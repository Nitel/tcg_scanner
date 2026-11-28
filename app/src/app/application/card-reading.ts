import { findCardNumbers, type CardNumber } from '../domain/card-number';
import { DEFAULT_PRESENCE_SETTINGS } from '../domain/card-presence';
import type { ScanState } from './card-scan';
import { expandArea } from './crop-frame';
import type { CameraPort } from './ports/camera.port';
import type { CardDetectorPort } from './ports/card-detector.port';
import type { OcrPort } from './ports/ocr.port';

export interface ReadingState {
  /** Number of the last card that entered the zone, once read. */
  readonly cardNumber: CardNumber | undefined;
  readonly attempts: number;
  /** Duration of the last attempt, image capture included. */
  readonly lastAttemptMs: number | undefined;
  /** The last attempt could not run at all. */
  readonly failed: boolean;
}

export const INITIAL_READING_STATE: ReadingState = {
  cardNumber: undefined,
  attempts: 0,
  lastAttemptMs: undefined,
  failed: false,
};

/** Image sent to the OCR: the zone and a margin, halved (best setting of ADR 008). */
const MARGIN = 0.1;
const SCALE = 0.5;

/** Reads the number of the card lying still in the zone, retrying until it is read or leaves. */
export class CardReading {
  private state = INITIAL_READING_STATE;
  /** Entry count of the card being read. */
  private entry = 0;
  private present = false;
  private busy = false;

  constructor(
    private readonly camera: Pick<CameraPort, 'captureArea'>,
    private readonly detector: Pick<CardDetectorPort, 'zoneFor'>,
    private readonly ocr: OcrPort,
    private readonly onState: (state: ReadingState) => void,
    private readonly now: () => number = () => performance.now(),
  ) {}

  /** To call on every scan state. Resolves once a triggered attempt is over. */
  async handleScan(scan: ScanState): Promise<void> {
    this.present = scan.cardPresent;
    if (scan.entries !== this.entry) {
      this.entry = scan.entries;
      this.emit(INITIAL_READING_STATE);
    }
    const still =
      (scan.observation?.motion ?? Infinity) <= DEFAULT_PRESENCE_SETTINGS.maxStableMotion;
    if (!this.present || !still || this.busy || this.state.cardNumber) return;

    this.busy = true;
    try {
      await this.attempt(this.entry);
    } finally {
      this.busy = false;
    }
  }

  private async attempt(entry: number): Promise<void> {
    const start = this.now();
    let lines: readonly string[];
    try {
      const image = await this.camera.captureArea((width, height) => {
        const zone = this.detector.zoneFor(width, height);
        return expandArea(zone, MARGIN, width, height);
      }, SCALE);
      if (!image) return;
      lines = await this.ocr.recognizeText(image);
    } catch {
      if (entry === this.entry) this.emit({ ...this.state, failed: true });
      return;
    }
    // The card left or was replaced while reading: the text may belong to another image.
    if (entry !== this.entry || !this.present) return;

    const numbers = findCardNumbers(lines.join('\n'), { correctConfusions: false });
    this.emit({
      // Several different numbers would be a guess: better to try again.
      cardNumber: numbers.length === 1 ? numbers[0] : undefined,
      attempts: this.state.attempts + 1,
      lastAttemptMs: Math.round(this.now() - start),
      failed: false,
    });
  }

  private emit(state: ReadingState): void {
    this.state = state;
    this.onState(state);
  }
}

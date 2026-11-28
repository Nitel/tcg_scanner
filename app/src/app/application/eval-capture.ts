import type { ScanState } from './card-scan';
import { cropFrame, expandArea } from './crop-frame';
import type { CameraPort } from './ports/camera.port';
import type { CardDetectorPort } from './ports/card-detector.port';
import type { PhotoStorePort } from './ports/photo-store.port';

export interface EvalCaptureState {
  readonly enabled: boolean;
  /** Folder of the current session. */
  readonly session: string | undefined;
  readonly saved: number;
  readonly lastSize: { readonly width: number; readonly height: number } | undefined;
  /** The card currently in the zone has its photo: it can be removed. */
  readonly done: boolean;
  readonly failed: boolean;
}

export const INITIAL_CAPTURE_STATE: EvalCaptureState = {
  enabled: false,
  session: undefined,
  saved: 0,
  lastSize: undefined,
  done: false,
  failed: false,
};

/** Frames to wait after a card entered, to let the focus settle. */
const SETTLE_FRAMES = 10;
/** Keeps the card edges and the number even when the card is slightly off-center. */
const MARGIN = 0.1;

/** `YYYYMMDD-HHmmss`, in local time. */
function folderName(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  return `${day}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/** Saves one photo per card entering the zone, to build the OCR test set. */
export class EvalCapture {
  private state = INITIAL_CAPTURE_STATE;
  /** Entry count of the last card handled. */
  private handledEntry = 0;
  private framesSinceEntry = 0;
  private taken = 0;

  constructor(
    private readonly camera: Pick<CameraPort, 'snapshot'>,
    private readonly detector: Pick<CardDetectorPort, 'zoneFor'>,
    private readonly store: PhotoStorePort,
    private readonly onState: (state: EvalCaptureState) => void,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Every activation starts a new session folder. */
  setEnabled(enabled: boolean): void {
    this.taken = 0;
    this.framesSinceEntry = 0;
    this.emit({
      ...INITIAL_CAPTURE_STATE,
      enabled,
      session: enabled ? folderName(this.now()) : undefined,
    });
  }

  /** To call on every scan state. Resolves once a triggered photo is saved. */
  async handleScan(scan: ScanState): Promise<void> {
    // Counters restart on calibration.
    if (scan.entries < this.handledEntry) this.handledEntry = 0;
    if (!scan.cardPresent) {
      this.framesSinceEntry = 0;
      if (this.state.done) this.emit({ ...this.state, done: false });
      return;
    }
    if (scan.entries === this.handledEntry) return;
    if (!this.state.enabled) {
      this.handledEntry = scan.entries;
      return;
    }
    if (++this.framesSinceEntry < SETTLE_FRAMES) return;
    this.handledEntry = scan.entries;
    this.framesSinceEntry = 0;
    await this.capture();
  }

  private async capture(): Promise<void> {
    const { session } = this.state;
    const frame = this.camera.snapshot();
    if (!session || !frame) return;
    const zone = this.detector.zoneFor(frame.width, frame.height);
    const photo = cropFrame(frame, expandArea(zone, MARGIN, frame.width, frame.height));
    const name = `${session}/${String(++this.taken).padStart(3, '0')}.png`;
    try {
      await this.store.save(name, photo);
    } catch {
      if (this.state.session === session) this.emit({ ...this.state, failed: true });
      return;
    }
    if (this.state.session !== session) return;
    this.emit({
      ...this.state,
      saved: this.state.saved + 1,
      lastSize: { width: frame.width, height: frame.height },
      done: true,
      failed: false,
    });
  }

  private emit(state: EvalCaptureState): void {
    this.state = state;
    this.onState(state);
  }
}

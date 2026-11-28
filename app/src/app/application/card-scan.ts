import { CardPresenceTracker, isPartial, type PresenceSample } from '../domain/card-presence';
import type { CameraFrame } from './ports/camera-frame';
import type { CardDetectorPort } from './ports/card-detector.port';

export interface ScanState {
  readonly calibration: 'needed' | 'pending' | 'done';
  readonly cardPresent: boolean;
  /** Something is in the zone, but not a whole card. */
  readonly cardIncomplete: boolean;
  readonly entries: number;
  readonly exits: number;
  readonly observation: PresenceSample | undefined;
}

export const INITIAL_SCAN_STATE: ScanState = {
  calibration: 'needed',
  cardPresent: false,
  cardIncomplete: false,
  entries: 0,
  exits: 0,
  observation: undefined,
};

/** Follows cards passing through the camera frames. */
export class CardScan {
  private state = INITIAL_SCAN_STATE;
  private readonly tracker = new CardPresenceTracker();

  constructor(
    private readonly detector: CardDetectorPort,
    private readonly onState: (state: ScanState) => void,
  ) {}

  /** Uses the next frame as the empty background and restarts the counters. */
  calibrate(): void {
    this.tracker.reset();
    this.emit({ ...INITIAL_SCAN_STATE, calibration: 'pending' });
  }

  /** To call when the frame flow is interrupted. Counters and background are kept. */
  interrupt(): void {
    this.tracker.reset();
    this.emit({
      ...this.state,
      calibration: this.state.calibration === 'pending' ? 'needed' : this.state.calibration,
      cardPresent: false,
      cardIncomplete: false,
      observation: undefined,
    });
  }

  handleFrame(frame: CameraFrame): void {
    if (this.state.calibration === 'pending') {
      this.detector.calibrate(frame);
      this.emit({ ...this.state, calibration: 'done' });
      return;
    }
    if (this.state.calibration === 'needed') return;

    const observation = this.detector.observe(frame);
    if (!observation) {
      this.tracker.reset();
      this.emit({
        ...this.state,
        calibration: 'needed',
        cardPresent: false,
        cardIncomplete: false,
        observation,
      });
      return;
    }
    const event = this.tracker.update(observation);
    this.emit({
      ...this.state,
      cardPresent: this.tracker.isPresent,
      cardIncomplete: !this.tracker.isPresent && isPartial(observation),
      entries: this.state.entries + (event === 'entered' ? 1 : 0),
      exits: this.state.exits + (event === 'exited' ? 1 : 0),
      observation,
    });
  }

  private emit(state: ScanState): void {
    this.state = state;
    this.onState(state);
  }
}

import { CardScan, type ScanState } from './card-scan';
import type { CameraFrame } from './ports/camera-frame';
import type { CardDetectorPort } from './ports/card-detector.port';

const FRAME: CameraFrame = { capturedAt: 0, width: 1, height: 1, pixels: new Uint8ClampedArray(4) };

class FakeDetector implements CardDetectorPort {
  calibrations = 0;
  occupancy: number | undefined = 0;
  /** Same as the occupancy unless set, as with a whole card or an empty zone. */
  coverage: number | undefined;

  zoneFor() {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  calibrate(): void {
    this.calibrations++;
  }

  observe() {
    if (this.occupancy === undefined) return undefined;
    return { occupancy: this.occupancy, coverage: this.coverage ?? this.occupancy, motion: 0 };
  }
}

describe('CardScan', () => {
  let detector: FakeDetector;
  let state: ScanState;
  let scan: CardScan;

  const frames = (occupancy: number | undefined, times = 5): void => {
    detector.occupancy = occupancy;
    for (let i = 0; i < times; i++) scan.handleFrame(FRAME);
  };
  const calibrate = (): void => {
    scan.calibrate();
    scan.handleFrame(FRAME);
  };

  beforeEach(() => {
    detector = new FakeDetector();
    scan = new CardScan(detector, (next) => (state = next));
  });

  it('ignores frames until calibration is requested', () => {
    frames(1);

    expect(detector.calibrations).toBe(0);
    expect(state).toBeUndefined();
  });

  it('calibrates on the next frame only', () => {
    calibrate();
    frames(0);

    expect(detector.calibrations).toBe(1);
    expect(state.calibration).toBe('done');
  });

  it('counts a card entering then leaving', () => {
    calibrate();

    frames(1);
    expect(state).toMatchObject({ cardPresent: true, entries: 1, exits: 0 });
    frames(0);
    expect(state).toMatchObject({ cardPresent: false, entries: 1, exits: 1 });
  });

  it('flags a partial card without counting it', () => {
    calibrate();
    detector.coverage = 0;

    frames(0.6);

    expect(state).toMatchObject({ cardIncomplete: true, cardPresent: false, entries: 0 });
  });

  it('restarts the counters on a new calibration', () => {
    calibrate();
    frames(1);

    calibrate();

    expect(state).toMatchObject({ cardPresent: false, entries: 0, exits: 0 });
  });

  it('keeps counters and background after an interruption', () => {
    calibrate();
    frames(1);

    scan.interrupt();

    expect(state).toMatchObject({ calibration: 'done', cardPresent: false, entries: 1 });
  });

  it('asks for a new calibration when the detector cannot use its background', () => {
    calibrate();

    frames(undefined);

    expect(state.calibration).toBe('needed');
  });
});

import { INITIAL_SCAN_STATE, type ScanState } from './card-scan';
import { EvalCapture, type EvalCaptureState } from './eval-capture';
import type { CameraFrame } from './ports/camera-frame';

const FRAME: CameraFrame = {
  capturedAt: 0,
  width: 100,
  height: 200,
  pixels: new Uint8ClampedArray(100 * 200 * 4),
};

describe('EvalCapture', () => {
  let saved: { path: string; width: number; height: number }[];
  let failing: boolean;
  let state: EvalCaptureState;
  let capture: EvalCapture;

  const scan = (entries: number, cardPresent = true): ScanState => ({
    ...INITIAL_SCAN_STATE,
    calibration: 'done',
    cardPresent,
    entries,
  });
  const feed = async (next: ScanState, times = 20): Promise<void> => {
    for (let i = 0; i < times; i++) await capture.handleScan(next);
  };

  beforeEach(() => {
    saved = [];
    failing = false;
    capture = new EvalCapture(
      { snapshot: () => FRAME },
      { zoneFor: () => ({ x: 20, y: 40, width: 50, height: 100 }) },
      {
        save: async (path, { width, height }) => {
          if (failing) throw new Error('disk full');
          saved.push({ path, width, height });
        },
      },
      (next) => (state = next),
      () => new Date(2026, 10, 28, 9, 5, 7),
    );
  });

  it('saves nothing while disabled', async () => {
    await feed(scan(1));

    expect(saved).toEqual([]);
  });

  it('saves one cropped photo per card, once the card has settled', async () => {
    capture.setEnabled(true);

    await feed(scan(1), 9);
    expect(saved).toEqual([]);
    await feed(scan(1));
    await feed(scan(1, false));
    await feed(scan(2));

    expect(saved).toEqual([
      { path: '20261128-090507/001.png', width: 60, height: 120 },
      { path: '20261128-090507/002.png', width: 60, height: 120 },
    ]);
    expect(state).toMatchObject({ saved: 2, done: true, lastSize: { width: 100, height: 200 } });
  });

  it('skips a card removed too early', async () => {
    capture.setEnabled(true);

    await feed(scan(1), 5);
    await feed(scan(1, false));

    expect(saved).toEqual([]);
    expect(state.done).toBe(false);
  });

  it('keeps capturing after the counters restart', async () => {
    capture.setEnabled(true);
    await feed(scan(1));

    await feed(scan(0, false));
    await feed(scan(1));

    expect(saved).toHaveLength(2);
  });

  it('reports a failed save', async () => {
    capture.setEnabled(true);
    failing = true;

    await feed(scan(1));

    expect(state).toMatchObject({ failed: true, saved: 0, done: false });
  });
});

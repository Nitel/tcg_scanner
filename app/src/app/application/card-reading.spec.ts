import { CardReading, type ReadingState } from './card-reading';
import { INITIAL_SCAN_STATE, type ScanState } from './card-scan';
import type { CameraFrame } from './ports/camera-frame';

const IMAGE: CameraFrame = { capturedAt: 0, width: 1, height: 1, pixels: new Uint8ClampedArray(4) };

describe('CardReading', () => {
  let texts: (string | Error)[];
  let captures: number;
  let state: ReadingState;
  let reading: CardReading;
  let release: (() => void) | undefined;
  let holdOcr: boolean;

  const scan = (entries: number, cardPresent = true, motion = 1): ScanState => ({
    ...INITIAL_SCAN_STATE,
    calibration: 'done',
    entries,
    cardPresent,
    observation: { occupancy: 1, coverage: 1, motion },
  });

  beforeEach(() => {
    texts = [];
    captures = 0;
    holdOcr = false;
    release = undefined;
    reading = new CardReading(
      {
        captureArea: async () => {
          captures++;
          return IMAGE;
        },
      },
      { zoneFor: () => ({ x: 0, y: 0, width: 1, height: 1 }) },
      {
        recognizeText: async () => {
          if (holdOcr) await new Promise<void>((resolve) => (release = resolve));
          const text = texts.shift() ?? '';
          if (text instanceof Error) throw text;
          return text.split('\n');
        },
      },
      (next) => (state = next),
      () => 0,
    );
  });

  it('reads a still card, then stops reading it', async () => {
    texts = ['Fictive name\nOP18-001 C'];

    await reading.handleScan(scan(1));
    await reading.handleScan(scan(1));

    expect(state).toMatchObject({ cardNumber: 'OP18-001', attempts: 1 });
    expect(captures).toBe(1);
  });

  it('waits for a card that is still', async () => {
    await reading.handleScan(scan(1, true, 40));
    await reading.handleScan(scan(0, false));

    expect(captures).toBe(0);
  });

  it('retries until the number is read', async () => {
    texts = ['blurry', 'OP18-001 OP18-002', 'OP18-001'];

    for (let i = 0; i < 3; i++) await reading.handleScan(scan(1));

    expect(state).toMatchObject({ cardNumber: 'OP18-001', attempts: 3 });
  });

  it('keeps the number after the card left, until the next card', async () => {
    texts = ['OP18-001'];
    await reading.handleScan(scan(1));

    await reading.handleScan(scan(1, false));
    expect(state.cardNumber).toBe('OP18-001');
    await reading.handleScan(scan(2, true, 40));
    expect(state.cardNumber).toBeUndefined();
  });

  it('runs one attempt at a time and drops the result of a card that left', async () => {
    holdOcr = true;
    texts = ['OP18-001'];

    const first = reading.handleScan(scan(1));
    await reading.handleScan(scan(1));
    await reading.handleScan(scan(1, false));
    await vi.waitFor(() => expect(release).toBeDefined());
    release!();
    await first;

    expect(captures).toBe(1);
    expect(state.cardNumber).toBeUndefined();
  });

  it('reports a failing engine and keeps trying', async () => {
    texts = [new Error('no engine'), 'OP18-001'];

    await reading.handleScan(scan(1));
    expect(state.failed).toBe(true);
    await reading.handleScan(scan(1));

    expect(state).toMatchObject({ cardNumber: 'OP18-001', failed: false });
  });
});

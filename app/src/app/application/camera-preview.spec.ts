import { CameraPreview, type PreviewState } from './camera-preview';
import type { CameraFrame } from './ports/camera-frame';
import { CameraError, type CameraPort } from './ports/camera.port';

class FakeCamera implements CameraPort {
  starts = 0;
  stops = 0;
  failure: Error | undefined;
  private onFrame: ((frame: CameraFrame) => void) | undefined;

  async start(_host: HTMLElement, onFrame: (frame: CameraFrame) => void): Promise<void> {
    this.starts++;
    if (this.failure) throw this.failure;
    this.onFrame = onFrame;
  }

  async stop(): Promise<void> {
    this.stops++;
  }

  emit(capturedAt: number): void {
    this.onFrame?.({ capturedAt, width: 4, height: 2, pixels: new Uint8ClampedArray(32) });
  }
}

describe('CameraPreview', () => {
  const host = {} as HTMLElement;
  let camera: FakeCamera;
  let states: PreviewState[];
  let preview: CameraPreview;

  beforeEach(() => {
    camera = new FakeCamera();
    states = [];
    preview = new CameraPreview(camera, (state) => states.push(state));
  });

  it('goes from starting to running', async () => {
    await preview.start(host);

    expect(states.map((state) => state.status)).toEqual(['starting', 'running']);
  });

  it('reports the resolution, then the frame rate after one second', async () => {
    await preview.start(host);

    for (let time = 0; time <= 1000; time += 100) camera.emit(time);

    expect(states.at(-2)).toEqual({
      status: 'running',
      stats: { width: 4, height: 2, framesPerSecond: undefined },
    });
    expect(states.at(-1)).toEqual({
      status: 'running',
      stats: { width: 4, height: 2, framesPerSecond: 10 },
    });
  });

  it.each([
    [new CameraError('permission-denied'), 'permission-denied'],
    [new Error('boom'), 'unknown'],
  ])('reports a failure: %s', async (failure, reason) => {
    camera.failure = failure;

    await preview.start(host);

    expect(states.at(-1)).toEqual({ status: 'failed', reason });
  });

  it('can retry after a failure', async () => {
    camera.failure = new CameraError('permission-denied');
    await preview.start(host);
    camera.failure = undefined;

    await preview.start(host);

    expect(states.at(-1)?.status).toBe('running');
  });

  it('forwards frames while running only', async () => {
    const received: number[] = [];
    preview = new CameraPreview(
      camera,
      () => undefined,
      (frame) => received.push(frame.capturedAt),
    );
    await preview.start(host);
    camera.emit(1);
    await preview.stop();
    camera.emit(2);

    expect(received).toEqual([1]);
  });

  it('ignores a second start while active', async () => {
    await preview.start(host);
    await preview.start(host);

    expect(camera.starts).toBe(1);
  });

  it('ignores frames received after stop', async () => {
    await preview.start(host);
    await preview.stop();

    camera.emit(0);

    expect(states.at(-1)).toEqual({ status: 'stopped' });
  });

  it('stays stopped when stop happens during startup', async () => {
    const starting = preview.start(host);
    await preview.stop();
    await starting;

    expect(states.at(-1)).toEqual({ status: 'stopped' });
  });

  it('releases the camera on suspend and restarts on resume', async () => {
    await preview.start(host);

    await preview.suspend();
    expect(camera.stops).toBe(1);
    await preview.resume();

    expect(camera.starts).toBe(2);
    expect(states.at(-1)?.status).toBe('running');
  });

  it('does not restart on resume after an explicit stop', async () => {
    await preview.start(host);
    await preview.stop();

    await preview.suspend();
    await preview.resume();

    expect(camera.starts).toBe(1);
  });
});

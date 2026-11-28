import { CameraError } from '../application/ports/camera.port';
import { WebCameraAdapter } from './web-camera.adapter';

/** Real streams, playback and pixel reading need a device: checked by hand. */
describe('WebCameraAdapter', () => {
  const host = document.createElement('div');
  const ignore = (): void => undefined;

  function stubCamera(getUserMedia: () => Promise<unknown>): void {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  }

  afterEach(() => vi.unstubAllGlobals());

  it('reports an unavailable camera when the API is missing', async () => {
    vi.stubGlobal('navigator', {});

    await expect(new WebCameraAdapter().start(host, ignore)).rejects.toEqual(
      new CameraError('unavailable'),
    );
  });

  it.each([
    ['NotAllowedError', 'permission-denied'],
    ['NotReadableError', 'unavailable'],
    ['AbortError', 'unknown'],
  ] as const)('maps %s to %s', async (name, reason) => {
    stubCamera(() => Promise.reject(new DOMException('refused', name)));

    await expect(new WebCameraAdapter().start(host, ignore)).rejects.toMatchObject({ reason });
  });

  it('has no image to give while stopped', async () => {
    const adapter = new WebCameraAdapter();
    const area = () => ({ x: 0, y: 0, width: 1, height: 1 });

    expect(adapter.snapshot()).toBeUndefined();
    await expect(adapter.captureArea(area, 1)).resolves.toBeUndefined();
  });

  it('releases a stream obtained after stop', async () => {
    const track = { stop: vi.fn() };
    let grant: (stream: unknown) => void = ignore;
    stubCamera(() => new Promise((resolve) => (grant = resolve)));
    const adapter = new WebCameraAdapter();

    const starting = adapter.start(host, ignore);
    await Promise.resolve();
    await adapter.stop();
    grant({ getTracks: () => [track] });
    await starting;

    expect(track.stop).toHaveBeenCalled();
    expect(host.children).toHaveLength(0);
  });
});

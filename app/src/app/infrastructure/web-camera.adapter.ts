import type { CameraFrame, CardRectangle } from '../application/ports/camera-frame';
import { CameraError, type CameraPort } from '../application/ports/camera.port';

/** Width of the frames delivered for analysis (ADR 014). */
const ANALYSIS_WIDTH = 540;

/** Rear camera in 4K if the device offers it, else its closest resolution. */
const CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 3840 },
    height: { ideal: 2160 },
  },
};

function toCameraError(error: unknown): CameraError {
  switch (error instanceof Error || error instanceof DOMException ? error.name : '') {
    case 'NotAllowedError':
    case 'SecurityError':
      return new CameraError('permission-denied');
    case 'NotFoundError':
    case 'NotReadableError':
    case 'OverconstrainedError':
      return new CameraError('unavailable');
    default:
      return new CameraError('unknown');
  }
}

function release(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

/** Draws an image at the given size and reads its pixels. */
function grab(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CameraFrame | undefined {
  // Resizing a canvas reallocates it: only do it when the size changes.
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;
  context.drawImage(source, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return { capturedAt: performance.now(), width, height, pixels: data };
}

/** `CameraPort` on top of the web camera API (ADR 012). */
export class WebCameraAdapter implements CameraPort {
  private stream: MediaStream | undefined;
  private video: HTMLVideoElement | undefined;
  /** Incremented on every stop, to cancel a pending start and the frame loop. */
  private session = 0;

  async start(previewHost: HTMLElement, onFrame: (frame: CameraFrame) => void): Promise<void> {
    await this.stop();
    const session = this.session;
    if (!navigator.mediaDevices?.getUserMedia) throw new CameraError('unavailable');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
    } catch (error) {
      throw toCameraError(error);
    }
    if (session !== this.session) {
      release(stream);
      return;
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.style.cssText = 'display:block;max-width:100%;max-height:60vh';
    video.srcObject = stream;
    previewHost.replaceChildren(video);
    this.stream = stream;
    this.video = video;

    try {
      await video.play();
    } catch (error) {
      if (session !== this.session) return;
      await this.stop();
      throw toCameraError(error);
    }
    if (session === this.session) this.readFrames(video, session, onFrame);
  }

  async stop(): Promise<void> {
    this.session++;
    if (this.stream) release(this.stream);
    if (this.video) {
      this.video.srcObject = null;
      this.video.remove();
    }
    this.stream = undefined;
    this.video = undefined;
  }

  snapshot(): CameraFrame | undefined {
    const video = this.video;
    if (!video?.videoWidth || !video.videoHeight) return undefined;
    const canvas = document.createElement('canvas');
    const frame = grab(video, canvas, video.videoWidth, video.videoHeight);
    canvas.width = 0; // Frees the full resolution buffer without waiting for garbage collection.
    return frame;
  }

  async captureArea(
    areaFor: (width: number, height: number) => CardRectangle,
    scale: number,
  ): Promise<CameraFrame | undefined> {
    const video = this.video;
    if (!video?.videoWidth || !video.videoHeight) return undefined;
    const session = this.session;
    const area = areaFor(video.videoWidth, video.videoHeight);
    const width = Math.round(area.width * scale);
    const height = Math.round(area.height * scale);
    const bitmap = await createImageBitmap(video, area.x, area.y, area.width, area.height, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'low',
    });
    const canvas = document.createElement('canvas');
    const frame = session === this.session ? grab(bitmap, canvas, width, height) : undefined;
    bitmap.close();
    return frame;
  }

  private readFrames(
    video: HTMLVideoElement,
    session: number,
    onFrame: (frame: CameraFrame) => void,
  ): void {
    const canvas = document.createElement('canvas');
    let busy = false;
    const read = (): void => {
      if (session !== this.session) return;
      video.requestVideoFrameCallback(read);
      const { videoWidth, videoHeight } = video;
      if (busy || !videoWidth || !videoHeight) return;
      const width = Math.min(ANALYSIS_WIDTH, videoWidth);
      const height = Math.round((videoHeight * width) / videoWidth);
      busy = true;
      // Resizing here is much cheaper than drawing the full video frame into a small canvas.
      void createImageBitmap(video, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: 'low',
      })
        .then((bitmap) => {
          const frame = session === this.session && grab(bitmap, canvas, width, height);
          bitmap.close();
          if (frame) onFrame(frame);
        })
        .finally(() => (busy = false));
    };
    video.requestVideoFrameCallback(read);
  }
}

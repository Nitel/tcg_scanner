import type { CameraFrame } from '../application/ports/camera-frame';
import { CameraError, type CameraPort } from '../application/ports/camera.port';

/** Rear camera at the highest common video resolution, if the device offers it. */
const CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
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
    video.style.cssText = 'display:block;width:100%;max-height:70vh;object-fit:contain';
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

  private readFrames(
    video: HTMLVideoElement,
    session: number,
    onFrame: (frame: CameraFrame) => void,
  ): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const read = (): void => {
      if (session !== this.session) return;
      video.requestVideoFrameCallback(read);
      const { videoWidth: width, videoHeight: height } = video;
      if (!width || !height) return;
      // Resizing a canvas reallocates it: only do it when the stream size changes.
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      context.drawImage(video, 0, 0);
      const { data } = context.getImageData(0, 0, width, height);
      onFrame({ capturedAt: performance.now(), width, height, pixels: data });
    };
    video.requestVideoFrameCallback(read);
  }
}

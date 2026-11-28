import type { CameraFrame } from './ports/camera-frame';
import { CameraError, type CameraFailure, type CameraPort } from './ports/camera.port';

export interface FrameStats {
  readonly width: number;
  readonly height: number;
  /** `undefined` until a full measuring window has elapsed. */
  readonly framesPerSecond: number | undefined;
}

export type PreviewState =
  | { readonly status: 'stopped' }
  | { readonly status: 'starting' }
  | { readonly status: 'running'; readonly stats: FrameStats | undefined }
  | { readonly status: 'failed'; readonly reason: CameraFailure };

const MEASURE_WINDOW_MS = 1000;

/** Drives the camera: start, stop, release in background, frame rate measure. */
export class CameraPreview {
  private host: HTMLElement | undefined;
  /** Incremented on every start and stop, to ignore outdated callbacks. */
  private run = 0;
  private active = false;
  private suspended = false;
  private windowStart: number | undefined;
  private windowFrames = 0;
  private framesPerSecond: number | undefined;

  constructor(
    private readonly camera: CameraPort,
    private readonly onState: (state: PreviewState) => void,
    private readonly onFrame: (frame: CameraFrame) => void = () => undefined,
  ) {}

  async start(host: HTMLElement): Promise<void> {
    if (this.active) return;
    const run = ++this.run;
    this.host = host;
    this.active = true;
    this.suspended = false;
    this.windowStart = undefined;
    this.windowFrames = 0;
    this.framesPerSecond = undefined;
    this.onState({ status: 'starting' });
    try {
      await this.camera.start(host, (frame) => this.handleFrame(run, frame));
    } catch (error) {
      if (run !== this.run) return;
      this.active = false;
      this.onState({
        status: 'failed',
        reason: error instanceof CameraError ? error.reason : 'unknown',
      });
      return;
    }
    if (run === this.run) this.onState({ status: 'running', stats: undefined });
  }

  async stop(): Promise<void> {
    this.suspended = false;
    await this.release();
  }

  /** Releases the camera while the app is in the background. */
  async suspend(): Promise<void> {
    if (!this.active) return;
    this.suspended = true;
    await this.release();
  }

  /** Restarts the camera only if `suspend` released it. */
  async resume(): Promise<void> {
    if (this.suspended && this.host) await this.start(this.host);
  }

  private async release(): Promise<void> {
    this.run++;
    this.active = false;
    await this.camera.stop();
    this.onState({ status: 'stopped' });
  }

  private handleFrame(run: number, frame: CameraFrame): void {
    if (run !== this.run) return;
    this.onFrame(frame);
    const isFirst = this.windowStart === undefined;
    this.windowStart ??= frame.capturedAt;
    const elapsed = frame.capturedAt - this.windowStart;
    if (!isFirst) this.windowFrames++;
    const windowDone = elapsed >= MEASURE_WINDOW_MS;
    if (windowDone) {
      this.framesPerSecond = Math.round((this.windowFrames * 1000) / elapsed);
      this.windowStart = frame.capturedAt;
      this.windowFrames = 0;
    }
    if (isFirst || windowDone) {
      this.onState({
        status: 'running',
        stats: {
          width: frame.width,
          height: frame.height,
          framesPerSecond: this.framesPerSecond,
        },
      });
    }
  }
}

import type { CameraFrame, CardRectangle } from './camera-frame';

export type CameraFailure = 'permission-denied' | 'unavailable' | 'unknown';

export class CameraError extends Error {
  constructor(readonly reason: CameraFailure) {
    super(`Camera failure: ${reason}`);
    this.name = 'CameraError';
  }
}

/** Live camera feed (ADR 012, ADR 014). */
export interface CameraPort {
  /**
   * Shows the live preview inside `previewHost` and delivers reduced frames, meant for
   * analysis, until `stop`. Rejects with a `CameraError`. A `stop` call during startup cancels it.
   */
  start(previewHost: HTMLElement, onFrame: (frame: CameraFrame) => void): Promise<void>;
  stop(): Promise<void>;
  /** Current image at full resolution, or `undefined` when the camera is not running. */
  snapshot(): CameraFrame | undefined;
  /**
   * Copies only an area of the current image, resized by `scale`: much cheaper than `snapshot`.
   * `areaFor` receives the full resolution size. `undefined` when the camera is not running.
   */
  captureArea(
    areaFor: (width: number, height: number) => CardRectangle,
    scale: number,
  ): Promise<CameraFrame | undefined>;
}

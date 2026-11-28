import type { CameraFrame } from './camera-frame';

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
}

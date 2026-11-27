import type { CameraFrame } from './camera-frame';

export type CameraFailure = 'permission-denied' | 'unavailable' | 'unknown';

export class CameraError extends Error {
  constructor(readonly reason: CameraFailure) {
    super(`Camera failure: ${reason}`);
    this.name = 'CameraError';
  }
}

/** Live camera feed (ADR 012). */
export interface CameraPort {
  /**
   * Shows the live preview inside `previewHost` and delivers frames until `stop`.
   * Rejects with a `CameraError`. A `stop` call during startup cancels it.
   */
  start(previewHost: HTMLElement, onFrame: (frame: CameraFrame) => void): Promise<void>;
  stop(): Promise<void>;
}

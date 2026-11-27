import type { CameraFrame } from './camera-frame';

/** Live camera feed. */
export interface CameraPort {
  start(onFrame: (frame: CameraFrame) => void): Promise<void>;
  stop(): Promise<void>;
}

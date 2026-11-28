import type { CameraFrame } from './camera-frame';

/** Keeps photos on the device, for the OCR test set. */
export interface PhotoStorePort {
  /** `path` is relative to the test set folder, such as `<session>/001.png`. */
  save(path: string, photo: CameraFrame): Promise<void>;
}

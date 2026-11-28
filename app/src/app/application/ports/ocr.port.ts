import type { CameraFrame } from './camera-frame';

/** Text recognition, independent of the engine (ADR 008). */
export interface OcrPort {
  /** Returns the raw text lines read in the image. */
  recognizeText(image: CameraFrame): Promise<readonly string[]>;
}

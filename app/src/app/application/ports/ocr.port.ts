import type { CameraFrame, CardRectangle } from './camera-frame';

/**
 * Text recognition, independent of the engine (ADR 008).
 * TODO(à vérifier): revisit input and output after the OCR benchmark (confidence, positions).
 */
export interface OcrPort {
  /** Returns the raw text lines read inside `region`. */
  recognizeText(frame: CameraFrame, region: CardRectangle): Promise<readonly string[]>;
}

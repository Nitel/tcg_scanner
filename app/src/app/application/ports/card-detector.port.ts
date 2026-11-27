import type { CameraFrame, CardRectangle } from './camera-frame';

/**
 * Finds the card rectangle in a frame (ADR 006, ADR 011).
 * Enter and exit events are domain logic built on top of this.
 */
export interface CardDetectorPort {
  /** Resolves to `undefined` when no card is visible. */
  detect(frame: CameraFrame): Promise<CardRectangle | undefined>;
}

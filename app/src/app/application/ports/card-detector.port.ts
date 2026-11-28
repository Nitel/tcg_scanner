import type { PresenceSample } from '../../domain/card-presence';
import type { CameraFrame, CardRectangle } from './camera-frame';

/**
 * Measures whether a card is visible (ADR 006, ADR 013).
 * Enter and exit events are domain logic built on top of this.
 */
export interface CardDetectorPort {
  /** Where the card is looked for, in frame pixels. */
  zoneFor(frameWidth: number, frameHeight: number): CardRectangle;
  /** Remembers this frame as the empty background. */
  calibrate(frame: CameraFrame): void;
  /** `undefined` while no background matching this frame size is calibrated. */
  observe(frame: CameraFrame): PresenceSample | undefined;
}

/** One image from the camera (ADR 012). */
export interface CameraFrame {
  /** Milliseconds on a monotonic clock. */
  readonly capturedAt: number;
  readonly width: number;
  readonly height: number;
  /** RGBA, 4 bytes per pixel, row by row. */
  readonly pixels: Uint8ClampedArray;
}

/** Area of a frame, in pixels. */
export interface CardRectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * One image from the camera.
 * TODO(à vérifier): pixel transport between native code and the WebView is not decided,
 * so the frame carries no image data yet.
 */
export interface CameraFrame {
  readonly capturedAt: number;
}

/** Area of a frame, in pixels. */
export interface CardRectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

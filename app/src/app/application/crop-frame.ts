import type { CameraFrame, CardRectangle } from './ports/camera-frame';

/** Grows an area by a share of its size on each side, without leaving the frame. */
export function expandArea(
  area: CardRectangle,
  margin: number,
  frameWidth: number,
  frameHeight: number,
): CardRectangle {
  const x = Math.max(0, Math.round(area.x - area.width * margin));
  const y = Math.max(0, Math.round(area.y - area.height * margin));
  const right = Math.min(frameWidth, Math.round(area.x + area.width * (1 + margin)));
  const bottom = Math.min(frameHeight, Math.round(area.y + area.height * (1 + margin)));
  return { x, y, width: right - x, height: bottom - y };
}

/** Copies an area lying inside the frame into a new frame. */
export function cropFrame(frame: CameraFrame, area: CardRectangle): CameraFrame {
  const pixels = new Uint8ClampedArray(area.width * area.height * 4);
  for (let row = 0; row < area.height; row++) {
    const start = ((area.y + row) * frame.width + area.x) * 4;
    pixels.set(frame.pixels.subarray(start, start + area.width * 4), row * area.width * 4);
  }
  return { capturedAt: frame.capturedAt, width: area.width, height: area.height, pixels };
}

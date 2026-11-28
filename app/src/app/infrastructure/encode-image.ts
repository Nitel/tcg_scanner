import type { CameraFrame } from '../application/ports/camera-frame';

/** Encodes a frame as a base64 image, without the data URL prefix. */
export function toBase64Image(
  frame: CameraFrame,
  type: 'image/png' | 'image/jpeg',
  quality?: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const pixels = new Uint8ClampedArray(frame.pixels);
  context.putImageData(new ImageData(pixels, frame.width, frame.height), 0, 0);
  return canvas.toDataURL(type, quality).split(',')[1]!;
}

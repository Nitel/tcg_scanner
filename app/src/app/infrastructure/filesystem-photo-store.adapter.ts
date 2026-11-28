import { Directory, Filesystem } from '@capacitor/filesystem';
import type { CameraFrame } from '../application/ports/camera-frame';
import type { PhotoStorePort } from '../application/ports/photo-store.port';

/** Lossless, so that the benchmark is not biased by compression. */
function toBase64Png(photo: CameraFrame): string {
  const canvas = document.createElement('canvas');
  canvas.width = photo.width;
  canvas.height = photo.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const pixels = new Uint8ClampedArray(photo.pixels);
  context.putImageData(new ImageData(pixels, photo.width, photo.height), 0, 0);
  return canvas.toDataURL('image/png').split(',')[1]!;
}

/** Writes into the app's own folder on shared storage, readable with `adb pull`. */
export class FilesystemPhotoStoreAdapter implements PhotoStorePort {
  async save(path: string, photo: CameraFrame): Promise<void> {
    await Filesystem.writeFile({
      path: `eval/${path}`,
      data: toBase64Png(photo),
      directory: Directory.External,
      recursive: true,
    });
  }
}

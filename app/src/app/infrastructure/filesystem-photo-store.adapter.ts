import { Directory, Filesystem } from '@capacitor/filesystem';
import type { CameraFrame } from '../application/ports/camera-frame';
import type { PhotoStorePort } from '../application/ports/photo-store.port';
import { toBase64Image } from './encode-image';

/** Writes into the app's own folder on shared storage, readable with `adb pull`. */
export class FilesystemPhotoStoreAdapter implements PhotoStorePort {
  async save(path: string, photo: CameraFrame): Promise<void> {
    await Filesystem.writeFile({
      path: `eval/${path}`,
      // Lossless, so that a benchmark is not biased by compression.
      data: toBase64Image(photo, 'image/png'),
      directory: Directory.External,
      recursive: true,
    });
  }
}

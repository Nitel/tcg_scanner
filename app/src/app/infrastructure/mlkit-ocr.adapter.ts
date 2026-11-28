import { registerPlugin } from '@capacitor/core';
import type { CameraFrame } from '../application/ports/camera-frame';
import type { OcrPort } from '../application/ports/ocr.port';
import { toBase64Image } from './encode-image';

interface CardOcrPlugin {
  recognize(options: { image: string }): Promise<{ text: string }>;
}

/** Native plugin of `app/android` (`CardOcrPlugin.java`). Android only for now. */
const CardOcr = registerPlugin<CardOcrPlugin>('CardOcr');

/** High enough to leave the small number intact, far faster to encode than PNG. */
const JPEG_QUALITY = 0.95;

/** `OcrPort` on top of ML Kit (ADR 008, ADR 016). */
export class MlKitOcrAdapter implements OcrPort {
  async recognizeText(image: CameraFrame): Promise<readonly string[]> {
    const encoded = toBase64Image(image, 'image/jpeg', JPEG_QUALITY);
    const { text } = await CardOcr.recognize({ image: encoded });
    return text.split('\n');
  }
}

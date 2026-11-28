import { InjectionToken } from '@angular/core';
import type { OcrPort } from '../application/ports/ocr.port';

export const OCR_PORT = new InjectionToken<OcrPort>('OcrPort');

import { InjectionToken } from '@angular/core';
import type { PhotoStorePort } from '../application/ports/photo-store.port';

export const PHOTO_STORE_PORT = new InjectionToken<PhotoStorePort>('PhotoStorePort');

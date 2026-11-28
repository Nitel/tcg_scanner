import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FilesystemPhotoStoreAdapter } from './infrastructure/filesystem-photo-store.adapter';
import { WebCameraAdapter } from './infrastructure/web-camera.adapter';
import { ZoneCardDetectorAdapter } from './infrastructure/zone-card-detector.adapter';
import { CAMERA_PORT } from './ui/camera.token';
import { CARD_DETECTOR_PORT } from './ui/card-detector.token';
import { PHOTO_STORE_PORT } from './ui/photo-store.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: CAMERA_PORT, useClass: WebCameraAdapter },
    { provide: CARD_DETECTOR_PORT, useClass: ZoneCardDetectorAdapter },
    { provide: PHOTO_STORE_PORT, useClass: FilesystemPhotoStoreAdapter },
  ],
};

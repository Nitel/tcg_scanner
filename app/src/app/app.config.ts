import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { WebCameraAdapter } from './infrastructure/web-camera.adapter';
import { CAMERA_PORT } from './ui/camera.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: CAMERA_PORT, useClass: WebCameraAdapter },
  ],
};

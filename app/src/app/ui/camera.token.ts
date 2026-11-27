import { InjectionToken } from '@angular/core';
import type { CameraPort } from '../application/ports/camera.port';

export const CAMERA_PORT = new InjectionToken<CameraPort>('CameraPort');

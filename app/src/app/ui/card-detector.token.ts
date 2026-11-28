import { InjectionToken } from '@angular/core';
import type { CardDetectorPort } from '../application/ports/card-detector.port';

export const CARD_DETECTOR_PORT = new InjectionToken<CardDetectorPort>('CardDetectorPort');

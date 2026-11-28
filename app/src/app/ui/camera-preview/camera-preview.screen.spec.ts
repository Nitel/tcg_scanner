import { TestBed } from '@angular/core/testing';
import { CameraError, type CameraPort } from '../../application/ports/camera.port';
import type { CardDetectorPort } from '../../application/ports/card-detector.port';
import { CAMERA_PORT } from '../camera.token';
import { CARD_DETECTOR_PORT } from '../card-detector.token';
import { CameraPreviewScreen } from './camera-preview.screen';

describe('CameraPreviewScreen', () => {
  it('shows a message when camera access is refused', async () => {
    const camera: CameraPort = {
      start: () => Promise.reject(new CameraError('permission-denied')),
      stop: () => Promise.resolve(),
    };
    const detector: CardDetectorPort = {
      zoneFor: () => ({ x: 0, y: 0, width: 1, height: 1 }),
      calibrate: () => undefined,
      observe: () => undefined,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CAMERA_PORT, useValue: camera },
        { provide: CARD_DETECTOR_PORT, useValue: detector },
      ],
    });
    const fixture = TestBed.createComponent(CameraPreviewScreen);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('button')?.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('refusé');
  });
});

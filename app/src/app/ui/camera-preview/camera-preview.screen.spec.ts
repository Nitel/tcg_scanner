import { TestBed } from '@angular/core/testing';
import { CameraError, type CameraPort } from '../../application/ports/camera.port';
import { CAMERA_PORT } from '../camera.token';
import { CameraPreviewScreen } from './camera-preview.screen';

describe('CameraPreviewScreen', () => {
  it('shows a message when camera access is refused', async () => {
    const camera: CameraPort = {
      start: () => Promise.reject(new CameraError('permission-denied')),
      stop: () => Promise.resolve(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: CAMERA_PORT, useValue: camera }] });
    const fixture = TestBed.createComponent(CameraPreviewScreen);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('button')?.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('refusé');
  });
});

import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CameraPreview, type PreviewState } from '../../application/camera-preview';
import type { CameraFailure } from '../../application/ports/camera.port';
import { CAMERA_PORT } from '../camera.token';

const FAILURE_MESSAGES: Record<CameraFailure, string> = {
  'permission-denied':
    'Accès à la caméra refusé. Autorisez la caméra dans les paramètres de l’application, puis réessayez.',
  unavailable: 'Caméra indisponible : absente ou utilisée par une autre application.',
  unknown: 'Impossible de démarrer la caméra.',
};

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.screen.html',
  styleUrl: './camera-preview.screen.scss',
  host: { '(document:visibilitychange)': 'onVisibilityChange()' },
})
export class CameraPreviewScreen implements OnDestroy {
  private readonly previewHost = viewChild.required<ElementRef<HTMLElement>>('previewHost');
  protected readonly state = signal<PreviewState>({ status: 'stopped' });
  private readonly preview = new CameraPreview(inject(CAMERA_PORT), (state) =>
    this.state.set(state),
  );

  protected readonly isActive = computed(() => {
    const { status } = this.state();
    return status === 'starting' || status === 'running';
  });
  protected readonly failureMessage = computed(() => {
    const state = this.state();
    return state.status === 'failed' ? FAILURE_MESSAGES[state.reason] : undefined;
  });
  protected readonly stats = computed(() => {
    const state = this.state();
    return state.status === 'running' ? state.stats : undefined;
  });

  protected start(): void {
    void this.preview.start(this.previewHost().nativeElement);
  }

  protected stop(): void {
    void this.preview.stop();
  }

  protected onVisibilityChange(): void {
    void (document.hidden ? this.preview.suspend() : this.preview.resume());
  }

  ngOnDestroy(): void {
    void this.preview.stop();
  }
}

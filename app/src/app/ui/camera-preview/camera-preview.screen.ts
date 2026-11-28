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
import { CardScan, INITIAL_SCAN_STATE, type ScanState } from '../../application/card-scan';
import {
  EvalCapture,
  INITIAL_CAPTURE_STATE,
  type EvalCaptureState,
} from '../../application/eval-capture';
import type { CameraFailure } from '../../application/ports/camera.port';
import { CAMERA_PORT } from '../camera.token';
import { CARD_DETECTOR_PORT } from '../card-detector.token';
import { PHOTO_STORE_PORT } from '../photo-store.token';

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
  private readonly camera = inject(CAMERA_PORT);
  private readonly detector = inject(CARD_DETECTOR_PORT);
  protected readonly captureState = signal<EvalCaptureState>(INITIAL_CAPTURE_STATE);
  private readonly capture = new EvalCapture(
    this.camera,
    this.detector,
    inject(PHOTO_STORE_PORT),
    (state) => this.captureState.set(state),
  );
  protected readonly scanState = signal<ScanState>(INITIAL_SCAN_STATE);
  private readonly scan = new CardScan(this.detector, (state) => {
    this.scanState.set(state);
    void this.capture.handleScan(state);
  });
  private readonly preview = new CameraPreview(
    this.camera,
    (state) => {
      this.state.set(state);
      if (state.status !== 'running') this.scan.interrupt();
    },
    (frame) => this.scan.handleFrame(frame),
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

  /** Aiming zone as CSS percentages of the preview. */
  protected readonly zoneStyle = computed(() => {
    const stats = this.stats();
    if (!stats) return undefined;
    const zone = this.detector.zoneFor(stats.width, stats.height);
    const percent = (value: number, total: number): string => `${(value * 100) / total}%`;
    return {
      left: percent(zone.x, stats.width),
      top: percent(zone.y, stats.height),
      width: percent(zone.width, stats.width),
      height: percent(zone.height, stats.height),
    };
  });

  protected toggleCapture(event: Event): void {
    this.capture.setEnabled((event.target as HTMLInputElement).checked);
  }

  protected calibrate(): void {
    this.scan.calibrate();
  }

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

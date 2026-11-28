import { Routes } from '@angular/router';
import { CameraPreviewScreen } from './ui/camera-preview/camera-preview.screen';

export const routes: Routes = [
  { path: '', component: CameraPreviewScreen },
  // Temporary, until the OCR engine is chosen (ADR 008).
  {
    path: 'benchmark',
    loadComponent: () => import('./benchmark/ocr-benchmark').then((m) => m.OcrBenchmark),
  },
];

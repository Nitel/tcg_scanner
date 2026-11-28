// Temporary screen for the OCR benchmark (ADR 008). Not part of the product layers.
import { Component, signal } from '@angular/core';
import { TextRecognition } from '@capacitor-mlkit/text-recognition';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { createWorker, PSM, type Worker } from 'tesseract.js';

const SCALES = [1, 0.5];
/** `corner` is the bottom right part of the photo, where the number is printed. */
const REGIONS = {
  full: { x: 0, y: 0, width: 1, height: 1 },
  corner: { x: 0.45, y: 0.7, width: 0.55, height: 0.3 },
};

interface Result {
  readonly photo: string;
  readonly engine: 'mlkit' | 'tesseract';
  readonly region: string;
  readonly scale: number;
  readonly ms: number;
  readonly text: string;
}

async function prepare(
  bitmap: ImageBitmap,
  region: (typeof REGIONS)['full'],
  scale: number,
): Promise<HTMLCanvasElement> {
  const width = Math.round(bitmap.width * region.width);
  const height = Math.round(bitmap.height * region.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const x = Math.round(bitmap.width * region.x);
  const y = Math.round(bitmap.height * region.y);
  canvas
    .getContext('2d')!
    .drawImage(bitmap, x, y, width, height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** The ML Kit plugin only reads files. */
async function readWithMlKit(canvas: HTMLCanvasElement): Promise<{ text: string; ms: number }> {
  const { uri } = await Filesystem.writeFile({
    path: 'benchmark-input.png',
    data: canvas.toDataURL('image/png').split(',')[1]!,
    directory: Directory.Cache,
  });
  const start = performance.now();
  const { text } = await TextRecognition.processImage({ path: uri });
  return { text, ms: Math.round(performance.now() - start) };
}

async function readWithTesseract(
  worker: Worker,
  canvas: HTMLCanvasElement,
): Promise<{ text: string; ms: number }> {
  const start = performance.now();
  const { data } = await worker.recognize(canvas);
  return { text: data.text, ms: Math.round(performance.now() - start) };
}

async function startTesseract(): Promise<Worker> {
  const base = new URL('ocr', document.baseURI).href;
  const worker = await createWorker('eng', 1, {
    workerPath: `${base}/worker.min.js`,
    corePath: base,
    langPath: base,
    gzip: false,
  });
  // Card numbers are isolated words: sparse text, restricted alphabet.
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
  });
  return worker;
}

@Component({
  selector: 'app-ocr-benchmark',
  template: `
    <p>Lit les photos du jeu d’essai avec les deux moteurs. Laissez l’écran allumé.</p>
    <button type="button" [disabled]="running()" (click)="run()">Lancer le banc d’essai</button>
    <p role="status">{{ progress() }}</p>
  `,
})
export class OcrBenchmark {
  protected readonly running = signal(false);
  protected readonly progress = signal('');

  protected async run(): Promise<void> {
    this.running.set(true);
    try {
      await this.measure();
    } catch (error) {
      this.progress.set(`Échec : ${error instanceof Error ? error.message : String(error)}`);
    }
    this.running.set(false);
  }

  private async measure(): Promise<void> {
    const sessions = await Filesystem.readdir({ path: 'eval', directory: Directory.External });
    const photos: string[] = [];
    for (const session of sessions.files) {
      const path = `eval/${session.name}`;
      const { files } = await Filesystem.readdir({ path, directory: Directory.External });
      photos.push(...files.map((file) => `${session.name}/${file.name}`));
    }
    photos.sort();

    const worker = await startTesseract();
    const results: Result[] = [];
    for (const [index, photo] of photos.entries()) {
      this.progress.set(`Photo ${index + 1} / ${photos.length}`);
      const { data } = await Filesystem.readFile({
        path: `eval/${photo}`,
        directory: Directory.External,
      });
      const blob = await (await fetch(`data:image/png;base64,${data as string}`)).blob();
      const bitmap = await createImageBitmap(blob);
      for (const [region, area] of Object.entries(REGIONS)) {
        for (const scale of SCALES) {
          const canvas = await prepare(bitmap, area, scale);
          const common = { photo, region, scale };
          results.push({ ...common, engine: 'mlkit', ...(await readWithMlKit(canvas)) });
          results.push({
            ...common,
            engine: 'tesseract',
            ...(await readWithTesseract(worker, canvas)),
          });
        }
      }
      bitmap.close();
      await Filesystem.writeFile({
        path: 'benchmark/results.json',
        data: JSON.stringify(results),
        directory: Directory.External,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    }
    await worker.terminate();
    this.progress.set(`Terminé : ${photos.length} photos.`);
  }
}

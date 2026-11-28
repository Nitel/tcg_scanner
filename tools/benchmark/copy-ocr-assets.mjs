// Copies the Tesseract files into app/public/ocr, so that the benchmark runs offline.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const modules = new URL('../../node_modules/', import.meta.url);
const target = new URL('../../app/public/ocr/', import.meta.url);
mkdirSync(target, { recursive: true });

const files = [
  'tesseract.js/dist/worker.min.js',
  'tesseract.js-core/tesseract-core-lstm.wasm.js',
  'tesseract.js-core/tesseract-core-simd-lstm.wasm.js',
  'tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js',
];
for (const file of files) {
  copyFileSync(new URL(file, modules), new URL(file.split('/').at(-1), target));
}
// Stored uncompressed: Android packaging renames and unpacks .gz assets.
const data = readFileSync(
  new URL('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', modules),
);
writeFileSync(new URL('eng.traineddata', target), gunzipSync(data));
console.log('Tesseract files copied to app/public/ocr');

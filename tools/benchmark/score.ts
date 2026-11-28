// Scores eval/captures/results.json against the truth.txt of each session.
// Usage: npm run eval:score
import { existsSync, readFileSync } from 'node:fs';
import { findCardNumbers } from '../../app/src/app/domain/card-number.ts';

interface Result {
  photo: string;
  engine: string;
  region: string;
  scale: number;
  ms: number;
  text: string;
}

const captures = new URL('../../eval/captures/', import.meta.url);
const results: Result[] = JSON.parse(readFileSync(new URL('results.json', captures), 'utf8'));

const truths = new Map<string, string[]>();
function truthFor(photo: string): string | undefined {
  const [session = '', file = ''] = photo.split('/');
  if (!truths.has(session)) {
    const url = new URL(`${session}/truth.txt`, captures);
    const lines = existsSync(url) ? readFileSync(url, 'utf8').trim().split('\n') : [];
    truths.set(
      session,
      lines.map((line) => line.trim().split(/\s+/)[0]!.toUpperCase()),
    );
  }
  // `007.png` is described by the 7th line.
  return truths.get(session)![Number.parseInt(file, 10) - 1];
}

const scored = results.filter((result) => truthFor(result.photo));
const keys = [...new Set(scored.map((r) => `${r.engine} ${r.region} x${r.scale}`))].sort();

for (const correctConfusions of [false, true]) {
  console.log(`\n${correctConfusions ? 'With' : 'Without'} confusion correction`);
  const table = keys.map((key) => {
    const group = scored.filter((r) => `${r.engine} ${r.region} x${r.scale}` === key);
    const counts = { exact: 0, ambiguous: 0, wrong: 0, missed: 0 };
    for (const result of group) {
      const truth = truthFor(result.photo)!;
      const found: string[] = findCardNumbers(result.text, { correctConfusions });
      if (found.length === 0) counts.missed++;
      else if (!found.includes(truth)) counts.wrong++;
      else if (found.length > 1) counts.ambiguous++;
      else counts.exact++;
    }
    const times = group.map((r) => r.ms).sort((a, b) => a - b);
    return {
      config: key,
      photos: group.length,
      ...counts,
      exactRate: `${Math.round((counts.exact * 100) / group.length)} %`,
      medianMs: times[Math.floor(times.length / 2)],
      maxMs: times.at(-1),
    };
  });
  console.table(table);
}

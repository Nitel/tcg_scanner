/** Printed card number, the identification key (ADR 002). Example: `OP18-042`, `P-001`. */
export type CardNumber = string & { readonly __brand: 'CardNumber' };

const CARD_NUMBER_PATTERN = /^(?:[A-Z]{2,3}\d{2}|P)-\d{3}$/;

/**
 * Validates a card number. Only trims and upper-cases: OCR confusion fixes
 * (`O`/`0`, ...) belong to a later task.
 */
export function parseCardNumber(input: string): CardNumber | undefined {
  const candidate = input.trim().toUpperCase();
  return CARD_NUMBER_PATTERN.test(candidate) ? (candidate as CardNumber) : undefined;
}

/** Characters an OCR engine commonly reads instead of a digit. */
const AS_DIGIT: Record<string, string> = {
  O: '0',
  Q: '0',
  D: '0',
  I: '1',
  L: '1',
  '|': '1',
  Z: '2',
  S: '5',
  G: '6',
  B: '8',
};
/** And the reverse, for the letters of the prefix. */
const AS_LETTER: Record<string, string> = { '0': 'O', '1': 'I', '5': 'S', '8': 'B' };

const DIGIT = '[0-9OQDILZSGB|]';
const STRICT_NUMBER = /(?<![A-Z0-9])((?:[A-Z]{2,3}\d{2}|P)-\d{3})(?!\d)/g;
const CONFUSED_NUMBER = new RegExp(
  `(?<![A-Z0-9])(?:([A-Z0158]{2,3}?)(${DIGIT}{2})|P)-(${DIGIT}{3})(?![0-9])`,
  'g',
);

const replaceAll = (value: string, table: Record<string, string>): string =>
  [...value].map((character) => table[character] ?? character).join('');

function correctedMatches(line: string): string[] {
  return [...line.matchAll(CONFUSED_NUMBER)].flatMap(([, prefix, set = '', index = '']) => {
    // Without a single real digit, it is more likely an ordinary word.
    if (!/\d/.test(set + index)) return [];
    const head = prefix ? replaceAll(prefix, AS_LETTER) + replaceAll(set, AS_DIGIT) : 'P';
    return [`${head}-${replaceAll(index, AS_DIGIT)}`];
  });
}

/**
 * Card numbers present in raw OCR text, without duplicates. With `correctConfusions`,
 * look-alike characters are replaced according to their position in the number.
 */
export function findCardNumbers(
  text: string,
  { correctConfusions }: { correctConfusions: boolean },
): CardNumber[] {
  const lines = text
    .toUpperCase()
    .split('\n')
    .map((line) => line.replace(/[ \t]*[-‐-―−][ \t]*/g, '-'));
  const found = lines.flatMap((line) =>
    correctConfusions
      ? correctedMatches(line)
      : [...line.matchAll(STRICT_NUMBER)].map((match) => match[1]!),
  );
  return [...new Set(found.flatMap((value) => parseCardNumber(value) ?? []))];
}

import { findCardNumbers, parseCardNumber } from './card-number';

describe('parseCardNumber', () => {
  it.each(['OP18-042', 'OP17-119', 'ST24-004', 'PRB01-001', 'P-001'])('accepts %s', (input) => {
    expect(parseCardNumber(input)).toBe(input);
  });

  it('trims and upper-cases the input', () => {
    expect(parseCardNumber(' op18-042 ')).toBe('OP18-042');
  });

  it.each(['', 'OP18', 'OP18-42', 'OP18-0420', 'OP1B-042', 'text OP18-042'])(
    'rejects "%s"',
    (input) => {
      expect(parseCardNumber(input)).toBeUndefined();
    },
  );
});

describe('findCardNumbers', () => {
  const strict = (text: string) => findCardNumbers(text, { correctConfusions: false });
  const corrected = (text: string) => findCardNumbers(text, { correctConfusions: true });

  it('finds a number among other text', () => {
    expect(strict('Fictive Pirates\nop18-014 C 5')).toEqual(['OP18-014']);
  });

  it('accepts a stuck rarity, spaces and other dashes', () => {
    expect(strict('OP18-014C')).toEqual(['OP18-014']);
    expect(strict('OP18 – 014')).toEqual(['OP18-014']);
    expect(strict('P-001')).toEqual(['P-001']);
  });

  it('does not repeat a number and does not truncate longer ones', () => {
    expect(strict('OP18-014 OP18-014')).toEqual(['OP18-014']);
    expect(strict('OP18-0145')).toEqual([]);
  });

  it('corrects look-alike characters according to their position', () => {
    expect(strict('0P18-O14')).toEqual([]);
    expect(corrected('0P18-O14')).toEqual(['OP18-014']);
    expect(corrected('OPI8-0l4')).toEqual(['OP18-014']);
    expect(corrected('5T24-004')).toEqual(['ST24-004']);
  });

  it('does not turn words into numbers', () => {
    expect(corrected('SOLID-GOLD and LOG-BOOK')).toEqual([]);
    expect(corrected('')).toEqual([]);
  });
});

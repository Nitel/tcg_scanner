import { parseCardNumber } from './card-number';

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

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

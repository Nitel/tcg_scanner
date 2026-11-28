import type { CardNumber } from './card-number';

/** Output categories, in export order (ADR 007, ADR 015). */
export type OutputCategory = 'op18' | 'alternative' | 'unreadable' | 'other_set';

export interface ScanEntry {
  readonly category: OutputCategory;
  /** Absent for `unreadable`. */
  readonly cardNumber?: CardNumber;
  readonly quantity: number;
}

export interface ScanSession {
  readonly entries: readonly ScanEntry[];
}

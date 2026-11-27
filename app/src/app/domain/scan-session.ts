import type { CardNumber } from './card-number';

/** Output categories, in export order (ADR 007). */
export type OutputCategory = 'op18' | 'foil' | 'unreadable' | 'other_set';

export interface ScanEntry {
  readonly category: OutputCategory;
  /** Absent for `unreadable`. */
  readonly cardNumber?: CardNumber;
  readonly quantity: number;
}

export interface ScanSession {
  readonly entries: readonly ScanEntry[];
}

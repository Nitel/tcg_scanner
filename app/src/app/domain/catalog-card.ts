import type { CardNumber } from './card-number';

export type CardColor = 'red' | 'green' | 'blue' | 'purple' | 'black' | 'yellow';

/** Base rarities only (ADR 005). */
export type Rarity = 'SEC' | 'SR' | 'R' | 'L' | 'UC' | 'C' | 'P';

export interface CatalogCard {
  readonly cardNumber: CardNumber;
  /** Product containing the card, which may differ from the number prefix (ADR 004). */
  readonly setId: string;
  readonly colors: readonly CardColor[];
  readonly rarity: Rarity;
}

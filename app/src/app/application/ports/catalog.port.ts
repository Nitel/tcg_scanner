import type { CardNumber } from '../../domain/card-number';
import type { CatalogCard } from '../../domain/catalog-card';

/** Local card catalog (ADR 004). */
export interface CatalogPort {
  findByNumber(cardNumber: CardNumber): Promise<CatalogCard | undefined>;
}

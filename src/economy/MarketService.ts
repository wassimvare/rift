import { itemById } from '../data/catalog.js';
import type { Store } from '../state/Store.js';
import { addInventoryItem } from '../state/storage.js';

export interface PurchaseResult {
  ok: boolean;
  message: string;
}

export class MarketService {
  constructor(private readonly store: Store) {}

  buy(id: string): PurchaseResult {
    const item = itemById(id);
    if (!item) return { ok: false, message: 'Objet introuvable' };
    if (this.store.get().credits < item.price) {
      return { ok: false, message: 'Pas assez de Nova Credits' };
    }
    this.store.update((state) => {
      state.credits -= item.price;
      addInventoryItem(state, id);
    });
    return { ok: true, message: `${item.name} acheté` };
  }
}

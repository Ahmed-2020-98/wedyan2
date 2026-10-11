import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from './models';

const CART_KEY = 'wedyan_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.load());

  readonly items = computed(() => this.itemsSignal());
  readonly count = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  add(item: CartItem): void {
    const existing = this.itemsSignal().find((i) => i.product_id === item.product_id);

    if (existing) {
      this.update(item.product_id, Math.min(existing.quantity + item.quantity, 99));
    } else {
      this.itemsSignal.update((items) => [...items, item]);
      this.save();
    }
  }

  update(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.itemsSignal.update((items) =>
      items.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
    this.save();
  }

  remove(productId: number): void {
    this.itemsSignal.update((items) => items.filter((i) => i.product_id !== productId));
    this.save();
  }

  clear(): void {
    this.itemsSignal.set([]);
    localStorage.removeItem(CART_KEY);
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.itemsSignal()));
  }
}

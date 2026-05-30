import { computed, Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSignal = signal<Book[]>([]);

  cartItems = this.cartSignal.asReadonly();

  cartCount = computed(() => this.cartSignal().length);

  addToCart(book: Book) {
    if (!this.cartSignal().find((b) => b.id === book.id)) {
      this.cartSignal.update((items) => [...items, book]);
    }
  }

  removeFromCart(bookId: number) {
    this.cartSignal.update((items) => items.filter((b) => b.id !== bookId));
  }

  isInCart(bookId: number): boolean {
    return this.cartSignal().some((b) => b.id === bookId);
  }
}

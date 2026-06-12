import { CommonModule, Location } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideBookmarkPlus, lucideLoader2, lucideTrash2 } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { BookService } from '../../app/services/book.service';
import { CartService } from '../../app/services/cart.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIcon,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmCardImports,
    ...HlmIconImports,
    HlmSkeleton,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideBookmarkPlus,
      lucideTrash2,
      lucideLoader2,
    }),
  ],
  templateUrl: './book-detail.component.html',
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private location = inject(Location);

  private bookId = Number(this.route.snapshot.paramMap.get('id'));

  books = toSignal(this.bookService.books$, { initialValue: [] });
  loading = toSignal(this.bookService.loading$, { initialValue: true });

  book = computed(() => this.books().find((b) => b.id === this.bookId));

  isInCart = computed(() => {
    const currentBook = this.book();
    return currentBook ? this.cartService.isInCart(currentBook.id) : false;
  });

  ngOnInit() {
    if (this.books().length === 0) {
      this.bookService.getBooks(40).subscribe();
    }
  }

  goBack() {
    this.location.back();
  }

  toggleCart() {
    const currentBook = this.book();
    if (!currentBook) return;

    if (this.isInCart()) {
      this.cartService.removeFromCart(currentBook.id);
    } else {
      this.cartService.addToCart(currentBook);
    }
  }

  handleImageError(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    // Note: fakerapi.it generates dead image links (placeimg.com no longer exists).
    // Any invalid image URL is automatically replaced by a default placehold.co image.
    target.src = 'https://placehold.co/400x600/e2e8f0/475569';
  }
}

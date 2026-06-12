import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideStar } from '@ng-icons/lucide';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmToggleImports } from '@spartan-ng/helm/toggle';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { HlmCardImports } from '@spartan-ng/ui/card';
import { HlmInputImports } from '@spartan-ng/ui/input';
import type { Book } from '../../app/models/book.model';
import { BookService } from '../../app/services/book.service';
import { CartService } from '../../app/services/cart.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgIcon,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmCardImports,
    ...HlmInputGroupImports,
    ...HlmSelectImports,
    ...HlmPaginationImports,
    ...HlmEmptyImports,
    HlmAutocompleteImports,
    ...HlmToggleImports,
    HlmSkeleton,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideStar,
    }),
  ],
  templateUrl: './book-list.component.html',
})
export class BookListComponent implements OnInit {
  private bookService = inject(BookService);
  public cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public books = toSignal(this.bookService.books$, { initialValue: [] });
  public loading = toSignal(this.bookService.loading$, { initialValue: true });
  public error = toSignal(this.bookService.error$, { initialValue: null });

  private readonly FAVORITES_STORAGE_KEY = 'favoriteBookIds';

  private readonly favoriteBookIds = signal<ReadonlySet<number>>(new Set<number>());
  public favoritesOnly = signal(false);

  public searchTerm = signal('');
  public selectedGenre = signal<string | null>(null);
  public sortBy = signal('title-asc');
  public currentPage = signal(1);

  constructor() {
    this.loadFavoritesFromStorage();

    this.route.queryParams.subscribe((params) => {
      // biome-ignore lint/complexity/useLiteralKeys: required by noPropertyAccessFromIndexSignature in strict TS
      const genre = params['genre'];
      this.selectedGenre.set(genre && genre !== 'all' ? genre : null);

      // biome-ignore lint/complexity/useLiteralKeys: required by noPropertyAccessFromIndexSignature in strict TS
      const search = params['search'];
      this.searchTerm.set(search || '');

      // biome-ignore lint/complexity/useLiteralKeys: required by noPropertyAccessFromIndexSignature in strict TS
      const page = Number.parseInt(params['page'] || '1', 10);
      this.currentPage.set(Number.isNaN(page) || page < 1 ? 1 : page);
    });
  }

  ngOnInit(): void {
    this.bookService.getBooks(40).subscribe();
  }

  public genres = computed(() => {
    const currentBooks = this.books();
    const genresSet = new Set(currentBooks.map((b) => b.genre));
    return Array.from(genresSet).sort();
  });

  public allFilteredBooks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const genre = this.selectedGenre();
    const favoritesOnly = this.favoritesOnly();
    const favorites = this.favoriteBookIds();

    let currentBooks = this.books();

    if (genre && genre !== 'all') {
      currentBooks = currentBooks.filter(
        (book) => book.genre.toLowerCase() === genre.toLowerCase(),
      );
    }

    if (term) {
      currentBooks = currentBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term),
      );
    }

    if (favoritesOnly) {
      currentBooks = currentBooks.filter((book) => favorites.has(book.id));
    }

    const sortedBooks = [...currentBooks];
    const sort = this.sortBy();

    sortedBooks.sort((a, b) => {
      if (sort === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sort === 'author-asc') {
        return a.author.localeCompare(b.author);
      }
      if (sort === 'author-desc') {
        return b.author.localeCompare(a.author);
      }
      return 0;
    });

    return sortedBooks;
  });

  public autocompleteSuggestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return [];

    return this.allFilteredBooks().slice(0, 5);
  });

  public totalPages = computed(() => {
    return Math.ceil(this.allFilteredBooks().length / 10) || 1;
  });

  public pageNumbers = computed(() => {
    const pages = this.totalPages();
    const arr = [];
    for (let i = 1; i <= pages; i++) {
      arr.push(i);
    }
    return arr;
  });

  public paginatedBooks = computed(() => {
    const booksList = this.allFilteredBooks();
    const page = this.currentPage();
    const start = (page - 1) * 10;
    const end = start + 10;
    return booksList.slice(start, end);
  });

  public onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, search: term || null },
      queryParamsHandling: 'merge',
    });
  }

  public onGenreChange(genre: string | null): void {
    this.selectedGenre.set(genre);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, genre: genre ?? null },
      queryParamsHandling: 'merge',
    });
  }

  public resetFilters(): void {
    this.searchTerm.set('');
    this.selectedGenre.set(null);
    this.currentPage.set(1);
    this.favoritesOnly.set(false);
    this.sortBy.set('title-asc');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, search: null, genre: null, favoritesOnly: null, sortBy: null },
      queryParamsHandling: 'merge',
    });
  }

  public isFavorite(bookId: number): boolean {
    return this.favoriteBookIds().has(bookId);
  }

  public onBookFavoriteStateChange(bookId: number, nextState: unknown): void {
    this.setFavorite(bookId, this.coerceToggleStateToBoolean(nextState));
  }

  public visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    } else if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    } else {
      return [1, '...', current - 1, current, current + 1, '...', total];
    }
  });

  public onFavoritesOnlyStateChange(nextState: unknown): void {
    this.favoritesOnly.set(this.coerceToggleStateToBoolean(nextState));

    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  private setFavorite(bookId: number, isFavorite: boolean): void {
    const next = new Set(this.favoriteBookIds());

    if (isFavorite) {
      next.add(bookId);
    } else {
      next.delete(bookId);
    }

    this.favoriteBookIds.set(next);
    this.saveFavoritesToStorage(next);

    if (this.favoritesOnly()) {
      this.clampCurrentPageToTotalPages();
    }
  }

  private clampCurrentPageToTotalPages(): void {
    const totalPages = this.totalPages();
    if (this.currentPage() <= totalPages) return;

    this.currentPage.set(totalPages);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: totalPages },
      queryParamsHandling: 'merge',
    });
  }

  private coerceToggleStateToBoolean(state: unknown): boolean {
    return state === 'on' || state === true;
  }

  private loadFavoritesFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const ids = parsed
        .map((v) => (typeof v === 'number' ? v : Number(v)))
        .filter((v) => Number.isFinite(v)) as number[];

      this.favoriteBookIds.set(new Set(ids));
    } catch {}
  }

  private saveFavoritesToStorage(ids: ReadonlySet<number>): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {}
  }

  public toggleCart(book: Book): void {
    if (this.cartService.isInCart(book.id)) {
      this.cartService.removeFromCart(book.id);
    } else {
      this.cartService.addToCart(book);
    }
  }

  public goToBook(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  public handleImageError(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    // Note: fakerapi.it generates dead image links (placeimg.com no longer exists).
    // Any invalid image URL is automatically replaced by a default placehold.co image.
    target.src = 'https://placehold.co/400x600/e2e8f0/475569';
  }
}

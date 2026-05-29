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
    HlmSkeleton,
    ...HlmToggleImports,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideStar,
    }),
  ],
  template: `
    <div class="container mx-auto p-4 md:p-8">

      <div class="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">

        <h1 class="text-3xl font-bold tracking-tight" i18n="Book List|Page title@@books.title">
          Books
        </h1>

        <div class="flex flex-col lg:flex-row gap-3 justify-end w-full">

          <div class="relative flex-grow w-full">

            <label
              for="book-search"
              class="sr-only"
              i18n="Search|Label for book search input@@books.search.label"
            >
              Search books by title or author
            </label>

            <ng-icon
              name="lucideSearch"
              size="sm"
              aria-hidden="true"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none"
            />

            <hlm-autocomplete
              class="w-full"
              [search]="searchTerm()"
              (searchChange)="onSearchChange($event)"
            >
              <hlm-autocomplete-input
                inputId="book-search"
                placeholder="Search books by title or author..."
                i18n-placeholder="Search|Placeholder for search input@@books.search.placeholder"
              />

              <hlm-autocomplete-content *hlmAutocompletePortal>
                <hlm-autocomplete-empty i18n="Search|Message when no results@@books.search.noResults">
                  No books found.
                </hlm-autocomplete-empty>

                <div hlmAutocompleteList>
                  @for (book of autocompleteSuggestions(); track book.id) {
                    <hlm-autocomplete-item
                      [value]="book.title"
                      (click)="goToBook(book.id)"
                      class="cursor-pointer"
                    >
                      {{ book.title }}
                      <span class="text-xs text-muted-foreground ml-2" i18n="Search|Autocomplete author prefix@@books.search.authorPrefix">
                        from {{ book.author }}
                      </span>
                    </hlm-autocomplete-item>
                  }
                </div>
              </hlm-autocomplete-content>
            </hlm-autocomplete>

            <div class="sr-only" aria-live="polite">
              @if (loading()) {
                <span i18n="Search|Live region loading state@@books.search.liveLoading">Loading books…</span>
              } @else if (error()) {
                <span i18n="Search|Live region error state@@books.search.liveError">An error occurred while loading books.</span>
              } @else if (allFilteredBooks().length === 0) {
                <span i18n="Search|Live region when no results@@books.search.liveNone">No books found.</span>
              } @else if (allFilteredBooks().length === 1) {
                <span i18n="Search|Live region singular result@@books.search.liveOne">1 book found.</span>
              } @else {
                <span i18n="Search|Live region plural results@@books.search.liveMany">{{ allFilteredBooks().length }} books found.</span>
              }
            </div>

            @if (allFilteredBooks().length > 0) {
              <div
                class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10"
                aria-hidden="true"
              >
                {{ allFilteredBooks().length }}
                @if (allFilteredBooks().length === 1) {
                  <span class="ml-1" i18n="Search|Singular label for book count@@books.search.bookSingular">book</span>
                } @else {
                  <span class="ml-1" i18n="Search|Plural label for book count@@books.search.bookPlural">books</span>
                }
              </div>
            }
          </div>
          <hlm-select
            [ngModel]="selectedGenre()"
            (ngModelChange)="onGenreChange($event)"
            class="w-full lg:w-44"
          >
            <hlm-select-trigger class="w-full lg:w-44">
              <span class="sr-only" i18n="Filter|SR prefix for genre select@@books.filter.genreSrPrefix">
                Filter by genre:
              </span>
              @if (selectedGenre() === null) {
                <span class="text-muted-foreground" i18n="Filter|Placeholder for genre selection@@books.filter.genrePlaceholder">
                  All Genres
                </span>
              } @else {
                <span>{{ selectedGenre() }}</span>
              }
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label i18n="Filter|Label for genres@@books.filter.genreLabel">
                  Genres
                </hlm-select-label>

                <hlm-select-item [value]="null" i18n="Filter|Option all genres@@books.filter.allGenres">
                  All Genres
                </hlm-select-item>

                @for (genre of genres(); track genre) {
                  <hlm-select-item [value]="genre">
                    {{ genre }}
                  </hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>

          <button
            hlmToggle
            size="default"
            variant="outline"
            type="button"
            class="min-w-32 justify-center data-[state=on]:*:[ng-icon]:*:[svg]:fill-foreground data-[state=on]:bg-transparent"
            [state]="favoritesOnly() ? 'on' : 'off'"
            (stateChange)="onFavoritesOnlyStateChange($event)"
            aria-label="Show favorites only"
            i18n-aria-label="Filter|Aria label for favorites-only toggle@@books.filter.favoritesOnly.aria"
          >
            <ng-icon name="lucideStar" aria-hidden="true" />
            <span i18n="Filter|Favorites toggle label@@books.filter.favorites">Favorites</span>
          </button>

          <hlm-select
            [ngModel]="sortBy()"
            (ngModelChange)="sortBy.set($event)"
            class="w-full lg:w-44"
          >
            <hlm-select-trigger class="w-full lg:w-44">
              <span class="sr-only" i18n="Sort|SR prefix for sort select@@books.sort.srPrefix">
                Sort books:
              </span>
              @switch (sortBy()) {
                @case ('title-asc') {
                  <span i18n="Sort|Current sort in trigger@@books.sort.titleAsc">Title (A-Z)</span>
                }
                @case ('title-desc') {
                  <span i18n="Sort|Current sort in trigger@@books.sort.titleDesc">Title (Z-A)</span>
                }
                @case ('author-asc') {
                  <span i18n="Sort|Current sort in trigger@@books.sort.authorAsc">Author (A-Z)</span>
                }
                @case ('author-desc') {
                  <span i18n="Sort|Current sort in trigger@@books.sort.authorDesc">Author (Z-A)</span>
                }
                @default {
                  <span class="text-muted-foreground" i18n="Sort|Placeholder for sorting@@books.sort.placeholder">Sort By</span>
                }
              }
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label i18n="Sort|Label for sorting@@books.sort.label">
                  Sort By
                </hlm-select-label>

                <hlm-select-item value="title-asc" i18n="Sort|Sorting option@@books.sort.titleAsc">Title (A-Z)</hlm-select-item>
                <hlm-select-item value="title-desc" i18n="Sort|Sorting option@@books.sort.titleDesc">Title (Z-A)</hlm-select-item>
                <hlm-select-item value="author-asc" i18n="Sort|Sorting option@@books.sort.authorAsc">Author (A-Z)</hlm-select-item>
                <hlm-select-item value="author-desc" i18n="Sort|Sorting option@@books.sort.authorDesc">Author (Z-A)</hlm-select-item>
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>

        </div>
      </div>

      @if (loading()) {
        <div
          class="my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-center w-full"
          aria-hidden="true"
        >
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
          <hlm-skeleton class="h-112 rounded-2xl w-full"></hlm-skeleton>
        </div>
      }

      @if (error()) {
        <div
          class="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded relative mb-6"
          role="alert"
          aria-live="assertive"
        >
          {{ error() }}
        </div>
      }

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        [attr.aria-busy]="loading() ? 'true' : null"
      >

        @if (!loading() && !error()) {

          @for (book of paginatedBooks(); track book.id) {
            <section
              hlmCard
              class="flex flex-col overflow-hidden group pt-0"
              [attr.aria-labelledby]="'book-title-' + book.id"
            >

              <div class="h-48 overflow-hidden bg-muted relative">
                <img
                  [src]="book.image"
                  (error)="handleImageError($event)"
                  i18n-title="Image|Book cover title@@books.card.coverTitle"
                  title="Book cover"
                  alt="Book cover of {{ book.title }} by {{ book.author }}"
                  i18n-alt="Image|Book cover alt text@@books.card.coverAlt"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                <button
                  hlmToggle
                  size="default"
                  variant="outline"
                  type="button"
                  class="absolute top-2 left-2 z-10 bg-background data-[state=on]:*:[ng-icon]:*:[svg]:fill-foreground py-1 px-1"
                  [state]="isFavorite(book.id) ? 'on' : 'off'"
                  (stateChange)="onBookFavoriteStateChange(book.id, $event)"
                  [attr.aria-describedby]="'book-title-' + book.id"
                >
                  <ng-icon name="lucideStar" aria-hidden="true" />
                  <span class="sr-only" i18n="Action|Favorite toggle label@@books.card.favorite">Favorite</span>
                  <span class="sr-only" i18n="Action|SR-only suffix to clarify which book@@books.card.btn.srSuffix">
                    for {{ book.title }}
                  </span>
                </button>

                <div class="absolute top-2 right-2 bg-background/95 backdrop-blur px-2 py-1 rounded text-xs font-semibold">
                  {{ book.genre }}
                </div>
              </div>

              <div hlmCardHeader class="pb-2">
                <h3 hlmCardTitle class="line-clamp-2 text-lg" [attr.id]="'book-title-' + book.id">
                  {{ book.title }}
                </h3>
                <p hlmCardDescription>
                  {{ book.author }}
                </p>
              </div>

              <div hlmCardContent class="flex-grow">
                <p class="text-sm text-muted-foreground line-clamp-3">
                  {{ book.description }}
                </p>
              </div>

              <div hlmCardFooter class="flex gap-2 pt-4">
                <a
                  [routerLink]="['/books', book.id]"
                  hlmBtn
                  variant="secondary"
                  class="flex-1"
                  i18n="Action|Details button@@books.btn.details"
                >
                  Details
                  <span class="sr-only">
                    for {{ book.title }}
                  </span>
                </a>
                <button
                  hlmBtn
                  [variant]="cartService.isInCart(book.id) ? 'destructive' : 'default'"
                  (click)="toggleCart(book)"
                  class="flex-1"
                >
                  @if (cartService.isInCart(book.id)) {
                    <span i18n="Action|Remove button on book card@@books.card.btn.remove">Remove</span>
                  } @else {
                    <span i18n="Action|Reserve button on book card@@books.card.btn.reserve">Reserve</span>
                  }
                  <span class="sr-only" i18n="Action|SR-only suffix to clarify which book@@books.card.btn.srSuffix">
                    for {{ book.title }}
                  </span>
                </button>
              </div>

            </section>
          }

          @if (allFilteredBooks().length === 0) {
            <div class="col-span-full" role="status" aria-live="polite">
              <hlm-empty>
                <hlm-empty-header>
                  <hlm-empty-media variant="icon">
                    <ng-icon name="lucideSearch" aria-hidden="true" />
                  </hlm-empty-media>
                  <div hlmEmptyTitle i18n="Search|No books found title@@books.empty.title">
                    No books found
                  </div>
                  <div hlmEmptyDescription i18n="Search|No books found description@@books.empty.desc">
                    Try adjusting your search term or genre filter.
                  </div>
                </hlm-empty-header>

                <hlm-empty-content class="flex-row justify-center gap-2">
                  <button
                    hlmBtn
                    variant="outline"
                    (click)="resetFilters()"
                    i18n="Action|Reset filters button@@books.btn.reset"
                  >
                    Reset filters
                  </button>
                </hlm-empty-content>
              </hlm-empty>
            </div>
          }

          @if (totalPages() > 1) {
            <nav
              hlmPagination
              class="mt-12 flex justify-center col-span-full"
              aria-label="Pagination"
              i18n-aria-label="Pagination|Aria label for pagination navigation@@pagination.nav.aria"
            >
              <ul hlmPaginationContent>

                <li hlmPaginationItem>
                  <hlm-pagination-previous
                    [link]="currentPage() > 1 ? '/books' : undefined"
                    [queryParams]="currentPage() > 1 ? { page: currentPage() - 1 } : undefined"
                    [queryParamsHandling]="currentPage() > 1 ? 'merge' : undefined"
                    [class.pointer-events-none]="currentPage() === 1"
                    [class.opacity-50]="currentPage() === 1"
                    [class.cursor-not-allowed]="currentPage() === 1"
                    class="hover:bg-muted"
                    text="Previous"
                    i18n-text="Pagination|Previous page link text@@pagination.previous"
                    aria-label="Go to previous page"
                    i18n-aria-label="Pagination|Aria label for previous page@@pagination.ariaPrevious"
                  />
                </li>

                @for (page of visiblePages(); track $index) {
                    <li hlmPaginationItem>
                      @if (page === '...') {
                        <hlm-pagination-ellipsis />
                      } @else {
                        <a
                          hlmPaginationLink
                          link="/books"
                          [queryParams]="{ page: page }"
                          queryParamsHandling="merge"
                          [isActive]="currentPage() === page"
                        >
                          {{ page }}
                        </a>
                      }
                    </li>
                  }

                <li hlmPaginationItem>
                  <hlm-pagination-next
                    [link]="currentPage() < totalPages() ? '/books' : undefined"
                    [queryParams]="currentPage() < totalPages() ? { page: currentPage() + 1 } : undefined"
                    [queryParamsHandling]="currentPage() < totalPages() ? 'merge' : undefined"
                    [class.pointer-events-none]="currentPage() === totalPages()"
                    [class.opacity-50]="currentPage() === totalPages()"
                    [class.cursor-not-allowed]="currentPage() === totalPages()"
                    class="hover:bg-muted"
                    text="Next"
                    i18n-text="Pagination|Next page link text@@pagination.next"
                    aria-label="Go to next page"
                    i18n-aria-label="Pagination|Aria label for next page@@pagination.ariaNext"
                  />
                </li>

              </ul>
            </nav>
          }
        }
      </div>
    </div>
  `,
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

    // Keep pagination predictable when the result set changes.
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
    } catch {
      // ignore storage errors (quota, privacy mode, ...)
    }
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

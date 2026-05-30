if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, type Params, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '../../app/models/book.model';
import { BookService } from '../../app/services/book.service';
import { CartService } from '../../app/services/cart.service';
import { BookListComponent } from './book-list.component';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  // biome-ignore lint/suspicious/noExplicitAny: spy object for mock testing
  let bookServiceSpy: any;
  let router: Router;
  let mockQueryParams: BehaviorSubject<Params>;
  let mockBooksSubject: BehaviorSubject<Book[]>;
  let mockLoadingSubject: BehaviorSubject<boolean>;
  let mockErrorSubject: BehaviorSubject<string | null>;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'Book A',
      author: 'Author Z',
      genre: 'Fantasy',
      description: 'Fantasy Book',
      isbn: '111',
      image: 'img1',
      published: '2026',
      publisher: 'Pub1',
    },
    {
      id: 2,
      title: 'Book B',
      author: 'Author Y',
      genre: 'Science',
      description: 'SciFi Book',
      isbn: '222',
      image: 'img2',
      published: '2026',
      publisher: 'Pub2',
    },
    {
      id: 3,
      title: 'Book C',
      author: 'Author X',
      genre: 'Fantasy',
      description: 'Another Fantasy Book',
      isbn: '333',
      image: 'img3',
      published: '2026',
      publisher: 'Pub3',
    },
  ];

  beforeEach(async () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }

    mockBooksSubject = new BehaviorSubject<Book[]>(mockBooks);
    mockLoadingSubject = new BehaviorSubject<boolean>(false);
    mockErrorSubject = new BehaviorSubject<string | null>(null);

    mockQueryParams = new BehaviorSubject<Params>({});

    bookServiceSpy = {
      books$: mockBooksSubject.asObservable(),
      loading$: mockLoadingSubject.asObservable(),
      error$: mockErrorSubject.asObservable(),
      getBooks: vi.fn().mockReturnValue(of(mockBooks)),
    };

    await TestBed.configureTestingModule({
      imports: [BookListComponent],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        CartService,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: mockQueryParams.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch books on init', () => {
    fixture.detectChanges();
    expect(bookServiceSpy.getBooks).toHaveBeenCalledWith(40);
    expect(component.books()).toEqual(mockBooks);
  });

  it('should correctly list and sort genres alphabetically', () => {
    fixture.detectChanges();
    expect(component.genres()).toEqual(['Fantasy', 'Science']);
  });

  describe('Filtering and Searching', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter books by searchTerm matching title or author', () => {
      component.searchTerm.set('Book B');
      expect(component.allFilteredBooks()).toEqual([mockBooks[1]]);

      component.searchTerm.set('Author Z');
      expect(component.allFilteredBooks()).toEqual([mockBooks[0]]);

      component.searchTerm.set('Nonexistent');
      expect(component.allFilteredBooks()).toEqual([]);
    });

    it('should filter books by genre', () => {
      component.selectedGenre.set('Fantasy');
      // Fantasy contains Book A and Book C. By default sorted by title-asc: [Book A, Book C]
      expect(component.allFilteredBooks()).toEqual([mockBooks[0], mockBooks[2]]);

      component.selectedGenre.set('Science');
      expect(component.allFilteredBooks()).toEqual([mockBooks[1]]);
    });

    it('should sort books correctly', () => {
      // title-asc
      component.sortBy.set('title-asc');
      expect(component.allFilteredBooks().map((b) => b.title)).toEqual([
        'Book A',
        'Book B',
        'Book C',
      ]);

      // title-desc
      component.sortBy.set('title-desc');
      expect(component.allFilteredBooks().map((b) => b.title)).toEqual([
        'Book C',
        'Book B',
        'Book A',
      ]);

      // author-asc (X, Y, Z)
      component.sortBy.set('author-asc');
      expect(component.allFilteredBooks().map((b) => b.author)).toEqual([
        'Author X',
        'Author Y',
        'Author Z',
      ]);

      // author-desc (Z, Y, X)
      component.sortBy.set('author-desc');
      expect(component.allFilteredBooks().map((b) => b.author)).toEqual([
        'Author Z',
        'Author Y',
        'Author X',
      ]);
    });
  });

  describe('Favorites Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add/remove favorites and toggle favorites-only filtering', () => {
      expect(component.isFavorite(1)).toBe(false);

      // Add to favorite
      component.onBookFavoriteStateChange(1, true);
      expect(component.isFavorite(1)).toBe(true);

      // Filter favorites only
      component.favoritesOnly.set(true);
      expect(component.allFilteredBooks()).toEqual([mockBooks[0]]);

      // Remove from favorite
      component.onBookFavoriteStateChange(1, false);
      expect(component.isFavorite(1)).toBe(false);
      expect(component.allFilteredBooks()).toEqual([]);
    });

    it('should load and save favorites from/to localStorage', () => {
      // Save favorites
      component.onBookFavoriteStateChange(2, true);

      // Verify localStorage storage
      const stored = window.localStorage.getItem('favoriteBookIds');
      expect(stored).toBe('[2]');

      // Create new instance of component to test loading
      const newFixture = TestBed.createComponent(BookListComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.isFavorite(2)).toBe(true);
      expect(newComponent.isFavorite(1)).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should calculate totalPages correctly', () => {
      // Mocking 15 books
      const mockManyBooks = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        author: `Author ${i + 1}`,
        genre: 'Fiction',
        description: 'Desc',
        isbn: String(i),
        image: 'img',
        published: '2026',
        publisher: 'Pub',
      }));

      mockBooksSubject.next(mockManyBooks);
      fixture.detectChanges();

      expect(component.totalPages()).toBe(2); // 15 / 10 = 2 pages
    });

    it('should paginate items correctly', () => {
      const mockManyBooks = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Book ${String.fromCharCode(65 + i)}`, // Book A, Book B...
        author: 'Author',
        genre: 'Fiction',
        description: 'Desc',
        isbn: String(i),
        image: 'img',
        published: '2026',
        publisher: 'Pub',
      }));

      mockBooksSubject.next(mockManyBooks);
      fixture.detectChanges();

      // Page 1 should contain items 1 to 10
      component.currentPage.set(1);
      expect(component.paginatedBooks().length).toBe(10);
      expect(component.paginatedBooks()[0].title).toBe('Book A');

      // Page 2 should contain items 11 and 12
      component.currentPage.set(2);
      expect(component.paginatedBooks().length).toBe(2);
      expect(component.paginatedBooks()[0].title).toBe('Book K');
    });

    it('should generate visible page arrays with ellipsis', () => {
      fixture.detectChanges();

      // Case <= 5 pages
      expect(component.visiblePages()).toEqual([1]); // Total pages is 1 with 3 books

      // Mock 60 books (6 pages)
      const mock60Books = Array.from({ length: 55 }, (_, i) => ({
        id: i + 1,
        title: 'Book',
        author: 'Author',
        genre: 'Fiction',
        description: 'Desc',
        isbn: String(i),
        image: 'img',
        published: '2026',
        publisher: 'Pub',
      }));
      mockBooksSubject.next(mock60Books);
      fixture.detectChanges();

      expect(component.totalPages()).toBe(6);

      // Current page 1: should return [1, 2, 3, 4, '...', 6]
      component.currentPage.set(1);
      expect(component.visiblePages()).toEqual([1, 2, 3, 4, '...', 6]);

      // Current page 4 (with total = 6): since 4 >= 6 - 2, should return [1, '...', 3, 4, 5, 6]
      component.currentPage.set(4);
      expect(component.visiblePages()).toEqual([1, '...', 3, 4, 5, 6]);

      // Current page 4 (with total = 8): should return [1, '...', 3, 4, 5, '...', 8]
      const mock80Books = Array.from({ length: 75 }, (_, i) => ({
        id: i + 1,
        title: 'Book',
        author: 'Author',
        genre: 'Fiction',
        description: 'Desc',
        isbn: String(i),
        image: 'img',
        published: '2026',
        publisher: 'Pub',
      }));
      mockBooksSubject.next(mock80Books);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(8);
      component.currentPage.set(4);
      expect(component.visiblePages()).toEqual([1, '...', 3, 4, 5, '...', 8]);
    });
  });

  describe('Route Synchronizations', () => {
    it('should update queryParams when search changes', () => {
      fixture.detectChanges();
      component.onSearchChange('Angular');

      expect(component.searchTerm()).toBe('Angular');
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { page: 1, search: 'Angular' },
        queryParamsHandling: 'merge',
      });
    });

    it('should update queryParams when genre changes', () => {
      fixture.detectChanges();
      component.onGenreChange('Science');

      expect(component.selectedGenre()).toBe('Science');
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { page: 1, genre: 'Science' },
        queryParamsHandling: 'merge',
      });
    });

    it('should reset all filters and navigation state on resetFilters()', () => {
      fixture.detectChanges();
      component.searchTerm.set('Test');
      component.selectedGenre.set('Fantasy');
      component.currentPage.set(2);
      component.favoritesOnly.set(true);
      component.sortBy.set('author-desc');

      component.resetFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.selectedGenre()).toBeNull();
      expect(component.currentPage()).toBe(1);
      expect(component.favoritesOnly()).toBe(false);
      expect(component.sortBy()).toBe('title-asc');

      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { page: 1, search: null, genre: null, favoritesOnly: null, sortBy: null },
        queryParamsHandling: 'merge',
      });
    });
  });
});

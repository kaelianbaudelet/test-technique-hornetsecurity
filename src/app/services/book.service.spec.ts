import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Book, FakerApiResponse } from '../models/book.model';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const mockApiResponse: FakerApiResponse<Book> = {
    status: 'OK',
    code: 200,
    total: 2,
    data: [
      {
        id: 1,
        title: 'Mock Book 1',
        author: 'Mock Author 1',
        genre: 'Fiction',
        description: 'Description 1',
        isbn: '111',
        image: 'img1',
        published: '2026',
        publisher: 'Pub1',
      },
      {
        id: 2,
        title: 'Mock Book 2',
        author: 'Mock Author 2',
        genre: 'History',
        description: 'Description 2',
        isbn: '222',
        image: 'img2',
        published: '2026',
        publisher: 'Pub2',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with default states', () => {
    let booksCount = -1;
    let isLoading = true;
    let errorMessage: string | null = '';

    service.books$.subscribe((books) => {
      booksCount = books.length;
    });
    service.loading$.subscribe((loading) => {
      isLoading = loading;
    });
    service.error$.subscribe((err) => {
      errorMessage = err;
    });

    expect(booksCount).toBe(0);
    expect(isLoading).toBe(false);
    expect(errorMessage).toBeNull();
  });

  it('should fetch books successfully and update states', () => {
    let emittedBooks: Book[] = [];
    const loadingStates: boolean[] = [];
    let emittedError: string | null = null;

    service.books$.subscribe((b) => {
      emittedBooks = b;
    });
    service.loading$.subscribe((l) => {
      loadingStates.push(l);
    });
    service.error$.subscribe((e) => {
      emittedError = e;
    });

    // Initial state check
    expect(loadingStates).toEqual([false]);

    service.getBooks(20).subscribe((books) => {
      expect(books).toEqual(mockApiResponse.data);
    });

    // Request is made, check loading state changes to true
    expect(loadingStates).toEqual([false, true]);

    const req = httpMock.expectOne((r) => r.url.startsWith('https://fakerapi.it/api/v2/books'));
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toContain('_quantity=20');

    // Respond with mock response
    req.flush(mockApiResponse);

    // After response, books are emitted, loading returns to false, error remains null
    expect(emittedBooks).toEqual(mockApiResponse.data);
    expect(loadingStates).toEqual([false, true, false]);
    expect(emittedError).toBeNull();
  });

  it('should handle errors during fetch gracefully', () => {
    let emittedBooks: Book[] = [];
    const loadingStates: boolean[] = [];
    let emittedError: string | null = null;

    service.books$.subscribe((b) => {
      emittedBooks = b;
    });
    service.loading$.subscribe((l) => {
      loadingStates.push(l);
    });
    service.error$.subscribe((e) => {
      emittedError = e;
    });

    service.getBooks(20).subscribe((books) => {
      expect(books).toEqual([]);
    });

    const req = httpMock.expectOne((r) => r.url.startsWith('https://fakerapi.it/api/v2/books'));
    req.flush('Error fetching data', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(emittedBooks).toEqual([]);
    expect(loadingStates).toEqual([false, true, false]);
    expect(emittedError).toBe('Failed to load books. Please try again later.');
  });
});

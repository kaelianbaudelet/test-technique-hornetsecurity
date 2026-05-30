if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '../../app/models/book.model';
import { BookService } from '../../app/services/book.service';
import { CartService } from '../../app/services/cart.service';
import { BookDetailComponent } from './book-detail.component';

describe('BookDetailComponent', () => {
  let component: BookDetailComponent;
  let fixture: ComponentFixture<BookDetailComponent>;
  // biome-ignore lint/suspicious/noExplicitAny: spy object for mock testing
  let bookServiceSpy: any;
  let cartService: CartService;
  let location: Location;

  const mockBook: Book = {
    id: 1,
    title: 'Detail Book',
    author: 'Detail Author',
    genre: 'Fiction',
    description: 'Beautiful story synopsis.',
    isbn: '999',
    image: 'img-detail',
    published: '2026-05-30',
    publisher: 'Publisher Detail',
  };

  const mockBooksSubject = new BehaviorSubject<Book[]>([mockBook]);
  const mockLoadingSubject = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    bookServiceSpy = {
      books$: mockBooksSubject.asObservable(),
      loading$: mockLoadingSubject.asObservable(),
      getBooks: vi.fn().mockReturnValue(of([mockBook])),
    };

    await TestBed.configureTestingModule({
      imports: [BookDetailComponent],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        CartService,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    location = TestBed.inject(Location);
    vi.spyOn(location, 'back');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load book from service and map it to signal', () => {
    fixture.detectChanges();
    expect(component.book()).toEqual(mockBook);
    expect(component.isInCart()).toBe(false);
  });

  it('should fetch books on init if store is empty', () => {
    // Empty store mock
    const emptyBooksSubject = new BehaviorSubject<Book[]>([]);
    bookServiceSpy.books$ = emptyBooksSubject.asObservable();

    const tempFixture = TestBed.createComponent(BookDetailComponent);
    tempFixture.detectChanges();

    expect(bookServiceSpy.getBooks).toHaveBeenCalledWith(40);
  });

  it('should toggle reservation state in CartService when clicking toggleCart', () => {
    fixture.detectChanges();
    expect(component.isInCart()).toBe(false);

    // Reserve book
    component.toggleCart();
    expect(cartService.isInCart(mockBook.id)).toBe(true);
    expect(component.isInCart()).toBe(true);

    // Remove book
    component.toggleCart();
    expect(cartService.isInCart(mockBook.id)).toBe(false);
    expect(component.isInCart()).toBe(false);
  });

  it('should trigger location.back when calling goBack', () => {
    fixture.detectChanges();
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});

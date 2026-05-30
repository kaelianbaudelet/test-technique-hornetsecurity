import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Book } from '../models/book.model';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const mockBook1: Book = {
    id: 1,
    title: 'Test Book 1',
    author: 'Author 1',
    genre: 'Fiction',
    description: 'Description 1',
    isbn: '1234567890',
    image: 'https://placehold.co/400x600',
    published: '2026-05-30',
    publisher: 'Publisher 1',
  };

  const mockBook2: Book = {
    id: 2,
    title: 'Test Book 2',
    author: 'Author 2',
    genre: 'Science',
    description: 'Description 2',
    isbn: '0987654321',
    image: 'https://placehold.co/400x600',
    published: '2026-05-30',
    publisher: 'Publisher 2',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should start with an empty cart', () => {
    expect(service.cartItems()).toEqual([]);
    expect(service.cartCount()).toBe(0);
  });

  it('should add a book to the cart', () => {
    service.addToCart(mockBook1);
    expect(service.cartItems()).toEqual([mockBook1]);
    expect(service.cartCount()).toBe(1);
    expect(service.isInCart(1)).toBe(true);
  });

  it('should not add a duplicate book to the cart', () => {
    service.addToCart(mockBook1);
    service.addToCart(mockBook1);
    expect(service.cartItems()).toEqual([mockBook1]);
    expect(service.cartCount()).toBe(1);
  });

  it('should add multiple different books to the cart', () => {
    service.addToCart(mockBook1);
    service.addToCart(mockBook2);
    expect(service.cartItems()).toEqual([mockBook1, mockBook2]);
    expect(service.cartCount()).toBe(2);
  });

  it('should remove a book from the cart', () => {
    service.addToCart(mockBook1);
    service.addToCart(mockBook2);
    service.removeFromCart(1);
    expect(service.cartItems()).toEqual([mockBook2]);
    expect(service.cartCount()).toBe(1);
    expect(service.isInCart(1)).toBe(false);
    expect(service.isInCart(2)).toBe(true);
  });

  it('should check if a book is in the cart', () => {
    expect(service.isInCart(1)).toBe(false);
    service.addToCart(mockBook1);
    expect(service.isInCart(1)).toBe(true);
    expect(service.isInCart(2)).toBe(false);
  });
});

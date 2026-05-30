if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Book } from '../../app/models/book.model';
import { CartService } from '../../app/services/cart.service';
import { BasketComponent } from './basket.component';

describe('BasketComponent', () => {
  let component: BasketComponent;
  let fixture: ComponentFixture<BasketComponent>;
  let cartService: CartService;

  const mockBook: Book = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Fiction',
    description: 'Test Description',
    isbn: '123',
    image: 'img',
    published: '2026',
    publisher: 'Pub',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasketComponent, ReactiveFormsModule],
      providers: [CartService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BasketComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with invalid form state', () => {
    expect(component.checkoutForm.valid).toBe(false);
    expect(component.isSubmitted()).toBe(false);
    expect(component.formSubmitAttempt).toBe(false);
  });

  describe('Form Validation', () => {
    it('should validate that fields are required', () => {
      const form = component.checkoutForm;
      expect(form.get('firstName')?.valid).toBe(false);
      expect(form.get('lastName')?.valid).toBe(false);
      expect(form.get('phone')?.valid).toBe(false);
      expect(form.get('email')?.valid).toBe(false);

      form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        phone: '0612345678',
        email: 'john.doe@example.com',
      });

      expect(form.get('firstName')?.valid).toBe(true);
      expect(form.get('lastName')?.valid).toBe(true);
      expect(form.get('phone')?.valid).toBe(true);
      expect(form.get('email')?.valid).toBe(true);
      expect(form.valid).toBe(true);
    });

    it('should validate phone number format', () => {
      const phoneControl = component.checkoutForm.get('phone');

      const invalidNumbers = ['abc', '123', '06', '12345678901234567'];
      for (const num of invalidNumbers) {
        phoneControl?.setValue(num);
        expect(phoneControl?.valid).toBe(false);
      }

      const validNumbers = ['0612345678', '+33612345678', '01 23 45 67 89', '123-456-7890'];
      for (const num of validNumbers) {
        phoneControl?.setValue(num);
        expect(phoneControl?.valid).toBe(true);
      }
    });

    it('should validate email format', () => {
      const emailControl = component.checkoutForm.get('email');

      const invalidEmails = ['plain-text', '@domain.com', 'john.doe@.com', 'john.doe'];
      for (const email of invalidEmails) {
        emailControl?.setValue(email);
        expect(emailControl?.valid).toBe(false);
      }

      const validEmails = ['john.doe@example.com', 'test@domain.co', 'a@b.c'];
      for (const email of validEmails) {
        emailControl?.setValue(email);
        expect(emailControl?.valid).toBe(true);
      }
    });
  });

  describe('isInvalid helper method', () => {
    it('should return false initially', () => {
      expect(component.isInvalid('firstName')).toBe(false);
    });

    it('should return true if field is invalid and dirty/touched', () => {
      const control = component.checkoutForm.get('firstName');
      control?.markAsTouched();
      expect(component.isInvalid('firstName')).toBe(true);

      control?.setValue('Kaelian');
      expect(component.isInvalid('firstName')).toBe(false);
    });

    it('should return true if field is invalid and formSubmitAttempt is true', () => {
      expect(component.isInvalid('firstName')).toBe(false);
      component.formSubmitAttempt = true;
      expect(component.isInvalid('firstName')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should not mark isSubmitted as true if form is invalid', () => {
      component.submitForm();
      expect(component.formSubmitAttempt).toBe(true);
      expect(component.isSubmitted()).toBe(false);
    });

    it('should mark isSubmitted as true if form is valid', () => {
      component.checkoutForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        phone: '0612345678',
        email: 'john.doe@example.com',
      });
      component.submitForm();
      expect(component.formSubmitAttempt).toBe(true);
      expect(component.isSubmitted()).toBe(true);
    });
  });

  describe('completeReservation', () => {
    it('should clear cart and reset form', () => {
      cartService.addToCart(mockBook);
      expect(cartService.cartCount()).toBe(1);

      component.checkoutForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        phone: '0612345678',
        email: 'john.doe@example.com',
      });
      component.submitForm();
      expect(component.isSubmitted()).toBe(true);

      component.completeReservation();

      expect(cartService.cartCount()).toBe(0);
      expect(component.isSubmitted()).toBe(false);
      expect(component.formSubmitAttempt).toBe(false);
      expect(component.checkoutForm.get('firstName')?.value).toBe(null);
    });
  });

  describe('onStateChanged', () => {
    it('should reset form and flags when dialog state is closed', () => {
      component.formSubmitAttempt = true;
      component.isSubmitted.set(true);
      component.checkoutForm.patchValue({ firstName: 'John' });

      // Run code with mock timer
      return new Promise<void>((resolve) => {
        component.onStateChanged('closed');
        setTimeout(() => {
          expect(component.isSubmitted()).toBe(false);
          expect(component.formSubmitAttempt).toBe(false);
          expect(component.checkoutForm.get('firstName')?.value).toBe(null);
          resolve();
        }, 350);
      });
    });
  });
});

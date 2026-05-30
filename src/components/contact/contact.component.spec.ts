if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with invalid empty form state', () => {
    expect(component.contactForm.valid).toBe(false);
    expect(component.isSubmitted()).toBe(false);
    expect(component.formSubmitAttempt).toBe(false);
  });

  describe('Form Validation', () => {
    it('should validate that fields are required', () => {
      const form = component.contactForm;
      expect(form.get('name')?.valid).toBe(false);
      expect(form.get('email')?.valid).toBe(false);
      expect(form.get('message')?.valid).toBe(false);

      form.patchValue({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, this is a long enough message!',
      });

      expect(form.get('name')?.valid).toBe(true);
      expect(form.get('email')?.valid).toBe(true);
      expect(form.get('message')?.valid).toBe(true);
      expect(form.valid).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.contactForm.get('email');

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

    it('should validate message minimum length of 10 characters', () => {
      const messageControl = component.contactForm.get('message');

      messageControl?.setValue('Short');
      expect(messageControl?.valid).toBe(false);
      expect(messageControl?.hasError('minlength')).toBe(true);

      messageControl?.setValue('This is 10 chars');
      expect(messageControl?.valid).toBe(true);
    });
  });

  describe('isInvalid helper method', () => {
    it('should return false initially', () => {
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return true if field is invalid and dirty/touched', () => {
      const control = component.contactForm.get('name');
      control?.markAsTouched();
      expect(component.isInvalid('name')).toBe(true);

      control?.setValue('Jane');
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return true if field is invalid and formSubmitAttempt is true', () => {
      expect(component.isInvalid('name')).toBe(false);
      component.formSubmitAttempt = true;
      expect(component.isInvalid('name')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should not mark isSubmitted as true if form is invalid', () => {
      component.submitForm();
      expect(component.formSubmitAttempt).toBe(true);
      expect(component.isSubmitted()).toBe(false);
    });

    it('should mark isSubmitted as true if form is valid', () => {
      component.contactForm.patchValue({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'This is a valid message that exceeds 10 chars.',
      });
      component.submitForm();
      expect(component.formSubmitAttempt).toBe(true);
      expect(component.isSubmitted()).toBe(true);
    });
  });

  describe('onStateChanged', () => {
    it('should reset form and flags when dialog state is closed', () => {
      component.formSubmitAttempt = true;
      component.isSubmitted.set(true);
      component.contactForm.patchValue({ name: 'Jane' });

      return new Promise<void>((resolve) => {
        component.onStateChanged('closed');
        setTimeout(() => {
          expect(component.isSubmitted()).toBe(false);
          expect(component.formSubmitAttempt).toBe(false);
          expect(component.contactForm.get('name')?.value).toBe(null);
          resolve();
        }, 350);
      });
    });
  });
});

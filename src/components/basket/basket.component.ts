import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookOpen, lucideCheck, lucideShoppingBag, lucideTrash2 } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { HlmInputImports } from '@spartan-ng/ui/input';
import { CartService } from '../../app/services/cart.service';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgIcon,
    ...HlmSheetImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmEmptyImports,
    ...HlmIconImports,
    ...HlmDialogImports,
    ...HlmFieldImports,
    ...HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideShoppingBag,
      lucideBookOpen,
      lucideTrash2,
      lucideCheck,
    }),
  ],
  templateUrl: './basket.component.html',
})
export class BasketComponent {
  public readonly cartService = inject(CartService);

  public isSubmitted = signal(false);
  public formSubmitAttempt = false;

  public checkoutForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[+]?[0-9\s.-]{8,15}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isInvalid(controlName: string): boolean {
    const control = this.checkoutForm.get(controlName);
    if (!control) return false;

    return control.invalid && (control.dirty || control.touched || this.formSubmitAttempt);
  }

  submitForm() {
    this.formSubmitAttempt = true;
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.valid) {
      this.isSubmitted.set(true);
    }
  }

  onStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') {
      setTimeout(() => {
        this.isSubmitted.set(false);
        this.formSubmitAttempt = false;
        this.checkoutForm.reset();
      }, 300);
    }
  }

  completeReservation() {
    const items = this.cartService.cartItems();
    if (items.length === 0) return;

    for (const item of items) {
      this.cartService.removeFromCart(item.id);
    }

    this.isSubmitted.set(false);
    this.formSubmitAttempt = false;
    this.checkoutForm.reset();
  }

  handleImageError(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    // Note: fakerapi.it generates dead image links (placeimg.com no longer exists).
    // Any invalid image URL is automatically replaced by a default placehold.co image.
    target.src = 'https://placehold.co/400x600/e2e8f0/475569';
  }
}

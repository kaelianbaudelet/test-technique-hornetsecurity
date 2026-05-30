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
  template: `
    <hlm-sheet side="left">
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        hlmSheetTrigger
        class="relative rounded-full hover:bg-muted text-foreground"
        aria-label="Open reservations cart ({{ cartService.cartCount() }} items)"
        i18n-aria-label="Navigation|Aria label for opening cart@@basket.ariaOpen"
      >
        <ng-icon hlm name="lucideShoppingBag" size="sm" aria-hidden="true" />
        @if (cartService.cartCount() > 0) {
        <span
          hlmBadge
          class="absolute -top-1.5 -right-1.5 flex h-5 min-w-5"
          aria-hidden="true"
        >
          {{ cartService.cartCount() }}
        </span>
        }
      </button>
      <hlm-sheet-content *hlmSheetPortal="let ctx">
        <hlm-sheet-header>
          <h3 hlmSheetTitle i18n="Basket|Title of the basket modal@@basket.title">Your Reservations</h3>
          <p hlmSheetDescription i18n="Basket|Description of the basket modal@@basket.description">
            Review selected books and confirm your reservation bookings instantly.
          </p>
        </hlm-sheet-header>

        <div class="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto min-h-0 py-2">
           @if (cartService.cartCount() === 0) {
          <hlm-empty>
            <hlm-empty-header>
              <hlm-empty-media variant="icon">
                <ng-icon name="lucideBookOpen" aria-hidden="true" />
              </hlm-empty-media>
              <div hlmEmptyTitle i18n="Basket|Empty state title@@basket.emptyTitle">Your cart is empty</div>
              <div hlmEmptyDescription i18n="Basket|Empty state description@@basket.emptyDescription">
                Explore our digital library and tap "Reserve" on any book to add it here.
              </div>
            </hlm-empty-header>
          </hlm-empty>
           }

           @if (cartService.cartCount() > 0) {
          <div class="space-y-4">
            @for (item of cartService.cartItems(); track item.id) {
            <div
              class="flex gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-200 group"
            >
              <div class="h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-muted border border-border relative">
                <img
                  [src]="item.image"
                  (error)="handleImageError($event)"
                  i18n-title="Image|Title for book cover@@basket.item.coverTitle"
                  title="Book cover"
                  alt="Book cover of {{ item.title }} by {{ item.author }}"
                  i18n-alt="Image|Alt text for book cover@@basket.item.coverAlt"
                  loading="lazy"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                <div class="space-y-0.5">
                   <a
                    [routerLink]="['/books', item.id]"
                    hlmSheetClose
                    class="block font-semibold text-sm truncate text-primary transition-colors cursor-pointer"
                  >
                    {{ item.title }}
                  </a>
                  <p class="text-xs text-muted-foreground truncate">{{ item.author }}</p>
                </div>
                <div class="flex items-center mt-1">
                  <span class="inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {{ item.genre }}
                  </span>
                </div>
              </div>
              <button
                hlmBtn
                variant="ghost"
                size="icon-sm"
                (click)="cartService.removeFromCart(item.id)"
                class="text-destructive hover:text-destructive/80 hover:bg-destructive rounded-md self-center flex-shrink-0 transition-colors"
                aria-label="Remove {{ item.title }} from reservations"
                i18n-aria-label="Action|Aria label for remove button@@basket.item.removeAria"
              >
                <ng-icon hlm name="lucideTrash2" size="sm" aria-hidden="true" />
              </button>
            </div>
            }
          </div>
          }

        </div>

        <hlm-sheet-footer>
          @if (cartService.cartCount() > 0) {
          <div class="flex justify-between items-baseline w-full px-2 mb-2">
            <span class="text-sm font-semibold text-muted-foreground" i18n="Basket|Label for total items@@basket.totalItems">Total Items</span>
            <span class="font-bold text-lg text-foreground">
              {{ cartService.cartCount() }}
            </span>
          </div>
          }

          @if (cartService.cartCount() > 0) {
          <hlm-dialog (stateChanged)="onStateChanged($event)">
            <button
              hlmBtn
              hlmDialogTrigger
              type="button"
              class="w-full"
              i18n="Action|Button to confirm booking@@basket.btn.confirm"
            >
              Confirm Booking
            </button>
            <hlm-dialog-content class="sm:max-w-3xl" *hlmDialogPortal="let dialogCtx">
              @if (!isSubmitted()) {
                <hlm-dialog-header>
                  <h3 hlmDialogTitle i18n="Basket Checkout|Title of basket checkout form@@basket.checkout.title">Finalize Reservation</h3>
                  <p hlmDialogDescription i18n="Basket Checkout|Description of basket checkout form@@basket.checkout.description">Please fill out your information to complete your book reservations.</p>
                </hlm-dialog-header>
                
                <form class="grid gap-4 py-4" [formGroup]="checkoutForm" (ngSubmit)="submitForm()">
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div hlmField [attr.data-invalid]="isInvalid('firstName') ? 'true' : null">
                      <label hlmFieldLabel for="checkout-firstName" i18n="Form|Label for first name@@basket.checkout.label.firstName">First Name</label>
                      <input
                        hlmInput
                        id="checkout-firstName"
                        formControlName="firstName"
                        placeholder="Jane"
                        i18n-placeholder="Form|Placeholder for first name field@@basket.checkout.placeholder.firstName"
                        autocomplete="given-name"
                        required
                        [attr.aria-invalid]="isInvalid('firstName') ? 'true' : null"
                        [attr.aria-describedby]="isInvalid('firstName') ? 'checkout-firstName-error' : null"
                      />
                      @if (isInvalid('firstName')) {
                        <hlm-field-error
                          id="checkout-firstName-error"
                          role="alert"
                          aria-live="polite"
                          i18n="Form Error|Error message when first name is missing@@basket.checkout.error.firstNameRequired"
                        >
                          First name is required.
                        </hlm-field-error>
                      }
                    </div>

                    <div hlmField [attr.data-invalid]="isInvalid('lastName') ? 'true' : null">
                      <label hlmFieldLabel for="checkout-lastName" i18n="Form|Label for last name@@basket.checkout.label.lastName">Last Name</label>
                      <input
                        hlmInput
                        id="checkout-lastName"
                        formControlName="lastName"
                        placeholder="Doe"
                        i18n-placeholder="Form|Placeholder for last name field@@basket.checkout.placeholder.lastName"
                        autocomplete="family-name"
                        required
                        [attr.aria-invalid]="isInvalid('lastName') ? 'true' : null"
                        [attr.aria-describedby]="isInvalid('lastName') ? 'checkout-lastName-error' : null"
                      />
                      @if (isInvalid('lastName')) {
                        <hlm-field-error
                          id="checkout-lastName-error"
                          role="alert"
                          aria-live="polite"
                          i18n="Form Error|Error message when last name is missing@@basket.checkout.error.lastNameRequired"
                        >
                          Last name is required.
                        </hlm-field-error>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div hlmField [attr.data-invalid]="isInvalid('phone') ? 'true' : null">
                      <label hlmFieldLabel for="checkout-phone" i18n="Form|Label for phone number@@basket.checkout.label.phone">Phone Number</label>
                      <input
                        hlmInput
                        type="tel"
                        id="checkout-phone"
                        formControlName="phone"
                        placeholder="0612345678"
                        i18n-placeholder="Form|Placeholder for phone number field@@basket.checkout.placeholder.phone"
                        autocomplete="tel"
                        inputmode="tel"
                        required
                        [attr.aria-invalid]="isInvalid('phone') ? 'true' : null"
                        [attr.aria-describedby]="isInvalid('phone') ? 'checkout-phone-error' : null"
                      />
                      @if (isInvalid('phone')) {
                        <hlm-field-error id="checkout-phone-error" role="alert" aria-live="polite">
                          @if (checkoutForm.get('phone')?.hasError('required')) {
                            <span i18n="Form Error|Error message when phone is missing@@basket.checkout.error.phoneRequired">Phone number is required.</span>
                          } @else {
                            <span i18n="Form Error|Error message when phone format is invalid@@basket.checkout.error.phoneInvalid">Please enter a valid phone number.</span>
                          }
                        </hlm-field-error>
                      }
                    </div>

                    <div hlmField [attr.data-invalid]="isInvalid('email') ? 'true' : null">
                      <label hlmFieldLabel for="checkout-email" i18n="Form|Label for email address@@basket.checkout.label.email">Email</label>
                      <input
                        hlmInput
                        type="email"
                        id="checkout-email"
                        formControlName="email"
                        placeholder="jane.doe@example.com"
                        i18n-placeholder="Form|Placeholder for email field@@basket.checkout.placeholder.email"
                        autocomplete="email"
                        inputmode="email"
                        required
                        [attr.aria-invalid]="isInvalid('email') ? 'true' : null"
                        [attr.aria-describedby]="isInvalid('email') ? 'checkout-email-error' : null"
                      />
                      @if (isInvalid('email')) {
                        <hlm-field-error id="checkout-email-error" role="alert" aria-live="polite">
                          @if (checkoutForm.get('email')?.hasError('required')) {
                            <span i18n="Form Error|Error message when email is missing@@basket.checkout.error.emailRequired">Email is required.</span>
                          } @else {
                            <span i18n="Form Error|Error message when email format is invalid@@basket.checkout.error.emailInvalid">Please enter a valid email address.</span>
                          }
                        </hlm-field-error>
                      }
                    </div>
                  </div>

                  <hlm-dialog-footer class="mt-4">
                    <button hlmBtn variant="outline" type="button" hlmDialogClose i18n="Action|Button to cancel the form@@basket.checkout.btn.cancel">Cancel</button>
                    <button hlmBtn type="submit" i18n="Action|Button to confirm booking@@basket.checkout.btn.confirm">Confirm Booking</button>
                  </hlm-dialog-footer>
                </form>
              } @else {
                <div class="flex flex-col py-6 text-center space-y-4">
                  <hlm-dialog-header>
                    <h3 hlmDialogTitle class="text-xl" i18n="Basket|Success title after confirmation@@basket.success.title">Reservation Confirmed!</h3>
                    <div hlmDialogDescription class="pt-2 text-base space-y-2">
                      <p i18n="Basket|Success message start@@basket.success.desc1">You have successfully booked:</p>
                      <ul class="list-disc pl-5 text-left text-foreground">
                        @for (item of cartService.cartItems(); track item.id) {
                        <li>
                          <span class="font-semibold">{{ item.title }}</span> (by {{ item.author }})
                        </li>
                        }
                      </ul>
                      <p class="pt-2 font-medium" i18n="Basket|Success greeting@@basket.success.desc2">Happy reading!</p>
                    </div>
                  </hlm-dialog-header>
                  <hlm-dialog-footer class="w-full mt-4">
                    <button hlmBtn hlmDialogClose class="w-full sm:w-auto" (click)="completeReservation(); dialogCtx.close()" i18n="Action|Button to close confirmation dialog@@basket.btn.ok">Ok</button>
                  </hlm-dialog-footer>
                </div>
              }
            </hlm-dialog-content>
          </hlm-dialog>
          }

          <button hlmSheetClose hlmBtn variant="outline" class="w-full" i18n="Action|Button to close the basket@@basket.btn.close">
            Close
          </button>
        </hlm-sheet-footer>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
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

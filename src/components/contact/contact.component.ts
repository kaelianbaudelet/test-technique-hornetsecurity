import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle2, lucideMail } from '@ng-icons/lucide';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { HlmInputImports } from '@spartan-ng/ui/input';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIcon,
    ...HlmButtonImports,
    ...HlmDialogImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
  ],
  providers: [provideIcons({ lucideMail, lucideCheckCircle2 })],
  template: `
    <hlm-dialog (stateChanged)="onStateChanged($event)">

      <button
        type="button"
        hlmDialogTrigger
        hlmBtn
        variant="ghost"
        aria-haspopup="dialog"
        [class]="isMobile
          ? 'justify-start gap-3.5 w-full text-base font-bold px-3 py-6 hover:bg-muted hover:text-primary rounded-xl'
          : 'text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer'"
        i18n="Navigation|Button to open contact modal@@nav.contact"
      >
        @if (isMobile) {
          <ng-icon hlm name="lucideMail" class="size-5 text-blue-600" aria-hidden="true" />
        }
        Contact
      </button>

      <hlm-dialog-content class="sm:max-w-3xl" *hlmDialogPortal>

        @if (!isSubmitted()) {
          <hlm-dialog-header>
            <h3 hlmDialogTitle i18n="Modal|Title of contact form@@contact.title">Contact Us</h3>
            <p hlmDialogDescription i18n="Modal|Description of contact form@@contact.description">Fill out this form and we will get back to you as soon as possible.</p>
          </hlm-dialog-header>

          <form class="grid gap-4 py-4" [formGroup]="contactForm" (ngSubmit)="submitForm()">

            <div hlmField [attr.data-invalid]="isInvalid('name') ? 'true' : null">
              <label hlmFieldLabel for="contact-name" i18n="Form|Label for full name@@contact.label.name">Full Name</label>
              <input
                hlmInput
                id="contact-name"
                formControlName="name"
                placeholder="John Doe"
                i18n-placeholder="Form|Placeholder for full name field@@contact.placeholder.name"
                autocomplete="name"
                required
                [attr.aria-invalid]="isInvalid('name') ? 'true' : null"
                [attr.aria-describedby]="isInvalid('name') ? 'contact-name-error' : null"
              />
              @if (isInvalid('name')) {
                <hlm-field-error
                  id="contact-name-error"
                  role="alert"
                  aria-live="polite"
                  i18n="Form Error|Error message when name is missing@@contact.error.nameRequired"
                >
                  Your full name is required.
                </hlm-field-error>
              }
            </div>

            <div hlmField [attr.data-invalid]="isInvalid('email') ? 'true' : null">
              <label hlmFieldLabel for="contact-email" i18n="Form|Label for email address@@contact.label.email">Email</label>
              <input
                hlmInput
                type="email"
                id="contact-email"
                formControlName="email"
                placeholder="contact@example.com"
                i18n-placeholder="Form|Placeholder for email field@@contact.placeholder.email"
                autocomplete="email"
                inputmode="email"
                required
                [attr.aria-invalid]="isInvalid('email') ? 'true' : null"
                [attr.aria-describedby]="isInvalid('email') ? 'contact-email-error' : null"
              />
              @if (isInvalid('email')) {
                <hlm-field-error id="contact-email-error" role="alert" aria-live="polite">
                  @if (contactForm.get('email')?.hasError('required')) {
                    <span i18n="Form Error|Error message when email is missing@@contact.error.emailRequired">Email is required.</span>
                  } @else {
                    <span i18n="Form Error|Error message when email format is invalid@@contact.error.emailInvalid">Please enter a valid email address.</span>
                  }
                </hlm-field-error>
              }
            </div>

            <div hlmField [attr.data-invalid]="isInvalid('message') ? 'true' : null">
              <label hlmFieldLabel for="contact-message" i18n="Form|Label for message field@@contact.label.message">Message</label>
              <textarea
                hlmTextarea
                id="contact-message"
                formControlName="message"
                placeholder="How can we help you?"
                i18n-placeholder="Form|Placeholder for message field@@contact.placeholder.message"
                class="resize-none min-h-[100px]"
                required
                [attr.aria-invalid]="isInvalid('message') ? 'true' : null"
                [attr.aria-describedby]="isInvalid('message') ? 'contact-message-error' : null"
              ></textarea>
              @if (isInvalid('message')) {
                <hlm-field-error id="contact-message-error" role="alert" aria-live="polite">
                  @if (contactForm.get('message')?.hasError('required')) {
                    <span i18n="Form Error|Error message when message is missing@@contact.error.messageRequired">A message is required.</span>
                  } @else {
                    <span i18n="Form Error|Error message when message is too short@@contact.error.messageMinLength">Message must be at least 10 characters long.</span>
                  }
                </hlm-field-error>
              }
            </div>

            <hlm-dialog-footer class="mt-4">
              <button hlmBtn variant="outline" type="button" hlmDialogClose i18n="Action|Button to cancel the form@@contact.btn.cancel">Cancel</button>
              <button hlmBtn type="submit" i18n="Action|Button to submit the form@@contact.btn.submit">Send</button>
            </hlm-dialog-footer>
          </form>
        }

        @else {
          <div class="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <hlm-dialog-header>
              <h3 hlmDialogTitle class="text-xl" i18n="Modal Success|Title after successful submission@@contact.success.title">Message sent!</h3>
              <p hlmDialogDescription class="pt-2 text-base" i18n="Modal Success|Thank you message after submission@@contact.success.description">
                Thank you for contacting us. Your message has been successfully sent. We will get back to you as soon as possible.
              </p>
            </hlm-dialog-header>
            <hlm-dialog-footer class="w-full mt-4">
              <button hlmBtn hlmDialogClose class="w-full sm:w-auto" i18n="Action|Button to close the modal@@contact.btn.close">Close</button>
            </hlm-dialog-footer>
          </div>
        }
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class ContactComponent {
  @Input() isMobile = false;

  public isSubmitted = signal(false);
  public formSubmitAttempt = false;

  public contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    if (!control) return false;

    return control.invalid && (control.dirty || control.touched || this.formSubmitAttempt);
  }

  submitForm() {
    this.formSubmitAttempt = true;
    this.contactForm.markAllAsTouched();

    if (this.contactForm.valid) {
      this.isSubmitted.set(true);
    }
  }

  onStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') {
      setTimeout(() => {
        this.isSubmitted.set(false);
        this.formSubmitAttempt = false;
        this.contactForm.reset();
      }, 300);
    }
  }
}

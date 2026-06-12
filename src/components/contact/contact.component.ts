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
  templateUrl: './contact.component.html',
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

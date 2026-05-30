import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { AppComponent } from '../../app/app';

@Component({
  selector: 'app-error-overlay',
  standalone: true,
  imports: [...HlmButtonImports],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-6">
      <div
        class="text-center flex flex-col items-center max-w-md"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-overlay-title"
        aria-describedby="error-overlay-desc"
        aria-live="assertive"
      >
        <h1 class="text-9xl font-bold text-primary mb-4 tracking-tighter">500</h1>

        <h2
          id="error-overlay-title"
          class="text-2xl font-semibold text-foreground mb-2"
          i18n="Error 500|Title for error overlay@@error500.title"
        >
          Server Error
        </h2>

        <p
          id="error-overlay-desc"
          class="text-lg text-muted-foreground mb-8"
          i18n="Error 500|Description for error overlay@@error500.description"
        >
          A critical error has occurred in the application.
        </p>

        <div class="flex gap-2">
        <button
          type="button"
          hlmBtn
          size="lg"
          (click)="reload()"
          i18n="Action|Button to reload app@@error500.btn.reload"
        >
          Reload Page
        </button>

        <button
          type="button"
          hlmBtn
          variant="outline"
          (click)="goToHome()"
          size="lg"
          i18n="Action|Button to return home@@error500.btn.home"
        >
          Go to Homepage
        </button>

        </div>
      </div>
    </div>
  `,
})
export class ErrorOverlayComponent {
  private readonly router = inject(Router);

  reload() {
    window.location.reload();
  }

  goToHome() {
    this.router.navigate(['/']);
    AppComponent.hasError.set(false);
  }
}

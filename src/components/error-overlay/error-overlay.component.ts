import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { ErrorService } from '../../app/services/error.service';

@Component({
  selector: 'app-error-overlay',
  standalone: true,
  imports: [...HlmButtonImports],
  templateUrl: './error-overlay.component.html',
})
export class ErrorOverlayComponent {
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  reload() {
    window.location.reload();
  }

  goToHome() {
    this.router.navigate(['/']);
    this.errorService.setError(false);
  }
}

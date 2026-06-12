import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ErrorOverlayComponent } from '../components/error-overlay/error-overlay.component';
import { ErrorService } from './services/error.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, ErrorOverlayComponent],
  template: `
    @if (errorService.hasError()) {
      <app-error-overlay />
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  protected readonly errorService = inject(ErrorService);
}

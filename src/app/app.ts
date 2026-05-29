import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router'; // RouterOutlet vient de @angular/router
import { ErrorOverlayComponent } from '../components/error-overlay/error-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, ErrorOverlayComponent],
  template: `
    @if (hasError()) {
      <app-error-overlay />
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  // On garde le signal statique pour que ton service puisse y accéder
  public static hasError = signal(false);

  // On expose le signal pour le template du composant
  public hasError = AppComponent.hasError;
}

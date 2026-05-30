import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { AppComponent } from '../app';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private ngZone = inject(NgZone);

  handleError(error: Error): void {
    console.error('Erreur critique capturée par le GlobalErrorHandler:', error);
    this.ngZone.run(() => {
      AppComponent.hasError.set(true);
    });
  }
}

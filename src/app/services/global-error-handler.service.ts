import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private readonly ngZone = inject(NgZone);
  private readonly errorService = inject(ErrorService);

  handleError(error: Error): void {
    console.error('Critical error caught by GlobalErrorHandler:', error);
    this.ngZone.run(() => {
      this.errorService.setError(true);
    });
  }
}

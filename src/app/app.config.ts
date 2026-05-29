import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};

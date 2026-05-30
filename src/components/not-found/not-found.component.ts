import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/ui/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ...HlmButtonImports],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full text-center p-6">
      <h1 class="text-9xl font-bold text-primary mb-4 tracking-tighter">404</h1>
      
      <h2 class="text-2xl font-semibold text-foreground mb-2" i18n="Error 404|Title for 404 page@@notfound.title">
        Page not found
      </h2>
      
      <p class="text-lg text-muted-foreground mb-8 max-w-md" i18n="Error 404|Description for 404 page@@notfound.description">
        Sorry, we couldn't find the page you're looking for. Please check the URL or return to the library.
      </p>
      
      <a routerLink="/" hlmBtn size="lg" i18n="Action|Button to return home from 404@@notfound.btn.home">
        Return to Library
      </a>
    </div>
  `,
})
export class NotFoundComponent {}

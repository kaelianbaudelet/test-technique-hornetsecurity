import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
// 1. Ajout de lucideSun et lucideMoon
import { lucideHome, lucideLibrary, lucideMenu, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmNavigationMenuImports } from '@spartan-ng/helm/navigation-menu';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/ui/button';
import { ThemeService } from '../../app/services/theme.service';
import { BasketComponent } from '../basket/basket.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    BasketComponent,
    ContactComponent,
    ...HlmNavigationMenuImports,
    ...HlmSheetImports,
    ...HlmButtonImports,
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideLibrary,
      lucideMenu,
      lucideHome,
      // 2. Déclaration des icônes de thème
      lucideSun,
      lucideMoon,
    }),
  ],
  template: `
    <header
      class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300"
    >
      <div
        class="container mx-auto flex h-16 items-center justify-between px-4 md:px-8"
      >
        <a
          routerLink="/"
          class="flex items-center gap-2.5 text-primary hover:opacity-90 transition-opacity group"
          aria-label="Go to homepage"
          i18n-aria-label="Navigation|Aria label for logo link@@nav.logo.aria"
        >
          <img src="logo.svg" alt="" aria-hidden="true" class="h-6 dark:invert" />
        </a>

        <div class="flex items-center gap-2 md:gap-4">

          <nav
            class="hidden md:flex items-center gap-1 mr-2"
            aria-label="Primary navigation"
            i18n-aria-label="Navigation|Aria label for primary navigation@@nav.primary.aria"
          >
            <a
              routerLink="/"
              routerLinkActive="bg-accent text-foreground"
              [routerLinkActiveOptions]="{exact: true}"
              hlmBtn
              variant="ghost"
              class="text-sm font-medium text-muted-foreground hover:text-foreground"
              i18n="Navigation|Link to the home page@@nav.home"
            >
              Home
            </a>
            <a
              routerLink="/books"
              routerLinkActive="bg-accent text-foreground"
              hlmBtn
              variant="ghost"
              class="text-sm font-medium text-muted-foreground hover:text-foreground"
              i18n="Navigation|Link to the book catalog@@nav.catalog"
            >
              Browse Catalog
            </a>
            <app-contact/>
          </nav>

          <app-basket />

          <button 
            hlmBtn 
            variant="ghost"
            size="icon"
            class="rounded-full"
            (click)="toggleTheme()" 
            aria-label="Toggle theme"
          >
            <span class="flex items-center justify-center text-foreground">
              <ng-icon 
                hlm 
                [name]="currentTheme() === 'dark' ? 'lucideMoon' : 'lucideSun'" 
                size="sm" 
                aria-hidden="true" 
              />
            </span>
          </button>

          <div class="md:hidden">
            <hlm-sheet side="right">
              <button
                hlmBtn
                variant="ghost"
                size="icon"
                hlmSheetTrigger
                class="rounded-full hover:bg-muted text-foreground transition-transform active:scale-95"
                aria-label="Open mobile navigation"
                i18n-aria-label="Navigation|Aria label for opening mobile menu@@nav.mobile.menuAria"
              >
                <ng-icon hlm name="lucideMenu" size="sm" class="text-foreground" aria-hidden="true" />
              </button>
              <hlm-sheet-content
                *hlmSheetPortal
                class="w-[85vw] sm:max-w-xs flex flex-col h-full bg-background border-l border-border p-6"
              >
                <nav
                  class="flex-1 flex flex-col space-y-2.5"
                  aria-label="Mobile navigation"
                  i18n-aria-label="Navigation|Aria label for mobile navigation@@nav.mobile.aria"
                >
                  <a
                    routerLink="/"
                    routerLinkActive="bg-accent text-foreground"
                    [routerLinkActiveOptions]="{exact: true}"
                    hlmBtn
                    variant="ghost"
                    class="justify-start gap-3.5 w-full text-base font-bold px-3 py-6 hover:bg-muted hover:text-primary rounded-xl"
                    i18n="Navigation|Link to the home page in mobile menu@@nav.mobile.home"
                  >
                    <ng-icon
                      hlm
                      name="lucideHome"
                      class="size-5 text-blue-600"
                      aria-hidden="true"
                    />
                    Home
                  </a>

                   <a
                    routerLink="/books"
                    routerLinkActive="bg-accent text-foreground"
                    hlmBtn
                    variant="ghost"
                    class="justify-start gap-3.5 w-full text-base font-bold px-3 py-6 hover:bg-muted hover:text-primary rounded-xl"
                    i18n="Navigation|Link to the book catalog in mobile menu@@nav.mobile.catalog"
                  >
                    <ng-icon
                      hlm
                      name="lucideLibrary"
                      class="size-5 text-blue-600"
                      aria-hidden="true"
                    />
                    Browse Catalog
                  </a>

                  <app-contact [isMobile]="true"></app-contact>

                </nav>
              </hlm-sheet-content>
            </hlm-sheet>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private _themeService = inject(ThemeService);
  public currentTheme = toSignal(this._themeService.theme$, { initialValue: 'light' });

  public toggleTheme(): void {
    this._themeService.toggleDarkMode();
  }
}

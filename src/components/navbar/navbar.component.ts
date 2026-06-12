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
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private _themeService = inject(ThemeService);
  public currentTheme = toSignal(this._themeService.theme$, { initialValue: 'light' });

  public toggleTheme(): void {
    this._themeService.toggleDarkMode();
  }
}

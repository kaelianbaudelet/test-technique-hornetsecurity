import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, HlmSelectImports, FormsModule],
  template: `
    <div class="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <app-navbar/>
      <main id="main-content" class="flex-grow" tabindex="-1">
        <router-outlet/>
      </main>
      
      <footer class="bg-card border-t border-border mt-auto">
        <div class="container mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-primary text-sm">
          <p>© 2026 La Petite Librairie. <span i18n="Footer|Copyright notice@@footer.copyright">All rights reserved.</span></p>

          <hlm-select 
            [(ngModel)]="currentLanguage" 
            (ngModelChange)="switchLanguage($event)" 
            [itemToString]="itemToString"
            [disabled]="isLanguageSelectDisabled">
            
            <hlm-select-trigger class="w-36">
              <hlm-select-value placeholder="Langue" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                @for (lang of languages; track lang.value) {
                  <hlm-select-item [value]="lang.value">{{ lang.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>

        </div>
      </footer>
    </div>
  `,
})
export class MainLayoutComponent {
  private document = inject(DOCUMENT);

  public currentLanguage = 'en-US';

  public isLanguageSelectDisabled = false;

  public readonly languages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en-US' },
  ];

  public readonly itemToString = (value: string) =>
    this.languages.find((item) => item.value === value)?.label || '';

  constructor() {
    this.detectLanguage();
  }

  private detectLanguage() {
    const path = this.document.location.pathname;

    const isFrench = path.startsWith('/fr/') || path === '/fr';
    const isEnglish = path.startsWith('/en-US/') || path === '/en-US';

    if (isFrench) {
      this.currentLanguage = 'fr';
      this.isLanguageSelectDisabled = false;
    } else if (isEnglish) {
      this.currentLanguage = 'en-US';
      this.isLanguageSelectDisabled = false;
    } else {
      this.currentLanguage = 'en-US';
      this.isLanguageSelectDisabled = true;
    }
  }

  public switchLanguage(newLang: string) {
    const currentPath = this.document.location.pathname;

    if (currentPath.startsWith(`/${newLang}`)) {
      return;
    }

    const segments = currentPath.split('/');

    if (segments.length > 1 && (segments[1] === 'fr' || segments[1] === 'en-US')) {
      segments[1] = newLang;
    } else {
      segments.splice(1, 0, newLang);
    }

    const newUrl = segments.join('/') + this.document.location.search;

    this.document.location.href = newUrl;
  }
}

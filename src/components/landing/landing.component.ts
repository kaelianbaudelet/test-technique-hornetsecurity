import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBookOpen,
  lucideMapPin,
  lucideSearch,
  lucideShoppingBag,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/ui/button';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmIconImports,
    ...HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideShoppingBag,
      lucideMapPin,
      lucideSparkles,
      lucideArrowRight,
      lucideBookOpen,
    }),
  ],
  template: `
    <div class="flex flex-col min-h-screen">

      <section class="relative h-[calc(100vh-64px)] w-full flex items-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img
            src="assets/images/hero.png"
            i18n-title="Image|Title of hero image@@landing.hero.title"
            title="Library background"
            alt="Library background"
            i18n-alt="Image|Alt text for hero image@@landing.hero.alt"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-black/40"></div>
        </div>

        <div class="container mx-auto px-6 md:px-12 z-10 text-white">
          <div class="max-w-2xl flex flex-col gap-6">

            <h1 class="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight" i18n="Landing|Hero title@@landing.hero.headline">
              Literary <br> Escape.
            </h1>

            <p class="text-lg md:text-xl text-slate-100 font-light max-w-lg leading-relaxed" i18n="Landing|Hero description@@landing.hero.subheadline">
              A unique selection of books and rare manuscripts to cultivate your imagination and enrich your knowledge.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mt-4">
              <a routerLink="/books" hlmBtn size="lg" class="px-8 py-7 text-base font-medium" variant="secondary" i18n="Action|Hero button text@@landing.hero.button">
                Explore the catalog
              </a>
            </div>
          </div>
        </div>

        <div class="absolute bottom-10 left-0 w-full z-10 hidden md:block">
            <div class="container mx-auto px-12 flex justify-between text-white/80 text-md uppercase tracking-[0.2em] font-medium">
                <div class="flex items-center gap-2"><ng-icon name="lucideSparkles" aria-hidden="true" /> <span i18n="Landing|Feature 1@@landing.feat.curated">Curated with care</span></div>
                <div class="flex items-center gap-2"><ng-icon name="lucideBookOpen" aria-hidden="true" /> <span i18n="Landing|Feature 2@@landing.feat.unlimited">Unlimited reading</span></div>
                <div class="flex items-center gap-2"><ng-icon name="lucideMapPin" aria-hidden="true" /> <span i18n="Landing|Feature 3@@landing.feat.pickup">Pick-up within 24h</span></div>
            </div>
        </div>
      </section>

      <section class="py-20 bg-background">
        <div class="container mx-auto px-4 md:px-8">
          <div class="text-center mb-16 space-y-4">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight" i18n="Landing|How it works section title@@landing.steps.title">How does it work?</h2>
            <p class="text-muted-foreground text-lg" i18n="Landing|How it works description@@landing.steps.description">Your next book in three simple steps.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <section hlmCard class="relative border-none shadow-none group">
              <div class="mb-6 flex items-center justify-center h-20 w-20 rounded-full bg-muted text-primary mx-auto">
                <ng-icon hlm name="lucideSearch" size="lg" aria-hidden="true" />
              </div>
              <hlm-card-header class="text-center px-0">
                <h3 hlmCardTitle class="text-xl mb-3" i18n="Landing|Step 1 title@@landing.step1.title">1. Choose your books</h3>
                <p hlmCardDescription class="text-base leading-relaxed" i18n="Landing|Step 1 description@@landing.step1.desc">
                  Explore our catalog and select the books that inspire you from thousands of titles.
                </p>
              </hlm-card-header>
            </section>

            <section hlmCard class="relative border-none shadow-none group">
              <div class="mb-6 flex items-center justify-center h-20 w-20 rounded-full bg-muted text-primary mx-auto">
                <ng-icon hlm name="lucideShoppingBag" size="lg" aria-hidden="true" />
              </div>
              <hlm-card-header class="text-center px-0">
                <h3 hlmCardTitle class="text-xl mb-3" i18n="Landing|Step 2 title@@landing.step2.title">2. Confirm your cart</h3>
                <p hlmCardDescription class="text-base leading-relaxed" i18n="Landing|Step 2 description@@landing.step2.desc">
                  Add your favorites to your reservation cart and confirm your request in one click.
                </p>
              </hlm-card-header>
            </section>

            <section hlmCard class="relative border-none shadow-none group">
              <div class="mb-6 flex items-center justify-center h-20 w-20 rounded-full bg-muted text-primary mx-auto">
                <ng-icon hlm name="lucideMapPin" size="lg" aria-hidden="true" />
              </div>
              <hlm-card-header class="text-center px-0">
                <h3 hlmCardTitle class="text-xl mb-3" i18n="Landing|Step 3 title@@landing.step3.title">3. Pick up at the library</h3>
                <p hlmCardDescription class="text-base leading-relaxed" i18n="Landing|Step 3 description@@landing.step3.desc">
                  Pick up your books, carefully prepared by our librarians, at your pick-up point.
                </p>
              </hlm-card-header>
            </section>
          </div>

          <div class="mt-16 flex justify-center">
            <a routerLink="/books" hlmBtn variant="default" class="px-10 py-6 text-base font-medium" i18n="Action|Bottom discovery button@@landing.discovery.btn">
                Discover books
            </a>
          </div>
        </div>
      </section>

    </div>
  `,
})
export class LandingComponent {}

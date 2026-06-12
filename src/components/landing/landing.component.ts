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
  templateUrl: './landing.component.html',
})
export class LandingComponent {}

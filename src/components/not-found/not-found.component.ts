import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/ui/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ...HlmButtonImports],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {}

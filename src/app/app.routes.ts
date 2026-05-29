import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../components/landing/landing.component').then((m) => m.LandingComponent),
      },
      {
        path: 'books',
        loadComponent: () =>
          import('../components/book-list/book-list.component').then((m) => m.BookListComponent),
      },
      {
        path: 'books/:id',
        loadComponent: () =>
          import('../components/book-detail/book-detail.component').then(
            (m) => m.BookDetailComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('../components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

import { Route } from '@angular/router';
import { authGuard, authRoutes } from '@intapp/auth';

export const appRoutes: Route[] = [
  {
    path: 'login',
    children: authRoutes,
  },
  {
    path: 'termsheet',
    canActivate: [authGuard],
    loadChildren: () => import('@intapp/termsheet').then(m => m.termsheetRoutes),
  },
  { path: '', pathMatch: 'full', redirectTo: '/termsheet' },
  { path: '**', redirectTo: '/termsheet' },
];

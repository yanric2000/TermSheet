import { Routes } from '@angular/router';

export const termsheetRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'deals' },
  {
    path: 'deals',
    loadChildren: () => import('./deals/pages/deals.routes').then(m => m.dealsRoutes),
  },
  { path: '**', redirectTo: 'deals' },
];

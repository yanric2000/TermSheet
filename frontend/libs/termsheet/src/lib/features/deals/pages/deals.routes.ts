import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { I18nService } from '@intapp/i18n';
import { provideDeals } from '@intapp/termsheet/deal/providers';

const dealsTitle: ResolveFn<string> = () => inject(I18nService).pageTitle('dealsTitle');

export const dealsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./deals-list-page/deals-list-page.component').then(m => m.DealsListPageComponent),
    providers: [provideDeals()],
    title: dealsTitle,
  },
];

import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { I18nService } from '@intapp/i18n';

/**
 * Resolver de título funcional. `pageTitle()` compõe `${productName} · ${section}`
 * — centraliza a regra de branding em um lugar só.
 */
const dealsTitle: ResolveFn<string> = () => inject(I18nService).pageTitle('pageTitleDeals');

/**
 * Rotas do subdomínio `deals`.
 *
 * Encapsula as páginas deste contexto (hoje apenas a listagem). É consumida
 * apenas pelo orquestrador `termsheet.routes.ts` via `loadChildren`, mantendo
 * o limite do subdomínio bem definido — NÃO é exportada via barrel público.
 */
export const dealsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./deals-list-page/deals-list-page.component').then(m => m.DealsListPageComponent),
    title: dealsTitle,
  },
];

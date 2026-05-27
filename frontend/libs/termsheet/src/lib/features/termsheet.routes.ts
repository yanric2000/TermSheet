import { Routes } from '@angular/router';

/**
 * Orquestrador de rotas do produto TermSheet.
 *
 * Esta é a única superfície de roteamento exposta para o app host.
 * Cada módulo do produto (deals, clients no futuro, etc.) é carregado lazy
 * a partir daqui, mantendo o app desacoplado da organização interna.
 *
 * Rota padrão: `deals`.
 */
export const termsheetRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'deals' },
  {
    path: 'deals',
    loadChildren: () => import('./deals/pages/deals.routes').then(m => m.dealsRoutes),
  },
  { path: '**', redirectTo: 'deals' },
];

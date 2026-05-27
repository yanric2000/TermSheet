import { Routes } from '@angular/router';

/**
 * Orquestrador de rotas da lib `@intapp/auth`.
 *
 * Esta é a única superfície de roteamento exposta para o app host. Cada
 * subdomínio (`login`, e futuramente `register`, `forgot-password`, etc.)
 * é carregado lazy a partir daqui através do seu próprio router interno,
 * mantendo o app desacoplado da organização interna da lib.
 */
export const authRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/pages/login.routes').then(m => m.loginRoutes),
  },
];

import { Route } from '@angular/router';
import { authGuard, authRoutes } from '@intapp/auth';

/**
 * Rotas raiz da Intapp Suite.
 *
 * Fluxo:
 *  - `/login` consome `authRoutes` da `@intapp/auth` (que aplica `publicOnlyGuard`
 *    redirecionando para `/termsheet` se o usuário já estiver logado). O
 *    `LoginComponent` em si continua carregado lazy via `loadComponent` dentro
 *    da própria lib de auth.
 *  - `/termsheet` é a área autenticada do produto TermSheet; toda a lib é
 *    carregada lazy via `loadChildren`, atrás do `authGuard`.
 *  - `''` e rotas desconhecidas vão para `/termsheet` — o `authGuard` decide
 *    se o usuário pode entrar ou se será mandado para `/login`.
 *
 * Nota: `@intapp/auth` é importada estaticamente (não via `loadChildren`)
 * porque seu `provideAuth()` registra providers de raiz (`JwtModule`,
 * `APP_INITIALIZER`) que precisam estar disponíveis no boot — fazer lazy
 * da lib inteira seria inócuo já que ela está no bundle inicial.
 */
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

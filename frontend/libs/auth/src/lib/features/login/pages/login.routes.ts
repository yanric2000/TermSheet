import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { publicOnlyGuard } from '@intapp/auth/guards';
import { I18nService } from '@intapp/i18n';

/**
 * Resolver de título funcional. `pageTitle()` compõe `${productName} · ${section}`
 * — centraliza a regra de branding em um lugar só.
 *
 * Limitação: troca de idioma em runtime atualiza a UI mas não re-executa
 * resolvers — o `<title>` só muda na próxima navegação. Aceitável até existir
 * UI de seleção de idioma; quando houver, basta refazer um `router.navigate`
 * para o mesmo path, ou subscrever ao locale e setar `Title.setTitle()`.
 */
const loginTitle: ResolveFn<string> = () => inject(I18nService).pageTitle('pageTitleLogin');

/**
 * Rotas do subdomínio `login` da feature de autenticação.
 *
 * Encapsula tudo que pertence a esta tela (guards, resolver de título e o
 * componente em si). É consumida apenas pelo orquestrador `auth.routes.ts`
 * via `loadChildren`, mantendo o limite do subdomínio bem definido.
 *
 * - `LoginComponent` carregado sob demanda (`loadComponent`) para reduzir bundle inicial
 * - Protegida por `publicOnlyGuard`: redireciona para `/deals` se já autenticado
 * - `title` define `document.title` automaticamente quando a rota é ativa
 */
export const loginRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: loginTitle,
  },
];

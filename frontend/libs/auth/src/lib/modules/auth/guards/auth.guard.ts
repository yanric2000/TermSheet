import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@intapp/auth/services';
import { AUTH_CONFIG } from '@intapp/auth/tokens';

/**
 * Guard funcional que bloqueia rotas privadas para usuários não autenticados.
 *
 * Retorna `true` quando há accessToken válido (não expirado), caso contrário
 * devolve um `UrlTree` apontando para `/login` — padrão moderno do Angular
 * que evita o ciclo "navigate then return false".
 *
 * O check de autenticação é puramente client-side e por isso NÃO é uma
 * fronteira de segurança: o backend continua sendo a fonte da verdade.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};

/**
 * Guard inverso: bloqueia a tela de login para usuários já autenticados.
 * Redireciona para `defaultAuthenticatedRoute` do `AUTH_CONFIG` (default `/`).
 */
export const publicOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);
  return auth.isAuthenticated() ? router.parseUrl(config.defaultAuthenticatedRoute ?? '/') : true;
};

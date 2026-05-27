import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@intapp/auth/services';
import { AUTH_CONFIG } from '@intapp/auth/tokens';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};

export const publicOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);
  return auth.isAuthenticated() ? router.parseUrl(config.defaultAuthenticatedRoute ?? '/') : true;
};

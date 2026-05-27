import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor funcional que ativa `withCredentials: true` em chamadas para
 * `/api/auth/*`, garantindo que o cookie HttpOnly `refresh_token` (emitido
 * pelo backend Spring) seja incluído nas requisições de login/refresh/logout.
 *
 * Não aplica em outras rotas para não vazar cookies desnecessariamente.
 *
 * O Bearer token (Authorization header) NÃO é setado aqui — quem cuida disso
 * é o `JwtInterceptor` do `@auth0/angular-jwt`, configurado via `provideAuth()`.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth/')) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};

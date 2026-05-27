import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { apiErrorToastInterceptor, credentialsInterceptor, provideAuth } from '@intapp/auth';
import { provideI18n } from '@intapp/i18n';
import { MessageService } from 'primeng/api';

import { environment } from '../environments/environment';

import { appRoutes } from './app.routes';

/**
 * Configuração raiz da aplicação.
 *
 * Ordem importa em `provideHttpClient`:
 *  - `withInterceptorsFromDi()` ativa o `JwtInterceptor` classe-based do
 *    `@auth0/angular-jwt` (registrado via `HTTP_INTERCEPTORS` pelo `JwtModule`).
 *  - `withInterceptors([credentialsInterceptor, apiErrorToastInterceptor])`:
 *      - `credentialsInterceptor` injeta `withCredentials: true` em
 *        `/api/auth/*` antes do request sair.
 *      - `apiErrorToastInterceptor` fica por último para envolver toda a
 *        cadeia: como `catchError` do último interceptor é o mais "externo"
 *        em relação à propagação do erro, ele recebe tanto falhas de rede
 *        quanto falhas devolvidas pelo backend depois do refresh handling.
 *
 * `provideAuth` injeta o `AUTH_CONFIG` e o `APP_INITIALIZER` que tenta
 * recuperar a sessão no boot via cookie HttpOnly de refresh.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
    MessageService,
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([credentialsInterceptor, apiErrorToastInterceptor])),
    provideI18n(),
    provideAuth({
      apiUrl: environment.apiUrl,
      allowedDomains: environment.allowedDomains,
      defaultAuthenticatedRoute: '/termsheet',
    }),
  ],
};

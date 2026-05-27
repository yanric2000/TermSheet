import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { IAuthConfig } from '@intapp/auth/models';
import { AUTH_API, AuthApiService, AuthService } from '@intapp/auth/services';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { firstValueFrom } from 'rxjs';

/**
 * Factory para o `JwtModule` que lê o accessToken diretamente do
 * `AuthTokenStore` (signal em memória) — sem tocar `localStorage`.
 *
 * Importante: dependemos do `AuthTokenStore` (zero deps) em vez do
 * `AuthService` para quebrar o ciclo de DI:
 *   AuthService -> JwtHelperService -> JWT_OPTIONS -> AuthService (CICLO)
 * Também evita o ciclo indireto via `HttpClient`/`JwtInterceptor` que
 * `AuthService` arrasta transitivamente através do `AuthApiService`.
 *
 * `allowedDomains` define em quais hosts o `JwtInterceptor` anexará o Bearer.
 * `disallowedRoutes` exclui endpoints públicos onde o Bearer não faz sentido
 * (login/refresh/logout autenticam via cookie HttpOnly, não Bearer).
 */
function jwtOptionsFactory(tokenStore: AuthTokenStore, config: IAuthConfig) {
  return {
    tokenGetter: () => tokenStore.accessToken(),
    allowedDomains: config.allowedDomains,
    disallowedRoutes: [/\/api\/auth\/(login|refresh|logout)$/],
  };
}

/**
 * Provider function (padrão moderno Angular `provide*`).
 *
 * Configura:
 *  - `AUTH_CONFIG` token com apiUrl e domínios permitidos
 *  - `AUTH_API` token amarrado ao adapter HTTP `AuthApiService`. Esse bind é
 *    o ÚNICO ponto onde o serviço de domínio e o adapter se cruzam; isolando-o
 *    aqui, o `AuthService` permanece desacoplado de HTTP.
 *  - `JwtModule` do `@auth0/angular-jwt` com tokenGetter via DI lendo o signal
 *  - `APP_INITIALIZER` chamando `AuthService.bootstrap()` para recuperar
 *    sessão silenciosamente no F5 (via cookie HttpOnly de refresh)
 *
 * Não inclui o `credentialsInterceptor` — esse fica explícito no `app.config.ts`
 * via `withInterceptors([credentialsInterceptor])` para deixar a ordem clara.
 *
 * @example
 * providers: [
 *   provideHttpClient(withInterceptorsFromDi(), withInterceptors([credentialsInterceptor])),
 *   provideAuth({ apiUrl: '/api', allowedDomains: ['localhost:4200'] }),
 * ]
 */
export function provideAuth(config: IAuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CONFIG, useValue: config },
    AuthApiService,
    { provide: AUTH_API, useExisting: AuthApiService },
    importProvidersFrom(
      JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: jwtOptionsFactory,
          deps: [AuthTokenStore, AUTH_CONFIG],
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (auth: AuthService) => () => firstValueFrom(auth.bootstrap()),
      deps: [AuthService],
    },
  ]);
}

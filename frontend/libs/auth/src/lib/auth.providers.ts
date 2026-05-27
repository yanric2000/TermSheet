import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { IAuthConfig } from '@intapp/auth/models';
import { AUTH_API, AuthApiService, AuthService } from '@intapp/auth/services';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { firstValueFrom } from 'rxjs';

function jwtOptionsFactory(tokenStore: AuthTokenStore, config: IAuthConfig) {
  return {
    tokenGetter: () => tokenStore.accessToken(),
    allowedDomains: config.allowedDomains,
    disallowedRoutes: [/\/api\/auth\/(login|refresh|logout)$/],
  };
}

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

# @intapp/auth

Lib de autenticação da suite **TermSheet**. Provê login (e futuramente
register / forgot-password), guards de rota, interceptor HTTP de credenciais
e o `AuthService` reativo (signals).

## Arquitetura

Duas camadas com regras de import enforçadas via ESLint `@nx/enforce-module-boundaries`:

```
libs/auth/src/lib/
├── auth.providers.ts                # provideAuth() — registra HTTP, JWT, AUTH_API e bootstrap
├── features/                        # Apresentação (UI), organizada por subdomínio
│   ├── auth.routes.ts               # Orquestrador raiz (delega para os subdomínios)
│   └── <subdominio>/                # Ex.: `login/`, futuramente `register/`, etc.
│       ├── pages/
│       │   ├── <subdominio>.routes.ts   # Router encapsulado do subdomínio
│       │   └── <nome-da-pagina>/        # Component standalone OnPush
│       ├── components/              # Componentes auxiliares (opcional)
│       └── helpers/                 # Funções utilitárias da UI (opcional)
└── modules/auth/                    # Negócio (port/adapter)
    ├── guards/                      # authGuard, publicOnlyGuard
    ├── interceptors/                # credentialsInterceptor
    ├── models/                      # tipos do domínio
    ├── services/                    # AuthService + AuthApiService (adapter HTTP)
    ├── stores/                      # AuthTokenStore (signal do accessToken)
    └── tokens/                      # AUTH_CONFIG, AUTH_API
```

> O domínio fica acima do tipo de arquivo: cada subdomínio encapsula seu
> próprio `*.routes.ts` (dentro de `pages/`, irmão das pastas de página).
> `auth.routes.ts` apenas referencia esses routers via `loadChildren`.

## API pública

Exposta no barrel `frontend/libs/auth/src/index.ts`:

```ts
import {
  provideAuth,
  authRoutes,
  authGuard,
  publicOnlyGuard,
  AuthService,
  credentialsInterceptor,
  // tipos: IAuthConfig, ILoginRequest, ILoginResponse, IRefreshResponse, IUser, IApiError
} from '@intapp/auth';
```

## Running unit tests

Run `nx test auth` to execute the unit tests.

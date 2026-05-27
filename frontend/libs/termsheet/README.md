# @intapp/termsheet

Lib do produto **TermSheet** (adquirido pela Intapp) com gestão de deals imobiliários.

## Arquitetura

Duas camadas com regras de import enforçadas via ESLint `@nx/enforce-module-boundaries`:

```
libs/termsheet/src/lib/
├── features/                       # Apresentação (UI), organizada por subdomínio
│   ├── termsheet.routes.ts         # Orquestrador raiz (delega para os subdomínios)
│   └── <subdominio>/               # Ex.: `deals/`, futuramente `clients/`, etc.
│       ├── pages/
│       │   ├── <subdominio>.routes.ts   # Router encapsulado do subdomínio
│       │   └── <nome-da-pagina>/        # Component standalone OnPush
│       ├── components/             # Componentes auxiliares (opcional)
│       └── helpers/                # Funções utilitárias da UI (opcional)
└── modules/<subdominio>/           # Negócio
    ├── core/                       # Regras puras (facades, adapters, interfaces, reducers, tokens)
    └── infra/                      # Comunicação externa (HttpClient, constants)
```

> O domínio fica acima do tipo de arquivo: cada subdomínio encapsula seu
> próprio `*.routes.ts` (dentro de `pages/`, irmão das pastas de página).
> O orquestrador raiz (`termsheet.routes.ts`) referencia esses routers via
> `loadChildren`, deixando claro o limite entre subdomínios e tornando
> trivial adicionar novos sem mexer no que já existe.

Convenções de nomenclatura (inspiradas no SL-ContratacaoGestaoFretePO):

- `*.facade.ts` — orquestração (core ou infra)
- `*-requisicoes.facade.ts` — infra HTTP
- `*-estado.facade.ts` — estado reativo (com `signal`)
- `*.adapter.ts` — DTO → ViewModel
- `*.interface.ts` — contratos de tipos
- `*.type.ts` — tipos union/alias
- `*.enum.ts` — enums
- `*.reducer.ts` — funções puras de transição de estado
- `*.token.ts` — `InjectionToken` + factory
- `*.component.ts` — UI standalone OnPush

## API pública

Exporta apenas `termsheetRoutes`. Tudo o mais é detalhe interno da lib.

```ts
import { termsheetRoutes } from '@intapp/termsheet';
```

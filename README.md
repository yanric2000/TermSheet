# TermSheet

Monorepo da solução **TermSheet**: aplicação web para gestão de deals imobiliários (desafio técnico Intapp / Keepers), com API REST em Spring Boot e frontend Angular 17.

## Objetivo do repositório

Este projeto implementa uma versão enxuta do produto TermSheet descrito em [`challenge.md`](challenge.md):

- **Login** com usuário e senha antes de acessar áreas privadas.
- **Listagem paginada** de deals com dados pré-carregados pela API.
- **Cadastro** de novos deals (nome, preço de compra, endereço, NOI, descrição; cap rate calculado no backend).
- **Filtros** por nome e faixa de preço de compra (maior/menor que).
- **Internacionalização** (pt-BR, en-US, es-ES) e decisões de arquitetura documentadas para o frontend.

O backend fornece autenticação JWT + refresh token em cookie HttpOnly, CRUD de deals e persistência em PostgreSQL. O frontend (`frontend/`) consome a API via proxy em desenvolvimento e organiza o código em libs Nx (`auth`, `i18n`, `termsheet`, `util`).

Brief original do desafio: [`challenge.md`](challenge.md).

## Como executar (desenvolvimento)

Recomendado: subir o **backend** primeiro e, em outro terminal, o **frontend**.

### Pré-requisitos

| Parte | Requisitos |
|-------|------------|
| Backend (Docker) | Docker e Docker Compose |
| Backend (local) | Java 21, Maven, PostgreSQL 16 em `localhost:5432` |
| Frontend | Node.js 18+ e npm |

### 1. Backend

**Opção A — Docker Compose (recomendado)**

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up --build
```

- API: <http://localhost:8080/api>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- PostgreSQL no host: porta `5433` (configurável via `POSTGRES_PORT` no `.env`)

Usuário padrão após o seed:

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | ADMIN |

**Opção B — Maven local**

Com PostgreSQL acessível em `localhost:5432` (banco/usuário `termsheet`):

```bash
cd backend
./mvnw spring-boot:run
# ou: mvn spring-boot:run
```

Variáveis opcionais: ver [`.env.example`](.env.example).

### 2. Frontend

Com a API rodando em `http://localhost:8080`:

```bash
cd frontend
npm install
npm start
```

- App: <http://localhost:4200>
- O dev server usa [`proxy.conf.json`](frontend/apps/intapp-suite/proxy.conf.json) para encaminhar `/api` → `http://localhost:8080` (cookies de refresh incluídos).

Outros comandos úteis:

```bash
cd frontend
npm run build          # build de produção
npm run lint           # ESLint em todos os projetos
npm run lint:deps      # regras de dependência (dependency-cruiser)
npm test               # testes unitários (Jest)
npx nx test auth       # testes de uma lib específica
```

Credenciais de teste na UI: mesmo usuário `admin` / `admin123` (ou o configurado no seed da API).

## Documentação de decisões (frontend)

Decisões de arquitetura, auth, i18n, termsheet, util e testes estão na raiz. Índice: [`DECISOES.md`](DECISOES.md).

## Estrutura do projeto

```text
TermSheet/
├── backend/              API Spring Boot (auth, deals, Flyway)
├── frontend/             Monorepo Nx + Angular 17 (app intapp-suite)
│   ├── apps/intapp-suite/
│   └── libs/             auth, i18n, termsheet, util
├── docker-compose.yml
├── .env.example
├── challenge.md          Enunciado do desafio
├── DECISOES*.md          Documentação de decisões do frontend
└── README.md
```

## Stack

**Backend**

- Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA
- PostgreSQL 16, Flyway, JJWT, springdoc-openapi

**Frontend**

- Angular 17, Nx 18, PrimeNG 17, Tailwind CSS
- NgRx Signals, `@auth0/angular-jwt`, Jest

## API (resumo)

Base: `http://localhost:8080/api`

### Auth

| Method | Path       | Auth   | Descrição                          |
|--------|------------|--------|------------------------------------|
| POST   | `/auth/login`   | público | Access JWT no body + cookie refresh |
| POST   | `/auth/refresh` | cookie  | Renova access token (rotação)       |
| POST   | `/auth/logout`  | cookie  | Revoga refresh e limpa cookie       |
| GET    | `/auth/me`      | bearer  | Usuário autenticado                 |

O frontend envia credenciais (`withCredentials`) nas rotas `/api/auth/**` e usa interceptors para Bearer + refresh silencioso.

### Deals

Requer `Authorization: Bearer <accessToken>`.

| Method | Path    | Descrição                                      |
|--------|---------|------------------------------------------------|
| GET    | `/deals` | Listagem paginada (`name`, `minPrice`, `maxPrice`, …) |
| POST   | `/deals` | Criar deal (cap rate calculado no servidor)    |
| GET    | `/deals/{id}` | Detalhe                                   |
| PUT    | `/deals/{id}` | Atualizar                                 |
| DELETE | `/deals/{id}` | Remover                                   |

Exemplo com curl (após login):

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

TOKEN="<accessToken do JSON>"
curl -s "http://localhost:8080/api/deals?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

Mais detalhes de autenticação, refresh e variáveis de ambiente: seções abaixo permanecem válidas para operação da API.

## Autenticação e silent refresh (API)

Login retorna access token no body e refresh em cookie HttpOnly:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
```

Refresh (cookie enviado automaticamente):

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/refresh
```

Logout:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/logout
```

## Configuração da API

| Variable                  | Default                                | Description                                       |
|---------------------------|----------------------------------------|---------------------------------------------------|
| `SPRING_DATASOURCE_URL`   | `jdbc:postgresql://localhost:5432/...` | JDBC URL                                          |
| `SPRING_DATASOURCE_USERNAME` | `termsheet`                         | DB user                                           |
| `SPRING_DATASOURCE_PASSWORD` | `termsheet`                         | DB password                                       |
| `JWT_SECRET`              | (obrigatório em produção)              | Segredo HS256, ≥ 32 bytes UTF-8                   |
| `JWT_ACCESS_EXPIRATION`   | `900000` (15 min)                      | TTL do access token (ms)                          |
| `JWT_REFRESH_EXPIRATION`  | `604800000` (7 dias)                   | TTL do refresh token (ms)                         |
| `COOKIE_SECURE`           | `false`                                | `true` em HTTPS                                   |
| `COOKIE_SAMESITE`         | `Lax`                                  | `None` com `Secure=true` se cross-site            |
| `CORS_ORIGINS`            | `http://localhost:4200`                | Origens permitidas (vírgula)                      |

## Comandos Docker

```bash
docker compose up --build     # build + start API + Postgres
docker compose logs -f api    # logs da API
docker compose down           # parar containers
docker compose down -v        # parar e apagar volume do Postgres
```

## License

See [`LICENSE`](LICENSE).

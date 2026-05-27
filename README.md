# TermSheet

Monorepo for the **TermSheet** solution: a web application for managing real estate deals (Intapp / Keepers technical challenge), with a Spring Boot REST API and an Angular 17 frontend.

## Repository purpose

This project implements a lean version of the TermSheet product described in [`challenge.md`](challenge.md):

- **Login** with username and password before accessing private areas.
- **Paginated listing** of deals with data preloaded by the API.
- **Create** new deals (name, purchase price, address, NOI, description; cap rate calculated on the backend).
- **Filters** by name and purchase price range (greater than / less than).
- **Internationalization** (pt-BR, en-US, es-ES) and documented frontend architecture decisions.

The backend provides JWT authentication + HttpOnly refresh-token cookie, deal CRUD, and PostgreSQL persistence. The frontend (`frontend/`) consumes the API through a dev proxy and organizes code in Nx libs (`auth`, `i18n`, `termsheet`, `util`).

Original challenge brief: [`challenge.md`](challenge.md).

## How to run (development)

Recommended: start the **backend** first, then the **frontend** in another terminal.

### Prerequisites

| Part | Requirements |
|------|----------------|
| Backend (Docker) | Docker and Docker Compose |
| Backend (local) | Java 21, Maven, PostgreSQL 16 on `localhost:5432` |
| Frontend | Node.js 18+ and npm |

### 1. Backend

**Option A — Docker Compose (recommended)**

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

- API: <http://localhost:8080/api>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- PostgreSQL on the host: port `5433` (configurable via `POSTGRES_PORT` in `.env`)

Default user after seed:

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | ADMIN |

**Option B — Local Maven**

With PostgreSQL reachable at `localhost:5432` (database/user `termsheet`):

```bash
cd backend
./mvnw spring-boot:run
# or: mvn spring-boot:run
```

Optional variables: see [`.env.example`](.env.example).

### 2. Frontend

With the API running at `http://localhost:8080`:

```bash
cd frontend
npm install
npm start
```

- App: <http://localhost:4200>
- The dev server uses [`proxy.conf.json`](frontend/apps/intapp-suite/proxy.conf.json) to forward `/api` → `http://localhost:8080` (refresh cookies included).

Other useful commands:

```bash
cd frontend
npm run build          # production build
npm run lint           # ESLint across all projects
npm run lint:deps      # dependency rules (dependency-cruiser)
npm test               # unit tests (Jest)
npx nx test auth       # tests for a specific lib
```

UI test credentials: same user `admin` / `admin123` (or whatever the API seed configures).

## Architecture decisions (frontend)

Architecture, auth, i18n, termsheet, util, and testing decisions live at the repository root. Index: [`DECISOES.md`](DECISOES.md) (Portuguese).

## Project layout

```text
TermSheet/
├── backend/              Spring Boot API (auth, deals, Flyway)
├── frontend/             Nx monorepo + Angular 17 (intapp-suite app)
│   ├── apps/intapp-suite/
│   └── libs/             auth, i18n, termsheet, util
├── docker-compose.yml
├── .env.example
├── challenge.md          Challenge brief
├── DECISOES*.md          Frontend decision docs (Portuguese)
└── README.md
```

## Stack

**Backend**

- Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA
- PostgreSQL 16, Flyway, JJWT, springdoc-openapi

**Frontend**

- Angular 17, Nx 18, PrimeNG 17, Tailwind CSS
- NgRx Signals, `@auth0/angular-jwt`, Jest

## API (summary)

Base URL: `http://localhost:8080/api`

### Auth

| Method | Path            | Auth    | Description                              |
|--------|-----------------|---------|------------------------------------------|
| POST   | `/auth/login`   | public  | Access JWT in body + refresh cookie      |
| POST   | `/auth/refresh` | cookie | Rotate refresh token                     |
| POST   | `/auth/logout`  | cookie  | Revoke refresh and clear cookie          |
| GET    | `/auth/me`      | bearer  | Authenticated user                       |

The frontend sends credentials (`withCredentials`) on `/api/auth/**` routes and uses interceptors for Bearer tokens + silent refresh.

### Deals

Requires `Authorization: Bearer <accessToken>`.

| Method | Path          | Description                                                |
|--------|---------------|------------------------------------------------------------|
| GET    | `/deals`      | Paginated list (`name`, `minPrice`, `maxPrice`, …)         |
| POST   | `/deals`      | Create deal (cap rate computed on the server)              |
| GET    | `/deals/{id}` | Get by id                                                  |
| PUT    | `/deals/{id}` | Update                                                     |
| DELETE | `/deals/{id}` | Delete                                                     |

Example with curl (after login):

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

TOKEN="<accessToken from JSON>"
curl -s "http://localhost:8080/api/deals?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

More details on authentication, refresh, and environment variables are in the sections below.

## Authentication and silent refresh (API)

Login returns the access token in the response body and the refresh token in an HttpOnly cookie:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
```

Refresh (cookie sent automatically):

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/refresh
```

Logout:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/logout
```

## API configuration

| Variable                     | Default                                | Description                                |
|------------------------------|----------------------------------------|--------------------------------------------|
| `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://localhost:5432/...` | JDBC URL                                   |
| `SPRING_DATASOURCE_USERNAME` | `termsheet`                            | DB user                                    |
| `SPRING_DATASOURCE_PASSWORD` | `termsheet`                            | DB password                                |
| `JWT_SECRET`                 | (required in production)               | HS256 secret, ≥ 32 UTF-8 bytes               |
| `JWT_ACCESS_EXPIRATION`      | `900000` (15 min)                      | Access token TTL (ms)                      |
| `JWT_REFRESH_EXPIRATION`     | `604800000` (7 days)                   | Refresh token TTL (ms)                     |
| `COOKIE_SECURE`              | `false`                                | `true` over HTTPS                          |
| `COOKIE_SAMESITE`            | `Lax`                                  | `None` with `Secure=true` if cross-site    |
| `CORS_ORIGINS`               | `http://localhost:4200`                | Allowed origins (comma-separated)        |

## Docker commands

```bash
docker compose up --build     # build + start API + Postgres
docker compose logs -f api    # tail API logs
docker compose down           # stop containers
docker compose down -v        # stop and wipe Postgres volume
```

## License

See [`LICENSE`](LICENSE).

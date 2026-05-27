# TermSheet — Mock API

Mocked REST API used as a backing service for the **TermSheet** Angular challenge. It exposes a CRUD of real estate deals with JWT authentication, refresh-token rotation (silent refresh ready), PostgreSQL persistence and is fully containerized with Docker Compose.

The challenge brief lives in [`desafio.md`](desafio.md). The Angular front-end is **not** part of this repo yet — the API is designed to live alongside a future `frontend/` folder.

## Stack

- Java 21 + Spring Boot 3.3
- Spring Web, Spring Validation, Spring Security, Spring Data JPA
- PostgreSQL 16 + Flyway
- JJWT 0.12 for HS256 access tokens
- springdoc-openapi for Swagger UI
- Maven, Docker, Docker Compose

## Project layout

```text
TermSheet/
├── backend/                 Spring Boot service
│   ├── src/main/java/com/termsheet/api/...
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-docker.yml
│   │   └── db/migration/    Flyway migrations
│   ├── pom.xml
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── desafio.md
└── README.md
```

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at:

- API base: <http://localhost:8080/api>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>
- PostgreSQL exposed on host port `5433` (override with `POSTGRES_PORT` in `.env` if needed). Inside the compose network the database is always reached as `db:5432`, so this only matters if you want to connect from your host with a tool like `psql` or DBeaver.

A default admin user is auto-seeded on first startup:

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | ADMIN |

Seven realistic deals (cap rates between 5% and 12%) are seeded as well.

## Running locally without Docker

You need a PostgreSQL 16 instance reachable on `localhost:5432` with a database/user named `termsheet/termsheet`. Then:

```bash
cd backend
./mvnw spring-boot:run
# or, if mvnw is not present:
mvn spring-boot:run
```

Override defaults via environment variables (see [`.env.example`](.env.example)).

## Authentication and silent refresh

Login returns a short-lived **access token** in the body and sets a long-lived **refresh token** as an HttpOnly cookie:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
```

Response shape:

```json
{
  "accessToken": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": { "id": "...", "username": "admin", "name": "TermSheet Admin", "role": "ADMIN" }
}
```

The `Set-Cookie: refresh_token=...; HttpOnly; Path=/api/auth; SameSite=Lax; Max-Age=604800` header is also returned.

To silently refresh the access token (no body, the cookie is read automatically):

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/refresh
```

Each refresh **rotates** the refresh token: the previous one is revoked and a new one is issued. If a revoked refresh token is presented again, the entire token family for that user is revoked (reuse detection).

Logout revokes the active refresh token and clears the cookie:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/logout
```

### Angular notes

Configure `HttpClient` with `withCredentials: true` for any call to `/api/auth/**`. Add an HTTP interceptor that:

1. Attaches `Authorization: Bearer <accessToken>` to protected requests.
2. On `401` from a protected endpoint, queues a `POST /api/auth/refresh` and retries the original request with the new access token.

## Endpoints

### Auth (`/api/auth`)

| Method | Path        | Auth     | Description                                                |
|--------|-------------|----------|------------------------------------------------------------|
| POST   | `/login`    | public   | Authenticate, returns access JWT + sets refresh cookie     |
| POST   | `/refresh`  | cookie   | Rotates refresh, returns new access JWT + new cookie       |
| POST   | `/logout`   | cookie   | Revokes refresh token and clears cookie                    |
| POST   | `/register` | public   | Creates a new `USER` (optional)                            |
| GET    | `/me`       | bearer   | Returns the authenticated user                             |

### Deals (`/api/deals`)

All endpoints require `Authorization: Bearer <accessToken>`.

| Method | Path           | Description                                                                |
|--------|----------------|----------------------------------------------------------------------------|
| GET    | `/`            | Paginated search (`name`, `minPrice`, `maxPrice`, `page`, `size`, `sort`) |
| GET    | `/{id}`        | Get a deal by id                                                          |
| POST   | `/`            | Create a deal (cap rate computed on the server)                           |
| PUT    | `/{id}`        | Update a deal                                                             |
| DELETE | `/{id}`        | Delete a deal                                                             |

Example search:

```bash
TOKEN="<paste accessToken here>"
curl -s "http://localhost:8080/api/deals?name=tower&minPrice=5000000&maxPrice=20000000&page=0&size=10&sort=purchasePrice,desc" \
     -H "Authorization: Bearer $TOKEN" | jq
```

Example create:

```bash
curl -s -X POST http://localhost:8080/api/deals \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "New Acquisition",
           "purchasePrice": 6500000,
           "address": "100 Example St, City, ST",
           "noi": 520000,
           "description": "Recently renovated mixed-use property"
         }' | jq
```

## Configuration reference

| Variable                  | Default                                | Description                                       |
|---------------------------|----------------------------------------|---------------------------------------------------|
| `SPRING_DATASOURCE_URL`   | `jdbc:postgresql://localhost:5432/...` | JDBC URL                                          |
| `SPRING_DATASOURCE_USERNAME` | `termsheet`                         | DB user                                           |
| `SPRING_DATASOURCE_PASSWORD` | `termsheet`                         | DB password                                       |
| `JWT_SECRET`              | (must be set in prod)                  | HS256 secret, must be ≥ 32 bytes UTF-8            |
| `JWT_ACCESS_EXPIRATION`   | `900000` (15 min)                      | Access token TTL (ms)                             |
| `JWT_REFRESH_EXPIRATION`  | `604800000` (7 days)                   | Refresh token TTL (ms)                            |
| `COOKIE_SECURE`           | `false`                                | `true` in production HTTPS                        |
| `COOKIE_SAMESITE`         | `Lax`                                  | `None` (with `Secure=true`) for cross-site setups |
| `COOKIE_DOMAIN`           | (unset)                                | Optional explicit cookie domain                   |
| `CORS_ORIGINS`            | `http://localhost:4200`                | Comma-separated allowed origins                   |

## Useful commands

```bash
docker compose up --build     # build + start everything
docker compose logs -f api    # tail API logs
docker compose down           # stop containers
docker compose down -v        # stop and wipe Postgres data
```

## License

See [`LICENSE`](LICENSE).

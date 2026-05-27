CREATE TABLE users (
    id            UUID         PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(150) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE deals (
    id             UUID           PRIMARY KEY,
    name           VARCHAR(200)   NOT NULL,
    purchase_price NUMERIC(19, 2) NOT NULL,
    address        VARCHAR(500)   NOT NULL,
    noi            NUMERIC(19, 2) NOT NULL,
    cap_rate       NUMERIC(7, 4)  NOT NULL,
    description    VARCHAR(2000),
    owner_id       UUID           NOT NULL,
    created_at     TIMESTAMPTZ    NOT NULL,
    updated_at     TIMESTAMPTZ    NOT NULL,
    CONSTRAINT fk_deals_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE INDEX idx_deals_owner_id ON deals (owner_id);
CREATE INDEX idx_deals_name_lower ON deals (LOWER(name));
CREATE INDEX idx_deals_purchase_price ON deals (purchase_price);

CREATE TABLE refresh_tokens (
    id              UUID         PRIMARY KEY,
    user_id         UUID         NOT NULL,
    token_hash      VARCHAR(64)  NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ  NOT NULL,
    revoked_at      TIMESTAMPTZ,
    replaced_by_id  UUID,
    user_agent      VARCHAR(500),
    ip_address      VARCHAR(64),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

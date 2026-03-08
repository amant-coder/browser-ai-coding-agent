-- V1: Create users table
CREATE TABLE IF NOT EXISTS users (
    id           VARCHAR(36)  PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url   VARCHAR(500),
    role         VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

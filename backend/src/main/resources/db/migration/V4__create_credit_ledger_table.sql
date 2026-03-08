-- V4: Create credit_ledger table
CREATE TABLE IF NOT EXISTS credit_ledger (
    id           VARCHAR(36) PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL UNIQUE,
    balance      INT         NOT NULL DEFAULT 0,
    last_updated TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON credit_ledger(user_id);

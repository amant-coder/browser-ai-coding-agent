-- V3: Create usage_events table
CREATE TABLE IF NOT EXISTS usage_events (
    id           VARCHAR(36) PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL,
    action       VARCHAR(50) NOT NULL,
    credits_used INT         NOT NULL DEFAULT 0,
    metadata     TEXT,
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);

-- V2: Create deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id           VARCHAR(36)  PRIMARY KEY,
    user_id      VARCHAR(36),
    project_name VARCHAR(255) NOT NULL,
    provider     VARCHAR(50)  NOT NULL,
    status       VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    public_url   VARCHAR(500),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);

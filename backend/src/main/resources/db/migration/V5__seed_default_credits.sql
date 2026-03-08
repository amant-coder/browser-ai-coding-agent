-- V5: Seed default credits (100 free credits) for all existing users
-- New users will receive credits upon registration via application logic.
-- This migration seeds existing users who have no ledger entry yet.
INSERT INTO credit_ledger (id, user_id, balance, last_updated)
SELECT
    gen_random_uuid()::TEXT,
    u.id,
    100,
    NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM credit_ledger cl WHERE cl.user_id = u.id
);

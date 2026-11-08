-- 003: businesses.password_hash is dead weight since v2 (credentials live in users.password_hash).
-- Already applied to the production database on 2026-11-08; kept here so the repo
-- documents the full upgrade path 001 (schema.sql) -> 002 -> 003. Safe to re-run.
ALTER TABLE businesses DROP COLUMN IF EXISTS password_hash;

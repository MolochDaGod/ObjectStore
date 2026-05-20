-- Migration v2: fix r2_key → key rename + add missing columns + conversion_jobs
-- Run: wrangler d1 execute grudge-objectstore --remote --file=workers/migrate-v2.sql

-- 1. Rename the column the DB has (r2_key) to what the worker expects (key)
ALTER TABLE assets RENAME COLUMN r2_key TO key;

-- 2. Add columns the worker writes but the old schema is missing
ALTER TABLE assets ADD COLUMN owner      TEXT;
ALTER TABLE assets ADD COLUMN updated_at TEXT;

-- 3. Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_assets_key        ON assets(key);
CREATE INDEX IF NOT EXISTS idx_assets_category   ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_visibility ON assets(visibility);
CREATE INDEX IF NOT EXISTS idx_assets_owner      ON assets(owner);
CREATE INDEX IF NOT EXISTS idx_assets_created    ON assets(created_at);

-- 4. Create conversion_jobs table (was never created)
CREATE TABLE IF NOT EXISTS conversion_jobs (
  id              TEXT PRIMARY KEY,
  source_hash     TEXT NOT NULL,
  source_name     TEXT NOT NULL,
  source_format   TEXT NOT NULL,
  source_size     INTEGER,
  output_asset_id TEXT REFERENCES assets(id),
  status          TEXT NOT NULL DEFAULT 'pending',
  error           TEXT,
  meshes          INTEGER,
  vertices        INTEGER,
  animations      INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_hash   ON conversion_jobs(source_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON conversion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_asset  ON conversion_jobs(output_asset_id);

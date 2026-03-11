-- ObjectStore D1 Schema
-- Run: wrangler d1 execute objectstore-meta --file=workers/schema.sql

CREATE TABLE IF NOT EXISTS assets (
  id         TEXT PRIMARY KEY,                          -- uuid
  key        TEXT NOT NULL UNIQUE,                      -- R2 object key (path)
  filename   TEXT NOT NULL,                             -- original upload filename
  mime       TEXT,                                      -- content-type
  size       INTEGER,                                   -- bytes
  sha256     TEXT,                                      -- integrity hash
  tags       TEXT DEFAULT '[]',                         -- JSON array of strings
  category   TEXT,                                      -- weapon, armor, icon, sprite, audio…
  visibility TEXT NOT NULL DEFAULT 'public',            -- public | private
  metadata   TEXT DEFAULT '{}',                         -- arbitrary JSON blob
  owner      TEXT,                                      -- uploader id / api-key name
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assets_key        ON assets(key);
CREATE INDEX IF NOT EXISTS idx_assets_category   ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_visibility ON assets(visibility);
CREATE INDEX IF NOT EXISTS idx_assets_owner      ON assets(owner);
CREATE INDEX IF NOT EXISTS idx_assets_created     ON assets(created_at);

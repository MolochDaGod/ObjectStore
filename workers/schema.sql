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

-- ── Conversion Jobs ─────────────────────────────────────────────────
-- Tracks FBX/OBJ → GLB conversions with dedup via source_hash

CREATE TABLE IF NOT EXISTS conversion_jobs (
  id              TEXT PRIMARY KEY,                      -- uuid
  source_hash     TEXT NOT NULL,                         -- SHA-256 of original file (dedup key)
  source_name     TEXT NOT NULL,                         -- original filename
  source_format   TEXT NOT NULL,                         -- fbx, obj, gltf
  source_size     INTEGER,                               -- original file size in bytes
  output_asset_id TEXT REFERENCES assets(id),            -- FK → converted GLB in assets table
  status          TEXT NOT NULL DEFAULT 'pending',       -- pending | converting | done | failed
  error           TEXT,                                  -- error message if failed
  meshes          INTEGER,                               -- mesh count after conversion
  vertices        INTEGER,                               -- vertex count after conversion
  animations      INTEGER,                               -- animation clip count
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_hash   ON conversion_jobs(source_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON conversion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_asset  ON conversion_jobs(output_asset_id);

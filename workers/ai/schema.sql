-- AI Jobs D1 Schema
-- Run: wrangler d1 execute objectstore-meta --file=workers/ai/schema.sql

CREATE TABLE IF NOT EXISTS ai_jobs (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,                              -- generate-sprite, generate-icon, tag, describe, chat
  prompt     TEXT,                                       -- user prompt
  status     TEXT NOT NULL DEFAULT 'pending',            -- pending | processing | complete | failed
  result     TEXT DEFAULT '{}',                          -- JSON result blob
  error      TEXT,                                       -- error message if failed
  model      TEXT,                                       -- AI model used
  owner      TEXT,                                       -- requester id
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_type    ON ai_jobs(type);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status  ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created ON ai_jobs(created_at);

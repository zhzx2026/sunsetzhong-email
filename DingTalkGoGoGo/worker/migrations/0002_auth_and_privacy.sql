CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS user_cookies (
  user_id TEXT PRIMARY KEY,
  cookies_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

ALTER TABLE jobs ADD COLUMN owner_user_id TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_jobs_owner_updated_at ON jobs(owner_user_id, updated_at DESC);

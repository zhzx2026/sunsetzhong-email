-- DingTalk core tables
CREATE TABLE IF NOT EXISTS dt_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dt_jobs (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued',
  stage TEXT NOT NULL DEFAULT 'queued',
  urls_json TEXT NOT NULL DEFAULT '[]',
  thread INTEGER NOT NULL DEFAULT 10,
  output_subdir TEXT,
  create_video_list INTEGER NOT NULL DEFAULT 1,
  current_title TEXT NOT NULL DEFAULT '',
  completed_parts INTEGER NOT NULL DEFAULT 0,
  total_parts INTEGER NOT NULL DEFAULT 0,
  progress_percent REAL NOT NULL DEFAULT 0,
  titles_json TEXT NOT NULL DEFAULT '[]',
  errors_json TEXT NOT NULL DEFAULT '[]',
  files_json TEXT NOT NULL DEFAULT '[]',
  runner_run_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_dt_jobs_status ON dt_jobs(status);
CREATE INDEX IF NOT EXISTS idx_dt_jobs_owner_updated ON dt_jobs(owner_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS dt_job_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dt_job_events_job ON dt_job_events(job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dt_user_cookies (
  user_id TEXT PRIMARY KEY,
  cookies_json TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dt_login_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  qr_url TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_dt_login_sessions ON dt_login_sessions(user_id, updated_at DESC);

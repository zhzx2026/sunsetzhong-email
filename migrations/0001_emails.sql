CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  message_id TEXT,
  source TEXT,
  address TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  raw_json TEXT,
  direction TEXT NOT NULL DEFAULT 'inbound',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_emails_direction_created ON emails(direction, created_at DESC);

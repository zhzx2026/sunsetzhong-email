ALTER TABLE emails ADD COLUMN owner_id TEXT;

CREATE TABLE IF NOT EXISTS user_addresses (
  user_id TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, address)
);

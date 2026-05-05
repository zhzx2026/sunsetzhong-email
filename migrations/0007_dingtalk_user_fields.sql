-- Add DingTalk-specific columns to existing users table
ALTER TABLE users ADD COLUMN is_sudo INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN legal_version TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN legal_accepted_at TEXT;

-- Existing admins get sudo
UPDATE users SET is_sudo = 1 WHERE role = 'admin';

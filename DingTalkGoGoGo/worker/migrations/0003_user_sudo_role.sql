ALTER TABLE users ADD COLUMN is_sudo INTEGER NOT NULL DEFAULT 0;

UPDATE users
SET is_sudo = 1
WHERE lower(username) = 'zhong';

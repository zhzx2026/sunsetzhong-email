-- Add DingTalk zip password field for encrypted downloads
ALTER TABLE users ADD COLUMN dt_zip_password TEXT NOT NULL DEFAULT '';

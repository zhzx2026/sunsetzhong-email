-- Seed default DingTalk settings
INSERT OR IGNORE INTO dt_settings (key, value, updated_at) VALUES ('dingtalk_enabled', 'false', datetime('now'));
INSERT OR IGNORE INTO dt_settings (key, value, updated_at) VALUES ('legal_version', '2026-05-01', datetime('now'));
INSERT OR IGNORE INTO dt_settings (key, value, updated_at) VALUES ('legal_text', '', datetime('now'));

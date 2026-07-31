-- +goose Up

-- Удаляем пользователей-призраков (без привязанного аккаунта).
-- Каскад автоматически удалит связанные positions, education, contacts, skills.
DELETE FROM users
WHERE account_id IS NULL;

-- +goose Down

-- Откат невозможен: удалённые строки восстановить нельзя.
-- Для отката используй резервную копию или повторный запуск seed-миграции.
SELECT 'down is irreversible — restore from backup or re-run seed';

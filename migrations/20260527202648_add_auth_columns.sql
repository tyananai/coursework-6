-- +goose Up
ALTER TABLE users
    ADD COLUMN email         varchar(255) UNIQUE,
    ADD COLUMN password_hash text;

-- +goose Down
ALTER TABLE users
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS password_hash;

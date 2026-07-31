-- +goose Up
ALTER     TABLE users
ADD       COLUMN email VARCHAR(255) UNIQUE,
ADD       COLUMN password_hash TEXT;

-- +goose Down
ALTER     TABLE users
DROP      COLUMN IF EXISTS email,
DROP      COLUMN IF EXISTS password_hash;
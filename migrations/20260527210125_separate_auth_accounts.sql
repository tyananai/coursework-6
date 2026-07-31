-- +goose Up
CREATE    TABLE accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

-- Move existing auth credentials from users into accounts
INSERT    INTO accounts (id, email, password_hash, created_at)
SELECT    id,
          email,
          password_hash,
          created_at
FROM      users
WHERE     email IS NOT NULL AND      
          password_hash IS NOT NULL;

-- Add ownership FK to resumes
ALTER     TABLE users
ADD       COLUMN account_id UUID REFERENCES accounts (id) ON DELETE SET NULL;

-- Delete the empty user records that were created by Register (no resume data)
DELETE    FROM users
WHERE     id IN (
          SELECT    id
          FROM      accounts
          );

-- Remove auth columns from users (they now belong to accounts)
ALTER     TABLE users
DROP      COLUMN email;

ALTER     TABLE users
DROP      COLUMN password_hash;

-- +goose Down
ALTER     TABLE users
ADD       COLUMN email VARCHAR(255) UNIQUE;

ALTER     TABLE users
ADD       COLUMN password_hash TEXT;

-- Restore auth data for users linked to an account
UPDATE    users u
SET       email = a.email,
          password_hash = a.password_hash
FROM      accounts a
WHERE     u.account_id = a.id;

-- Re-insert auth-only records back as empty user rows
INSERT    INTO users (id, email, password_hash, created_at, updated_at)
SELECT    a.id,
          a.email,
          a.password_hash,
          a.created_at,
          a.created_at
FROM      accounts a
WHERE     a.id NOT IN (
          SELECT    account_id
          FROM      users
          WHERE     account_id IS NOT NULL
          );

ALTER     TABLE users
DROP      COLUMN account_id;

DROP      TABLE accounts;










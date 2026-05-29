-- +goose Up
CREATE    EXTENSION IF NOT EXISTS pgcrypto;

CREATE    TABLE regions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          NAME VARCHAR(255) NOT NULL UNIQUE
          );

CREATE    TABLE industries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          NAME VARCHAR(255) NOT NULL UNIQUE
          );

-- +goose Down
DROP      TABLE IF EXISTS industries;

DROP      TABLE IF EXISTS regions;
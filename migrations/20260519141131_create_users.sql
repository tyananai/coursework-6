-- +goose Up
CREATE    TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          summary TEXT,
          photo_url TEXT,
          region_id UUID REFERENCES regions (id),
          industry_id UUID REFERENCES industries (id),
          created_at timestamptz NOT NULL DEFAULT NOW(),
          updated_at timestamptz NOT NULL DEFAULT NOW()
          );

CREATE    INDEX idx_users_region_id ON users (region_id);

CREATE    INDEX idx_users_industry_id ON users (industry_id);

-- +goose StatementBegin
CREATE OR       
REPLACE FUNCTION set_updated_at () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- +goose StatementEnd
CREATE    TRIGGER users_updated_at BEFORE
UPDATE    ON users FOR EACH ROW
EXECUTE   FUNCTION set_updated_at ();

-- +goose Down
DROP      TRIGGER IF EXISTS users_updated_at ON users;

DROP      FUNCTION IF EXISTS set_updated_at ();

DROP      TABLE IF EXISTS users;



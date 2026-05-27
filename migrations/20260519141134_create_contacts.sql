-- +goose Up
CREATE TABLE contacts (
    id      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type    varchar(50) NOT NULL
                CHECK (type IN ('blog','twitter','linkedin','github','email','website')),
    url     text
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);

-- +goose Down
DROP TABLE IF EXISTS contacts;

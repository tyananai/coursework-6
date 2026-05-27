-- +goose Up
CREATE TABLE skills (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       varchar(100) NOT NULL,
    category   varchar(100),
    sort_order int          NOT NULL DEFAULT 0
);

CREATE INDEX idx_skills_user_id ON skills(user_id);

-- +goose Down
DROP TABLE IF EXISTS skills;

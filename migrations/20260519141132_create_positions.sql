-- +goose Up
CREATE TABLE positions (
    id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title    varchar(255),
    organization varchar(255),
    start_date   date,
    end_date     date,
    is_current   bool         NOT NULL DEFAULT false
);

CREATE INDEX idx_positions_user_id ON positions(user_id);

-- +goose Down
DROP TABLE IF EXISTS positions;

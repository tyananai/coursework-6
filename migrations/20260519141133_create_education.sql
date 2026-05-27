-- +goose Up
CREATE TABLE education (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_name varchar(255),
    start_date  date,
    end_date    date
);

CREATE INDEX idx_education_user_id ON education(user_id);

-- +goose Down
DROP TABLE IF EXISTS education;

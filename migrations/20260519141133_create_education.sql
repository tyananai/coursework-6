-- +goose Up
CREATE    TABLE education (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
          school_name VARCHAR(255),
          start_date date,
          end_date date
          );

CREATE    INDEX idx_education_user_id ON education (user_id);

-- +goose Down
DROP      TABLE IF EXISTS education;
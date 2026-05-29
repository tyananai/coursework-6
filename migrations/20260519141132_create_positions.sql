-- +goose Up
CREATE    TABLE positions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
          job_title VARCHAR(255),
          organization VARCHAR(255),
          start_date date,
          end_date date,
          is_current bool NOT NULL DEFAULT FALSE
          );

CREATE    INDEX idx_positions_user_id ON positions (user_id);

-- +goose Down
DROP      TABLE IF EXISTS positions;
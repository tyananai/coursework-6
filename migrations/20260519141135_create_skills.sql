-- +goose Up
CREATE    TABLE skills (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
          NAME VARCHAR(100) NOT NULL,
          category VARCHAR(100),
          sort_order INT NOT NULL DEFAULT 0
          );

CREATE    INDEX idx_skills_user_id ON skills (user_id);

-- +goose Down
DROP      TABLE IF EXISTS skills;
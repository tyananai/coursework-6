-- +goose Up
CREATE    TABLE contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
          user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
          TYPE      VARCHAR(50) NOT NULL CHECK (
          TYPE      IN (
          'blog',
          'twitter',
          'linkedin',
          'github',
          'email',
          'website'
          )
          ),
          url TEXT
          );

CREATE    INDEX idx_contacts_user_id ON contacts (user_id);

-- +goose Down
DROP      TABLE IF EXISTS contacts;
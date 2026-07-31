-- +goose Up
UPDATE    users
SET       email = 'alice.johnson@example.com'
WHERE     first_name = 'Alice' AND      
          last_name = 'Johnson' AND      
          email IS NULL;

UPDATE    users
SET       email = 'bob.williams@example.com'
WHERE     first_name = 'Bob' AND      
          last_name = 'Williams' AND      
          email IS NULL;

UPDATE    users
SET       email = 'clara.davis@university.edu'
WHERE     first_name = 'Clara' AND      
          last_name = 'Davis' AND      
          email IS NULL;

-- +goose Down
UPDATE    users
SET       email = NULL
WHERE     email IN (
          'alice.johnson@example.com',
          'bob.williams@example.com',
          'clara.davis@university.edu'
          );
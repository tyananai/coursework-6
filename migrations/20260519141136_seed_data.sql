-- +goose Up
INSERT    INTO regions (NAME)
VALUES    ('Moscow'),
          ('Saint Petersburg'),
          ('Novosibirsk'),
          ('Yekaterinburg'),
          ('Kazan'),
          ('Nizhny Novgorod'),
          ('Krasnodar');

INSERT    INTO industries (NAME)
VALUES    ('Information Technology'),
          ('Finance & Banking'),
          ('Education'),
          ('Healthcare'),
          ('Retail'),
          ('Manufacturing'),
          ('Marketing & Advertising'),
          ('Consulting'),
          ('Construction'),
          ('Transportation & Logistics');

INSERT    INTO users (
          first_name,
          last_name,
          summary,
          region_id,
          industry_id
          )
VALUES    (
          'Alice',
          'Johnson',
          'Full-stack developer with 5 years of experience in Go and React.',
          (
          SELECT    id
          FROM      regions
          WHERE     NAME = 'Moscow'
          ),
          (
          SELECT    id
          FROM      industries
          WHERE     NAME = 'Information Technology'
          )
          ),
          (
          'Bob',
          'Williams',
          'Financial analyst specializing in risk assessment and portfolio management.',
          (
          SELECT    id
          FROM      regions
          WHERE     NAME = 'Saint Petersburg'
          ),
          (
          SELECT    id
          FROM      industries
          WHERE     NAME = 'Finance & Banking'
          )
          ),
          (
          'Clara',
          'Davis',
          'University professor and researcher in applied mathematics.',
          (
          SELECT    id
          FROM      regions
          WHERE     NAME = 'Novosibirsk'
          ),
          (
          SELECT    id
          FROM      industries
          WHERE     NAME = 'Education'
          )
          );

INSERT    INTO positions (
          user_id,
          job_title,
          organization,
          start_date,
          end_date,
          is_current
          )
VALUES    (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'Senior Backend Engineer',
          'TechCorp LLC',
          '2021-03-01',
          NULL,
          TRUE
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'Junior Developer',
          'StartupXYZ',
          '2019-06-01',
          '2021-02-28',
          FALSE
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'Lead Financial Analyst',
          'Global Bank',
          '2018-09-01',
          NULL,
          TRUE
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'Associate Professor',
          'State University',
          '2015-09-01',
          NULL,
          TRUE
          );

INSERT    INTO education (user_id, school_name, start_date, end_date)
VALUES    (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'Moscow State Technical University',
          '2015-09-01',
          '2019-06-30'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'Saint Petersburg State University of Economics',
          '2012-09-01',
          '2016-06-30'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'Novosibirsk State University',
          '2005-09-01',
          '2010-06-30'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'Novosibirsk State University (PhD)',
          '2010-09-01',
          '2014-12-31'
          );

INSERT    INTO contacts (
          user_id,
          TYPE     ,
          url
          )
VALUES    (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'github',
          'https://github.com/alicejohnson'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'linkedin',
          'https://linkedin.com/in/alicejohnson'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'email',
          'alice.johnson@example.com'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'linkedin',
          'https://linkedin.com/in/bobwilliams'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'email',
          'bob.williams@example.com'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'email',
          'clara.davis@university.edu'
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'blog',
          'https://clara-davis.medium.com'
          );

INSERT    INTO skills (user_id, NAME, category, sort_order)
VALUES    (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'Go',
          'Backend',
          1
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'PostgreSQL',
          'Database',
          2
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'React',
          'Frontend',
          3
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Alice' AND      
                    last_name = 'Johnson'
          ),
          'Docker',
          'DevOps',
          4
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'Excel',
          'Analytics',
          1
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'Python',
          'Analytics',
          2
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Bob' AND      
                    last_name = 'Williams'
          ),
          'SQL',
          'Database',
          3
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'MATLAB',
          'Research',
          1
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'LaTeX',
          'Research',
          2
          ),
          (
          (
          SELECT    id
          FROM      users
          WHERE     first_name = 'Clara' AND      
                    last_name = 'Davis'
          ),
          'Python',
          'Analytics',
          3
          );

-- +goose Down
DELETE    FROM skills;

DELETE    FROM contacts;

DELETE    FROM education;

DELETE    FROM positions;

DELETE    FROM users;

DELETE    FROM industries;

DELETE    FROM regions;
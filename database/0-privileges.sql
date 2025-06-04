CREATE SCHEMA smartform;

GRANT CONNECT ON DATABASE smartalh_smartform_dev TO smartalh_smartforms_app_dev;
GRANT USAGE, CREATE ON SCHEMA smartform TO smartalh_smartforms_app_dev;

GRANT SELECT, INSERT, UPDATE, DELETE 
  ON ALL TABLES IN SCHEMA smartform 
  TO smartalh_smartforms_app_dev;




/*
CREATE TABLE smartform.test_table (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ    DEFAULT now()
);

INSERT INTO smartform.test_table (username, email)
VALUES
  ('alice',   'alice@example.com'),
  ('bob',     'bob@example.com'),
  ('charlie', 'charlie@example.com');
*/

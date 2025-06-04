/*
 DataTypes https://www.postgresql.org/docs/current/datatype.html

DROP DATABASE IF EXISTS smartformsdb;
CREATE DATABASE smartformsdb;
DROP SCHEMA IF EXISTS smartformsschema
CREATE SCHEMA smartformsschema;
DROP USER IF EXISTS smartuser;
CREATE USER smartuser WITH PASSWORD 'Vr$martFyi';
GRANT ALL PRIVILEGES ON DATABASE smartformsdb TO smartuser;
GRANT ALL PRIVILEGES ON SCHEMA smartformsschema TO smartuser;
*/
USE SCHEMA smartformsschema;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT ,
  email TEXT NOT NULL UNIQUE,
  status boolean DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (email) VALUES
('krishna@smartforms.fyi'),
('anil@smartforms.fyi');


DROP TABLE IF EXISTS user_history;
CREATE TABLE user_history (
    id SERIAL PRIMARY KEY,
    email text NOT NULL, 
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_forms;
CREATE TABLE user_forms (
    id SERIAL PRIMARY KEY,
    email text NOT NULL,
    status boolean DEFAULT true,
    page_id text NOT NULL,
    page_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
INSERT INTO user_forms (email, page_id, page_content) VALUES
('krishna@smartforms.fyi', '1234', '{"data":"<P>Hello, SmartForm For Your Information</P>"}'::jsonb)

DROP TABLE IF EXISTS user_form_history;
CREATE TABLE user_form_history(
    id SERIAL PRIMARY KEY,
    email text NOT NULL,
    status boolean DEFAULT true,
    page_id text NOT NULL,
    page_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

DROP TABLE IF EXISTS user_form_data; 
CREATE TABLE user_form_data (
  id SERIAL PRIMARY KEY,
  email text NOT NULL,
  status boolean DEFAULT true,
  page_id text NOT NULL,
  page_content JSONB NOT NULL,
  page_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



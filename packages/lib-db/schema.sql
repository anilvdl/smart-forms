CREATE SCHEMA smartform;

GRANT CONNECT ON DATABASE smartalh_smartform_dev TO smartalh_smartforms_app_dev;
GRANT USAGE, CREATE ON SCHEMA smartform TO smartalh_smartforms_app_dev;

GRANT SELECT, INSERT, UPDATE, DELETE 
  ON ALL TABLES IN SCHEMA smartform 
  TO smartalh_smartforms_app_dev;

CREATE TABLE IF NOT EXISTS sf_users (
  id UUID PRIMARY KEY,
  contact TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified TIMESTAMPTZ,
  image TEXT,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sf_sessions (
  session_token TEXT PRIMARY KEY,
  user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sf_accounts (
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sf_verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT PRIMARY KEY,
  expires TIMESTAMPTZ NOT NULL,
  CONSTRAINT sf_verification_tokens_unique UNIQUE (identifier, token)
);

CREATE TABLE IF NOT EXISTS sf_forms (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE smartform.sf_form_raw_data (
  id         BIGSERIAL      PRIMARY KEY,
  form_id    UUID           NOT NULL,
  user_id    UUID           NOT NULL,
  title      TEXT           NOT NULL,
  raw_json   JSONB          NOT NULL,
  version    INT            NOT NULL,
  status     TEXT           NOT NULL CHECK (status IN ('WIP','PUBLISH')),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  UNIQUE(form_id, version)
);

ALTER TABLE smartform.sf_form_raw_data
  ADD CONSTRAINT fk_form_user
    FOREIGN KEY (user_id)
    REFERENCES smartform.sf_users(id)
    ON DELETE CASCADE;

ALTER TABLE sf_form_raw_data
ADD COLUMN thumbnail TEXT NULL;

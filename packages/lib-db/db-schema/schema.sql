-- lib-db/schema.sql

-- =====================================
-- A) Existing NextAuth / Forms tables (unchanged)
-- =====================================

-- 1) Ensure schema exists
CREATE SCHEMA IF NOT EXISTS smartform;

-- 2) Existing GRANTS (as before)
GRANT CONNECT ON DATABASE smartalh_smartform_dev TO smartalh_smartforms_app_dev;
GRANT USAGE, CREATE ON SCHEMA smartform TO smartalh_smartforms_app_dev;

GRANT SELECT, INSERT, UPDATE, DELETE 
  ON ALL TABLES IN SCHEMA smartform 
  TO smartalh_smartforms_app_dev;

-- -----------------------------------------------------
-- 3) Existing NextAuth / User Tables
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_users (
  id UUID PRIMARY KEY,
  contact TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified TIMESTAMPTZ,
  image TEXT,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_users TO smartalh_smartforms_app_dev;

CREATE TABLE IF NOT EXISTS smartform.sf_sessions (
  session_token TEXT PRIMARY KEY,
  user_id UUID REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_sessions TO smartalh_smartforms_app_dev;

CREATE TABLE IF NOT EXISTS smartform.sf_accounts (
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  user_id UUID REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_accounts TO smartalh_smartforms_app_dev;

CREATE TABLE IF NOT EXISTS smartform.sf_verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT PRIMARY KEY,
  expires TIMESTAMPTZ NOT NULL,
  CONSTRAINT sf_verification_tokens_unique UNIQUE (identifier, token)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_verification_tokens TO smartalh_smartforms_app_dev;

-- -----------------------------------------------------
-- 4) Existing Forms Tables
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_forms (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_forms TO smartalh_smartforms_app_dev;

CREATE TABLE IF NOT EXISTS smartform.sf_form_raw_data (
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
ALTER TABLE smartform.sf_form_raw_data
  ADD COLUMN IF NOT EXISTS thumbnail TEXT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_form_raw_data TO smartalh_smartforms_app_dev;

-- Grant usage on the sequence backing sf_form_raw_data.id
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA smartform TO smartalh_smartforms_app_dev;


-- =====================================
-- B) New “Phase 1” Tenant & Admin Tables (prefixed with sf_)
-- =====================================

-- 1) sf_org_accounts (formerly “org_accounts”)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_org_accounts (
  id UUID PRIMARY KEY ,
  name VARCHAR NOT NULL,

  -- Billing Address Fields
  billing_address_line1 VARCHAR NULL,
  billing_address_line2 VARCHAR NULL,
  billing_city VARCHAR NULL,
  billing_state VARCHAR NULL,
  billing_postal_code VARCHAR NULL,
  billing_country VARCHAR NULL,

  preferred_currency VARCHAR NOT NULL DEFAULT 'USD',
  tax_id VARCHAR NULL,
  invoice_footer TEXT NULL,
  bank_details JSONB NULL,
  invoice_retention_years INT NOT NULL DEFAULT 7,

  -- Billing Integration Fields
  provider VARCHAR NULL,                 -- e.g. 'stripe', 'paypal', 'razorpay'
  subscription_id VARCHAR NULL,
  billing_customer_id VARCHAR NULL,      -- e.g. Stripe Customer ID
  billing_plan VARCHAR NOT NULL,
  billing_status VARCHAR NOT NULL
    CHECK (billing_status IN ('ACTIVE','PAST_DUE','CANCELED'))
    DEFAULT 'ACTIVE',
  next_billing_date TIMESTAMP NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_org_accounts TO smartalh_smartforms_app_dev;

-- 2) sf_user_orgs (join table for users ↔ org_accounts)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_user_orgs (
  user_id UUID NOT NULL REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  org_id  UUID NOT NULL REFERENCES smartform.sf_org_accounts(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL
    CHECK (role IN ('OWNER','ADMIN','DEVELOPER','VIEWER')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, org_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_user_orgs TO smartalh_smartforms_app_dev;

-- 3) sf_invites (for inviting users to an organization)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_invites (
  id UUID PRIMARY KEY ,
  invited_email VARCHAR NOT NULL,
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id),
  invited_by UUID NOT NULL REFERENCES smartform.sf_users(id),
  role_requested VARCHAR NOT NULL
    CHECK (role_requested IN ('ADMIN','DEVELOPER','VIEWER')),
  token VARCHAR UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_invites TO smartalh_smartforms_app_dev;

-- 4) sf_audit_logs (tenant-scoped activity history)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_audit_logs (
  id UUID PRIMARY KEY ,
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id),
  user_id UUID NULL REFERENCES smartform.sf_users(id),
  event_type VARCHAR NOT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_audit_logs TO smartalh_smartforms_app_dev;

-- 5) sf_feature_flags (global feature toggles)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_feature_flags (
  id UUID PRIMARY KEY ,
  flag_key VARCHAR UNIQUE NOT NULL,
  description TEXT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  min_plan_required VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_feature_flags TO smartalh_smartforms_app_dev;

-- 6) sf_distribution_groups (email recipient groups)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_distribution_groups (
  id UUID PRIMARY KEY ,
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_distribution_groups TO smartalh_smartforms_app_dev;

-- 7) sf_distribution_group_members (emails in each group)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_distribution_group_members (
  group_id UUID NOT NULL
    REFERENCES smartform.sf_distribution_groups(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  PRIMARY KEY (group_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_distribution_group_members TO smartalh_smartforms_app_dev;

-- 8) Extend sf_forms (Follow-Up / Email columns)
--    (We add only if missing; do not drop existing data.)
-- -----------------------------------------------------
ALTER TABLE smartform.sf_forms
  ADD COLUMN IF NOT EXISTS followup_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS followup_distribution_group_id UUID NULL
    REFERENCES smartform.sf_distribution_groups(id),
  ADD COLUMN IF NOT EXISTS followup_ad_hoc_emails JSONB NULL,
  ADD COLUMN IF NOT EXISTS followup_cadence_days INT NULL,
  ADD COLUMN IF NOT EXISTS followup_skip_weekends BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS send_final_reminder BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS template_subject TEXT NULL,
  ADD COLUMN IF NOT EXISTS template_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_forms TO smartalh_smartforms_app_dev;

-- 9) sf_form_views (track form page loads)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_form_views (
  id UUID PRIMARY KEY ,
  form_id UUID NOT NULL REFERENCES smartform.sf_forms(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  visitor_id VARCHAR NULL,
  ip_address VARCHAR NULL
);
CREATE INDEX IF NOT EXISTS idx_sf_form_views_form_id_viewed_at
  ON smartform.sf_form_views(form_id, viewed_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_form_views TO smartalh_smartforms_app_dev;

-- 10) sf_ownership_transfers (to migrate ownership later)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_ownership_transfers (
  id UUID PRIMARY KEY ,
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id),
  old_owner_id UUID NOT NULL REFERENCES smartform.sf_users(id),
  new_owner_id UUID NOT NULL REFERENCES smartform.sf_users(id),
  initiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_at TIMESTAMP NOT NULL,
  status VARCHAR NOT NULL
    CHECK (status IN ('PENDING','CONFIRMED','EXPIRED','COMPLETED'))
    DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_ownership_transfers TO smartalh_smartforms_app_dev;

-- 11) sf_invoices (live invoices)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_invoices (
  id UUID PRIMARY KEY ,
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id),
  provider VARCHAR NOT NULL,                 -- e.g. 'stripe','paypal','razorpay'
  provider_invoice_id VARCHAR NOT NULL,
  original_amount INT NOT NULL,              -- in smallest currency unit
  original_currency VARCHAR NOT NULL,        -- e.g. 'USD','INR'
  converted_amount INT NOT NULL,
  converted_currency VARCHAR NOT NULL,
  exchange_rate_to_preferred NUMERIC NOT NULL,
  status VARCHAR NOT NULL
    CHECK (status IN ('PAID','OPEN','PAST_DUE','VOIDED')),
  invoice_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NULL,
  pdf_blob BYTEA NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sf_invoices_org_id_status_date
  ON smartform.sf_invoices(org_id, status, invoice_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_invoices TO smartalh_smartforms_app_dev;

-- 12) sf_invoices_archive (archived invoices)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_invoices_archive (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  provider VARCHAR NOT NULL,
  provider_invoice_id VARCHAR NOT NULL,
  original_amount INT NOT NULL,
  original_currency VARCHAR NOT NULL,
  converted_amount INT NOT NULL,
  converted_currency VARCHAR NOT NULL,
  exchange_rate_to_preferred NUMERIC NOT NULL,
  status VARCHAR NOT NULL,
  invoice_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NULL,
  pdf_blob BYTEA NULL,
  archived_at TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, DELETE ON smartform.sf_invoices_archive TO smartalh_smartforms_app_dev;

-- (No new sequence to grant: all new tables use UUID defaults.)
-- The only sequence is for sf_form_raw_data.id, which we already granted above.

-- ----------------------------------------------------------------------------
-- Table: smartform.sf_holidays
--
-- Purpose:
--   Stores cached public‐holiday lists per country and year.
--   Each row contains a JSONB array of normalized HolidayRecord objects.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS smartform.sf_holidays (
  country_code   VARCHAR(2)   NOT NULL,       -- ISO 3166-1 alpha-2 code, e.g. 'IN', 'US'
  year           INT          NOT NULL,       -- e.g. 2025
  data           JSONB        NOT NULL,       -- Array of normalized holiday records
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (country_code, year)
);

-- Grant permissions on the new table to the application role
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_holidays
  TO smartalh_smartforms_app_dev;


CREATE TABLE smartform.sf_email_queue (
  id          BIGSERIAL PRIMARY KEY,
  form_id     UUID       NOT NULL,
  to_email    TEXT       NOT NULL,
  subject     TEXT       NOT NULL,
  body        TEXT       NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at     TIMESTAMPTZ NULL,
  failed_at   TIMESTAMPTZ NULL,
  error       TEXT       NULL
);

-- Grant permissions on the new table to the application role
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_email_queue
  TO smartalh_smartforms_app_dev;


CREATE TABLE smartform.sf_followup_settings (
  form_id             UUID        PRIMARY KEY REFERENCES smartform.sf_form_raw_data(form_id),
  enabled             BOOLEAN     NOT NULL DEFAULT FALSE,
  distribution_group_id UUID      NULL REFERENCES smartform.sf_distribution_groups(id),
  ad_hoc_emails       JSONB       NULL,           -- [ "a@x.com", … ]
  interval_days       INT         NULL,
  skip_weekends       BOOLEAN     NOT NULL DEFAULT FALSE,
  send_final_reminder BOOLEAN     NOT NULL DEFAULT FALSE,
  template_subject    TEXT        NULL,
  template_body       TEXT        NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant permissions on the new table to the application role
GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_followup_settings
  TO smartalh_smartforms_app_dev;

-- ----------------------------------------------------------------------------
-- Table: smartform.sf_payments
-- Purpose:
--   Record every payment/charge attempt for auditing & reconciliation.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smartform.sf_payments (
  id                  UUID        PRIMARY KEY,
  org_id              UUID        NOT NULL 
                         REFERENCES smartform.sf_org_accounts(id),
  invoice_id          UUID        NULL 
                         REFERENCES smartform.sf_invoices(id),
  provider            VARCHAR     NOT NULL,    -- 'stripe','paypal','razorpay', etc.
  provider_charge_id  VARCHAR     NOT NULL,
  amount              INT         NOT NULL,    -- in smallest currency unit
  currency            VARCHAR     NOT NULL,    -- e.g. 'USD','INR'
  status              VARCHAR     NOT NULL 
                         CHECK (status IN ('SUCCEEDED','FAILED','PENDING')),
  failure_code        VARCHAR     NULL,        -- from provider
  failure_message     TEXT        NULL,        -- human-readable
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE 
  ON smartform.sf_payments 
  TO smartalh_smartforms_app_dev;

CREATE TABLE sf_user_preferences (
  user_id       UUID PRIMARY KEY REFERENCES sf_users(id),
  default_org_id UUID REFERENCES sf_user_orgs(org_id),
  timezone      TEXT,
  locale        TEXT,
  settings      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_prefs_default_org ON sf_user_preferences(default_org_id);

GRANT SELECT, INSERT, UPDATE, DELETE 
  ON smartform.sf_user_preferences 
  TO smartalh_smartforms_app_dev;

-- User credentials table for password storage
CREATE TABLE IF NOT EXISTS smartform.sf_user_credentials (
  user_id UUID PRIMARY KEY REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_user_credentials TO smartalh_smartforms_app_dev;


-- =====================================
-- Template and Favorites Schema Updates
-- =====================================

-- 1) Update billing_plan enum to include PENDING and PAYU variants
-- Note: You mentioned you already removed the constraint, so this is just for reference
-- billing_plan options: "FREE" | "PRO" | "ENTERPRISE" | "PENDING" | "STARTER" | "PRO-PAYU" | "STARTER-PAYU" | "ENTERPRISE-PAYU"

-- 2) Global Form Templates Table
CREATE TABLE IF NOT EXISTS smartform.sf_form_templates (
  id UUID PRIMARY KEY ,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'personal_events', 'business', 'surveys', etc.
  sub_category VARCHAR(100), -- 'birthday', 'get_together', 'house_warming', etc.
  raw_json JSONB NOT NULL,
  thumbnail TEXT, -- Base64 SVG thumbnail
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  tags TEXT[], -- Array of searchable tags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON smartform.sf_form_templates(category);
CREATE INDEX idx_templates_active ON smartform.sf_form_templates(is_active);
CREATE INDEX idx_templates_tags ON smartform.sf_form_templates USING GIN(tags);

GRANT SELECT ON smartform.sf_form_templates TO smartalh_smartforms_app_dev;

-- 3) User Favorite Templates
CREATE TABLE IF NOT EXISTS smartform.sf_user_favorite_templates (
  user_id UUID NOT NULL REFERENCES smartform.sf_users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES smartform.sf_form_templates(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, template_id)
);

CREATE INDEX idx_user_favorites ON smartform.sf_user_favorite_templates(user_id);

GRANT SELECT, INSERT, DELETE ON smartform.sf_user_favorite_templates TO smartalh_smartforms_app_dev;

-- 4) Organization Recommended Templates (for future use)
CREATE TABLE IF NOT EXISTS smartform.sf_org_recommended_templates (
  org_id UUID NOT NULL REFERENCES smartform.sf_org_accounts(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES smartform.sf_form_templates(id) ON DELETE CASCADE,
  recommended_by UUID REFERENCES smartform.sf_users(id),
  recommended_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, template_id)
);

GRANT SELECT, INSERT, DELETE ON smartform.sf_org_recommended_templates TO smartalh_smartforms_app_dev;

-- 5) Template Usage Analytics (track popularity)
CREATE TABLE IF NOT EXISTS smartform.sf_template_usage (
  id UUID PRIMARY KEY ,
  template_id UUID NOT NULL REFERENCES smartform.sf_form_templates(id),
  user_id UUID NOT NULL REFERENCES smartform.sf_users(id),
  org_id UUID REFERENCES smartform.sf_org_accounts(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_usage_template ON smartform.sf_template_usage(template_id);
CREATE INDEX idx_template_usage_date ON smartform.sf_template_usage(used_at);

GRANT SELECT, INSERT ON smartform.sf_template_usage TO smartalh_smartforms_app_dev;

-- -- 6) Seed initial templates (to be run once)
-- INSERT INTO smartform.sf_form_templates (title, description, category, sub_category, raw_json, tags, display_order) VALUES
-- -- RSVP Template
-- ('RSVP Form', 'Simple RSVP form for any event', 'personal_events', 'rsvp', 
-- '{"title":"RSVP","logo":{"placeholder":""},"elements":[{"id":"name","type":"text","label":"Your Name","required":true,"placeholder":"Enter your full name"},{"id":"email","type":"email","label":"Email Address","required":true,"placeholder":"your@email.com"},{"id":"attending","type":"radio","label":"Will you be attending?","required":true,"options":["Yes, I will attend","No, I cannot attend"]},{"id":"guests","type":"number","label":"Number of guests (including yourself)","required":true,"min":1,"max":10,"showIf":{"field":"attending","value":"Yes, I will attend"}},{"id":"dietary","type":"checkbox","label":"Dietary Requirements","options":["Vegetarian","Vegan","Gluten Free","Nut Allergy","Other"]},{"id":"special_requests","type":"textarea","label":"Special Requests or Comments","placeholder":"Let us know if you have any special requirements...","rows":4}],"settings":{"submitButton":"Submit RSVP","successMessage":"Thank you for your RSVP! We look forward to seeing you."}}'::jsonb,
-- ARRAY['rsvp', 'event', 'attendance', 'quick'], 1),

-- -- Birthday Party Invite
-- ('Birthday Party Invitation', 'Fun birthday party invitation with RSVP', 'personal_events', 'birthday', 
-- '{"title":"You''re Invited to a Birthday Party!","logo":{"placeholder":"🎉"},"elements":[{"id":"child_name","type":"text","label":"Child''s Name","required":true,"placeholder":"Enter child''s name"},{"id":"parent_name","type":"text","label":"Parent/Guardian Name","required":true,"placeholder":"Enter your name"},{"id":"email","type":"email","label":"Email Address","required":true,"placeholder":"your@email.com"},{"id":"phone","type":"tel","label":"Phone Number","required":true,"placeholder":"(555) 123-4567"},{"id":"attending","type":"radio","label":"Will you be attending?","required":true,"options":["Yes, we''ll be there!","Sorry, we can''t make it"]},{"id":"num_attending","type":"number","label":"Number attending (adults + children)","required":true,"min":1,"max":10,"showIf":{"field":"attending","value":"Yes, we''ll be there!"}},{"id":"allergies","type":"textarea","label":"Food Allergies or Dietary Restrictions","placeholder":"Please list any allergies...","rows":3},{"id":"message","type":"textarea","label":"Birthday Message (optional)","placeholder":"Write a special message for the birthday child!","rows":4}],"settings":{"submitButton":"Send RSVP","successMessage":"Thank you! We can''t wait to celebrate with you!","theme":"festive"}}'::jsonb,
-- ARRAY['birthday', 'party', 'invitation', 'kids', 'celebration'], 2),

-- -- Get-together Party
-- ('Get-Together Invitation', 'Casual get-together or reunion invitation', 'personal_events', 'get_together',
-- '{"title":"You''re Invited to Our Get-Together!","logo":{"placeholder":"🏠"},"elements":[{"id":"name","type":"text","label":"Your Name","required":true,"placeholder":"Enter your name"},{"id":"email","type":"email","label":"Email Address","required":true,"placeholder":"your@email.com"},{"id":"phone","type":"tel","label":"Phone Number","placeholder":"(555) 123-4567"},{"id":"attending","type":"radio","label":"Can you make it?","required":true,"options":["Yes, count me in!","Maybe, I''ll try","Sorry, can''t make it"]},{"id":"bringing","type":"checkbox","label":"What will you bring?","options":["Appetizers","Main Dish","Dessert","Drinks","Nothing, just myself!"],"showIf":{"field":"attending","value":"Yes, count me in!"}},{"id":"plus_ones","type":"number","label":"How many people are you bringing (including yourself)?","min":1,"max":5,"showIf":{"field":"attending","value":"Yes, count me in!"}},{"id":"notes","type":"textarea","label":"Any notes or questions?","placeholder":"Let us know...","rows":3}],"settings":{"submitButton":"Submit Response","successMessage":"Great! Thanks for letting us know. See you there!"}}'::jsonb,
-- ARRAY['party', 'get-together', 'reunion', 'casual', 'social'], 3),

-- -- House Warming
-- ('House Warming Invitation', 'Welcome friends to your new home', 'personal_events', 'house_warming',
-- '{"title":"House Warming Party","logo":{"placeholder":"🏡"},"elements":[{"id":"name","type":"text","label":"Your Name","required":true,"placeholder":"Enter your name"},{"id":"email","type":"email","label":"Email Address","required":true,"placeholder":"your@email.com"},{"id":"phone","type":"tel","label":"Phone Number","placeholder":"(555) 123-4567"},{"id":"attending","type":"radio","label":"Will you be joining us?","required":true,"options":["Yes, wouldn''t miss it!","Unfortunately, I can''t make it"]},{"id":"guests","type":"number","label":"Total number of guests","min":1,"max":6,"showIf":{"field":"attending","value":"Yes, wouldn''t miss it!"}},{"id":"gift_registry","type":"radio","label":"Would you like gift registry information?","options":["Yes, please","No, thank you"]},{"id":"parking","type":"radio","label":"Will you need parking?","options":["Yes","No"],"showIf":{"field":"attending","value":"Yes, wouldn''t miss it!"}},{"id":"message","type":"textarea","label":"Leave a message (optional)","placeholder":"Any questions or warm wishes...","rows":3}],"settings":{"submitButton":"Send RSVP","successMessage":"Thank you! We look forward to celebrating our new home with you!"}}'::jsonb,
-- ARRAY['house-warming', 'new-home', 'party', 'invitation'], 4),

-- -- Event Registration
-- ('Event Registration', 'Professional event registration form', 'business', 'event_registration',
-- '{"title":"Event Registration","logo":{"placeholder":"📅"},"elements":[{"id":"first_name","type":"text","label":"First Name","required":true,"placeholder":"John"},{"id":"last_name","type":"text","label":"Last Name","required":true,"placeholder":"Doe"},{"id":"email","type":"email","label":"Email Address","required":true,"placeholder":"john.doe@company.com"},{"id":"phone","type":"tel","label":"Phone Number","required":true,"placeholder":"(555) 123-4567"},{"id":"company","type":"text","label":"Company/Organization","required":true,"placeholder":"ABC Corporation"},{"id":"job_title","type":"text","label":"Job Title","placeholder":"Senior Manager"},{"id":"attendance_type","type":"radio","label":"Attendance Type","required":true,"options":["In-Person","Virtual","Hybrid"]},{"id":"sessions","type":"checkbox","label":"Which sessions will you attend?","options":["Opening Keynote","Workshop A","Workshop B","Networking Lunch","Closing Ceremony"]},{"id":"dietary","type":"select","label":"Dietary Requirements","options":["None","Vegetarian","Vegan","Gluten-Free","Halal","Kosher","Other"]},{"id":"accessibility","type":"textarea","label":"Accessibility Requirements","placeholder":"Please let us know if you have any accessibility needs...","rows":3}],"settings":{"submitButton":"Register Now","successMessage":"Registration successful! Check your email for confirmation and event details."}}'::jsonb,
-- ARRAY['event', 'registration', 'conference', 'business', 'professional'], 5),

-- -- Survey Template
-- ('Customer Feedback Survey', 'Gather valuable customer feedback', 'business', 'survey',
-- '{"title":"Customer Feedback Survey","logo":{"placeholder":"📊"},"elements":[{"id":"satisfaction","type":"radio","label":"How satisfied are you with our service?","required":true,"options":["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"]},{"id":"recommendation","type":"radio","label":"How likely are you to recommend us to others?","required":true,"options":["0 - Not at all likely","1","2","3","4","5 - Neutral","6","7","8","9","10 - Extremely likely"]},{"id":"improvements","type":"checkbox","label":"What areas could we improve?","options":["Customer Service","Product Quality","Pricing","Delivery Time","Website Experience","Other"]},{"id":"best_feature","type":"textarea","label":"What do you like most about our service?","placeholder":"Tell us what we''re doing well...","rows":3},{"id":"suggestions","type":"textarea","label":"Any suggestions for improvement?","placeholder":"We value your feedback...","rows":4},{"id":"contact_me","type":"radio","label":"May we contact you about your feedback?","options":["Yes","No"]},{"id":"email","type":"email","label":"Email Address","placeholder":"your@email.com","showIf":{"field":"contact_me","value":"Yes"}}],"settings":{"submitButton":"Submit Survey","successMessage":"Thank you for your feedback! Your input helps us improve our service."}}'::jsonb,
-- ARRAY['survey', 'feedback', 'customer', 'satisfaction', 'business'], 6);

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA smartform TO smartalh_smartforms_app_dev;
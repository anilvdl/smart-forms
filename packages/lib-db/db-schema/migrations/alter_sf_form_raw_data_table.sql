-- Migration: Add columns for My Forms functionality

-- Add source template tracking
ALTER TABLE smartform.sf_form_raw_data 
  ADD COLUMN IF NOT EXISTS source_template_id UUID NULL;

-- Add short URL code for sharing
ALTER TABLE smartform.sf_form_raw_data 
  ADD COLUMN IF NOT EXISTS short_code VARCHAR(10) UNIQUE NULL;

-- Add public/private access control
ALTER TABLE smartform.sf_form_raw_data 
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- Add organization ownership
ALTER TABLE smartform.sf_form_raw_data 
  ADD COLUMN IF NOT EXISTS org_id UUID NULL 
  REFERENCES smartform.sf_org_accounts(id) ON DELETE CASCADE;

-- Add soft delete support
ALTER TABLE smartform.sf_form_raw_data 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_raw_data_short_code 
  ON smartform.sf_form_raw_data(short_code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_form_raw_data_org_id 
  ON smartform.sf_form_raw_data(org_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_form_raw_data_user_status 
  ON smartform.sf_form_raw_data(user_id, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_form_raw_data_source_template 
  ON smartform.sf_form_raw_data(source_template_id) 
  WHERE deleted_at IS NULL;

-- Create a function to generate unique short codes
CREATE OR REPLACE FUNCTION generate_unique_short_code() 
RETURNS VARCHAR(10) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result VARCHAR(10);
  i INTEGER;
BEGIN
  LOOP
    result := '';
    -- Generate 8 character code
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if it's unique
    IF NOT EXISTS (SELECT 1 FROM smartform.sf_form_raw_data WHERE short_code = result) THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON smartform.sf_form_raw_data 
  TO smartalh_smartforms_app_dev;
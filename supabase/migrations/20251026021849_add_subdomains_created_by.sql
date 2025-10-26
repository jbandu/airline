-- Add created_by column to subdomains table for tracking subdomain creators
-- This brings subdomains table in line with workflows table which already has created_by

-- Add created_by column to subdomains table
ALTER TABLE subdomains
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN subdomains.created_by IS 'User who created this subdomain';

-- Create index for better query performance when filtering by creator
CREATE INDEX IF NOT EXISTS idx_subdomains_created_by ON subdomains(created_by);

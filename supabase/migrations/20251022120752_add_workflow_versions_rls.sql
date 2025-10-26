/*
  # Add RLS Policies for workflow_versions Table

  1. Security
    - Enable RLS on workflow_versions table
    - Add SELECT policy for authenticated users
    - Add INSERT policy for authenticated users
    - Add UPDATE policy for authenticated users
    - Add DELETE policy for authenticated users

  ## Notes
  - All authenticated users can perform CRUD operations on workflow versions
  - This matches the access pattern for workflows table
*/

-- Enable RLS
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_versions
CREATE POLICY "Authenticated users can view workflow versions"
  ON workflow_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflow versions"
  ON workflow_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflow versions"
  ON workflow_versions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflow versions"
  ON workflow_versions FOR DELETE
  TO authenticated
  USING (true);

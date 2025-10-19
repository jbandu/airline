/*
  # Add Workflow Versioning and Soft Delete

  ## Changes
  
  1. **Workflows Table Updates**
     - Add `archived_at` (timestamptz) - Timestamp when workflow was soft deleted
     - Add `parent_workflow_id` (uuid) - Reference to original workflow for clones
     - Add index on `archived_at` for filtering active workflows
     - Add index on `parent_workflow_id` for version tracking

  ## Important Notes
  - Soft delete preserves data for audit trails
  - Version tracking allows workflow cloning and history
  - Queries should filter WHERE archived_at IS NULL for active workflows
*/

-- Add soft delete and versioning columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE workflows ADD COLUMN archived_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'parent_workflow_id'
  ) THEN
    ALTER TABLE workflows ADD COLUMN parent_workflow_id uuid REFERENCES workflows(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_archived ON workflows(archived_at);
CREATE INDEX IF NOT EXISTS idx_workflows_parent ON workflows(parent_workflow_id);
/*
  # AirFlow Database Schema - Airline Workflow Management System

  ## Overview
  This migration creates the complete database schema for AirFlow, an airline workflow 
  management application that tracks automation opportunities, implementation planning, 
  and stakeholder collaboration.

  ## Tables Created

  1. **domains**
     - `id` (uuid, primary key) - Unique domain identifier
     - `name` (text) - Domain name (e.g., "Flight Operations")
     - `description` (text) - Domain description
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  2. **subdomains**
     - `id` (uuid, primary key) - Unique subdomain identifier
     - `domain_id` (uuid, foreign key) - Parent domain reference
     - `name` (text) - Subdomain name
     - `description` (text) - Subdomain description
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  3. **workflows**
     - `id` (uuid, primary key) - Unique workflow identifier
     - `name` (text) - Workflow name
     - `description` (text) - Detailed description
     - `domain_id` (uuid, foreign key) - Associated domain
     - `subdomain_id` (uuid, foreign key) - Associated subdomain
     - `complexity` (int) - Complexity score (1-5)
     - `agentic_potential` (int) - Automation potential score (1-5)
     - `autonomy_level` (int) - Autonomy level (1-5)
     - `implementation_wave` (int) - Wave 1, 2, or 3
     - `status` (text) - Current status
     - `airline_type` (text[]) - Applicable airline types
     - `agentic_function_type` (text) - Type of AI function
     - `ai_enablers` (text[]) - AI technologies used
     - `systems_involved` (text[]) - Systems integration list
     - `business_context` (text) - Business justification
     - `expected_roi` (text) - Return on investment estimate
     - `dependencies` (text[]) - Workflow dependencies
     - `success_metrics` (jsonb) - Success metrics data
     - `version` (int) - Version number
     - `created_by` (uuid) - Creator user ID
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  4. **stakeholders**
     - `id` (uuid, primary key) - Unique stakeholder identifier
     - `name` (text) - Stakeholder name
     - `role` (text) - Stakeholder role
     - `email` (text) - Contact email
     - `department` (text) - Department name
     - `created_at` (timestamptz) - Record creation timestamp

  5. **workflow_stakeholders**
     - `id` (uuid, primary key) - Junction table identifier
     - `workflow_id` (uuid, foreign key) - Workflow reference
     - `stakeholder_id` (uuid, foreign key) - Stakeholder reference
     - `role_in_workflow` (text) - Specific role in this workflow
     - `created_at` (timestamptz) - Record creation timestamp

  6. **workflow_comments**
     - `id` (uuid, primary key) - Unique comment identifier
     - `workflow_id` (uuid, foreign key) - Associated workflow
     - `user_id` (uuid) - Comment author
     - `content` (text) - Comment text
     - `created_at` (timestamptz) - Comment timestamp

  7. **workflow_attachments**
     - `id` (uuid, primary key) - Unique attachment identifier
     - `workflow_id` (uuid, foreign key) - Associated workflow
     - `filename` (text) - Original filename
     - `file_url` (text) - Storage URL
     - `file_type` (text) - MIME type
     - `uploaded_by` (uuid) - Uploader user ID
     - `created_at` (timestamptz) - Upload timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict data access to authenticated users only
  - All tables have appropriate access controls

  ## Indexes
  - Foreign key indexes for optimal join performance
  - Status and wave indexes on workflows for filtering
  - Domain and subdomain indexes for quick lookups

  ## Important Notes
  - All IDs use UUID v4 for distributed system compatibility
  - Timestamps use timestamptz for timezone awareness
  - JSONB used for flexible success metrics storage
  - Array types used for multi-value fields
  - Cascading deletes configured for referential integrity
*/

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subdomains table
CREATE TABLE IF NOT EXISTS subdomains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  domain_id uuid REFERENCES domains(id) ON DELETE SET NULL,
  subdomain_id uuid REFERENCES subdomains(id) ON DELETE SET NULL,
  complexity int DEFAULT 3 CHECK (complexity >= 1 AND complexity <= 5),
  agentic_potential int DEFAULT 3 CHECK (agentic_potential >= 1 AND agentic_potential <= 5),
  autonomy_level int DEFAULT 3 CHECK (autonomy_level >= 1 AND autonomy_level <= 5),
  implementation_wave int DEFAULT 1 CHECK (implementation_wave >= 1 AND implementation_wave <= 3),
  status text DEFAULT 'draft',
  airline_type text[] DEFAULT '{}',
  agentic_function_type text DEFAULT '',
  ai_enablers text[] DEFAULT '{}',
  systems_involved text[] DEFAULT '{}',
  business_context text DEFAULT '',
  expected_roi text DEFAULT '',
  dependencies text[] DEFAULT '{}',
  success_metrics jsonb DEFAULT '[]'::jsonb,
  version int DEFAULT 1,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT '',
  email text DEFAULT '',
  department text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create workflow_stakeholders junction table
CREATE TABLE IF NOT EXISTS workflow_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  stakeholder_id uuid NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  role_in_workflow text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(workflow_id, stakeholder_id)
);

-- Create workflow_comments table
CREATE TABLE IF NOT EXISTS workflow_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workflow_attachments table
CREATE TABLE IF NOT EXISTS workflow_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT '',
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subdomains_domain_id ON subdomains(domain_id);
CREATE INDEX IF NOT EXISTS idx_workflows_domain_id ON workflows(domain_id);
CREATE INDEX IF NOT EXISTS idx_workflows_subdomain_id ON workflows(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_wave ON workflows(implementation_wave);
CREATE INDEX IF NOT EXISTS idx_workflow_stakeholders_workflow ON workflow_stakeholders(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stakeholders_stakeholder ON workflow_stakeholders(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_workflow_comments_workflow ON workflow_comments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_attachments_workflow ON workflow_attachments(workflow_id);

-- Enable Row Level Security
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for domains
CREATE POLICY "Authenticated users can view domains"
  ON domains FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete domains"
  ON domains FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for subdomains
CREATE POLICY "Authenticated users can view subdomains"
  ON subdomains FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert subdomains"
  ON subdomains FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subdomains"
  ON subdomains FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subdomains"
  ON subdomains FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for workflows
CREATE POLICY "Authenticated users can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for stakeholders
CREATE POLICY "Authenticated users can view stakeholders"
  ON stakeholders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stakeholders"
  ON stakeholders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stakeholders"
  ON stakeholders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stakeholders"
  ON stakeholders FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for workflow_stakeholders
CREATE POLICY "Authenticated users can view workflow_stakeholders"
  ON workflow_stakeholders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflow_stakeholders"
  ON workflow_stakeholders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflow_stakeholders"
  ON workflow_stakeholders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflow_stakeholders"
  ON workflow_stakeholders FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for workflow_comments
CREATE POLICY "Authenticated users can view workflow_comments"
  ON workflow_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflow_comments"
  ON workflow_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflow_comments"
  ON workflow_comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflow_comments"
  ON workflow_comments FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for workflow_attachments
CREATE POLICY "Authenticated users can view workflow_attachments"
  ON workflow_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflow_attachments"
  ON workflow_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflow_attachments"
  ON workflow_attachments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflow_attachments"
  ON workflow_attachments FOR DELETE
  TO authenticated
  USING (true);
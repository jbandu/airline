-- Migration: Add Data Entities and Mappings
-- Description: Create tables for airline operational data entities (PNR, E-TKT, FLIFO, etc.)
--              and their relationships with domains, workflows, and agents

-- =====================================================
-- 1. DATA ENTITIES TABLE
-- =====================================================
-- Core airline data objects (PNR, E-TKT, FLIFO, etc.)
CREATE TABLE IF NOT EXISTS data_entities (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- 'PNR', 'E_TKT', 'FLIFO', 'INVENTORY', etc.
  name TEXT NOT NULL,
  icon TEXT, -- Emoji icon: '📋', '🎫', '✈️', '💺', '🧳'
  description TEXT,
  schema_definition JSONB, -- Field definitions for this data entity
  volume_per_day BIGINT, -- Daily volume (e.g., 500000 for PNR)
  retention_years INTEGER, -- Data retention policy in years
  sensitivity TEXT CHECK (sensitivity IN ('PII', 'Confidential', 'Public', 'Internal')),
  storage_location TEXT, -- 'S3 Batch Raw', 'DynamoDB', 'Redshift'
  source_systems TEXT[], -- ['Amadeus Altea PSS', 'Sabre']
  data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_data_entities_code ON data_entities(code);
CREATE INDEX IF NOT EXISTS idx_data_entities_sensitivity ON data_entities(sensitivity);

-- =====================================================
-- 2. WORKFLOW-DATA MAPPINGS TABLE
-- =====================================================
-- Maps which workflows read/write which data entities
CREATE TABLE IF NOT EXISTS workflow_data_mappings (
  id BIGSERIAL PRIMARY KEY,
  workflow_id BIGINT REFERENCES workflows(id) ON DELETE CASCADE,
  data_entity_id BIGINT REFERENCES data_entities(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'read_write')),
  is_primary_data BOOLEAN DEFAULT false, -- Is this the primary data source for this workflow?
  volume_estimate TEXT CHECK (volume_estimate IN ('low', 'medium', 'high', 'very_high')),
  latency_requirement TEXT CHECK (latency_requirement IN ('real-time', 'near-real-time', 'batch', 'on-demand')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, data_entity_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_workflow_data_workflow ON workflow_data_mappings(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_data_entity ON workflow_data_mappings(data_entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_data_access_type ON workflow_data_mappings(access_type);

-- =====================================================
-- 3. AGENT-DATA MAPPINGS TABLE
-- =====================================================
-- Maps which agents consume which data entities
CREATE TABLE IF NOT EXISTS agent_data_mappings (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT REFERENCES agents(id) ON DELETE CASCADE,
  data_entity_id BIGINT REFERENCES data_entities(id) ON DELETE CASCADE,
  access_pattern TEXT CHECK (access_pattern IN ('batch', 'stream', 'on_demand', 'scheduled')),
  latency_requirement TEXT CHECK (latency_requirement IN ('real-time', 'near-real-time', 'batch')),
  query_frequency TEXT CHECK (query_frequency IN ('continuous', 'per_minute', 'per_hour', 'per_day')),
  is_critical BOOLEAN DEFAULT false, -- Is this data critical for agent operation?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, data_entity_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agent_data_agent ON agent_data_mappings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_data_entity ON agent_data_mappings(data_entity_id);
CREATE INDEX IF NOT EXISTS idx_agent_data_pattern ON agent_data_mappings(access_pattern);

-- =====================================================
-- 4. DATA ARCHITECTURE LAYERS TABLE
-- =====================================================
-- Represents the 4-tier data architecture (Source → ODS → Lake → Analytics)
CREATE TABLE IF NOT EXISTS data_layers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  layer_order INTEGER NOT NULL UNIQUE, -- 1=Source Systems, 2=ODS, 3=Data Lake, 4=Analytics
  description TEXT,
  technologies JSONB, -- ['S3', 'Glue', 'EMR', 'Redshift', 'DynamoDB', 'Kinesis']
  icon TEXT, -- Emoji icon
  color TEXT, -- Color for visualization
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. DATA ENTITY LAYER MAPPINGS TABLE
-- =====================================================
-- Maps data entities to architecture layers (where they live)
CREATE TABLE IF NOT EXISTS data_entity_layers (
  id BIGSERIAL PRIMARY KEY,
  data_entity_id BIGINT REFERENCES data_entities(id) ON DELETE CASCADE,
  data_layer_id BIGINT REFERENCES data_layers(id) ON DELETE CASCADE,
  is_primary_layer BOOLEAN DEFAULT false, -- Is this the primary storage layer?
  storage_format TEXT, -- 'Parquet', 'JSON', 'CSV', 'Binary'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_entity_id, data_layer_id)
);

-- =====================================================
-- 6. DATA FLOWS TABLE (Optional - for explicit flow definitions)
-- =====================================================
-- Tracks how data flows from source to destination
CREATE TABLE IF NOT EXISTS data_flows (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_system TEXT, -- 'Amadeus PSS', 'BRS', 'DCS'
  source_data_entity_id BIGINT REFERENCES data_entities(id),
  destination_data_entity_id BIGINT REFERENCES data_entities(id),
  flow_type TEXT CHECK (flow_type IN ('batch', 'stream', 'real-time', 'scheduled')),
  frequency TEXT, -- 'continuous', 'every_5_min', 'hourly', 'daily'
  transformation_logic TEXT, -- Description of transformations
  technologies JSONB, -- ['Kinesis', 'Lambda', 'Glue']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Data entities with usage counts
CREATE OR REPLACE VIEW v_data_entities_with_usage AS
SELECT
  de.*,
  COUNT(DISTINCT wdm.workflow_id) as workflow_count,
  COUNT(DISTINCT adm.agent_id) as agent_count,
  COUNT(DISTINCT wdm.workflow_id) + COUNT(DISTINCT adm.agent_id) as total_usage_count
FROM data_entities de
LEFT JOIN workflow_data_mappings wdm ON de.id = wdm.data_entity_id
LEFT JOIN agent_data_mappings adm ON de.id = adm.data_entity_id
GROUP BY de.id;

-- View: Workflows with their data dependencies
CREATE OR REPLACE VIEW v_workflows_with_data AS
SELECT
  w.id as workflow_id,
  w.name as workflow_name,
  w.subdomain_id,
  json_agg(
    json_build_object(
      'entity_id', de.id,
      'entity_code', de.code,
      'entity_name', de.name,
      'access_type', wdm.access_type,
      'is_primary', wdm.is_primary_data
    )
  ) as data_entities
FROM workflows w
LEFT JOIN workflow_data_mappings wdm ON w.id = wdm.workflow_id
LEFT JOIN data_entities de ON wdm.data_entity_id = de.id
GROUP BY w.id, w.name, w.subdomain_id;

-- View: Agents with their data sources
CREATE OR REPLACE VIEW v_agents_with_data AS
SELECT
  a.id as agent_id,
  a.name as agent_name,
  json_agg(
    json_build_object(
      'entity_id', de.id,
      'entity_code', de.code,
      'entity_name', de.name,
      'access_pattern', adm.access_pattern,
      'latency', adm.latency_requirement,
      'is_critical', adm.is_critical
    )
  ) as data_entities
FROM agents a
LEFT JOIN agent_data_mappings adm ON a.id = adm.agent_id
LEFT JOIN data_entities de ON adm.data_entity_id = de.id
GROUP BY a.id, a.name;

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY (if needed)
-- =====================================================
-- ALTER TABLE data_entities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflow_data_mappings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_data_mappings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_layers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_entity_layers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_flows ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_entities IS 'Core airline operational data entities (PNR, E-TKT, FLIFO, etc.)';
COMMENT ON TABLE workflow_data_mappings IS 'Maps workflows to the data entities they read/write';
COMMENT ON TABLE agent_data_mappings IS 'Maps AI agents to the data entities they consume';
COMMENT ON TABLE data_layers IS 'Data architecture layers (Source, ODS, Lake, Analytics)';
COMMENT ON TABLE data_entity_layers IS 'Maps data entities to architecture layers';
COMMENT ON TABLE data_flows IS 'Tracks data flow from source to destination';

-- Migration: Create Agent Network Views (Fixed)
-- Created: 2025-11-08
-- Description: Creates views for agent network visualization

-- First, create the agent_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) NOT NULL DEFAULT '🤖',
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category_code VARCHAR(50) REFERENCES agent_categories(code),
  description TEXT,
  autonomy_level INTEGER DEFAULT 1 CHECK (autonomy_level BETWEEN 1 AND 5),
  workflow_count INTEGER DEFAULT 0,
  active_instances INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_collaborations table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_collaborations (
  id SERIAL PRIMARY KEY,
  source_agent_id INTEGER REFERENCES agents(id),
  target_agent_id INTEGER REFERENCES agents(id),
  collaboration_type VARCHAR(50) DEFAULT 'data_exchange',
  strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength BETWEEN 0 AND 1),
  bidirectional BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_agent_id, target_agent_id, collaboration_type)
);

-- Create the agent network view
CREATE OR REPLACE VIEW v_agent_network AS
SELECT
  a.id,
  a.code,
  a.name,
  a.category_code,
  ac.name AS category_name,
  ac.icon,
  ac.color,
  a.autonomy_level,
  a.metadata,
  a.workflow_count,
  a.active_instances
FROM agents a
LEFT JOIN agent_categories ac ON a.category_code = ac.code
WHERE a.active = true;

-- Create the collaboration edges view
CREATE OR REPLACE VIEW v_agent_collaboration_edges AS
SELECT
  ac.id,
  ac.source_agent_id AS source_id,
  ac.target_agent_id AS target_id,
  ac.collaboration_type,
  ac.strength,
  ac.bidirectional,
  a1.name AS source_name,
  a2.name AS target_name
FROM agent_collaborations ac
JOIN agents a1 ON ac.source_agent_id = a1.id
JOIN agents a2 ON ac.target_agent_id = a2.id
WHERE a1.active = true AND a2.active = true;

-- Insert sample agent categories
INSERT INTO agent_categories (code, name, description, icon, color) VALUES
  ('decisioning', 'Decisioning & Optimization', 'Agents that make decisions and optimize operations', '🎯', '#ec4899'),
  ('predictive', 'Predictive & Forecasting', 'Agents that predict future trends and patterns', '🔮', '#8b5cf6'),
  ('conversational', 'Conversational AI', 'Agents that interact with users via natural language', '💬', '#3b82f6'),
  ('automation', 'Process Automation', 'Agents that automate routine tasks', '⚡', '#10b981'),
  ('monitoring', 'Monitoring & Alerts', 'Agents that monitor systems and send alerts', '👁️', '#f59e0b'),
  ('data_processing', 'Data Processing', 'Agents that process and transform data', '📊', '#06b6d4')
ON CONFLICT (code) DO NOTHING;

-- Insert sample agents with workflow counts
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata) VALUES
  ('demand_forecaster', 'Demand Forecaster', 'predictive', 'Predicts passenger demand for routes', 4, 12, 3, '{"capabilities": ["time_series_analysis", "seasonal_patterns"]}'),
  ('dynamic_pricer', 'Dynamic Pricing Agent', 'decisioning', 'Optimizes ticket prices in real-time', 5, 18, 5, '{"capabilities": ["price_optimization", "competitor_analysis"]}'),
  ('chatbot', 'Customer Support Bot', 'conversational', 'Handles customer inquiries 24/7', 3, 8, 12, '{"capabilities": ["natural_language", "multi_language"]}'),
  ('schedule_optimizer', 'Schedule Optimizer', 'decisioning', 'Optimizes flight schedules and crew assignments', 4, 15, 4, '{"capabilities": ["constraint_solving", "resource_allocation"]}'),
  ('baggage_tracker', 'Baggage Tracking Agent', 'monitoring', 'Monitors baggage location and alerts on delays', 2, 6, 8, '{"capabilities": ["iot_integration", "real_time_tracking"]}'),
  ('maintenance_predictor', 'Predictive Maintenance', 'predictive', 'Predicts aircraft maintenance needs', 4, 10, 2, '{"capabilities": ["anomaly_detection", "failure_prediction"]}'),
  ('checkin_automation', 'Check-in Automation', 'automation', 'Automates passenger check-in process', 3, 20, 15, '{"capabilities": ["document_verification", "seat_assignment"]}'),
  ('fraud_detector', 'Fraud Detection', 'monitoring', 'Detects fraudulent transactions and bookings', 4, 14, 6, '{"capabilities": ["pattern_recognition", "risk_scoring"]}'),
  ('crew_scheduler', 'Crew Scheduler', 'automation', 'Automates crew scheduling and assignments', 3, 11, 3, '{"capabilities": ["constraint_solving", "compliance_checking"]}'),
  ('sentiment_analyzer', 'Customer Sentiment Analyzer', 'data_processing', 'Analyzes customer feedback and sentiment', 2, 9, 4, '{"capabilities": ["nlp", "sentiment_analysis"]}')
ON CONFLICT (code) DO NOTHING;

-- Insert sample collaborations
INSERT INTO agent_collaborations (source_agent_id, target_agent_id, collaboration_type, strength, bidirectional)
SELECT
  a1.id, a2.id, collab.type, collab.strength, collab.bidirectional
FROM (VALUES
  ('demand_forecaster', 'dynamic_pricer', 'data_feed', 0.9, false),
  ('demand_forecaster', 'schedule_optimizer', 'data_feed', 0.8, false),
  ('dynamic_pricer', 'fraud_detector', 'validation', 0.7, false),
  ('chatbot', 'baggage_tracker', 'query', 0.6, true),
  ('chatbot', 'checkin_automation', 'trigger', 0.8, false),
  ('maintenance_predictor', 'schedule_optimizer', 'alert', 0.9, false),
  ('sentiment_analyzer', 'chatbot', 'training_data', 0.5, false),
  ('crew_scheduler', 'schedule_optimizer', 'coordination', 0.9, true),
  ('fraud_detector', 'chatbot', 'alert', 0.6, false)
) AS collab(source_code, target_code, type, strength, bidirectional)
JOIN agents a1 ON a1.code = collab.source_code
JOIN agents a2 ON a2.code = collab.target_code
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category_code);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active);
CREATE INDEX IF NOT EXISTS idx_agent_collaborations_source ON agent_collaborations(source_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_collaborations_target ON agent_collaborations(target_agent_id);

-- Grant permissions
GRANT SELECT ON v_agent_network TO authenticated;
GRANT SELECT ON v_agent_collaboration_edges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agent_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agent_collaborations TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE agents_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE agent_categories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE agent_collaborations_id_seq TO authenticated;

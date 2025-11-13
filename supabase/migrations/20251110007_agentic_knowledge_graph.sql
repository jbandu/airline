/*
  Migration 007: Agentic Distribution Knowledge Graph Edges

  Purpose: Create relationship network between agents, workflows, domains, and systems

  Establishes:
  - Agent-to-workflow assignments (which agents power which workflows)
  - Agent collaboration relationships (which agents work together)
  - Cross-domain bridges (workflows spanning multiple domains)
  - System dependencies (which workflows depend on which systems)
*/

-- ============================================================================
-- AGENT-WORKFLOW ASSIGNMENTS
-- ============================================================================
-- Map which agents are involved in which workflows

DO $$
DECLARE
  -- Agent IDs
  v_agent_query_parser_id BIGINT;
  v_agent_multi_constraint_search_id BIGINT;
  v_agent_fare_recommender_id BIGINT;
  v_agent_ancillary_discovery_id BIGINT;
  v_agent_ndc_standardizer_id BIGINT;
  v_agent_brand_monitor_id BIGINT;
  v_agent_content_governor_id BIGINT;
  v_agent_booking_orchestrator_id BIGINT;
  v_agent_payment_processor_id BIGINT;
  v_agent_ticket_issuer_id BIGINT;
  v_agent_rate_limiter_id BIGINT;
  v_agent_auth_manager_id BIGINT;
  v_agent_realtime_sync_id BIGINT;
  v_agent_ffp_recognition_id BIGINT;
  v_agent_preference_learner_id BIGINT;
  v_agent_upgrade_matcher_id BIGINT;

  -- Workflow IDs
  v_workflow_nlp_search_id BIGINT;
  v_workflow_fare_recommendation_id BIGINT;
  v_workflow_ancillary_bundling_id BIGINT;
  v_workflow_ndc_content_id BIGINT;
  v_workflow_brand_accuracy_id BIGINT;
  v_workflow_booking_orchestration_id BIGINT;
  v_workflow_payment_ticketing_id BIGINT;
  v_workflow_api_gateway_id BIGINT;
  v_workflow_realtime_inventory_id BIGINT;
  v_workflow_ffp_recognition_id BIGINT;
  v_workflow_personalized_reco_id BIGINT;
  v_workflow_seat_assignment_id BIGINT;

BEGIN
  -- Fetch agent IDs by code
  SELECT id INTO v_agent_query_parser_id FROM agents WHERE code = 'complex_query_parser';
  SELECT id INTO v_agent_multi_constraint_search_id FROM agents WHERE code = 'multi_constraint_search';
  SELECT id INTO v_agent_fare_recommender_id FROM agents WHERE code = 'fare_family_recommender';
  SELECT id INTO v_agent_ancillary_discovery_id FROM agents WHERE code = 'ancillary_discovery';
  SELECT id INTO v_agent_ndc_standardizer_id FROM agents WHERE code = 'ndc_content_standardizer';
  SELECT id INTO v_agent_brand_monitor_id FROM agents WHERE code = 'brand_accuracy_monitor';
  SELECT id INTO v_agent_content_governor_id FROM agents WHERE code = 'content_approval_governor';
  SELECT id INTO v_agent_booking_orchestrator_id FROM agents WHERE code = 'booking_orchestrator';
  SELECT id INTO v_agent_payment_processor_id FROM agents WHERE code = 'payment_processor';
  SELECT id INTO v_agent_ticket_issuer_id FROM agents WHERE code = 'ticket_issuer';
  SELECT id INTO v_agent_rate_limiter_id FROM agents WHERE code = 'rate_limiter';
  SELECT id INTO v_agent_auth_manager_id FROM agents WHERE code = 'auth_manager';
  SELECT id INTO v_agent_realtime_sync_id FROM agents WHERE code = 'realtime_inventory_sync';
  SELECT id INTO v_agent_ffp_recognition_id FROM agents WHERE code = 'ffp_status_recognizer';
  SELECT id INTO v_agent_preference_learner_id FROM agents WHERE code = 'preference_learner';
  SELECT id INTO v_agent_upgrade_matcher_id FROM agents WHERE code = 'upgrade_opportunity_matcher';

  -- Fetch workflow IDs by name
  SELECT id INTO v_workflow_nlp_search_id FROM workflows WHERE name = 'Complex Natural Language Flight Search';
  SELECT id INTO v_workflow_fare_recommendation_id FROM workflows WHERE name = 'Dynamic Fare Family Recommendation';
  SELECT id INTO v_workflow_ancillary_bundling_id FROM workflows WHERE name = 'Intelligent Ancillary Bundling';
  SELECT id INTO v_workflow_ndc_content_id FROM workflows WHERE name = 'NDC Content Syndication';
  SELECT id INTO v_workflow_brand_accuracy_id FROM workflows WHERE name = 'Brand Accuracy Monitoring';
  SELECT id INTO v_workflow_booking_orchestration_id FROM workflows WHERE name = 'AI-Driven Booking Orchestration';
  SELECT id INTO v_workflow_payment_ticketing_id FROM workflows WHERE name = 'Autonomous Payment & Ticketing';
  SELECT id INTO v_workflow_api_gateway_id FROM workflows WHERE name = 'API Gateway for AI Platforms';
  SELECT id INTO v_workflow_realtime_inventory_id FROM workflows WHERE name = 'Real-Time Inventory Synchronization';
  SELECT id INTO v_workflow_ffp_recognition_id FROM workflows WHERE name = 'FFP Status Recognition & Benefits Application';
  SELECT id INTO v_workflow_personalized_reco_id FROM workflows WHERE name = 'Personalized Flight & Ancillary Recommendations';
  SELECT id INTO v_workflow_seat_assignment_id FROM workflows WHERE name = 'Preference-Based Seat Assignment';

  -- ============================================================================
  -- WORKFLOW: Complex Natural Language Flight Search
  -- ============================================================================
  -- Primary agents: Query Parser, Multi-Constraint Search, Fare Recommender
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_nlp_search_id, v_agent_query_parser_id, 'primary', 1, true),
    (v_workflow_nlp_search_id, v_agent_multi_constraint_search_id, 'primary', 2, true),
    (v_workflow_nlp_search_id, v_agent_fare_recommender_id, 'supporting', 3, false),
    (v_workflow_nlp_search_id, v_agent_ancillary_discovery_id, 'supporting', 4, false);

  -- ============================================================================
  -- WORKFLOW: Dynamic Fare Family Recommendation
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_fare_recommendation_id, v_agent_fare_recommender_id, 'primary', 1, true),
    (v_workflow_fare_recommendation_id, v_agent_preference_learner_id, 'supporting', 2, false),
    (v_workflow_fare_recommendation_id, v_agent_ancillary_discovery_id, 'supporting', 3, false);

  -- ============================================================================
  -- WORKFLOW: Intelligent Ancillary Bundling
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_ancillary_bundling_id, v_agent_ancillary_discovery_id, 'primary', 1, true),
    (v_workflow_ancillary_bundling_id, v_agent_preference_learner_id, 'primary', 2, true),
    (v_workflow_ancillary_bundling_id, v_agent_fare_recommender_id, 'supporting', 3, false);

  -- ============================================================================
  -- WORKFLOW: NDC Content Syndication
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_ndc_content_id, v_agent_ndc_standardizer_id, 'primary', 1, true),
    (v_workflow_ndc_content_id, v_agent_content_governor_id, 'supporting', 2, true),
    (v_workflow_ndc_content_id, v_agent_realtime_sync_id, 'supporting', 3, false);

  -- ============================================================================
  -- WORKFLOW: Brand Accuracy Monitoring
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_brand_accuracy_id, v_agent_brand_monitor_id, 'primary', 1, true),
    (v_workflow_brand_accuracy_id, v_agent_content_governor_id, 'supporting', 2, false);

  -- ============================================================================
  -- WORKFLOW: AI-Driven Booking Orchestration
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_booking_orchestration_id, v_agent_booking_orchestrator_id, 'primary', 1, true),
    (v_workflow_booking_orchestration_id, v_agent_query_parser_id, 'supporting', 2, false),
    (v_workflow_booking_orchestration_id, v_agent_payment_processor_id, 'supporting', 3, true),
    (v_workflow_booking_orchestration_id, v_agent_ticket_issuer_id, 'supporting', 4, true);

  -- ============================================================================
  -- WORKFLOW: Autonomous Payment & Ticketing
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_payment_ticketing_id, v_agent_payment_processor_id, 'primary', 1, true),
    (v_workflow_payment_ticketing_id, v_agent_ticket_issuer_id, 'primary', 2, true);

  -- ============================================================================
  -- WORKFLOW: API Gateway for AI Platforms
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_api_gateway_id, v_agent_rate_limiter_id, 'primary', 1, true),
    (v_workflow_api_gateway_id, v_agent_auth_manager_id, 'primary', 2, true);

  -- ============================================================================
  -- WORKFLOW: Real-Time Inventory Synchronization
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_realtime_inventory_id, v_agent_realtime_sync_id, 'primary', 1, true),
    (v_workflow_realtime_inventory_id, v_agent_ndc_standardizer_id, 'supporting', 2, false);

  -- ============================================================================
  -- WORKFLOW: FFP Status Recognition & Benefits Application
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_ffp_recognition_id, v_agent_ffp_recognition_id, 'primary', 1, true),
    (v_workflow_ffp_recognition_id, v_agent_upgrade_matcher_id, 'supporting', 2, false);

  -- ============================================================================
  -- WORKFLOW: Personalized Flight & Ancillary Recommendations
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_personalized_reco_id, v_agent_preference_learner_id, 'primary', 1, true),
    (v_workflow_personalized_reco_id, v_agent_fare_recommender_id, 'supporting', 2, true),
    (v_workflow_personalized_reco_id, v_agent_ancillary_discovery_id, 'supporting', 3, true),
    (v_workflow_personalized_reco_id, v_agent_ffp_recognition_id, 'supporting', 4, false);

  -- ============================================================================
  -- WORKFLOW: Preference-Based Seat Assignment
  -- ============================================================================
  INSERT INTO workflow_agents (workflow_id, agent_id, role, execution_order, required) VALUES
    (v_workflow_seat_assignment_id, v_agent_preference_learner_id, 'primary', 1, true),
    (v_workflow_seat_assignment_id, v_agent_ffp_recognition_id, 'supporting', 2, false);

END $$;

-- ============================================================================
-- AGENT COLLABORATION RELATIONSHIPS
-- ============================================================================
-- Define which agents collaborate with each other and how

INSERT INTO agent_relationships (from_agent_id, to_agent_id, relationship_type, strength, metadata)
SELECT
  a1.id,
  a2.id,
  rel.relationship_type,
  rel.strength,
  rel.metadata
FROM (VALUES
  -- Query Parser collaborations
  ('complex_query_parser', 'multi_constraint_search', 'triggers', 0.95, '{"latency_ms": 50, "success_rate": 0.98}'::jsonb),
  ('complex_query_parser', 'fare_family_recommender', 'informs', 0.75, '{"data_passed": "passenger_preferences", "async": true}'::jsonb),

  -- Multi-Constraint Search collaborations
  ('multi_constraint_search', 'fare_family_recommender', 'triggers', 0.90, '{"latency_ms": 120, "success_rate": 0.96}'::jsonb),
  ('multi_constraint_search', 'ancillary_discovery', 'informs', 0.70, '{"data_passed": "flight_results", "async": true}'::jsonb),

  -- Fare Recommender collaborations
  ('fare_family_recommender', 'ancillary_discovery', 'triggers', 0.85, '{"latency_ms": 80, "success_rate": 0.97}'::jsonb),
  ('fare_family_recommender', 'preference_learner', 'learns_from', 0.80, '{"feedback_loop": true, "learning_rate": 0.001}'::jsonb),

  -- Ancillary Discovery collaborations
  ('ancillary_discovery', 'preference_learner', 'learns_from', 0.85, '{"feedback_loop": true, "learning_rate": 0.002}'::jsonb),
  ('ancillary_discovery', 'upgrade_opportunity_matcher', 'informs', 0.65, '{"data_passed": "current_booking_class", "async": true}'::jsonb),

  -- NDC Content collaborations
  ('ndc_content_standardizer', 'content_approval_governor', 'requires_approval', 0.99, '{"approval_threshold": 0.95, "human_review_required": false}'::jsonb),
  ('ndc_content_standardizer', 'realtime_inventory_sync', 'triggers', 0.92, '{"latency_ms": 200, "success_rate": 0.99}'::jsonb),

  -- Brand Monitor collaborations
  ('brand_accuracy_monitor', 'content_approval_governor', 'triggers', 0.88, '{"alert_threshold": 0.15, "auto_correct": true}'::jsonb),
  ('brand_accuracy_monitor', 'ndc_content_standardizer', 'informs', 0.75, '{"correction_suggestions": true, "async": false}'::jsonb),

  -- Booking Orchestration collaborations
  ('booking_orchestrator', 'payment_processor', 'triggers', 0.98, '{"latency_ms": 500, "success_rate": 0.995, "transactional": true}'::jsonb),
  ('booking_orchestrator', 'ticket_issuer', 'triggers', 0.97, '{"latency_ms": 800, "success_rate": 0.993, "transactional": true}'::jsonb),
  ('booking_orchestrator', 'pnr_manager', 'requires', 0.99, '{"dependency": "critical", "fallback_available": false}'::jsonb),

  -- Payment & Ticketing collaborations
  ('payment_processor', 'ticket_issuer', 'triggers', 0.99, '{"latency_ms": 400, "success_rate": 0.997, "transactional": true}'::jsonb),
  ('payment_processor', 'receipt_generator', 'triggers', 0.95, '{"latency_ms": 150, "success_rate": 0.999}'::jsonb),

  -- API Gateway collaborations
  ('rate_limiter', 'auth_manager', 'depends_on', 0.99, '{"order": "auth_first", "critical": true}'::jsonb),
  ('rate_limiter', 'realtime_inventory_sync', 'protects', 0.85, '{"rate_limit_per_minute": 100, "burst_allowed": 20}'::jsonb),

  -- Real-Time Sync collaborations
  ('realtime_inventory_sync', 'ndc_content_standardizer', 'triggers', 0.88, '{"latency_ms": 100, "success_rate": 0.98, "pubsub": true}'::jsonb),
  ('realtime_inventory_sync', 'multi_constraint_search', 'informs', 0.95, '{"cache_invalidation": true, "async": true}'::jsonb),

  -- FFP & Personalization collaborations
  ('ffp_status_recognizer', 'upgrade_opportunity_matcher', 'triggers', 0.92, '{"latency_ms": 180, "success_rate": 0.96}'::jsonb),
  ('ffp_status_recognizer', 'preference_learner', 'informs', 0.80, '{"data_passed": "tier_status", "async": true}'::jsonb),

  -- Preference Learning collaborations
  ('preference_learner', 'fare_family_recommender', 'informs', 0.88, '{"model_update_frequency": "hourly", "async": true}'::jsonb),
  ('preference_learner', 'ancillary_discovery', 'informs', 0.90, '{"model_update_frequency": "hourly", "async": true}'::jsonb),
  ('preference_learner', 'upgrade_opportunity_matcher', 'informs', 0.85, '{"model_update_frequency": "daily", "async": true}'::jsonb),

  -- Upgrade Matcher collaborations
  ('upgrade_opportunity_matcher', 'payment_processor', 'triggers', 0.75, '{"latency_ms": 300, "success_rate": 0.98}'::jsonb),
  ('upgrade_opportunity_matcher', 'ffp_status_recognizer', 'depends_on', 0.95, '{"dependency": "required", "fallback_available": true}'::jsonb)

) AS rel(from_code, to_code, relationship_type, strength, metadata)
INNER JOIN agents a1 ON a1.code = rel.from_code
INNER JOIN agents a2 ON a2.code = rel.to_code
ON CONFLICT (from_agent_id, to_agent_id) DO NOTHING;

-- ============================================================================
-- CROSS-DOMAIN WORKFLOW BRIDGES
-- ============================================================================
-- Identify workflows that span multiple domains (create bridge relationships)

DO $$
DECLARE
  -- Domain IDs
  v_domain_discovery_id BIGINT;
  v_domain_brand_id BIGINT;
  v_domain_transaction_id BIGINT;
  v_domain_api_id BIGINT;
  v_domain_loyalty_id BIGINT;

  -- Workflow IDs
  v_workflow_nlp_search_id BIGINT;
  v_workflow_booking_orchestration_id BIGINT;
  v_workflow_personalized_reco_id BIGINT;

BEGIN
  -- Fetch domain IDs
  SELECT id INTO v_domain_discovery_id FROM domains WHERE name = 'Agentic Distribution & Discovery';
  SELECT id INTO v_domain_brand_id FROM domains WHERE name = 'Brand & Product Management';
  SELECT id INTO v_domain_transaction_id FROM domains WHERE name = 'Agentic Transaction Execution';
  SELECT id INTO v_domain_api_id FROM domains WHERE name = 'API-First Architecture';
  SELECT id INTO v_domain_loyalty_id FROM domains WHERE name = 'Loyalty & Personalization';

  -- Fetch workflow IDs
  SELECT id INTO v_workflow_nlp_search_id FROM workflows WHERE name = 'Complex Natural Language Flight Search';
  SELECT id INTO v_workflow_booking_orchestration_id FROM workflows WHERE name = 'AI-Driven Booking Orchestration';
  SELECT id INTO v_workflow_personalized_reco_id FROM workflows WHERE name = 'Personalized Flight & Ancillary Recommendations';

  -- Create cross-domain bridges
  -- Note: Using a custom junction table approach since workflows already have a primary domain

  -- NLP Search bridges Discovery → Brand (for branded fare content)
  INSERT INTO workflow_cross_domain_bridges (workflow_id, primary_domain_id, secondary_domain_id, bridge_strength, bridge_reason)
  VALUES
    (
      v_workflow_nlp_search_id,
      v_domain_discovery_id,
      v_domain_brand_id,
      0.75,
      'Requires branded fare family content for accurate search results'
    ),
    (
      v_workflow_nlp_search_id,
      v_domain_discovery_id,
      v_domain_api_id,
      0.90,
      'Depends on API gateway for AI platform access and rate limiting'
    );

  -- Booking Orchestration bridges Transaction → Discovery + API
  INSERT INTO workflow_cross_domain_bridges (workflow_id, primary_domain_id, secondary_domain_id, bridge_strength, bridge_reason)
  VALUES
    (
      v_workflow_booking_orchestration_id,
      v_domain_transaction_id,
      v_domain_discovery_id,
      0.65,
      'May reference search results for booking context'
    ),
    (
      v_workflow_booking_orchestration_id,
      v_domain_transaction_id,
      v_domain_api_id,
      0.95,
      'Critical dependency on API infrastructure for PNR creation and payment'
    ),
    (
      v_workflow_booking_orchestration_id,
      v_domain_transaction_id,
      v_domain_loyalty_id,
      0.70,
      'Applies FFP benefits and accrues miles during booking'
    );

  -- Personalized Recommendations bridges Loyalty → Discovery + Brand
  INSERT INTO workflow_cross_domain_bridges (workflow_id, primary_domain_id, secondary_domain_id, bridge_strength, bridge_reason)
  VALUES
    (
      v_workflow_personalized_reco_id,
      v_domain_loyalty_id,
      v_domain_discovery_id,
      0.85,
      'Uses search/discovery capabilities to generate recommendations'
    ),
    (
      v_workflow_personalized_reco_id,
      v_domain_loyalty_id,
      v_domain_brand_id,
      0.80,
      'Requires branded fare and ancillary content for personalization'
    );

END $$;

-- Create the cross-domain bridge table if it doesn't exist
CREATE TABLE IF NOT EXISTS workflow_cross_domain_bridges (
  id BIGSERIAL PRIMARY KEY,
  workflow_id BIGINT REFERENCES workflows(id) ON DELETE CASCADE,
  primary_domain_id BIGINT REFERENCES domains(id) ON DELETE CASCADE,
  secondary_domain_id BIGINT REFERENCES domains(id) ON DELETE CASCADE,
  bridge_strength NUMERIC(3,2) CHECK (bridge_strength >= 0 AND bridge_strength <= 1),
  bridge_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workflow_id, secondary_domain_id)
);

COMMENT ON TABLE workflow_cross_domain_bridges IS 'Cross-domain relationships showing workflows that span multiple business domains';
COMMENT ON COLUMN workflow_cross_domain_bridges.bridge_strength IS 'Strength of cross-domain dependency (0-1 scale)';

-- ============================================================================
-- WORKFLOW-SYSTEM DEPENDENCIES
-- ============================================================================
-- Map which workflows depend on which airline systems

DO $$
DECLARE
  v_system_copa_pss_id BIGINT;
  v_system_copa_loyalty_id BIGINT;
  v_system_copa_rm_id BIGINT;

  v_workflow_nlp_search_id BIGINT;
  v_workflow_fare_recommendation_id BIGINT;
  v_workflow_booking_orchestration_id BIGINT;
  v_workflow_payment_ticketing_id BIGINT;
  v_workflow_ffp_recognition_id BIGINT;
  v_workflow_personalized_reco_id BIGINT;

BEGIN
  -- Fetch Copa Airlines system IDs
  SELECT id INTO v_system_copa_pss_id
  FROM systems
  WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');

  SELECT id INTO v_system_copa_loyalty_id
  FROM systems
  WHERE system_name = 'Copa ConnectMiles Platform';

  SELECT id INTO v_system_copa_rm_id
  FROM systems
  WHERE system_name = 'Sabre AirVision RM' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');

  -- Fetch workflow IDs
  SELECT id INTO v_workflow_nlp_search_id FROM workflows WHERE name = 'Complex Natural Language Flight Search';
  SELECT id INTO v_workflow_fare_recommendation_id FROM workflows WHERE name = 'Dynamic Fare Family Recommendation';
  SELECT id INTO v_workflow_booking_orchestration_id FROM workflows WHERE name = 'AI-Driven Booking Orchestration';
  SELECT id INTO v_workflow_payment_ticketing_id FROM workflows WHERE name = 'Autonomous Payment & Ticketing';
  SELECT id INTO v_workflow_ffp_recognition_id FROM workflows WHERE name = 'FFP Status Recognition & Benefits Application';
  SELECT id INTO v_workflow_personalized_reco_id FROM workflows WHERE name = 'Personalized Flight & Ancillary Recommendations';

  -- Create workflow-system dependencies
  INSERT INTO workflow_system_dependencies (workflow_id, system_id, dependency_type, criticality, fallback_available)
  VALUES
    -- NLP Search → PSS (for inventory lookup)
    (v_workflow_nlp_search_id, v_system_copa_pss_id, 'data_source', 0.95, false),
    (v_workflow_nlp_search_id, v_system_copa_rm_id, 'data_source', 0.70, true),

    -- Fare Recommendation → PSS + RM
    (v_workflow_fare_recommendation_id, v_system_copa_pss_id, 'data_source', 0.90, false),
    (v_workflow_fare_recommendation_id, v_system_copa_rm_id, 'data_source', 0.85, false),

    -- Booking Orchestration → PSS (critical)
    (v_workflow_booking_orchestration_id, v_system_copa_pss_id, 'transactional', 0.99, false),

    -- Payment & Ticketing → PSS (critical)
    (v_workflow_payment_ticketing_id, v_system_copa_pss_id, 'transactional', 0.99, false),

    -- FFP Recognition → Loyalty Platform (critical)
    (v_workflow_ffp_recognition_id, v_system_copa_loyalty_id, 'data_source', 0.98, false),

    -- Personalized Recommendations → Loyalty + PSS
    (v_workflow_personalized_reco_id, v_system_copa_loyalty_id, 'data_source', 0.85, true),
    (v_workflow_personalized_reco_id, v_system_copa_pss_id, 'data_source', 0.75, false);

END $$;

-- Create the workflow-system dependencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS workflow_system_dependencies (
  id BIGSERIAL PRIMARY KEY,
  workflow_id BIGINT REFERENCES workflows(id) ON DELETE CASCADE,
  system_id BIGINT REFERENCES systems(id) ON DELETE CASCADE,
  dependency_type TEXT CHECK (dependency_type IN ('data_source', 'transactional', 'integration', 'monitoring')),
  criticality NUMERIC(3,2) CHECK (criticality >= 0 AND criticality <= 1),
  fallback_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workflow_id, system_id)
);

COMMENT ON TABLE workflow_system_dependencies IS 'Maps workflows to their dependent airline systems';
COMMENT ON COLUMN workflow_system_dependencies.dependency_type IS 'Type of dependency: data_source, transactional, integration, monitoring';
COMMENT ON COLUMN workflow_system_dependencies.criticality IS 'How critical this system is to workflow success (0-1 scale)';

-- ============================================================================
-- KNOWLEDGE GRAPH METRICS VIEW
-- ============================================================================
-- Create a view for analyzing the knowledge graph structure

CREATE OR REPLACE VIEW knowledge_graph_metrics AS
SELECT
  'agents' AS entity_type,
  COUNT(*) AS total_count,
  NULL::BIGINT AS avg_connections
FROM agents
UNION ALL
SELECT
  'workflows' AS entity_type,
  COUNT(*) AS total_count,
  NULL::BIGINT AS avg_connections
FROM workflows
UNION ALL
SELECT
  'agent_relationships' AS entity_type,
  COUNT(*) AS total_count,
  AVG(degree)::BIGINT AS avg_connections
FROM (
  SELECT from_agent_id, COUNT(*) AS degree
  FROM agent_relationships
  GROUP BY from_agent_id
) AS agent_degrees
UNION ALL
SELECT
  'workflow_agent_assignments' AS entity_type,
  COUNT(*) AS total_count,
  AVG(agent_count)::BIGINT AS avg_connections
FROM (
  SELECT workflow_id, COUNT(*) AS agent_count
  FROM workflow_agents
  GROUP BY workflow_id
) AS workflow_agent_counts
UNION ALL
SELECT
  'cross_domain_bridges' AS entity_type,
  COUNT(*) AS total_count,
  NULL::BIGINT AS avg_connections
FROM workflow_cross_domain_bridges;

COMMENT ON VIEW knowledge_graph_metrics IS 'Summary metrics for the agentic distribution knowledge graph';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Agent-Workflow Assignments: ~45 mappings (agents assigned to workflows)
-- Agent Collaboration Relationships: ~28 relationships (agents working together)
-- Cross-Domain Bridges: 7 bridges (workflows spanning multiple domains)
-- Workflow-System Dependencies: 9 dependencies (workflows dependent on systems)
--
-- Knowledge Graph Nodes: 24 agents + 17 workflows + 5 domains = 46 nodes
-- Knowledge Graph Edges: ~89 total relationships
--
-- Next: Migration 008 (Copa Airlines Complete Seed Data)

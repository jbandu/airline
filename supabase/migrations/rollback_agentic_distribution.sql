/*
  ROLLBACK SCRIPT: Agentic Distribution System

  ⚠️  WARNING: This script will completely remove all agentic distribution data.

  Use this script to rollback migrations 001-009 in case of issues.

  Rollback Order: 009 → 008 → 007 → 006 → 005 → 004 → 003 → 002 → 001
  (Reverse order to respect foreign key dependencies)

  Execution:
    psql "$DATABASE_URL" -f rollback_agentic_distribution.sql

  Or in Supabase Dashboard SQL Editor:
    Copy/paste this entire file and execute
*/

-- ============================================================================
-- ROLLBACK CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AGENTIC DISTRIBUTION ROLLBACK STARTING';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'This will delete:';
  RAISE NOTICE '- 8 analytical views';
  RAISE NOTICE '- Copa Airlines seed data (routes, metrics, templates)';
  RAISE NOTICE '- Knowledge graph relationships';
  RAISE NOTICE '- Reference data (airlines, systems, APIs)';
  RAISE NOTICE '- 17 workflow definitions';
  RAISE NOTICE '- 24 agent definitions';
  RAISE NOTICE '- 10 new database tables';
  RAISE NOTICE '- 5 agent categories';
  RAISE NOTICE '- 5 domains with 15 subdomains';
  RAISE NOTICE '';
  RAISE NOTICE 'Proceeding with rollback in 3 seconds...';
  RAISE NOTICE '';

  PERFORM pg_sleep(3);
END $$;

-- ============================================================================
-- MIGRATION 009 ROLLBACK: Drop Analytics Views
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 009: Analytics Views';
  RAISE NOTICE '═══════════════════════════════════════';
END $$;

DROP VIEW IF EXISTS ndc_adoption_metrics CASCADE;
DROP VIEW IF EXISTS content_syndication_coverage CASCADE;
DROP VIEW IF EXISTS loyalty_personalization_readiness CASCADE;
DROP VIEW IF EXISTS api_health_dashboard CASCADE;
DROP VIEW IF EXISTS cross_domain_complexity CASCADE;
DROP VIEW IF EXISTS agent_utilization_metrics CASCADE;
DROP VIEW IF EXISTS workflow_agentic_potential CASCADE;
DROP VIEW IF EXISTS ai_readiness_scorecard CASCADE;
DROP VIEW IF EXISTS knowledge_graph_metrics CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Migration 009 rolled back: 8 views dropped';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 008 ROLLBACK: Copa Airlines Seed Data
-- ============================================================================

DO $$
DECLARE
  v_copa_id BIGINT;
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 008: Copa Seed Data';
  RAISE NOTICE '═══════════════════════════════════════';

  SELECT id INTO v_copa_id FROM airlines WHERE iata_code = 'CM';

  -- Delete operational metrics
  DELETE FROM airline_operational_metrics WHERE airline_id = v_copa_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % Copa operational metrics', v_deleted_count;

  -- Delete NDC offer templates
  DELETE FROM ndc_offer_templates WHERE airline_id = v_copa_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % Copa NDC offer templates', v_deleted_count;

  -- Delete passenger archetypes
  DELETE FROM passenger_preference_archetypes;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % passenger archetypes', v_deleted_count;

  -- Delete routes
  DELETE FROM airline_routes WHERE airline_id = v_copa_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % Copa routes', v_deleted_count;

  -- Drop tables created in migration 008
  DROP TABLE IF EXISTS airline_operational_metrics CASCADE;
  DROP TABLE IF EXISTS ndc_offer_templates CASCADE;
  DROP TABLE IF EXISTS passenger_preference_archetypes CASCADE;
  DROP TABLE IF EXISTS airline_routes CASCADE;

  RAISE NOTICE '✓ Migration 008 rolled back: Copa seed data removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 007 ROLLBACK: Knowledge Graph Edges
-- ============================================================================

DO $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 007: Knowledge Graph';
  RAISE NOTICE '═══════════════════════════════════════';

  -- Drop dependency tables
  DROP TABLE IF EXISTS workflow_system_dependencies CASCADE;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Dropped workflow_system_dependencies table';

  DROP TABLE IF EXISTS workflow_cross_domain_bridges CASCADE;
  RAISE NOTICE '✓ Dropped workflow_cross_domain_bridges table';

  -- Delete agent relationships for agentic agents
  DELETE FROM agent_relationships
  WHERE from_agent_id IN (
    SELECT id FROM agents WHERE category_code IN (
      'agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agent relationships', v_deleted_count;

  -- Delete workflow-agent assignments for agentic workflows
  DELETE FROM workflow_agents
  WHERE workflow_id IN (
    SELECT id FROM workflows
    WHERE name IN (
      'Complex Natural Language Flight Search',
      'Dynamic Fare Family Recommendation',
      'Intelligent Ancillary Bundling',
      'NDC Content Syndication',
      'Brand Accuracy Monitoring',
      'Schema.org Markup Generation',
      'AI-Driven Booking Orchestration',
      'Autonomous Payment & Ticketing',
      'Post-Booking Service Automation',
      'API Gateway for AI Platforms',
      'Real-Time Inventory Synchronization',
      'NDC Standard Compliance Verification',
      'FFP Status Recognition & Benefits Application',
      'Personalized Flight & Ancillary Recommendations',
      'Privacy-Preserving Preference Learning',
      'Preference-Based Seat Assignment',
      'Dynamic Upgrade Opportunity Matching'
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % workflow-agent assignments', v_deleted_count;

  RAISE NOTICE '✓ Migration 007 rolled back: Knowledge graph removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 006 ROLLBACK: Reference Data
-- ============================================================================

DO $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 006: Reference Data';
  RAISE NOTICE '═══════════════════════════════════════';

  -- Delete in order respecting foreign keys

  DELETE FROM aircraft_configurations;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % aircraft configurations', v_deleted_count;

  DELETE FROM content_syndication_feeds;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % content syndication feeds', v_deleted_count;

  DELETE FROM api_endpoints;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % API endpoints', v_deleted_count;

  DELETE FROM ffp_tiers;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % FFP tiers', v_deleted_count;

  DELETE FROM branded_fare_families;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % branded fare families', v_deleted_count;

  DELETE FROM ai_platform_integrations;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % AI platform integrations', v_deleted_count;

  DELETE FROM systems;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % airline systems', v_deleted_count;

  DELETE FROM airlines;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % airlines', v_deleted_count;

  RAISE NOTICE '✓ Migration 006 rolled back: Reference data removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 005 ROLLBACK: Workflow Definitions
-- ============================================================================

DO $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 005: Workflow Definitions';
  RAISE NOTICE '═══════════════════════════════════════';

  DELETE FROM workflows
  WHERE name IN (
    'Complex Natural Language Flight Search',
    'Dynamic Fare Family Recommendation',
    'Intelligent Ancillary Bundling',
    'Conversational Itinerary Construction',
    'NDC Content Syndication',
    'Brand Accuracy Monitoring',
    'Schema.org Markup Generation',
    'AI-Driven Booking Orchestration',
    'Autonomous Payment & Ticketing',
    'Post-Booking Service Automation',
    'Self-Service Disruption Management',
    'API Gateway for AI Platforms',
    'Real-Time Inventory Synchronization',
    'NDC Standard Compliance Verification',
    'FFP Status Recognition & Benefits Application',
    'Personalized Flight & Ancillary Recommendations',
    'Privacy-Preserving Preference Learning',
    'Preference-Based Seat Assignment',
    'Dynamic Upgrade Opportunity Matching'
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agentic workflow definitions', v_deleted_count;

  RAISE NOTICE '✓ Migration 005 rolled back: Workflows removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 004 ROLLBACK: Agent Definitions
-- ============================================================================

DO $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 004: Agent Definitions';
  RAISE NOTICE '═══════════════════════════════════════';

  -- Delete agent relationships first
  DELETE FROM agent_relationships
  WHERE from_agent_id IN (
    SELECT id FROM agents WHERE category_code IN (
      'agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'
    )
  ) OR to_agent_id IN (
    SELECT id FROM agents WHERE category_code IN (
      'agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'
    )
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agent relationships', v_deleted_count;

  -- Delete agents
  DELETE FROM agents
  WHERE category_code IN (
    'agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agentic agents', v_deleted_count;

  RAISE NOTICE '✓ Migration 004 rolled back: Agents removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 003 ROLLBACK: Distribution Tables
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 003: Distribution Tables';
  RAISE NOTICE '═══════════════════════════════════════';
END $$;

DROP TABLE IF EXISTS ndc_offers CASCADE;
DROP TABLE IF EXISTS aircraft_configurations CASCADE;
DROP TABLE IF EXISTS content_syndication_feeds CASCADE;
DROP TABLE IF EXISTS passenger_preferences CASCADE;
DROP TABLE IF EXISTS ai_platform_integrations CASCADE;
DROP TABLE IF EXISTS ffp_tiers CASCADE;
DROP TABLE IF EXISTS branded_fare_families CASCADE;
DROP TABLE IF EXISTS api_endpoints CASCADE;
DROP TABLE IF EXISTS systems CASCADE;
DROP TABLE IF EXISTS airlines CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Migration 003 rolled back: 10 tables dropped';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 002 ROLLBACK: Agent Categories
-- ============================================================================

DO $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 002: Agent Categories';
  RAISE NOTICE '═══════════════════════════════════════';

  DELETE FROM agent_categories
  WHERE code IN (
    'agentic_shopping',
    'content_syndication',
    'transaction_execution',
    'api_gateway',
    'personalization'
  );
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agentic agent categories', v_deleted_count;

  RAISE NOTICE '✓ Migration 002 rolled back: Agent categories removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- MIGRATION 001 ROLLBACK: Domains & Subdomains
-- ============================================================================

DO $$
DECLARE
  v_deleted_subdomains INTEGER;
  v_deleted_domains INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE 'Rolling back Migration 001: Domains & Subdomains';
  RAISE NOTICE '═══════════════════════════════════════';

  -- Delete subdomains first (foreign key to domains)
  DELETE FROM subdomains
  WHERE domain_id IN (
    SELECT id FROM domains WHERE name IN (
      'Agentic Distribution & Discovery',
      'Brand & Product Management',
      'Agentic Transaction Execution',
      'API-First Architecture',
      'Loyalty & Personalization'
    )
  );
  GET DIAGNOSTICS v_deleted_subdomains = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agentic subdomains', v_deleted_subdomains;

  -- Delete domains
  DELETE FROM domains
  WHERE name IN (
    'Agentic Distribution & Discovery',
    'Brand & Product Management',
    'Agentic Transaction Execution',
    'API-First Architecture',
    'Loyalty & Personalization'
  );
  GET DIAGNOSTICS v_deleted_domains = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % agentic domains', v_deleted_domains;

  RAISE NOTICE '✓ Migration 001 rolled back: Domains & subdomains removed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'All agentic distribution migrations (001-009) have been rolled back.';
  RAISE NOTICE '';
  RAISE NOTICE 'Verification queries:';
  RAISE NOTICE '  SELECT COUNT(*) FROM domains WHERE name LIKE ''%Agentic%'';  -- Should return 0';
  RAISE NOTICE '  SELECT COUNT(*) FROM agents WHERE category_code = ''agentic_shopping'';  -- Should return 0';
  RAISE NOTICE '  SELECT table_name FROM information_schema.tables WHERE table_name = ''airlines'';  -- Should return 0 rows';
  RAISE NOTICE '';
  RAISE NOTICE 'Database restored to pre-migration state.';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Uncomment to run)
-- ============================================================================

-- Verify domains removed
-- SELECT COUNT(*) AS agentic_domains_remaining
-- FROM domains
-- WHERE name IN ('Agentic Distribution & Discovery', 'Brand & Product Management', 'Agentic Transaction Execution', 'API-First Architecture', 'Loyalty & Personalization');
-- -- Expected: 0

-- Verify agent categories removed
-- SELECT COUNT(*) AS agentic_categories_remaining
-- FROM agent_categories
-- WHERE code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization');
-- -- Expected: 0

-- Verify tables removed
-- SELECT COUNT(*) AS agentic_tables_remaining
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('airlines', 'systems', 'api_endpoints', 'branded_fare_families', 'ffp_tiers', 'ai_platform_integrations', 'passenger_preferences', 'content_syndication_feeds', 'aircraft_configurations', 'ndc_offers');
-- -- Expected: 0

-- Verify agents removed
-- SELECT COUNT(*) AS agentic_agents_remaining
-- FROM agents
-- WHERE category_code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization');
-- -- Expected: 0

-- Verify workflows removed
-- SELECT COUNT(*) AS agentic_workflows_remaining
-- FROM workflows
-- WHERE name LIKE '%Natural Language%' OR name LIKE '%Agentic%' OR name LIKE '%NDC%';
-- -- Expected: 0

-- Verify views removed
-- SELECT COUNT(*) AS agentic_views_remaining
-- FROM information_schema.views
-- WHERE table_schema = 'public'
--   AND table_name IN ('ai_readiness_scorecard', 'workflow_agentic_potential', 'agent_utilization_metrics', 'cross_domain_complexity', 'api_health_dashboard', 'loyalty_personalization_readiness', 'content_syndication_coverage', 'ndc_adoption_metrics');
-- -- Expected: 0

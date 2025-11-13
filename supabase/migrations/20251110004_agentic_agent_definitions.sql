/*
  Migration 004: Agentic Distribution Agent Definitions

  Purpose: Define AI agent instances for distribution and commerce capabilities
  Based on: Hotel agentic commerce model adapted for airline industry

  New Agents by Category:
  - Agentic Shopping (5 agents)
  - Content Syndication (5 agents)
  - Transaction Execution (5 agents)
  - API Gateway (4 agents)
  - Personalization (5 agents)

  Total New Agents: 24
  Existing Agents: 12
  Total After Migration: 36 agents
*/

-- ============================================================================
-- CATEGORY 1: AGENTIC SHOPPING AGENTS (5)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
  (
    'complex_query_parser',
    'Complex Query Parser Agent',
    'agentic_shopping',
    'Parses multi-constraint natural language queries into structured search parameters. Handles requests like "Find me a red-eye to Tokyo with WiFi, flat-bed seats, and under $2000".',
    4,
    8,
    3,
    '{"capabilities": ["nlp", "intent_recognition", "constraint_extraction", "entity_resolution"], "languages": ["en", "es", "zh", "ja"], "accuracy": 0.94}'::jsonb,
    true
  ),
  (
    'multi_constraint_search',
    'Multi-Constraint Flight Search Agent',
    'agentic_shopping',
    'Executes complex flight searches with multiple simultaneous constraints (time, price, amenities, loyalty status). Optimizes search across multiple airline APIs.',
    5,
    12,
    5,
    '{"capabilities": ["multi_api_search", "constraint_solving", "result_ranking", "cache_optimization"], "avg_search_time_ms": 850, "success_rate": 0.97}'::jsonb,
    true
  ),
  (
    'fare_family_recommender',
    'Fare Family Recommendation Agent',
    'agentic_shopping',
    'Analyzes passenger profile and trip context to recommend optimal fare family. Considers travel frequency, route, and historical upgrade behavior.',
    4,
    15,
    8,
    '{"capabilities": ["collaborative_filtering", "contextual_analysis", "upsell_optimization"], "conversion_lift": 0.23, "avg_basket_increase": 47.50}'::jsonb,
    true
  ),
  (
    'ancillary_matcher',
    'Ancillary Matching Agent',
    'agentic_shopping',
    'Matches passengers with relevant ancillary services based on preferences, trip characteristics, and purchase history. Optimizes bundle recommendations.',
    3,
    10,
    6,
    '{"capabilities": ["preference_matching", "bundle_optimization", "price_sensitivity_analysis"], "ancillaries": ["seats", "bags", "meals", "lounge", "wifi", "insurance"]}'::jsonb,
    true
  ),
  (
    'visual_search_agent',
    'Visual Cabin Search Agent',
    'agentic_shopping',
    'Enables passengers to search flights by cabin photos, seat layouts, or amenity visuals. Uses computer vision to match preferences with aircraft configurations.',
    3,
    5,
    2,
    '{"capabilities": ["image_recognition", "visual_similarity", "cabin_matching"], "supported_features": ["seat_maps", "ife_screens", "meal_photos", "lounge_images"]}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- CATEGORY 2: CONTENT SYNDICATION AGENTS (5)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
  (
    'ndc_standardizer',
    'NDC Content Standardization Agent',
    'content_syndication',
    'Transforms airline product content into NDC-compliant format. Validates schema compliance and enriches metadata for AI platforms.',
    4,
    7,
    4,
    '{"capabilities": ["ndc_schema_validation", "content_transformation", "metadata_enrichment"], "standards": ["NDC 21.3", "IATA ONE Order"], "validation_rules": 247}'::jsonb,
    true
  ),
  (
    'aircraft_config_syndicator',
    'Aircraft Configuration Syndication Agent',
    'content_syndication',
    'Publishes detailed aircraft seat maps, IFE, WiFi, and amenity information to all distribution channels. Ensures real-time updates for config changes.',
    3,
    6,
    3,
    '{"capabilities": ["seat_map_generation", "multi_channel_publish", "change_propagation"], "channels": ["GDS", "OTA", "AI_platforms", "mobile_apps"], "update_latency_sec": 30}'::jsonb,
    true
  ),
  (
    'fare_family_metadata_manager',
    'Dynamic Fare Family Metadata Manager',
    'content_syndication',
    'Maintains single source of truth for fare family definitions. Generates AI-optimized descriptions, Schema.org markup, and competitor comparisons.',
    4,
    9,
    5,
    '{"capabilities": ["content_governance", "schema_org_generation", "llm_optimization", "version_control"], "description_variants": 5, "languages": 12}'::jsonb,
    true
  ),
  (
    'amenity_taxonomy_standardizer',
    'Amenity Taxonomy Standardizer',
    'content_syndication',
    'Maintains consistent amenity terminology across all channels. Maps airline-specific terms to industry standards for AI understanding.',
    3,
    4,
    2,
    '{"capabilities": ["taxonomy_mapping", "synonym_management", "multilingual_translation"], "amenity_types": 87, "standard_mappings": 312}'::jsonb,
    true
  ),
  (
    'brand_accuracy_monitor',
    'Brand Accuracy Monitor',
    'content_syndication',
    'Continuously monitors how airline brand and products are represented across OTAs, metasearch, and AI platforms. Flags inaccuracies for correction.',
    3,
    11,
    7,
    '{"capabilities": ["web_scraping", "content_comparison", "anomaly_detection", "alert_generation"], "channels_monitored": 45, "checks_per_hour": 120}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- CATEGORY 3: TRANSACTION EXECUTION AGENTS (5)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
  (
    'booking_orchestrator',
    'Booking Execution Agent',
    'transaction_execution',
    'End-to-end booking orchestration from offer selection through PNR creation. Handles multi-segment itineraries, seat assignments, and SSR requests.',
    5,
    20,
    12,
    '{"capabilities": ["pnr_creation", "ssr_handling", "multi_segment_booking", "error_recovery"], "avg_completion_time_sec": 4.2, "success_rate": 0.983}'::jsonb,
    true
  ),
  (
    'payment_orchestrator',
    'Payment Authorization Agent',
    'transaction_execution',
    'Processes payments across multiple methods (cards, wallets, BNPL, points). Handles split payments, currency conversion, and PCI compliance.',
    5,
    18,
    10,
    '{"capabilities": ["multi_fop", "3ds_authentication", "fraud_check", "currency_conversion"], "payment_methods": ["card", "paypal", "apple_pay", "points", "klarna"], "pci_level": "Level 1"}'::jsonb,
    true
  ),
  (
    'ticketing_agent',
    'E-Ticket Issuance Agent',
    'transaction_execution',
    'Automated e-ticket generation via BSP/ARC connections. Handles ticket repricing, exchanges, refunds, and EMD issuance for ancillaries.',
    4,
    16,
    8,
    '{"capabilities": ["eticket_issuance", "emd_generation", "exchange_processing", "refund_calculation"], "issuance_time_sec": 1.8, "daily_volume": 15000}'::jsonb,
    true
  ),
  (
    'seat_assignment_agent',
    'Intelligent Seat Assignment Agent',
    'transaction_execution',
    'Automatically assigns optimal seats based on passenger preferences, FFP status, and family/group considerations. Handles last-minute changes.',
    4,
    14,
    9,
    '{"capabilities": ["preference_matching", "group_seating", "upgrade_logic", "real_time_availability"], "assignment_accuracy": 0.91, "passenger_satisfaction": 0.88}'::jsonb,
    true
  ),
  (
    'ancillary_purchase_agent',
    'Post-Booking Ancillary Agent',
    'transaction_execution',
    'Enables ancillary purchases after initial booking (bags, meals, seats, lounge, insurance). Integrates with PSS for real-time inventory.',
    3,
    12,
    7,
    '{"capabilities": ["inventory_check", "pricing_calculation", "pnr_update", "receipt_generation"], "avg_response_ms": 320, "ancillaries_supported": 18}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- CATEGORY 4: API GATEWAY AGENTS (4)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
  (
    'api_rate_limiter',
    'API Rate Limiter',
    'api_gateway',
    'Enforces rate limits per consumer, implements token bucket algorithm, and provides quota management. Prevents API abuse and ensures fair resource allocation.',
    3,
    25,
    15,
    '{"capabilities": ["token_bucket", "sliding_window", "quota_management", "burst_allowance"], "requests_per_sec": 10000, "latency_overhead_ms": 2}'::jsonb,
    true
  ),
  (
    'auth_manager',
    'API Authentication Manager',
    'api_gateway',
    'Centralized authentication and authorization for all API endpoints. Supports OAuth2, API keys, mTLS, and JWT tokens. Integrates with identity providers.',
    5,
    22,
    11,
    '{"capabilities": ["oauth2", "api_key", "mtls", "jwt", "saml"], "auth_methods": 5, "token_validation_ms": 12, "mfa_supported": true}'::jsonb,
    true
  ),
  (
    'realtime_inventory_sync',
    'Real-Time Inventory Sync Agent',
    'api_gateway',
    'Synchronizes flight inventory across PSS, NDC, and AI platforms in real-time. Pushes updates via webhooks when availability changes.',
    5,
    19,
    14,
    '{"capabilities": ["change_detection", "webhook_delivery", "retry_logic", "batch_updates"], "update_latency_ms": 150, "webhook_success_rate": 0.994}'::jsonb,
    true
  ),
  (
    'dynamic_pricing_feed',
    'Dynamic Pricing Feed Agent',
    'api_gateway',
    'Publishes real-time fare updates to subscribed platforms. Handles surge pricing, flash sales, and time-sensitive offers with low-latency distribution.',
    4,
    17,
    9,
    '{"capabilities": ["price_streaming", "change_notification", "cache_invalidation"], "price_update_frequency": "10sec", "platforms_subscribed": 23}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- CATEGORY 5: PERSONALIZATION AGENTS (5)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
  (
    'ffp_recognition_agent',
    'FFP Recognition Agent',
    'personalization',
    'Recognizes frequent flyer status across all touchpoints. Retrieves tier benefits in real-time and applies them to offers and services.',
    4,
    16,
    10,
    '{"capabilities": ["status_lookup", "benefit_calculation", "partner_validation", "real_time_sync"], "ffp_programs": 15, "alliance_coverage": ["Star", "Oneworld", "SkyTeam"]}'::jsonb,
    true
  ),
  (
    'status_benefits_eligibility',
    'Status Benefits Eligibility Agent',
    'personalization',
    'Calculates which benefits apply to a given booking based on FFP status, fare class, route, and operational context. Handles complex rules.',
    4,
    13,
    8,
    '{"capabilities": ["rule_engine", "eligibility_calc", "exception_handling"], "benefit_types": ["lounge", "baggage", "upgrades", "boarding", "seats"], "rules_count": 437}'::jsonb,
    true
  ),
  (
    'upgrade_opportunity_agent',
    'Upgrade Opportunity Agent',
    'personalization',
    'Identifies upgrade opportunities (operational, mileage, paid) and proactively offers them at optimal moments. Considers seat availability and passenger willingness to pay.',
    4,
    11,
    6,
    '{"capabilities": ["opportunity_detection", "pricing_optimization", "notification_timing"], "upgrade_types": ["op_up", "mileage", "paid", "bid"], "conversion_rate": 0.18}'::jsonb,
    true
  ),
  (
    'preference_learning_agent',
    'Preference Learning Agent',
    'personalization',
    'Learns passenger preferences from behavior without explicit input. Identifies patterns in seat selection, meal choices, route preferences.',
    3,
    9,
    5,
    '{"capabilities": ["behavioral_analysis", "pattern_recognition", "preference_inference"], "privacy_preserving": true, "consent_required": true, "retention_months": 24}'::jsonb,
    true
  ),
  (
    'privacy_preserving_personalization',
    'Privacy-Preserving Personalization Layer',
    'personalization',
    'Applies personalization while respecting GDPR/CCPA. Implements differential privacy, federated learning, and granular consent management.',
    5,
    8,
    4,
    '{"capabilities": ["differential_privacy", "federated_learning", "consent_management", "data_minimization"], "gdpr_compliant": true, "ccpa_compliant": true, "privacy_budget": "epsilon=1.0"}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- UPDATE AGENT COLLABORATION GRAPH
-- ============================================================================
-- Add key collaborations between new agents and existing ones

INSERT INTO agent_collaborations (source_agent_id, target_agent_id, collaboration_type, strength, bidirectional, metadata)
SELECT
  a1.id, a2.id, collab.type, collab.strength, collab.bidirectional, collab.metadata::jsonb
FROM (VALUES
  -- Shopping agents collaborate with each other
  ('complex_query_parser', 'multi_constraint_search', 'data_feed', 0.9, false, '{"flow": "query -> search"}'),
  ('multi_constraint_search', 'fare_family_recommender', 'data_feed', 0.85, false, '{"flow": "results -> recommendation"}'),
  ('fare_family_recommender', 'ancillary_matcher', 'coordination', 0.8, true, '{"flow": "bundled offers"}'),

  -- Shopping with personalization
  ('ffp_recognition_agent', 'multi_constraint_search', 'context_enrichment', 0.9, false, '{"benefit": "status-based filtering"}'),
  ('ffp_recognition_agent', 'fare_family_recommender', 'context_enrichment', 0.85, false, '{"benefit": "tier-specific offers"}'),
  ('preference_learning_agent', 'ancillary_matcher', 'insights', 0.8, false, '{"learned_preferences": true}'),

  -- Content syndication with shopping
  ('ndc_standardizer', 'multi_constraint_search', 'data_feed', 0.95, false, '{"content": "standardized offers"}'),
  ('fare_family_metadata_manager', 'fare_family_recommender', 'data_feed', 0.9, false, '{"content": "fare descriptions"}'),
  ('aircraft_config_syndicator', 'seat_assignment_agent', 'data_feed', 0.85, false, '{"content": "seat maps"}'),

  -- Transaction execution chain
  ('booking_orchestrator', 'payment_orchestrator', 'orchestration', 0.95, false, '{"sequence": "booking -> payment"}'),
  ('payment_orchestrator', 'ticketing_agent', 'trigger', 0.9, false, '{"on_success": "issue ticket"}'),
  ('booking_orchestrator', 'seat_assignment_agent', 'trigger', 0.85, false, '{"timing": "post-booking"}'),
  ('seat_assignment_agent', 'ancillary_purchase_agent', 'upsell', 0.7, false, '{"context": "seat upsells"}'),

  -- API Gateway supporting all agents
  ('auth_manager', 'booking_orchestrator', 'security', 0.95, false, '{"validates": "all transactions"}'),
  ('api_rate_limiter', 'multi_constraint_search', 'governance', 0.8, false, '{"prevents": "search abuse"}'),
  ('realtime_inventory_sync', 'multi_constraint_search', 'data_feed', 0.9, false, '{"ensures": "fresh inventory"}'),
  ('dynamic_pricing_feed', 'fare_family_recommender', 'data_feed', 0.85, false, '{"provides": "current prices"}'),

  -- Personalization enriching transactions
  ('status_benefits_eligibility', 'booking_orchestrator', 'enrichment', 0.9, false, '{"applies": "tier benefits"}'),
  ('upgrade_opportunity_agent', 'booking_orchestrator', 'upsell', 0.75, false, '{"offers": "upgrades"}'),

  -- Monitoring and fraud detection
  ('fraud_detector', 'payment_orchestrator', 'validation', 0.9, false, '{"prevents": "fraud"}'),
  ('fraud_detector', 'booking_orchestrator', 'alert', 0.85, false, '{"flags": "suspicious patterns"}'),

  -- Brand accuracy monitoring
  ('brand_accuracy_monitor', 'ndc_standardizer', 'feedback', 0.7, true, '{"reports": "content discrepancies"}'),

  -- Existing agents collaborate with new ones
  ('chatbot', 'complex_query_parser', 'orchestration', 0.85, false, '{"translates": "user queries"}'),
  ('chatbot', 'booking_orchestrator', 'orchestration', 0.8, false, '{"executes": "bookings"}'),
  ('dynamic_pricer', 'dynamic_pricing_feed', 'data_feed', 0.95, false, '{"publishes": "price updates"}')
) AS collab(source_code, target_code, type, strength, bidirectional, metadata)
JOIN agents a1 ON a1.code = collab.source_code
JOIN agents a2 ON a2.code = collab.target_code
ON CONFLICT (source_agent_id, target_agent_id, collaboration_type) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- New agents added: 24
-- - Agentic Shopping: 5
-- - Content Syndication: 5
-- - Transaction Execution: 5
-- - API Gateway: 4
-- - Personalization: 5
--
-- Total agents after migration: 36 (12 existing + 24 new)
-- New collaborations: ~25
--
-- Next step: Create workflow definitions (migration 005)

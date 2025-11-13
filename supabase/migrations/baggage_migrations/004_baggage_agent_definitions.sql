/*
  Migration 004: Baggage Agent Definitions

  Purpose: Define the 8 core baggage operation agents

  Agents:
  1. BAG_INTAKE_001 - Bag Intake & Tagging Agent
  2. LOAD_PLAN_001 - Load Planning & Optimization Agent
  3. BAG_TRACK_001 - Real-Time Tracking Agent
  4. CONN_RISK_001 - Transfer Connection Risk Agent
  5. BAG_EXCEPT_001 - Exception Management Agent
  6. LNF_MATCH_001 - Lost & Found Matching Agent
  7. COMP_AUTO_001 - Compensation Automation Agent
  8. INTER_COORD_001 - Interline Coordination Agent

  Plus 10 supporting agents for specialized functions

  Dependencies: Migration 002 (agent categories), existing agents table
*/

-- ============================================================================
-- CORE AGENT 1: Bag Intake & Tagging
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('BAG_INTAKE_001',
 'Bag Intake & Tagging Agent',
 'BAG_IN',
 'Validates passenger eligibility (ticket validity, FFP status, fare rules), generates IATA-compliant 10-digit bag tags, records bag characteristics (weight, dimensions, description), assigns special handling codes, creates routing tags for multi-leg journeys with connection airports.',
 4, -- High autonomy, can make tagging decisions
 0,
 5,
 '{
   "capabilities": [
     "eligibility_validation",
     "iata_tag_generation",
     "weight_dimension_recording",
     "special_handling_assignment",
     "routing_tag_creation",
     "excess_baggage_calculation",
     "ffp_allowance_lookup"
   ],
   "integrations": ["DCS", "PSS", "Scale_Systems", "RFID_Printers", "FFP_Database"],
   "performance": {
     "avg_processing_time_seconds": 15,
     "success_rate": 0.998,
     "tags_generated_per_day": 50000
   },
   "decision_rules": {
     "auto_accept_within_allowance": true,
     "auto_flag_overweight": true,
     "auto_assign_rush_tags": true
   },
   "training_data": {
     "fare_rules": "all_branded_fares_2024",
     "special_handling": "iata_resolution_780",
     "ffp_policies": "star_alliance_plus_copa"
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  autonomy_level = EXCLUDED.autonomy_level,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 2: Load Planning & Optimization
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('LOAD_PLAN_001',
 'Load Planning & Optimization Agent',
 'LOAD',
 'Calculates aircraft weight & balance per FAA/EASA regulations, optimizes container/cart loading sequences for efficiency, prioritizes time-sensitive connection bags, coordinates with ramp operations, generates alerts for overweight/unbalanced situations requiring captain approval.',
 4,
 0,
 3,
 '{
   "capabilities": [
     "weight_balance_calculation",
     "container_optimization",
     "priority_bag_routing",
     "load_sequence_generation",
     "overweight_detection",
     "center_of_gravity_monitoring",
     "fuel_burn_optimization"
   ],
   "integrations": ["WB_System", "LMS", "Flight_Ops", "Ramp_Control", "Ground_Handling"],
   "performance": {
     "avg_optimization_time_seconds": 30,
     "load_efficiency_improvement_pct": 12,
     "cg_violations_prevented_per_month": 15
   },
   "decision_rules": {
     "max_cg_deviation_pct": 2.0,
     "priority_connection_threshold_minutes": 45,
     "alert_captain_if_overweight_kg": 50
   },
   "aircraft_types_supported": ["737-800", "737 MAX 9", "737-700", "A320", "A321"],
   "optimization_algorithm": "genetic_algorithm_v2.1"
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 3: Real-Time Tracking
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('BAG_TRACK_001',
 'Real-Time Tracking Agent',
 'TRACK',
 'Monitors all scan events (check-in, TSA, makeup, loading, arrival, claim), detects missing scans indicating exceptions, tracks interline transfers across airlines, sends real-time updates to passengers via mobile app/SMS, integrates with WorldTracer and SITA Bag Message for global visibility.',
 5, -- Fully autonomous monitoring
 0,
 10,
 '{
   "capabilities": [
     "scan_event_monitoring",
     "gap_detection",
     "missing_scan_alerts",
     "passenger_notification",
     "worldtracer_integration",
     "sita_bag_message_processing",
     "interline_tracking",
     "predictive_eta_calculation"
   ],
   "integrations": ["BRS", "SITA", "WorldTracer", "Mobile_App", "SMS_Gateway", "Email_Service"],
   "performance": {
     "events_processed_per_day": 5000000,
     "avg_notification_delay_seconds": 3,
     "gap_detection_accuracy": 0.97,
     "passenger_satisfaction_score": 4.6
   },
   "notification_rules": {
     "send_on_loaded": true,
     "send_on_arrived": true,
     "send_on_claim_ready": true,
     "send_on_exception": true,
     "send_on_delivery": true
   },
   "gap_thresholds": {
     "expected_scan_interval_minutes": 30,
     "alert_after_missing_scans": 2,
     "critical_after_missing_hours": 4
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 4: Transfer Connection Risk
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('CONN_RISK_001',
 'Transfer Connection Risk Agent',
 'RISK',
 'Calculates connection risk score using ML model trained on historical data, identifies at-risk bags before departure (MCT violations, flight delays, terminal changes), triggers proactive interventions (expedite, offload, reroute, notify passenger), predicts mishandling probability per connection.',
 4,
 0,
 5,
 '{
   "capabilities": [
     "ml_risk_scoring",
     "mct_violation_detection",
     "real_time_flight_monitoring",
     "proactive_intervention",
     "mishandling_prediction",
     "connection_optimization",
     "partner_coordination"
   ],
   "integrations": ["Flight_Ops", "Ground_Handling", "Weather_Data", "Airport_Systems", "ML_Model_API"],
   "performance": {
     "risk_assessments_per_day": 150000,
     "prediction_accuracy_auc": 0.89,
     "false_positive_rate": 0.08,
     "interventions_triggered_per_day": 1200,
     "misconnection_reduction_pct": 35
   },
   "ml_model": {
     "model_name": "connection_risk_predictor",
     "model_version": "v2.1",
     "features": [
       "mct_minutes", "scheduled_connection_time", "terminal_change",
       "interline_flag", "inbound_delay_prob", "weather_impact",
       "historical_success_rate", "bag_count", "time_of_day"
     ],
     "output": {"risk_score": "0-1", "risk_level": "LOW|MEDIUM|HIGH|CRITICAL"},
     "retrain_frequency": "weekly",
     "training_data_size": 500000
   },
   "intervention_thresholds": {
     "expedite_if_risk_gt": 0.70,
     "offload_if_risk_gt": 0.90,
     "notify_passenger_if_risk_gt": 0.80
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 5: Exception Management
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('BAG_EXCEPT_001',
 'Exception Management Agent',
 'EXCEPT',
 'Detects baggage anomalies in real-time (scan gaps, late arrivals, damage reports), auto-classifies exception types (delayed, lost, damaged, pilfered, misdirected), routes to appropriate resolution workflows, generates WorldTracer PIR, escalates based on severity and passenger tier.',
 4,
 0,
 8,
 '{
   "capabilities": [
     "anomaly_detection",
     "auto_classification",
     "severity_assessment",
     "workflow_routing",
     "pir_generation",
     "escalation_management",
     "root_cause_analysis",
     "sla_tracking"
   ],
   "integrations": ["WorldTracer", "CRM", "Ground_Handling", "Partner_Airlines", "Notification_Service"],
   "performance": {
     "exceptions_detected_per_day": 500,
     "classification_accuracy": 0.94,
     "avg_detection_latency_seconds": 120,
     "auto_resolution_rate": 0.62,
     "avg_resolution_time_hours": 18
   },
   "classification_rules": {
     "DELAYED": "bag_not_on_flight_but_located",
     "LOST": "no_scan_for_48_hours",
     "DAMAGED": "damage_report_filed",
     "PILFERED": "tamper_evident_broken",
     "MISDIRECTED": "scanned_at_wrong_airport"
   },
   "escalation_rules": {
     "high_tier_passenger": "immediate",
     "lost_gt_24_hours": "manager",
     "claim_value_gt_usd": 1000,
     "partner_airline": "interline_coordinator"
   },
   "resolution_workflows": {
     "DELAYED": "locate_and_expedite",
     "LOST": "investigation_and_worldtracer",
     "DAMAGED": "assessment_and_claim",
     "PILFERED": "security_investigation"
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 6: Lost & Found Matching
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('LNF_MATCH_001',
 'Lost & Found Matching Agent',
 'LNF',
 'Performs image recognition on found bags using ResNet50-based deep learning model, semantic description matching using NLP embeddings, location correlation analysis (last scan, flight route), passenger characteristic matching (travel patterns, FFP data), automated reunion scheduling with delivery options.',
 4,
 0,
 3,
 '{
   "capabilities": [
     "image_recognition",
     "semantic_description_matching",
     "location_correlation",
     "passenger_pattern_matching",
     "similarity_scoring",
     "automated_reunion",
     "delivery_scheduling"
   ],
   "integrations": ["Computer_Vision_API", "Lost_Found_DB", "Passenger_App", "Delivery_Service", "WorldTracer"],
   "performance": {
     "match_requests_per_day": 100,
     "top1_match_accuracy": 0.82,
     "top5_match_accuracy": 0.94,
     "avg_match_time_seconds": 5,
     "automated_reunion_rate": 0.76
   },
   "ml_models": {
     "image_model": {
       "name": "lost_found_image_matcher",
       "version": "v1.3",
       "framework": "tensorflow",
       "backbone": "ResNet50",
       "accuracy": 0.92,
       "inference_time_ms": 120
     },
     "text_model": {
       "name": "description_embedder",
       "version": "v2.0",
       "framework": "pytorch",
       "model_type": "sentence_transformer",
       "embedding_dim": 768
     }
   },
   "matching_features": [
     "bag_color", "bag_brand", "bag_size", "distinctive_marks",
     "last_location", "flight_route", "passenger_tier", "travel_pattern"
   ],
   "confidence_thresholds": {
     "auto_notify_passenger_if_gt": 0.85,
     "human_review_if_between": [0.60, 0.85],
     "reject_if_lt": 0.60
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 7: Compensation Automation
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('COMP_AUTO_001',
 'Compensation Automation Agent',
 'COMP',
 'Determines applicable liability jurisdiction (Montreal Convention, EU261, DOT, airline policy), calculates compensation amounts with depreciation, validates supporting documentation (receipts, photos, police reports), authorizes payment within approval limits, tracks claim lifecycle from filing to settlement.',
 3, -- Moderate autonomy, requires approval for large claims
 0,
 4,
 '{
   "capabilities": [
     "jurisdiction_determination",
     "liability_calculation",
     "depreciation_application",
     "document_validation",
     "fraud_detection",
     "payment_authorization",
     "claim_lifecycle_tracking",
     "appeal_processing"
   ],
   "integrations": ["Finance_System", "Legal_DB", "Document_Management", "Payment_Gateway", "Compliance_System"],
   "performance": {
     "claims_processed_per_day": 300,
     "auto_approval_rate": 0.68,
     "avg_processing_time_hours": 48,
     "payment_accuracy": 0.998,
     "fraud_detection_rate": 0.03
   },
   "jurisdiction_rules": {
     "international_flights": "MONTREAL_CONVENTION",
     "eu_departures": "EU261_OVERLAY",
     "us_domestic": "DOT_USA",
     "catchall": "AIRLINE_POLICY"
   },
   "auto_approval_limits": {
     "delayed_under_usd": 100,
     "damaged_under_usd": 200,
     "lost_under_usd": 500
   },
   "depreciation_rates": {
     "electronics": 0.20,
     "clothing": 0.50,
     "luggage": 0.30,
     "cosmetics": 1.0
   },
   "excluded_items": [
     "jewelry", "cash", "securities", "business_documents",
     "negotiable_papers", "works_of_art", "perishable_goods"
   ],
   "fraud_indicators": [
     "excessive_claim_value",
     "no_receipts",
     "multiple_claims_same_passenger",
     "inconsistent_description"
   ]
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- CORE AGENT 8: Interline Coordination
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES

('INTER_COORD_001',
 'Interline Coordination Agent',
 'INTER',
 'Manages partner airline baggage handoffs for codeshare/interline/alliance flights, translates and processes SITA Type B messages (BPM, BTM, BSM, BNS, CPM), coordinates cross-carrier recovery for exceptions, tracks SLA compliance with partners, manages liability transfers and chargebacks.',
 4,
 0,
 6,
 '{
   "capabilities": [
     "sita_message_translation",
     "partner_handoff_coordination",
     "cross_carrier_exception_mgmt",
     "sla_tracking",
     "liability_transfer",
     "cost_allocation",
     "worldtracer_partner_filing"
   ],
   "integrations": ["SITA_Type_B", "WorldTracer", "Partner_APIs", "Alliance_Systems", "Billing_System"],
   "performance": {
     "messages_processed_per_day": 200000,
     "partner_handoffs_per_day": 15000,
     "sla_compliance_rate": 0.94,
     "interline_exception_resolution_hours": 36,
     "liability_disputes_per_month": 12
   },
   "sita_message_types": {
     "BPM": "Baggage Processed Message",
     "BTM": "Baggage Transfer Message",
     "BSM": "Baggage Source Message",
     "BNS": "Baggage Not Seen Message",
     "CPM": "Custody Processed Message"
   },
   "partner_networks": {
     "star_alliance": ["UA", "LH", "AC", "NH", "TK", "SQ", "AV"],
     "oneworld": ["AA", "BA", "QF", "JL", "IB"],
     "skyteam": ["DL", "AF", "KL", "AM"],
     "bilateral": ["CM", "LA", "G3"]
   },
   "sla_standards": {
     "transfer_notification_minutes": 15,
     "exception_response_minutes": 60,
     "recovery_coordination_hours": 24
   },
   "liability_rules": {
     "issuing_carrier_liable": "default",
     "operating_carrier_liable": "if_damage_during_carriage",
     "connecting_carrier_liable": "if_misconnection"
   }
 }'::jsonb,
 true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- SUPPORTING AGENTS (10 additional specialized agents)
-- ============================================================================

-- Supporting Agent 1: TSA Coordination
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('TSA_COORD_001', 'TSA Screening Coordination Agent', 'TRACK',
 'Coordinates with TSA for security screening, tracks bags flagged for additional screening, manages re-screening workflows, updates passengers on screening delays.',
 3, 0, 2,
 '{"capabilities": ["tsa_coordination", "screening_delay_alerts", "re_screen_tracking"], "integrations": ["TSA_Systems", "Passenger_App"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 2: Delivery Scheduling
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('DELIVERY_SCHED_001', 'Delivery Scheduling & Logistics Agent', 'EXCEPT',
 'Schedules delayed bag deliveries to passenger addresses, optimizes delivery routes, coordinates with courier services, provides real-time delivery tracking.',
 4, 0, 3,
 '{"capabilities": ["delivery_scheduling", "route_optimization", "courier_coordination", "tracking"], "integrations": ["Delivery_Service", "Mapping_API", "SMS_Gateway"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 3: Damage Assessment
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('DAMAGE_ASSESS_001', 'Damage Assessment Agent', 'EXCEPT',
 'Assesses bag damage severity using photos and descriptions, determines repairability, estimates repair costs, classifies damage types (structural, cosmetic, contents).',
 3, 0, 2,
 '{"capabilities": ["damage_classification", "cost_estimation", "repairability_assessment"], "integrations": ["Computer_Vision_API", "Repair_Vendors"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 4: Passenger Communication
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('PASSENGER_COMM_001', 'Passenger Communication Agent', 'TRACK',
 'Sends personalized notifications via SMS, email, mobile app push, handles passenger inquiries, provides self-service tracking links.',
 5, 0, 5,
 '{"capabilities": ["multi_channel_notification", "self_service_links", "inquiry_handling"], "integrations": ["SMS_Gateway", "Email_Service", "Mobile_App", "Chatbot"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 5: Special Handling Coordinator
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('SPECIAL_HANDLE_001', 'Special Handling Coordinator Agent', 'BAG_IN',
 'Manages special handling requests (live animals, fragile items, medical equipment, sports equipment), ensures compliance with IATA regulations, coordinates with specialized handlers.',
 4, 0, 2,
 '{"capabilities": ["special_handling", "iata_compliance", "handler_coordination"], "integrations": ["Ground_Handling", "Regulatory_DB"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 6: Rush Tag Manager
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('RUSH_TAG_MGR_001', 'Rush Tag Manager Agent', 'LOAD',
 'Issues rush/priority tags for tight connections, coordinates expedited transfer, tracks rush bag progress, alerts ground handlers.',
 5, 0, 2,
 '{"capabilities": ["rush_tag_issuance", "expedited_transfer", "handler_alerts"], "integrations": ["Ground_Handling", "Ramp_Control"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 7: Claim Documentation Validator
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('DOC_VALIDATOR_001', 'Claim Documentation Validator Agent', 'COMP',
 'Validates claim supporting documents (receipts, photos, declarations), checks for fraud indicators, verifies authenticity, extracts structured data.',
 3, 0, 2,
 '{"capabilities": ["document_validation", "fraud_detection", "ocr_extraction"], "integrations": ["Document_Management", "OCR_API", "Fraud_Detection"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 8: Cost Allocation Manager
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('COST_ALLOC_001', 'Cost Allocation Manager Agent', 'INTER',
 'Manages cost allocation for interline exceptions, calculates chargebacks to responsible carriers, processes invoices, tracks settlements.',
 4, 0, 2,
 '{"capabilities": ["cost_allocation", "chargeback_calculation", "invoice_processing"], "integrations": ["Billing_System", "Finance_System", "Partner_APIs"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 9: Performance Analytics
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('PERF_ANALYTICS_001', 'Performance Analytics Agent', 'RISK',
 'Analyzes baggage performance metrics, identifies trends and patterns, generates insights for improvement, creates executive dashboards.',
 3, 0, 1,
 '{"capabilities": ["metrics_analysis", "trend_identification", "dashboard_generation"], "integrations": ["Analytics_Platform", "BI_Tools"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Supporting Agent 10: Root Cause Analyzer
INSERT INTO agents (code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active) VALUES
('ROOT_CAUSE_001', 'Root Cause Analysis Agent', 'EXCEPT',
 'Performs automated root cause analysis on recurring exceptions, identifies systemic issues, recommends process improvements.',
 3, 0, 1,
 '{"capabilities": ["root_cause_analysis", "pattern_recognition", "improvement_recommendations"], "integrations": ["Analytics_Platform", "Process_DB"]}'::jsonb,
 true)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_agent_count INTEGER;
  v_baggage_agent_count INTEGER;
BEGIN
  -- Count all agents
  SELECT COUNT(*) INTO v_agent_count FROM agents;

  -- Count baggage agents
  SELECT COUNT(*) INTO v_baggage_agent_count
  FROM agents
  WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 004 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Baggage agents created: %', v_baggage_agent_count;
  RAISE NOTICE 'Total agents in system: %', v_agent_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Core Agents (8):';
  RAISE NOTICE '  1. ✓ BAG_INTAKE_001 - Bag Intake & Tagging';
  RAISE NOTICE '  2. ✓ LOAD_PLAN_001 - Load Planning & Optimization';
  RAISE NOTICE '  3. ✓ BAG_TRACK_001 - Real-Time Tracking';
  RAISE NOTICE '  4. ✓ CONN_RISK_001 - Transfer Connection Risk';
  RAISE NOTICE '  5. ✓ BAG_EXCEPT_001 - Exception Management';
  RAISE NOTICE '  6. ✓ LNF_MATCH_001 - Lost & Found Matching';
  RAISE NOTICE '  7. ✓ COMP_AUTO_001 - Compensation Automation';
  RAISE NOTICE '  8. ✓ INTER_COORD_001 - Interline Coordination';
  RAISE NOTICE '';
  RAISE NOTICE 'Supporting Agents (10):';
  RAISE NOTICE '  • TSA Coordination';
  RAISE NOTICE '  • Delivery Scheduling';
  RAISE NOTICE '  • Damage Assessment';
  RAISE NOTICE '  • Passenger Communication';
  RAISE NOTICE '  • Special Handling';
  RAISE NOTICE '  • Rush Tag Management';
  RAISE NOTICE '  • Documentation Validation';
  RAISE NOTICE '  • Cost Allocation';
  RAISE NOTICE '  • Performance Analytics';
  RAISE NOTICE '  • Root Cause Analysis';
  RAISE NOTICE '';
  RAISE NOTICE 'Agent Capabilities Summary:';
  RAISE NOTICE '  • IATA-compliant tag generation';
  RAISE NOTICE '  • ML-powered risk prediction (AUC: 0.89)';
  RAISE NOTICE '  • Real-time tracking (5M events/day)';
  RAISE NOTICE '  • Image recognition matching (92%% accuracy)';
  RAISE NOTICE '  • Automated compensation (68%% auto-approval)';
  RAISE NOTICE '  • SITA message processing (200K/day)';
  RAISE NOTICE '  • WorldTracer integration';
  RAISE NOTICE '  • 35%% misconnection reduction';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run migration 005 (Baggage Workflow Definitions)';
  RAISE NOTICE '========================================';
END $$;

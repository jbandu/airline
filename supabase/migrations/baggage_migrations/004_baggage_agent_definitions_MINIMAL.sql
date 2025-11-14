/*
  Migration 004: Baggage Agent Definitions (Simplified)

  Purpose: Define 18 AI agents (8 core + 10 supporting)

  Core Agents:
  - BAG_INTAKE_001, LOAD_PLAN_001, BAG_TRACK_001, CONN_RISK_001
  - BAG_EXCEPT_001, LNF_MATCH_001, COMP_AUTO_001, INTER_COORD_001

  Supporting Agents:
  - TSA_COORD_001, DELIVERY_SCHED_001, DAMAGE_ASSESS_001
  - PASSENGER_COMM_001, SPECIAL_HANDLE_001, RUSH_TAG_MGR_001
  - DOC_VALIDATOR_001, COST_ALLOC_001, PERF_ANALYTICS_001, ROOT_CAUSE_001
*/

-- ============================================================================
-- CORE AGENTS (8)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, metadata, active) VALUES

-- Agent 1: Baggage Intake & Tagging
('BAG_INTAKE_001', 'Bag Intake & Tagging Agent', 'BAG_IN',
  'Validates passenger eligibility, generates IATA-compliant 10-digit bag tags, records weight/dimensions, assigns special handling codes, creates routing tags for multi-leg journeys.',
  4, -- High autonomy
  '{"capabilities": ["eligibility_validation", "iata_tag_generation", "weight_dimension_recording", "special_handling_assignment"], "performance": {"avg_processing_time_seconds": 15, "success_rate": 0.998, "tags_generated_per_day": 50000}}'::jsonb,
  true),

-- Agent 2: Load Planning
('LOAD_PLAN_001', 'Load Planning Agent', 'LOAD',
  'Optimizes aircraft load planning with weight & balance calculations, container/cart loading sequences, connection prioritization, and CG monitoring per FAA/EASA regulations.',
  4,
  '{"capabilities": ["weight_balance_calc", "container_optimization", "cg_monitoring", "connection_priority"], "performance": {"flights_planned_per_day": 200, "cg_compliance_rate": 1.0, "fuel_savings_pct": 3.5}}'::jsonb,
  true),

-- Agent 3: Real-Time Tracking
('BAG_TRACK_001', 'Real-Time Tracking Agent', 'TRACK',
  'Monitors all scan events, detects missing scans, sends real-time passenger notifications, and provides end-to-end visibility across baggage journey.',
  5, -- Fully autonomous
  '{"capabilities": ["scan_event_monitoring", "gap_detection", "passenger_notification"], "performance": {"events_processed_per_day": 5000000, "avg_notification_delay_seconds": 3, "gap_detection_accuracy": 0.97}}'::jsonb,
  true),

-- Agent 4: Connection Risk
('CONN_RISK_001', 'Transfer Connection Risk Agent', 'RISK',
  'Calculates connection risk score using ML model (AUC 0.89), detects MCT violations, recommends interventions for high-risk connections (>0.70 score).',
  4,
  '{"ml_model": {"model_name": "connection_risk_predictor", "model_version": "v2.1", "features": ["mct_minutes", "scheduled_connection_time", "terminal_change", "interline_flag", "weather_impact"], "prediction_accuracy_auc": 0.89}, "performance": {"risk_assessments_per_day": 150000, "misconnection_reduction_pct": 35}}'::jsonb,
  true),

-- Agent 5: Exception Management
('BAG_EXCEPT_001', 'Exception Management Agent', 'EXCEPT',
  'Detects and classifies exceptions (delayed/lost/damaged/pilfered), files WorldTracer PIRs, optimizes recovery routing, coordinates passenger communication and delivery.',
  4,
  '{"capabilities": ["exception_detection", "worldtracer_pir_filing", "recovery_routing", "delivery_coordination"], "performance": {"exceptions_handled_per_day": 5000, "same_day_recovery_rate": 0.85, "avg_resolution_time_hours": 18}}'::jsonb,
  true),

-- Agent 6: Lost & Found Matching
('LNF_MATCH_001', 'Lost & Found Matching Agent', 'LNF',
  'Performs image recognition on found bags using ResNet50 model (92% accuracy), semantic description matching, and passenger reunion workflows.',
  4,
  '{"ml_models": {"image_model": {"name": "lost_found_image_matcher", "framework": "tensorflow", "backbone": "ResNet50", "accuracy": 0.92}, "text_model": {"name": "description_embedder", "framework": "pytorch", "model_type": "sentence_transformer"}}, "performance": {"top1_match_accuracy": 0.82, "top5_match_accuracy": 0.94}}'::jsonb,
  true),

-- Agent 7: Compensation Automation
('COMP_AUTO_001', 'Compensation Automation Agent', 'COMP',
  'Processes claims with Montreal Convention compliance ($1,700 max), determines jurisdiction (Montreal/EU261/DOT), calculates depreciation, detects fraud, automates settlements.',
  4,
  '{"capabilities": ["jurisdiction_determination", "depreciation_calculation", "fraud_detection", "settlement_automation"], "performance": {"claims_processed_per_day": 2000, "auto_approval_rate": 0.45, "avg_processing_hours": 12, "fraud_detection_accuracy": 0.88}}'::jsonb,
  true),

-- Agent 8: Interline Coordination
('INTER_COORD_001', 'Interline Coordination Agent', 'INTER',
  'Manages partner airline baggage handoffs, translates SITA Type B messages (BPM, BTM, BSM), tracks SLA compliance (15min/60min/24hr), processes cost allocation/chargebacks.',
  4,
  '{"sita_message_types": {"BPM": "Baggage Processed Message", "BTM": "Baggage Transfer Message", "BSM": "Baggage Source Message"}, "partner_networks": {"star_alliance": ["UA", "LH", "AC"], "oneworld": ["AA", "BA", "QF"]}, "performance": {"messages_processed_per_day": 200000, "sla_compliance_rate": 0.94}}'::jsonb,
  true);

-- ============================================================================
-- SUPPORTING AGENTS (10)
-- ============================================================================

INSERT INTO agents (code, name, category_code, description, autonomy_level, metadata, active) VALUES

-- Supporting Agent 1: TSA Coordination
('TSA_COORD_001', 'TSA Screening Coordination Agent', 'TRACK',
  'Tracks bags through TSA screening, detects holds, notifies passengers, recalculates connection risk for delayed bags, coordinates re-screening.',
  3,
  '{"capabilities": ["screening_tracking", "hold_detection", "passenger_notification", "risk_recalculation"], "performance": {"bags_tracked_per_day": 100000, "avg_screening_time_minutes": 7}}'::jsonb,
  true),

-- Supporting Agent 2: Delivery Scheduling
('DELIVERY_SCHED_001', 'Delivery Scheduling & Logistics Agent', 'EXCEPT',
  'Schedules last-mile delivery for delayed/lost bags, coordinates courier services, optimizes routing, confirms delivery with passengers.',
  3,
  '{"capabilities": ["delivery_scheduling", "courier_coordination", "route_optimization"], "performance": {"deliveries_per_day": 3000, "on_time_delivery_rate": 0.92}}'::jsonb,
  true),

-- Supporting Agent 3: Damage Assessment
('DAMAGE_ASSESS_001', 'Damage Assessment Agent', 'EXCEPT',
  'Assesses bag damage with photo documentation, determines liability (carrier vs passenger vs manufacturer), calculates repair/replacement costs with depreciation.',
  3,
  '{"capabilities": ["damage_classification", "liability_determination", "cost_calculation"], "performance": {"assessments_per_day": 1000, "avg_assessment_time_minutes": 15}}'::jsonb,
  true),

-- Supporting Agent 4: Passenger Communication
('PASSENGER_COMM_001', 'Passenger Communication Agent', 'TRACK',
  'Sends proactive notifications (app/SMS/email) for bag status updates, delivery scheduling, claim processing, and exception resolution.',
  5,
  '{"capabilities": ["multi_channel_notification", "real_time_updates", "personalization"], "performance": {"notifications_per_day": 500000, "delivery_rate": 0.98, "avg_satisfaction_score": 4.3}}'::jsonb,
  true),

-- Supporting Agent 5: Special Handling Coordinator
('SPECIAL_HANDLE_001', 'Special Handling Coordinator Agent', 'BAG_IN',
  'Manages IATA Resolution 780 special handling codes (FRAG, RUSH, HEAVY, PET, BIKE, GOLF, SKI, HAZMAT), ensures proper loading/storage, coordinates ground handlers.',
  3,
  '{"iata_codes": ["FRAG", "RUSH", "HEAVY", "PET", "BIKE", "GOLF", "SKI", "HAZMAT", "DRY_ICE"], "performance": {"special_bags_per_day": 15000, "handling_compliance_rate": 0.95}}'::jsonb,
  true),

-- Supporting Agent 6: Rush Tag Manager
('RUSH_TAG_MGR_001', 'Rush Tag Manager Agent', 'RISK',
  'Identifies bags requiring rush tags (<60 min connection), alerts ramp crew, prioritizes offload/transfer, tracks success rate.',
  4,
  '{"capabilities": ["rush_tag_identification", "priority_alerts", "success_tracking"], "performance": {"rush_bags_per_day": 8000, "connection_save_rate": 0.87}}'::jsonb,
  true),

-- Supporting Agent 7: Documentation Validator
('DOC_VALIDATOR_001', 'Claim Documentation Validator Agent', 'COMP',
  'Validates claim documentation (receipts, photos, declarations), checks for completeness, requests missing items, detects fraudulent documents.',
  3,
  '{"capabilities": ["document_validation", "completeness_check", "fraud_detection"], "performance": {"docs_validated_per_day": 5000, "fraud_detection_rate": 0.12}}'::jsonb,
  true),

-- Supporting Agent 8: Cost Allocation
('COST_ALLOC_001', 'Cost Allocation Manager Agent', 'INTER',
  'Allocates mishandling costs to responsible parties (origin/transfer/destination carrier), calculates chargebacks per IATA rules, processes reconciliation.',
  3,
  '{"capabilities": ["cost_allocation", "chargeback_calculation", "reconciliation"], "performance": {"allocations_per_day": 2000, "dispute_rate": 0.08}}'::jsonb,
  true),

-- Supporting Agent 9: Performance Analytics
('PERF_ANALYTICS_001', 'Performance Analytics Agent', 'RISK',
  'Calculates daily KPIs (mishandling rate, connection success, claim time), generates scorecards, identifies trends, alerts on anomalies.',
  4,
  '{"kpis": ["mishandling_rate_per_1000", "connection_success_rate", "avg_claim_time_hours", "nps_score"], "performance": {"metrics_calculated_daily": 500, "trend_detection_accuracy": 0.91}}'::jsonb,
  true),

-- Supporting Agent 10: Root Cause Analysis
('ROOT_CAUSE_001', 'Root Cause Analysis Agent', 'RISK',
  'Analyzes exception patterns, identifies systemic issues, recommends process improvements, tracks implementation of corrective actions.',
  3,
  '{"capabilities": ["pattern_analysis", "systemic_issue_detection", "recommendation_generation"], "performance": {"analyses_per_week": 50, "recommendation_acceptance_rate": 0.75}}'::jsonb,
  true);

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_agent_count INTEGER;
  v_core_count INTEGER;
  v_support_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_agent_count
  FROM agents
  WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');

  SELECT COUNT(*) INTO v_core_count
  FROM agents
  WHERE code IN ('BAG_INTAKE_001', 'LOAD_PLAN_001', 'BAG_TRACK_001', 'CONN_RISK_001',
                 'BAG_EXCEPT_001', 'LNF_MATCH_001', 'COMP_AUTO_001', 'INTER_COORD_001');

  v_support_count := v_agent_count - v_core_count;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION 004 COMPLETE';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Total agents created: %', v_agent_count;
  RAISE NOTICE '  • Core agents: %', v_core_count;
  RAISE NOTICE '  • Supporting agents: %', v_support_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Core Agents:';
  RAISE NOTICE '  1. BAG_INTAKE_001 - Bag Intake & Tagging';
  RAISE NOTICE '  2. LOAD_PLAN_001 - Load Planning';
  RAISE NOTICE '  3. BAG_TRACK_001 - Real-Time Tracking';
  RAISE NOTICE '  4. CONN_RISK_001 - Connection Risk';
  RAISE NOTICE '  5. BAG_EXCEPT_001 - Exception Management';
  RAISE NOTICE '  6. LNF_MATCH_001 - Lost & Found Matching';
  RAISE NOTICE '  7. COMP_AUTO_001 - Compensation Automation';
  RAISE NOTICE '  8. INTER_COORD_001 - Interline Coordination';
  RAISE NOTICE '';
  RAISE NOTICE 'Autonomy levels: 3-5 (moderate to full automation)';
  RAISE NOTICE '';
  RAISE NOTICE '➡️  Next: Run migration 005 (Workflow Definitions)';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

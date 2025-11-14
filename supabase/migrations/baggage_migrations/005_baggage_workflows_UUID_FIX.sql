/*
  Migration 005: Baggage Workflow Definitions (UUID Fix)

  PURPOSE: Create 30 workflows for baggage domains

  TYPE MISMATCH FIX:
  - Baggage migrations created BIGINT subdomains (migration 001)
  - But workflows table expects UUID subdomain_id
  - Solution: Insert baggage domains/subdomains with UUIDs first, THEN create workflows

  This migration:
  1. Inserts baggage domains into UUID-based domains table
  2. Inserts baggage subdomains into UUID-based subdomains table
  3. Creates workflows linked to those UUID subdomains
*/

DO $$
DECLARE
  -- Domain IDs (will be UUIDs)
  v_domain_ops UUID;
  v_domain_except UUID;
  v_domain_interline UUID;
  v_domain_comp UUID;
  v_domain_analytics UUID;

  -- Domain 1 subdomain IDs
  v_sd_checkin UUID;
  v_sd_load UUID;
  v_sd_tracking UUID;
  v_sd_arrival UUID;

  -- Domain 2 subdomain IDs
  v_sd_detection UUID;
  v_sd_delayed UUID;
  v_sd_lost UUID;
  v_sd_damage UUID;

  -- Domain 3 subdomain IDs
  v_sd_handoff UUID;
  v_sd_alliance UUID;
  v_sd_interline_except UUID;

  -- Domain 4 subdomain IDs
  v_sd_liability UUID;
  v_sd_claims UUID;
  v_sd_settlement UUID;

  -- Domain 5 subdomain IDs
  v_sd_performance UUID;
  v_sd_predictive UUID;
  v_sd_cost_analysis UUID;
BEGIN

  -- ============================================================================
  -- STEP 1: Create or get baggage domains (UUID-based)
  -- ============================================================================

  -- Domain 1: Baggage Operations & Tracking
  INSERT INTO domains (name, description, icon_url)
  VALUES (
    'Baggage Operations & Tracking',
    'End-to-end baggage lifecycle management from check-in to claim delivery',
    NULL
  )
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_domain_ops;

  -- Domain 2: Baggage Exception Management
  INSERT INTO domains (name, description, icon_url)
  VALUES (
    'Baggage Exception Management',
    'Detection, recovery, and resolution of baggage exceptions (delayed/lost/damaged)',
    NULL
  )
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_domain_except;

  -- Domain 3: Interline Baggage Coordination
  INSERT INTO domains (name, description, icon_url)
  VALUES (
    'Interline Baggage Coordination',
    'Partner airline baggage handoffs and SITA Type B messaging',
    NULL
  )
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_domain_interline;

  -- Domain 4: Baggage Compensation & Claims
  INSERT INTO domains (name, description, icon_url)
  VALUES (
    'Baggage Compensation & Claims',
    'Automated claims processing with Montreal Convention and EU261 compliance',
    NULL
  )
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_domain_comp;

  -- Domain 5: Baggage Analytics & Optimization
  INSERT INTO domains (name, description, icon_url)
  VALUES (
    'Baggage Analytics & Optimization',
    'Performance monitoring, predictive analytics, and cost optimization',
    NULL
  )
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_domain_analytics;

  -- ============================================================================
  -- STEP 2: Create subdomains (UUID-based)
  -- ============================================================================

  -- Domain 1 subdomains
  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_ops, 'Check-In & Tagging Operations', 'Passenger eligibility, IATA bag tag generation, weight/dimension capture')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_checkin;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_ops, 'Load Planning & Optimization', 'Aircraft load planning, weight & balance, container optimization')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_load;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_ops, 'Real-Time Tracking & Monitoring', 'Scan event processing, gap detection, passenger notifications')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_tracking;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_ops, 'Arrival & Claim Operations', 'Offload sequencing, carousel delivery, claim time monitoring')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_arrival;

  -- Domain 2 subdomains
  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_except, 'Exception Detection & Classification', 'Automatic exception detection and WorldTracer PIR filing')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_detection;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_except, 'Delayed Bag Recovery', 'Recovery routing optimization and delivery scheduling')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_delayed;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_except, 'Lost Bag Investigation', 'WorldTracer network searches and partner coordination')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_lost;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_except, 'Damage & Pilferage Assessment', 'Photo documentation and liability determination')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_damage;

  -- Domain 3 subdomains
  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_interline, 'Partner Airline Handoffs', 'SITA Type B messaging and custody transfers')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_handoff;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_interline, 'Alliance Network Integration', 'Star Alliance/Oneworld/SkyTeam protocols')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_alliance;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_interline, 'Interline Exception Resolution', 'Cross-carrier exception handling and cost allocation')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_interline_except;

  -- Domain 4 subdomains
  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_comp, 'Liability Determination', 'Montreal Convention / EU261 / DOT jurisdiction rules')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_liability;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_comp, 'Claim Processing & Validation', 'Item valuation, fraud detection, approval workflows')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_claims;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_comp, 'Settlement & Payment Automation', 'Interim expenses and automated settlements')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_settlement;

  -- Domain 5 subdomains
  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_analytics, 'Performance Monitoring & KPIs', 'Mishandling rate tracking and ground handler scorecards')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_performance;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_analytics, 'Predictive Analytics & ML', 'Connection risk prediction and delay forecasting')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_predictive;

  INSERT INTO subdomains (domain_id, name, description)
  VALUES (v_domain_analytics, 'Cost Analysis & ROI', 'Cost per bag tracking and ROI measurement')
  ON CONFLICT (domain_id, name) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_sd_cost_analysis;

  RAISE NOTICE '✓ Created/updated 5 baggage domains and 17 subdomains (UUID-based)';

  -- ============================================================================
  -- STEP 3: Create workflows linked to UUID subdomains
  -- ============================================================================

  -- Domain 1: Baggage Operations & Tracking (8 workflows - Wave 1)
  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES
  ('Bag Check-In & Tagging', v_sd_checkin, 'Automated passenger eligibility validation, IATA-compliant 10-digit bag tag generation, weight/dimension verification, special handling code assignment, routing tag creation. 99.8% success rate, 15-second processing. Prevents 5,000 mis-tagged bags/year.', 1, 'planned', 3, 4, 4),
  ('Load Planning & Weight Balance', v_sd_load, 'AI-optimized aircraft load planning with FAA/EASA weight & balance, container/cart optimization, connection-sensitive prioritization. 15+ factors analyzed. Saves $1.2M/year (fuel + offloads).', 1, 'planned', 5, 5, 4),
  ('TSA Screening Coordination', v_sd_checkin, 'Real-time tracking through TSA screening, hold detection, passenger notification, connection risk recalculation. Prevents 3,200 misconnections/year from screening delays.', 1, 'planned', 3, 4, 3),
  ('Real-Time Tracking & Notifications', v_sd_tracking, 'Continuous scan event monitoring (5M events/day capacity), gap detection, passenger app/SMS updates. 3-second avg notification delay. 97% gap detection accuracy.', 1, 'planned', 3, 4, 4),
  ('Connection Risk Assessment', v_sd_load, 'ML-powered connection risk scoring (AUC 0.89), MCT violation detection, intervention triggering (>0.70 score). Reduces misconnections by 35%.', 1, 'planned', 5, 5, 4),
  ('Aircraft Loading Verification', v_sd_load, 'Scan reconciliation vs manifest, missing bag alerts, offload documentation, last-minute connection integration. Prevents forgotten bags (2% of mishandling).', 1, 'planned', 3, 4, 3),
  ('Arrival Offloading Optimization', v_sd_arrival, 'Priority offload sequencing (connections → elite → general), carousel assignment, transfer coordination. Reduces claim time from 22 to 16 minutes (P85).', 1, 'planned', 3, 4, 3),
  ('Baggage Claim Delivery', v_sd_arrival, 'Carousel delivery tracking, claim time monitoring, missing bag reporting. Target <16 min P85 claim time. 99.5% bags delivered to carousel.', 1, 'planned', 2, 3, 3);

  -- Domain 2: Baggage Exception Management (8 workflows - Wave 2)
  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES
  ('Delayed Bag Detection & Recovery', v_sd_delayed, 'Automatic detection via scan gap analysis, recovery routing optimization, passenger communication, delivery scheduling. 85% reunited within 24hrs. 70% of all exceptions.', 2, 'planned', 3, 5, 4),
  ('Lost Bag Investigation', v_sd_lost, 'Last known location analysis, WorldTracer network filing (2,800+ airports), partner queries, warehouse searches. 60% recovered within 21 days. $850 avg cost per bag.', 2, 'planned', 4, 4, 3),
  ('Damaged Bag Assessment', v_sd_damage, 'Photo documentation, liability determination (carrier vs passenger), tamper seal verification, settlement processing. 95% documented with photos, <24hr assessment.', 2, 'planned', 3, 3, 3),
  ('WorldTracer PIR Filing', v_sd_detection, 'Automated Property Irregularity Report generation and WorldTracer submission for lost/delayed bags. Global network search. 100% PIRs within 72 hours.', 2, 'planned', 2, 4, 4),
  ('Misdirected Bag Correction', v_sd_detection, 'Auto-detection of wrong-destination routing, root cause analysis, correction routing, passenger communication. 3% of exceptions. Preventable with better tagging.', 2, 'planned', 2, 3, 3),
  ('Offloaded Bag Handling', v_sd_detection, 'Proactive offload management for weight/balance/security, passenger notification, re-booking, priority loading. 2% of exceptions. Prevents with load optimization.', 2, 'planned', 3, 3, 3),
  ('Rush Tag Processing', v_sd_detection, 'High-priority processing for bags <60 min connection, expedited handling alerts, fast-track transfer. 8% of total bags, 25% higher risk without intervention.', 2, 'planned', 3, 4, 3),
  ('Pilferage Investigation', v_sd_damage, 'Theft investigation with security coordination, tamper evidence collection, contents verification, police reporting for high-value items. 30% false claim rate.', 2, 'planned', 4, 3, 2);

  -- Domain 3: Interline Baggage Coordination (6 workflows - Wave 2 & 3)
  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES
  ('Partner Airline Handoff', v_sd_handoff, 'SITA message exchange (BPM, BTM, BSM), custody transfer, liability shift, SLA tracking (15min/60min/24hr). 22% of Copa bags are interline. 50K+ messages/day.', 2, 'planned', 5, 4, 3),
  ('SITA Type B Message Processing', v_sd_handoff, 'Real-time parsing/validation of SITA messages (BPM, BTM, BSM, BNS, CPM), translation to internal format, acknowledgment, retry logic. 200K messages/day.', 2, 'planned', 4, 3, 4),
  ('Alliance Transfer Coordination', v_sd_alliance, 'Star Alliance/Oneworld/SkyTeam protocols, alliance bag tag recognition, reciprocal handling, priority transfer, WorldTracer visibility.', 2, 'planned', 3, 3, 3),
  ('Interline Exception Recovery', v_sd_interline_except, 'Cross-carrier exception resolution, responsibility determination, partner coordination, joint investigation. 40% higher resolution time vs domestic.', 3, 'planned', 5, 4, 3),
  ('Cost Allocation & Chargeback', v_sd_interline_except, 'Automated liability/cost allocation, responsible party ID, chargeback calculation per IATA rules, reconciliation. $850K annual chargebacks processed.', 3, 'planned', 3, 3, 3),
  ('SLA Compliance Monitoring', v_sd_handoff, 'Real-time SLA tracking (notification: 15min, response: 60min, recovery: 24hr), violation escalation, partner scorecards. Enforces contractual agreements.', 3, 'planned', 3, 4, 3);

  -- Domain 4: Baggage Compensation & Claims (5 workflows - Wave 3)
  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES
  ('Montreal Convention Claims', v_sd_claims, 'Automated processing per Montreal Convention (1288 SDR / $1,700 max), item valuation with depreciation, excluded items filtering, approval workflow. 95% international routes.', 3, 'planned', 5, 4, 3),
  ('EU261 Baggage Claims', v_sd_liability, 'EU261 regulation compliance for EU origin/destination flights, interim expenses (€1,500), mandatory timelines (6 weeks), passenger rights documentation.', 3, 'planned', 3, 3, 3),
  ('DOT Domestic Claims', v_sd_liability, 'US DOT domestic rules ($3,800 max - higher than Montreal), mandatory DOT reporting, consumer complaints, 24hr acknowledgment requirement.', 3, 'planned', 3, 3, 3),
  ('Interim Expense Reimbursement', v_sd_settlement, 'Immediate reimbursement for essentials (toiletries, clothing, meds), auto-approval up to $100, 24hr processing. Reduces complaints. $85 avg per delayed bag.', 3, 'planned', 2, 4, 4),
  ('Fraud Detection & Prevention', v_sd_claims, 'ML-powered fraud detection, pattern recognition, duplicate claims, value inflation, professional claimant flagging. 18% of $500+ claims show fraud indicators.', 3, 'planned', 5, 4, 3);

  -- Domain 5: Baggage Analytics & Optimization (3 workflows - Wave 3)
  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES
  ('Daily Performance Analysis', v_sd_performance, 'Automated KPI calculation: mishandling rate (target 7 per 1000), connection success, claim time, ground handler scorecards. Variance analysis vs targets, anomaly alerts.', 3, 'planned', 3, 4, 4),
  ('Connection Risk Prediction', v_sd_predictive, 'ML model (scikit-learn, AUC 0.89) trained on 500K connections. 9 features: MCT, connection time, terminal change, interline, delay prob, weather. 35% misconnection reduction.', 3, 'planned', 5, 5, 4),
  ('Ground Handler Scorecard', v_sd_cost_analysis, 'Performance tracking: damage rate, on-time performance, loading accuracy, special handling compliance. Monthly scorecards, SLA compliance, performance incentives. 12 handlers, 5-18 per 1000 variance.', 3, 'planned', 3, 3, 3);

  RAISE NOTICE '✓ Created 30 baggage workflows';

END $$;

-- Verification
DO $$
DECLARE
  v_workflow_count INTEGER;
  v_domain_count INTEGER;
  v_subdomain_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_domain_count
  FROM domains WHERE name LIKE '%Baggage%';

  SELECT COUNT(*) INTO v_subdomain_count
  FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%';

  SELECT COUNT(*) INTO v_workflow_count
  FROM workflows w
  JOIN subdomains sd ON w.subdomain_id = sd.id
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION 005 COMPLETE (UUID FIX)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Baggage domains: %', v_domain_count;
  RAISE NOTICE 'Baggage subdomains: %', v_subdomain_count;
  RAISE NOTICE 'Baggage workflows: %', v_workflow_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL BAGGAGE MIGRATIONS COMPLETE!';
  RAISE NOTICE '========================================';
END $$;

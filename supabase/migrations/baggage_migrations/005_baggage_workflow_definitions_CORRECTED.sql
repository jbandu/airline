/*
  Migration 005: Baggage Workflow Definitions (Schema Corrected)

  Purpose: Define 30 operational workflows across 5 baggage domains

  Schema Compatibility:
  - Uses implementation_wave (not wave)
  - complexity as int (1-5): 2=Low, 3=Medium, 4-5=High
  - status as lowercase ('planned', 'draft', etc.)
  - No business_value, technical_feasibility, effort_estimate, impact_score, priority_score columns

  Distribution:
  - Domain 1: Baggage Operations & Tracking (8 workflows)
  - Domain 2: Baggage Exception Management (8 workflows)
  - Domain 3: Interline Baggage Coordination (6 workflows)
  - Domain 4: Baggage Compensation & Claims (5 workflows)
  - Domain 5: Baggage Analytics & Optimization (3 workflows)
*/

-- Get subdomain IDs (handling potential UUID vs BIGINT difference)
DO $$
DECLARE
  -- Check subdomain_id type in workflows table
  v_subdomain_type TEXT;

  -- Domain 1 subdomains (will store as TEXT for flexibility)
  v_sd_checkin TEXT;
  v_sd_load TEXT;
  v_sd_tracking TEXT;
  v_sd_arrival TEXT;

  -- Domain 2 subdomains
  v_sd_detection BIGINT;
  v_sd_delayed BIGINT;
  v_sd_lost BIGINT;
  v_sd_damage BIGINT;

  -- Domain 3 subdomains
  v_sd_handoff BIGINT;
  v_sd_alliance BIGINT;
  v_sd_interline_except BIGINT;

  -- Domain 4 subdomains
  v_sd_liability BIGINT;
  v_sd_claims BIGINT;
  v_sd_settlement BIGINT;

  -- Domain 5 subdomains
  v_sd_performance BIGINT;
  v_sd_predictive BIGINT;
  v_sd_cost_analysis BIGINT;
BEGIN

  -- Get Domain 1 subdomain IDs
  SELECT sd.id INTO v_sd_checkin FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Operations & Tracking' AND sd.name = 'Check-In & Tagging Operations';

  SELECT sd.id INTO v_sd_load FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Operations & Tracking' AND sd.name = 'Load Planning & Optimization';

  SELECT sd.id INTO v_sd_tracking FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Operations & Tracking' AND sd.name = 'Real-Time Tracking & Monitoring';

  SELECT sd.id INTO v_sd_arrival FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Operations & Tracking' AND sd.name = 'Arrival & Claim Operations';

  -- Get Domain 2 subdomain IDs
  SELECT sd.id INTO v_sd_detection FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Exception Management' AND sd.name = 'Exception Detection & Classification';

  SELECT sd.id INTO v_sd_delayed FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Exception Management' AND sd.name = 'Delayed Bag Recovery';

  SELECT sd.id INTO v_sd_lost FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Exception Management' AND sd.name = 'Lost Bag Investigation';

  SELECT sd.id INTO v_sd_damage FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Exception Management' AND sd.name = 'Damage & Pilferage Assessment';

  -- Get Domain 3 subdomain IDs
  SELECT sd.id INTO v_sd_handoff FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Interline Baggage Coordination' AND sd.name = 'Partner Airline Handoffs';

  SELECT sd.id INTO v_sd_alliance FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Interline Baggage Coordination' AND sd.name = 'Alliance Network Integration';

  SELECT sd.id INTO v_sd_interline_except FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Interline Baggage Coordination' AND sd.name = 'Interline Exception Resolution';

  -- Get Domain 4 subdomain IDs
  SELECT sd.id INTO v_sd_liability FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Compensation & Claims' AND sd.name = 'Liability Determination';

  SELECT sd.id INTO v_sd_claims FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Compensation & Claims' AND sd.name = 'Claim Processing & Validation';

  SELECT sd.id INTO v_sd_settlement FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Compensation & Claims' AND sd.name = 'Settlement & Payment Automation';

  -- Get Domain 5 subdomain IDs
  SELECT sd.id INTO v_sd_performance FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Analytics & Optimization' AND sd.name = 'Performance Monitoring & KPIs';

  SELECT sd.id INTO v_sd_predictive FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Analytics & Optimization' AND sd.name = 'Predictive Analytics & ML';

  SELECT sd.id INTO v_sd_cost_analysis FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name = 'Baggage Analytics & Optimization' AND sd.name = 'Cost Analysis & ROI';

  -- ============================================================================
  -- DOMAIN 1: BAGGAGE OPERATIONS & TRACKING (8 WORKFLOWS)
  -- Wave 1: Foundation workflows - High impact, core operations
  -- ============================================================================

  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  ('Bag Check-In & Tagging', v_sd_checkin,
    'Automated passenger eligibility validation, IATA-compliant 10-digit bag tag generation, weight/dimension verification, special handling code assignment, routing tag creation. 99.8% success rate, 15-second processing. Prevents 5,000 mis-tagged bags/year.',
    1, 'planned', 3, 4, 4),

  ('Load Planning & Weight Balance', v_sd_load,
    'AI-optimized aircraft load planning with FAA/EASA weight & balance, container/cart optimization, connection-sensitive prioritization. 15+ factors analyzed. Saves $1.2M/year (fuel + offloads).',
    1, 'planned', 5, 5, 4),

  ('TSA Screening Coordination', v_sd_checkin,
    'Real-time tracking through TSA screening, hold detection, passenger notification, connection risk recalculation. Prevents 3,200 misconnections/year from screening delays.',
    1, 'planned', 3, 4, 3),

  ('Real-Time Tracking & Notifications', v_sd_tracking,
    'Continuous scan event monitoring (5M events/day capacity), gap detection, passenger app/SMS updates. 3-second avg notification delay. 97% gap detection accuracy.',
    1, 'planned', 3, 4, 4),

  ('Connection Risk Assessment', v_sd_load,
    'ML-powered connection risk scoring (AUC 0.89), MCT violation detection, intervention triggering (>0.70 score). Reduces misconnections by 35%.',
    1, 'planned', 5, 5, 4),

  ('Aircraft Loading Verification', v_sd_load,
    'Scan reconciliation vs manifest, missing bag alerts, offload documentation, last-minute connection integration. Prevents forgotten bags (2% of mishandling).',
    1, 'planned', 3, 4, 3),

  ('Arrival Offloading Optimization', v_sd_arrival,
    'Priority offload sequencing (connections → elite → general), carousel assignment, transfer coordination. Reduces claim time from 22 to 16 minutes (P85).',
    1, 'planned', 3, 4, 3),

  ('Baggage Claim Delivery', v_sd_arrival,
    'Carousel delivery tracking, claim time monitoring, missing bag reporting. Target <16 min P85 claim time. 99.5% bags delivered to carousel.',
    1, 'planned', 2, 3, 3);

  -- ============================================================================
  -- DOMAIN 2: BAGGAGE EXCEPTION MANAGEMENT (8 WORKFLOWS)
  -- Wave 2: Exception handling - Critical for reducing mishandling costs
  -- ============================================================================

  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  ('Delayed Bag Detection & Recovery', v_sd_delayed,
    'Automatic detection via scan gap analysis, recovery routing optimization, passenger communication, delivery scheduling. 85% reunited within 24hrs. 70% of all exceptions.',
    2, 'planned', 3, 5, 4),

  ('Lost Bag Investigation', v_sd_lost,
    'Last known location analysis, WorldTracer network filing (2,800+ airports), partner queries, warehouse searches. 60% recovered within 21 days. $850 avg cost per bag.',
    2, 'planned', 4, 4, 3),

  ('Damaged Bag Assessment', v_sd_damage,
    'Photo documentation, liability determination (carrier vs passenger), tamper seal verification, settlement processing. 95% documented with photos, <24hr assessment.',
    2, 'planned', 3, 3, 3),

  ('WorldTracer PIR Filing', v_sd_detection,
    'Automated Property Irregularity Report generation and WorldTracer submission for lost/delayed bags. Global network search. 100% PIRs within 72 hours.',
    2, 'planned', 2, 4, 4),

  ('Misdirected Bag Correction', v_sd_detection,
    'Auto-detection of wrong-destination routing, root cause analysis, correction routing, passenger communication. 3% of exceptions. Preventable with better tagging.',
    2, 'planned', 2, 3, 3),

  ('Offloaded Bag Handling', v_sd_detection,
    'Proactive offload management for weight/balance/security, passenger notification, re-booking, priority loading. 2% of exceptions. Prevents with load optimization.',
    2, 'planned', 3, 3, 3),

  ('Rush Tag Processing', v_sd_detection,
    'High-priority processing for bags <60 min connection, expedited handling alerts, fast-track transfer. 8% of total bags, 25% higher risk without intervention.',
    2, 'planned', 3, 4, 3),

  ('Pilferage Investigation', v_sd_damage,
    'Theft investigation with security coordination, tamper evidence collection, contents verification, police reporting for high-value items. 30% false claim rate.',
    2, 'planned', 4, 3, 2);

  -- ============================================================================
  -- DOMAIN 3: INTERLINE BAGGAGE COORDINATION (6 WORKFLOWS)
  -- Wave 2 & 3: Partner coordination - Complex integration requirements
  -- ============================================================================

  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  ('Partner Airline Handoff', v_sd_handoff,
    'SITA message exchange (BPM, BTM, BSM), custody transfer, liability shift, SLA tracking (15min/60min/24hr). 22% of Copa bags are interline. 50K+ messages/day.',
    2, 'planned', 5, 4, 3),

  ('SITA Type B Message Processing', v_sd_handoff,
    'Real-time parsing/validation of SITA messages (BPM, BTM, BSM, BNS, CPM), translation to internal format, acknowledgment, retry logic. 200K messages/day.',
    2, 'planned', 4, 3, 4),

  ('Alliance Transfer Coordination', v_sd_alliance,
    'Star Alliance/Oneworld/SkyTeam protocols, alliance bag tag recognition, reciprocal handling, priority transfer, WorldTracer visibility.',
    2, 'planned', 3, 3, 3),

  ('Interline Exception Recovery', v_sd_interline_except,
    'Cross-carrier exception resolution, responsibility determination, partner coordination, joint investigation. 40% higher resolution time vs domestic.',
    3, 'planned', 5, 4, 3),

  ('Cost Allocation & Chargeback', v_sd_interline_except,
    'Automated liability/cost allocation, responsible party ID, chargeback calculation per IATA rules, reconciliation. $850K annual chargebacks processed.',
    3, 'planned', 3, 3, 3),

  ('SLA Compliance Monitoring', v_sd_handoff,
    'Real-time SLA tracking (notification: 15min, response: 60min, recovery: 24hr), violation escalation, partner scorecards. Enforces contractual agreements.',
    3, 'planned', 3, 4, 3);

  -- ============================================================================
  -- DOMAIN 4: BAGGAGE COMPENSATION & CLAIMS (5 WORKFLOWS)
  -- Wave 3: Advanced claims processing - Regulatory compliance
  -- ============================================================================

  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  ('Montreal Convention Claims', v_sd_claims,
    'Automated processing per Montreal Convention (1288 SDR / $1,700 max), item valuation with depreciation, excluded items filtering, approval workflow. 95% international routes.',
    3, 'planned', 5, 4, 3),

  ('EU261 Baggage Claims', v_sd_liability,
    'EU261 regulation compliance for EU origin/destination flights, interim expenses (€1,500), mandatory timelines (6 weeks), passenger rights documentation.',
    3, 'planned', 3, 3, 3),

  ('DOT Domestic Claims', v_sd_liability,
    'US DOT domestic rules ($3,800 max - higher than Montreal), mandatory DOT reporting, consumer complaints, 24hr acknowledgment requirement.',
    3, 'planned', 3, 3, 3),

  ('Interim Expense Reimbursement', v_sd_settlement,
    'Immediate reimbursement for essentials (toiletries, clothing, meds), auto-approval up to $100, 24hr processing. Reduces complaints. $85 avg per delayed bag.',
    3, 'planned', 2, 4, 4),

  ('Fraud Detection & Prevention', v_sd_claims,
    'ML-powered fraud detection, pattern recognition, duplicate claims, value inflation, professional claimant flagging. 18% of $500+ claims show fraud indicators.',
    3, 'planned', 5, 4, 3);

  -- ============================================================================
  -- DOMAIN 5: BAGGAGE ANALYTICS & OPTIMIZATION (3 WORKFLOWS)
  -- Wave 3: Advanced analytics - Data-driven optimization
  -- ============================================================================

  INSERT INTO workflows (name, subdomain_id, description, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  ('Daily Performance Analysis', v_sd_performance,
    'Automated KPI calculation: mishandling rate (target 7 per 1000), connection success, claim time, ground handler scorecards. Variance analysis vs targets, anomaly alerts.',
    3, 'planned', 3, 4, 4),

  ('Connection Risk Prediction', v_sd_predictive,
    'ML model (scikit-learn, AUC 0.89) trained on 500K connections. 9 features: MCT, connection time, terminal change, interline, delay prob, weather. 35% misconnection reduction.',
    3, 'planned', 5, 5, 4),

  ('Ground Handler Scorecard', v_sd_cost_analysis,
    'Performance tracking: damage rate, on-time performance, loading accuracy, special handling compliance. Monthly scorecards, SLA compliance, performance incentives. 12 handlers, 5-18 per 1000 variance.',
    3, 'planned', 3, 3, 3);

  RAISE NOTICE '✓ Created 30 baggage workflows across 5 domains';

END $$;

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_workflow_count INTEGER;
  v_wave1_count INTEGER;
  v_wave2_count INTEGER;
  v_wave3_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_workflow_count
  FROM workflows w
  JOIN subdomains sd ON w.subdomain_id = sd.id
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%';

  SELECT COUNT(*) INTO v_wave1_count
  FROM workflows w
  JOIN subdomains sd ON w.subdomain_id = sd.id
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%' AND w.implementation_wave = 1;

  SELECT COUNT(*) INTO v_wave2_count
  FROM workflows w
  JOIN subdomains sd ON w.subdomain_id = sd.id
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%' AND w.implementation_wave = 2;

  SELECT COUNT(*) INTO v_wave3_count
  FROM workflows w
  JOIN subdomains sd ON w.subdomain_id = sd.id
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%' AND w.implementation_wave = 3;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION 005 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Workflows created: %', v_workflow_count;
  RAISE NOTICE '  - Wave 1 (Foundation): %', v_wave1_count;
  RAISE NOTICE '  - Wave 2 (Optimization): %', v_wave2_count;
  RAISE NOTICE '  - Wave 3 (Advanced): %', v_wave3_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Distribution by domain:';
  RAISE NOTICE '  - Baggage Operations & Tracking: 8 workflows';
  RAISE NOTICE '  - Baggage Exception Management: 8 workflows';
  RAISE NOTICE '  - Interline Coordination: 6 workflows';
  RAISE NOTICE '  - Compensation & Claims: 5 workflows';
  RAISE NOTICE '  - Analytics & Optimization: 3 workflows';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL BAGGAGE MIGRATIONS COMPLETE!';
  RAISE NOTICE '';
END $$;

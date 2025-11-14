/*
  Migration 005: Baggage Workflows (WORKAROUND - Use Existing Domains)

  This version AVOIDS creating new domains/subdomains.
  Instead, it links workflows to EXISTING domains in your database.

  Run this if you keep getting UUID/BIGINT type errors.
*/

DO $$
DECLARE
  v_existing_domain_id UUID;
  v_existing_subdomain_id UUID;
  v_workflow_count INTEGER := 0;
BEGIN

  -- Try to find an existing domain to link to
  SELECT id INTO v_existing_domain_id
  FROM domains
  LIMIT 1;

  -- Try to find an existing subdomain to link to
  SELECT id INTO v_existing_subdomain_id
  FROM subdomains
  LIMIT 1;

  -- Check if we found existing records
  IF v_existing_domain_id IS NULL THEN
    RAISE EXCEPTION 'No existing domains found. Please run the diagnostic query first.';
  END IF;

  IF v_existing_subdomain_id IS NULL THEN
    RAISE EXCEPTION 'No existing subdomains found. Please run the diagnostic query first.';
  END IF;

  RAISE NOTICE 'Found existing domain: %, subdomain: %', v_existing_domain_id, v_existing_subdomain_id;
  RAISE NOTICE 'Will create workflows linked to this subdomain temporarily';

  -- ============================================================================
  -- Create 30 baggage workflows linked to an existing subdomain
  -- ============================================================================
  -- NOTE: These workflows will show under whatever subdomain we found
  -- You can reassign them to proper baggage subdomains later through the UI

  INSERT INTO workflows (name, description, subdomain_id, implementation_wave, status, complexity, agentic_potential, autonomy_level) VALUES

  -- Wave 1: Foundation (8 workflows)
  ('Bag Check-In & Tagging', 'Automated passenger eligibility validation, IATA-compliant 10-digit bag tag generation, weight/dimension verification, special handling code assignment, routing tag creation. 99.8% success rate, 15-second processing. Prevents 5,000 mis-tagged bags/year.', v_existing_subdomain_id, 1, 'planned', 3, 4, 4),
  ('Load Planning & Weight Balance', 'AI-optimized aircraft load planning with FAA/EASA weight & balance, container/cart optimization, connection-sensitive prioritization. 15+ factors analyzed. Saves $1.2M/year (fuel + offloads).', v_existing_subdomain_id, 1, 'planned', 5, 5, 4),
  ('TSA Screening Coordination', 'Real-time tracking through TSA screening, hold detection, passenger notification, connection risk recalculation. Prevents 3,200 misconnections/year from screening delays.', v_existing_subdomain_id, 1, 'planned', 3, 4, 3),
  ('Real-Time Tracking & Notifications', 'Continuous scan event monitoring (5M events/day capacity), gap detection, passenger app/SMS updates. 3-second avg notification delay. 97% gap detection accuracy.', v_existing_subdomain_id, 1, 'planned', 3, 4, 4),
  ('Connection Risk Assessment', 'ML-powered connection risk scoring (AUC 0.89), MCT violation detection, intervention triggering (>0.70 score). Reduces misconnections by 35%.', v_existing_subdomain_id, 1, 'planned', 5, 5, 4),
  ('Aircraft Loading Verification', 'Scan reconciliation vs manifest, missing bag alerts, offload documentation, last-minute connection integration. Prevents forgotten bags (2% of mishandling).', v_existing_subdomain_id, 1, 'planned', 3, 4, 3),
  ('Arrival Offloading Optimization', 'Priority offload sequencing (connections → elite → general), carousel assignment, transfer coordination. Reduces claim time from 22 to 16 minutes (P85).', v_existing_subdomain_id, 1, 'planned', 3, 4, 3),
  ('Baggage Claim Delivery', 'Carousel delivery tracking, claim time monitoring, missing bag reporting. Target <16 min P85 claim time. 99.5% bags delivered to carousel.', v_existing_subdomain_id, 1, 'planned', 2, 3, 3),

  -- Wave 2: Exception & Interline (14 workflows)
  ('Delayed Bag Detection & Recovery', 'Automatic detection via scan gap analysis, recovery routing optimization, passenger communication, delivery scheduling. 85% reunited within 24hrs. 70% of all exceptions.', v_existing_subdomain_id, 2, 'planned', 3, 5, 4),
  ('Lost Bag Investigation', 'Last known location analysis, WorldTracer network filing (2,800+ airports), partner queries, warehouse searches. 60% recovered within 21 days. $850 avg cost per bag.', v_existing_subdomain_id, 2, 'planned', 4, 4, 3),
  ('Damaged Bag Assessment', 'Photo documentation, liability determination (carrier vs passenger), tamper seal verification, settlement processing. 95% documented with photos, <24hr assessment.', v_existing_subdomain_id, 2, 'planned', 3, 3, 3),
  ('WorldTracer PIR Filing', 'Automated Property Irregularity Report generation and WorldTracer submission for lost/delayed bags. Global network search. 100% PIRs within 72 hours.', v_existing_subdomain_id, 2, 'planned', 2, 4, 4),
  ('Misdirected Bag Correction', 'Auto-detection of wrong-destination routing, root cause analysis, correction routing, passenger communication. 3% of exceptions. Preventable with better tagging.', v_existing_subdomain_id, 2, 'planned', 2, 3, 3),
  ('Offloaded Bag Handling', 'Proactive offload management for weight/balance/security, passenger notification, re-booking, priority loading. 2% of exceptions. Prevents with load optimization.', v_existing_subdomain_id, 2, 'planned', 3, 3, 3),
  ('Rush Tag Processing', 'High-priority processing for bags <60 min connection, expedited handling alerts, fast-track transfer. 8% of total bags, 25% higher risk without intervention.', v_existing_subdomain_id, 2, 'planned', 3, 4, 3),
  ('Pilferage Investigation', 'Theft investigation with security coordination, tamper evidence collection, contents verification, police reporting for high-value items. 30% false claim rate.', v_existing_subdomain_id, 2, 'planned', 4, 3, 2),
  ('Partner Airline Handoff', 'SITA message exchange (BPM, BTM, BSM), custody transfer, liability shift, SLA tracking (15min/60min/24hr). 22% of Copa bags are interline. 50K+ messages/day.', v_existing_subdomain_id, 2, 'planned', 5, 4, 3),
  ('SITA Type B Message Processing', 'Real-time parsing/validation of SITA messages (BPM, BTM, BSM, BNS, CPM), translation to internal format, acknowledgment, retry logic. 200K messages/day.', v_existing_subdomain_id, 2, 'planned', 4, 3, 4),
  ('Alliance Transfer Coordination', 'Star Alliance/Oneworld/SkyTeam protocols, alliance bag tag recognition, reciprocal handling, priority transfer, WorldTracer visibility.', v_existing_subdomain_id, 2, 'planned', 3, 3, 3),
  ('Interline Exception Recovery', 'Cross-carrier exception resolution, responsibility determination, partner coordination, joint investigation. 40% higher resolution time vs domestic.', v_existing_subdomain_id, 2, 'planned', 5, 4, 3),
  ('Cost Allocation & Chargeback', 'Automated liability/cost allocation, responsible party ID, chargeback calculation per IATA rules, reconciliation. $850K annual chargebacks processed.', v_existing_subdomain_id, 2, 'planned', 3, 3, 3),
  ('SLA Compliance Monitoring', 'Real-time SLA tracking (notification: 15min, response: 60min, recovery: 24hr), violation escalation, partner scorecards. Enforces contractual agreements.', v_existing_subdomain_id, 2, 'planned', 3, 4, 3),

  -- Wave 3: Advanced Analytics & Claims (8 workflows)
  ('Montreal Convention Claims', 'Automated processing per Montreal Convention (1288 SDR / $1,700 max), item valuation with depreciation, excluded items filtering, approval workflow. 95% international routes.', v_existing_subdomain_id, 3, 'planned', 5, 4, 3),
  ('EU261 Baggage Claims', 'EU261 regulation compliance for EU origin/destination flights, interim expenses (€1,500), mandatory timelines (6 weeks), passenger rights documentation.', v_existing_subdomain_id, 3, 'planned', 3, 3, 3),
  ('DOT Domestic Claims', 'US DOT domestic rules ($3,800 max - higher than Montreal), mandatory DOT reporting, consumer complaints, 24hr acknowledgment requirement.', v_existing_subdomain_id, 3, 'planned', 3, 3, 3),
  ('Interim Expense Reimbursement', 'Immediate reimbursement for essentials (toiletries, clothing, meds), auto-approval up to $100, 24hr processing. Reduces complaints. $85 avg per delayed bag.', v_existing_subdomain_id, 3, 'planned', 2, 4, 4),
  ('Fraud Detection & Prevention', 'ML-powered fraud detection, pattern recognition, duplicate claims, value inflation, professional claimant flagging. 18% of $500+ claims show fraud indicators.', v_existing_subdomain_id, 3, 'planned', 5, 4, 3),
  ('Daily Performance Analysis', 'Automated KPI calculation: mishandling rate (target 7 per 1000), connection success, claim time, ground handler scorecards. Variance analysis vs targets, anomaly alerts.', v_existing_subdomain_id, 3, 'planned', 3, 4, 4),
  ('Connection Risk Prediction', 'ML model (scikit-learn, AUC 0.89) trained on 500K connections. 9 features: MCT, connection time, terminal change, interline, delay prob, weather. 35% misconnection reduction.', v_existing_subdomain_id, 3, 'planned', 5, 5, 4),
  ('Ground Handler Scorecard', 'Performance tracking: damage rate, on-time performance, loading accuracy, special handling compliance. Monthly scorecards, SLA compliance, performance incentives. 12 handlers, 5-18 per 1000 variance.', v_existing_subdomain_id, 3, 'planned', 3, 3, 3);

  GET DIAGNOSTICS v_workflow_count = ROW_COUNT;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ WORKAROUND MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created % baggage workflows', v_workflow_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTE: All workflows linked to subdomain: %', v_existing_subdomain_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run migration 006 to fix agent links';
  RAISE NOTICE '2. Optionally reassign workflows to proper subdomains via UI';
  RAISE NOTICE '========================================';

END $$;

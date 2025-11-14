/*
  Migration 001: Baggage Domains & Subdomains (FIXED for bigint IDs)

  Purpose: Add 5 core baggage operations domains with 18 subdomains

  Domains:
  1. Baggage Operations & Tracking
  2. Baggage Exception Management
  3. Interline Baggage Coordination
  4. Baggage Compensation & Claims
  5. Baggage Analytics & Optimization

  Dependencies: Existing domains and subdomains tables with BIGINT IDs
*/

-- ============================================================================
-- DOMAIN 1: Baggage Operations & Tracking
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  -- Insert domain (let ID auto-generate)
  INSERT INTO domains (name, description, icon, color, created_at, updated_at)
  VALUES (
    'Baggage Operations & Tracking',
    'End-to-end baggage lifecycle management from check-in through claim delivery. Includes intake, tagging, load planning, real-time tracking, and passenger notifications.',
    '🧳',
    '#3b82f6',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  -- Insert subdomains (or update if they exist)
  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Check-In & Tagging Operations',
    'Passenger eligibility validation, IATA-compliant bag tag generation (10-digit standard), special handling code assignment, weight/dimension recording, routing tag assignment for multi-leg journeys.',
    NOW(), NOW()),

  (v_domain_id, 'Load Planning & Optimization',
    'Aircraft weight & balance calculations, container/cart loading sequence optimization, time-sensitive connection prioritization, ramp operations coordination, overweight/unbalanced situation alerts.',
    NOW(), NOW()),

  (v_domain_id, 'Real-Time Tracking & Monitoring',
    'Continuous scan event processing (check-in, TSA, loading, arrival, claim), missing scan detection, interline transfer tracking, passenger app/SMS notifications, WorldTracer/SITA Bag Message integration.',
    NOW(), NOW()),

  (v_domain_id, 'Arrival & Claim Operations',
    'Priority offload sequencing (connections first, then elite passengers), carousel assignment optimization, claim delivery time monitoring, short-checked bag detection, lost & found processing.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

  RAISE NOTICE 'Domain 1: Baggage Operations & Tracking created with % subdomains', 4;
END $$;

-- ============================================================================
-- DOMAIN 2: Baggage Exception Management
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  INSERT INTO domains (name, description, icon, color, created_at, updated_at)
  VALUES (
    'Baggage Exception Management',
    'Comprehensive exception handling for delayed, lost, damaged, and pilfered baggage. Includes detection, investigation, recovery routing, passenger communication, and WorldTracer integration.',
    '🚨',
    '#ef4444',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Exception Detection & Classification',
    'Automatic delayed bag detection via scan gap analysis, misrouted bag identification, exception type classification (delayed/lost/damaged/pilfered), severity scoring, WorldTracer PIR filing.',
    NOW(), NOW()),

  (v_domain_id, 'Delayed Bag Recovery',
    'Recovery routing optimization (direct flight vs. multi-leg vs. ground transport), passenger communication (SMS/email/app updates), delivery scheduling, courier coordination, reunion confirmation.',
    NOW(), NOW()),

  (v_domain_id, 'Lost Bag Investigation',
    'Last known location analysis, flight manifest review, container load sheet review, partner airline queries, warehouse searches, WorldTracer network searches (2,800+ airports globally).',
    NOW(), NOW()),

  (v_domain_id, 'Damage & Pilferage Assessment',
    'Photo documentation requirements, liability determination (carrier vs. passenger vs. manufacturer), tamper-evident seal verification, damage severity classification, fraud detection patterns.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

  RAISE NOTICE 'Domain 2: Baggage Exception Management created with % subdomains', 4;
END $$;

-- ============================================================================
-- DOMAIN 3: Interline Baggage Coordination
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  INSERT INTO domains (name, description, icon, color, created_at, updated_at)
  VALUES (
    'Interline Baggage Coordination',
    'Partner airline baggage transfer management with SITA message exchange, alliance network integration, SLA tracking, and cross-carrier exception resolution.',
    '🔗',
    '#8b5cf6',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Partner Airline Handoffs',
    'SITA Type B message exchange (BPM, BTM, BSM, BNS, CPM), custody transfer documentation, liability shift processing, handoff reconciliation, SLA compliance tracking (15 min notification, 60 min response, 24 hr recovery).',
    NOW(), NOW()),

  (v_domain_id, 'Alliance Network Integration',
    'Star Alliance/Oneworld/SkyTeam specific transfer protocols, alliance bag tag recognition, reciprocal lounge access coordination, elite status handling, alliance-wide tracking visibility via WorldTracer.',
    NOW(), NOW()),

  (v_domain_id, 'Interline Exception Resolution',
    'Cross-carrier exception resolution for delayed/lost bags in partner network, responsibility determination, recovery cost allocation, partner coordination via SITA messaging, joint investigation protocols, customer communication coordination.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

  RAISE NOTICE 'Domain 3: Interline Baggage Coordination created with % subdomains', 3;
END $$;

-- ============================================================================
-- DOMAIN 4: Baggage Compensation & Claims
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  INSERT INTO domains (name, description, icon, color, created_at, updated_at)
  VALUES (
    'Baggage Compensation & Claims',
    'Automated claims processing with Montreal Convention compliance, jurisdiction determination, fraud detection, and settlement automation.',
    '💰',
    '#f59e0b',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Liability Determination',
    'Jurisdiction determination (Montreal Convention/EU261/DOT domestic), item valuation with depreciation rules, excluded items filtering (jewelry, cash, electronics in checked bags), liability cap application ($1,700 for Montreal Convention).',
    NOW(), NOW()),

  (v_domain_id, 'Claim Processing & Validation',
    'Documentation validation (receipts, declarations, photos), fraud detection patterns (duplicate claims, value inflation, professional claimants), reasonable necessity verification for interim expenses, auto-approval workflows for low-value claims (<$100).',
    NOW(), NOW()),

  (v_domain_id, 'Settlement & Payment Automation',
    'Payment method selection (bank transfer, check, voucher, frequent flyer miles), interim expense reimbursement (toiletries, clothing, medications), final settlement calculation with depreciation, payment processing within regulatory timelines.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

  RAISE NOTICE 'Domain 4: Baggage Compensation & Claims created with % subdomains', 3;
END $$;

-- ============================================================================
-- DOMAIN 5: Baggage Analytics & Optimization
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  INSERT INTO domains (name, description, icon, color, created_at, updated_at)
  VALUES (
    'Baggage Analytics & Optimization',
    'Performance monitoring, predictive analytics with ML models, and cost analysis for continuous improvement and ROI tracking.',
    '📊',
    '#10b981',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Performance Monitoring & KPIs',
    'Mishandling rate tracking (target: 7 per 1000), connection success rate monitoring, ground handler performance scorecards, on-time bag delivery rates, passenger satisfaction scores (NPS), executive dashboards with variance analysis.',
    NOW(), NOW()),

  (v_domain_id, 'Predictive Analytics & ML',
    'Connection risk prediction ML model (scikit-learn, AUC 0.89, 9 features), mishandling probability forecasting, capacity planning analytics, weather impact modeling, demand forecasting for peak periods.',
    NOW(), NOW()),

  (v_domain_id, 'Cost Analysis & ROI',
    'Mishandling cost tracking ($150 per bag average), compensation payout analysis, operational efficiency metrics, ground handler cost allocation, interline chargeback reconciliation, ROI calculation vs. baseline (Copa target: $6.3M annual savings).',
    NOW(), NOW()),

  (v_domain_id, 'Root Cause Analysis',
    'Exception pattern analysis, failure mode identification, process bottleneck detection, ground handler performance trends, systemic issue identification, continuous improvement recommendations.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

  RAISE NOTICE 'Domain 5: Baggage Analytics & Optimization created with % subdomains', 4;
END $$;

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_domain_count INTEGER;
  v_subdomain_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_domain_count FROM domains WHERE name LIKE '%Baggage%';
  SELECT COUNT(*) INTO v_subdomain_count
  FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name LIKE '%Baggage%';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 001 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Baggage domains created: %', v_domain_count;
  RAISE NOTICE 'Baggage subdomains created: %', v_subdomain_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Domains:';
  RAISE NOTICE '  1. Baggage Operations & Tracking (4 subdomains)';
  RAISE NOTICE '  2. Baggage Exception Management (4 subdomains)';
  RAISE NOTICE '  3. Interline Baggage Coordination (3 subdomains)';
  RAISE NOTICE '  4. Baggage Compensation & Claims (3 subdomains)';
  RAISE NOTICE '  5. Baggage Analytics & Optimization (4 subdomains)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: % domains, % subdomains', v_domain_count, v_subdomain_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run migration 002 (Baggage Agent Categories)';
  RAISE NOTICE '========================================';
END $$;

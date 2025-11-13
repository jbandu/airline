/*
  Migration 001: Baggage Domains & Subdomains

  Purpose: Add 5 core baggage operations domains with 15 subdomains

  Domains:
  1. Baggage Operations & Tracking
  2. Baggage Exception Management
  3. Interline Baggage Coordination
  4. Baggage Compensation & Claims
  5. Baggage Analytics & Optimization

  Dependencies: Existing domains and subdomains tables
*/

-- ============================================================================
-- DOMAIN 1: Baggage Operations & Tracking
-- ============================================================================

DO $$
DECLARE
  v_domain_id BIGINT;
BEGIN
  -- Insert domain
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
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  -- Insert subdomains
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
    'Offload verification, baggage claim belt assignment, delivery confirmation tracking, claim time optimization, last-mile passenger reunion.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO NOTHING;

  RAISE NOTICE 'Domain 1 created: Baggage Operations & Tracking with 4 subdomains';
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
    'Comprehensive exception handling for delayed, lost, damaged, and pilfered baggage. Includes anomaly detection, auto-classification, resolution workflows, and WorldTracer PIR generation.',
    '🚨',
    '#ef4444',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Exception Detection & Classification',
    'Real-time anomaly detection, automatic exception type classification (delayed, lost, damaged, pilfered, misdirected, offloaded), priority assignment based on passenger status and severity, WorldTracer PIR generation.',
    NOW(), NOW()),

  (v_domain_id, 'Delayed Bag Recovery',
    'Proactive location tracking, optimal recovery routing, multi-channel passenger communication (app, SMS, email), delivery scheduling and coordination, real-time ETAs.',
    NOW(), NOW()),

  (v_domain_id, 'Lost Bag Investigation',
    'Last known location analysis, flight path reconstruction, partner airline coordination, WorldTracer network filing, escalation workflows for extended searches.',
    NOW(), NOW()),

  (v_domain_id, 'Damage & Pilferage Assessment',
    'Incident documentation and photo evidence collection, liability determination (carrier vs. passenger), tamper-evident seal verification, claim initiation, security investigation triggers.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO NOTHING;

  RAISE NOTICE 'Domain 2 created: Baggage Exception Management with 4 subdomains';
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
    'Cross-airline baggage transfer management for codeshare, interline, and alliance partners. Includes SITA Type B message exchange, SLA tracking, and liability coordination.',
    '🔗',
    '#a855f7',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Partner Airline Handoffs',
    'Transfer documentation generation, SITA message exchange (BPM, BTM, BSM, BNS, CPM), handoff SLA tracking, liability transfer coordination, reconciliation processes.',
    NOW(), NOW()),

  (v_domain_id, 'Alliance Network Integration',
    'Star Alliance baggage coordination, Oneworld interline processes, SkyTeam transfer protocols, bilateral agreement management, alliance-wide tracking visibility.',
    NOW(), NOW()),

  (v_domain_id, 'Interline Exception Resolution',
    'Cross-carrier communication for exceptions, distributed recovery coordination, cost allocation and chargeback processing, dispute resolution workflows, joint liability determination.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO NOTHING;

  RAISE NOTICE 'Domain 3 created: Interline Baggage Coordination with 3 subdomains';
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
    'Automated compensation determination and claims processing. Implements Montreal Convention, EU261, DOT regulations, and airline policies with documentation validation and payment automation.',
    '💰',
    '#84cc16',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Liability Determination',
    'Montreal Convention rule application (SDR limits), EU261 applicability assessment, DOT regulation interpretation (US domestic), airline policy overlays, jurisdiction determination based on ticket and route.',
    NOW(), NOW()),

  (v_domain_id, 'Claim Processing & Validation',
    'Documentation validation (receipts, photos, declarations), depreciation calculation by item category, approval workflow routing, fraud detection, supporting evidence verification.',
    NOW(), NOW()),

  (v_domain_id, 'Settlement & Payment Automation',
    'Payment method execution (bank transfer, check, voucher, miles), receipt generation and accounting integration, audit trail maintenance, settlement reporting, chargeback handling.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO NOTHING;

  RAISE NOTICE 'Domain 4 created: Baggage Compensation & Claims with 3 subdomains';
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
    'Performance monitoring, predictive analytics, cost analysis, and continuous improvement for baggage operations. Includes ML-driven risk scoring, pattern recognition, and ROI tracking.',
    '📊',
    '#06b6d4',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW()
  RETURNING id INTO v_domain_id;

  INSERT INTO subdomains (domain_id, name, description, created_at, updated_at) VALUES
  (v_domain_id, 'Performance Monitoring & KPIs',
    'Mishandling rate tracking (per 1000 passengers), connection success rate analysis, average claim time measurement, ground handler performance scorecards, on-time bag delivery rates.',
    NOW(), NOW()),

  (v_domain_id, 'Predictive Analytics & ML',
    'Connection risk scoring with ML models, delay prediction algorithms, volume forecasting for staffing, seasonal pattern recognition, mishandling probability prediction.',
    NOW(), NOW()),

  (v_domain_id, 'Cost Analysis & ROI',
    'Cost per mishandled bag tracking, compensation trend analysis, operational efficiency measurement, ROI calculation for automation initiatives, benchmarking against industry standards.',
    NOW(), NOW()),

  (v_domain_id, 'Continuous Improvement',
    'Root cause analysis for recurring failures, process optimization recommendations, best practice identification and sharing, ground handler comparison, training need identification.',
    NOW(), NOW())
  ON CONFLICT (domain_id, name) DO NOTHING;

  RAISE NOTICE 'Domain 5 created: Baggage Analytics & Optimization with 4 subdomains';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_domain_count INTEGER;
  v_subdomain_count INTEGER;
BEGIN
  -- Count domains
  SELECT COUNT(*) INTO v_domain_count
  FROM domains
  WHERE name IN (
    'Baggage Operations & Tracking',
    'Baggage Exception Management',
    'Interline Baggage Coordination',
    'Baggage Compensation & Claims',
    'Baggage Analytics & Optimization'
  );

  -- Count subdomains
  SELECT COUNT(*) INTO v_subdomain_count
  FROM subdomains sd
  JOIN domains d ON sd.domain_id = d.id
  WHERE d.name IN (
    'Baggage Operations & Tracking',
    'Baggage Exception Management',
    'Interline Baggage Coordination',
    'Baggage Compensation & Claims',
    'Baggage Analytics & Optimization'
  );

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 001 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Baggage domains added: %', v_domain_count;
  RAISE NOTICE 'Baggage subdomains added: %', v_subdomain_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Domains:';
  RAISE NOTICE '  1. Baggage Operations & Tracking (4 subdomains)';
  RAISE NOTICE '  2. Baggage Exception Management (4 subdomains)';
  RAISE NOTICE '  3. Interline Baggage Coordination (3 subdomains)';
  RAISE NOTICE '  4. Baggage Compensation & Claims (3 subdomains)';
  RAISE NOTICE '  5. Baggage Analytics & Optimization (4 subdomains)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run migration 002 (Baggage Agent Categories)';
  RAISE NOTICE '========================================';
END $$;

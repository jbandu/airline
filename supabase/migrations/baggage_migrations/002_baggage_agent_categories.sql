/*
  Migration 002: Baggage Agent Categories

  Purpose: Add 8 specialized agent categories for baggage operations

  Categories:
  1. BAG_IN - Baggage Intake (check-in, tagging)
  2. LOAD - Load Planning (weight & balance, optimization)
  3. TRACK - Real-Time Tracking (scan monitoring, notifications)
  4. RISK - Risk Assessment (connection risk, prediction)
  5. EXCEPT - Exception Management (anomaly detection, resolution)
  6. LNF - Lost & Found (image matching, reunion)
  7. COMP - Compensation (liability, payment automation)
  8. INTER - Interline Coordination (partner handoffs, SITA messages)

  Dependencies: Migration 001 (domains), existing agent_categories table
*/

-- ============================================================================
-- INSERT BAGGAGE AGENT CATEGORIES
-- ============================================================================

INSERT INTO agent_categories (code, name, description, icon, color, created_at, updated_at) VALUES

-- Category 1: Baggage Intake
('BAG_IN', 'Baggage Intake',
  'Check-in and tagging operations including passenger eligibility validation, IATA-compliant tag generation, special handling code assignment, and routing tag creation for multi-leg journeys.',
  '🏷️',
  '#3b82f6',
  NOW(), NOW()),

-- Category 2: Load Planning
('LOAD', 'Load Planning',
  'Weight and balance calculations, container/cart loading sequence optimization, time-sensitive connection prioritization, and ramp operations coordination to ensure safe and efficient aircraft loading.',
  '⚖️',
  '#8b5cf6',
  NOW(), NOW()),

-- Category 3: Real-Time Tracking
('TRACK', 'Real-Time Tracking',
  'Continuous scan event monitoring across the baggage journey, missing scan detection, interline transfer tracking, passenger notifications via app/SMS, and WorldTracer/SITA integration.',
  '📍',
  '#10b981',
  NOW(), NOW()),

-- Category 4: Risk Assessment
('RISK', 'Risk Assessment',
  'Connection risk scoring with ML models, MCT violation detection, proactive intervention triggering for at-risk bags, mishandling probability prediction, and delay forecasting.',
  '⚠️',
  '#f59e0b',
  NOW(), NOW()),

-- Category 5: Exception Management
('EXCEPT', 'Exception Management',
  'Real-time anomaly detection, automatic exception classification (delayed, lost, damaged, pilfered), resolution workflow routing, WorldTracer PIR generation, and escalation management.',
  '🚨',
  '#ef4444',
  NOW(), NOW()),

-- Category 6: Lost & Found
('LNF', 'Lost & Found',
  'Image recognition for bag identification, semantic description matching, location correlation analysis, passenger characteristic matching, and automated reunion scheduling.',
  '🔍',
  '#06b6d4',
  NOW(), NOW()),

-- Category 7: Compensation
('COMP', 'Compensation',
  'Liability determination per Montreal Convention/EU261/DOT, compensation amount calculation with depreciation, documentation validation, payment authorization, and claim lifecycle tracking.',
  '💰',
  '#84cc16',
  NOW(), NOW()),

-- Category 8: Interline Coordination
('INTER', 'Interline Coordination',
  'Partner airline handoff management, SITA Type B message translation (BPM, BTM, BSM), cross-carrier recovery coordination, SLA compliance tracking, and liability transfer processing.',
  '🔗',
  '#a855f7',
  NOW(), NOW())

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_category_count INTEGER;
  v_category_names TEXT;
BEGIN
  -- Count categories
  SELECT COUNT(*) INTO v_category_count
  FROM agent_categories
  WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');

  -- Get category names
  SELECT STRING_AGG(name || ' (' || code || ')', ', ' ORDER BY code)
  INTO v_category_names
  FROM agent_categories
  WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 002 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Baggage agent categories added: %', v_category_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Categories created:';
  RAISE NOTICE '  🏷️  BAG_IN - Baggage Intake';
  RAISE NOTICE '  ⚖️  LOAD - Load Planning';
  RAISE NOTICE '  📍 TRACK - Real-Time Tracking';
  RAISE NOTICE '  ⚠️  RISK - Risk Assessment';
  RAISE NOTICE '  🚨 EXCEPT - Exception Management';
  RAISE NOTICE '  🔍 LNF - Lost & Found';
  RAISE NOTICE '  💰 COMP - Compensation';
  RAISE NOTICE '  🔗 INTER - Interline Coordination';
  RAISE NOTICE '';
  RAISE NOTICE 'Agent capabilities:';
  RAISE NOTICE '  • Eligibility validation & tag generation';
  RAISE NOTICE '  • Weight & balance optimization';
  RAISE NOTICE '  • Real-time scan monitoring';
  RAISE NOTICE '  • ML-powered risk prediction';
  RAISE NOTICE '  • Automatic exception classification';
  RAISE NOTICE '  • Image-based bag matching';
  RAISE NOTICE '  • Automated compensation calculation';
  RAISE NOTICE '  • SITA message translation';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run migration 003 (Core Baggage Tables)';
  RAISE NOTICE '========================================';
END $$;

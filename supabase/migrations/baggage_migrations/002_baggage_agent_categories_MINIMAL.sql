/*
  Migration 002: Baggage Agent Categories (Minimal Schema)

  Purpose: Define 8 agent categories for specialized baggage functions

  Categories:
  - BAG_IN: Baggage Intake
  - LOAD: Load Planning
  - TRACK: Real-Time Tracking
  - RISK: Risk Assessment
  - EXCEPT: Exception Management
  - LNF: Lost & Found
  - COMP: Compensation
  - INTER: Interline Coordination
*/

INSERT INTO agent_categories (code, name, description, icon, color) VALUES
('BAG_IN', 'Baggage Intake',
  'Check-in and tagging operations including passenger eligibility validation, IATA-compliant 10-digit bag tag generation, weight/dimension recording, special handling code assignment (IATA Resolution 780), routing tag creation for multi-leg journeys, and excess baggage fee calculation.',
  '🏷️', '#3b82f6'),

('LOAD', 'Load Planning',
  'Aircraft load optimization with weight & balance calculations per FAA/EASA regulations, container/cart loading sequence optimization, Center of Gravity (CG) monitoring, time-sensitive connection prioritization, and ramp operations coordination for safe and efficient loading.',
  '⚖️', '#10b981'),

('TRACK', 'Real-Time Tracking',
  'Continuous scan event monitoring across the baggage journey (check-in, TSA screening, makeup, loading, arrival, claim), missing scan detection with gap analysis, passenger notifications (app/SMS/email), and interline transfer visibility.',
  '📍', '#06b6d4'),

('RISK', 'Risk Assessment',
  'Connection risk scoring with ML models (AUC 0.89), Minimum Connection Time (MCT) violation detection, weather/delay impact analysis, intervention triggering for high-risk connections (>0.70 score), and predictive mishandling probability calculation.',
  '⚠️', '#f59e0b'),

('EXCEPT', 'Exception Management',
  'Automated exception detection and classification (delayed/lost/damaged/pilfered), recovery routing optimization, WorldTracer PIR filing, passenger communication, delivery scheduling, and last-mile courier coordination.',
  '🚨', '#ef4444'),

('LNF', 'Lost & Found',
  'Image recognition-based bag matching using ResNet50 deep learning model (92% accuracy), semantic description search with sentence transformers, found bag inventory management, passenger reunion workflows, and storage/disposal tracking (60-90 day retention).',
  '🔍', '#8b5cf6'),

('COMP', 'Compensation',
  'Automated claims processing with Montreal Convention compliance ($1,700 max liability), jurisdiction determination (Montreal/EU261/DOT), depreciation calculation by item category, fraud detection with ML pattern recognition, and settlement payment automation.',
  '💰', '#f59e0b'),

('INTER', 'Interline Coordination',
  'Partner airline baggage handoff management with SITA Type B message exchange (BPM, BTM, BSM, BNS, CPM), alliance network integration (Star Alliance, Oneworld, SkyTeam), SLA tracking (15 min notification, 60 min response, 24 hr recovery), and cost allocation/chargeback processing.',
  '🔗', '#a855f7')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Verification
DO $$
DECLARE
  v_category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_category_count
  FROM agent_categories
  WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION 002 COMPLETE';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Agent categories created: %', v_category_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Categories:';
  RAISE NOTICE '  1. 🏷️  BAG_IN - Baggage Intake';
  RAISE NOTICE '  2. ⚖️  LOAD - Load Planning';
  RAISE NOTICE '  3. 📍 TRACK - Real-Time Tracking';
  RAISE NOTICE '  4. ⚠️  RISK - Risk Assessment';
  RAISE NOTICE '  5. 🚨 EXCEPT - Exception Management';
  RAISE NOTICE '  6. 🔍 LNF - Lost & Found';
  RAISE NOTICE '  7. 💰 COMP - Compensation';
  RAISE NOTICE '  8. 🔗 INTER - Interline Coordination';
  RAISE NOTICE '';
  RAISE NOTICE '➡️  Next: Run migration 003 (Core Baggage Tables Part 1)';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

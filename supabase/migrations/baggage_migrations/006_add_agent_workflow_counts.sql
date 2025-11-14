/*
  Migration 006: Add Missing Fields to Baggage Agents

  Purpose: Add workflow_count and active_instances to baggage agents

  Issue: Baggage agents created in migration 004 are missing these fields,
  causing them to not show proper links/metrics in the Agent Network page

  Solution: Update all baggage agents with appropriate workflow counts
*/

-- Update Core Baggage Agents with workflow_count and active_instances
UPDATE agents SET
  workflow_count = 8,
  active_instances = 5
WHERE code = 'BAG_INTAKE_001';

UPDATE agents SET
  workflow_count = 12,
  active_instances = 8
WHERE code = 'LOAD_PLAN_001';

UPDATE agents SET
  workflow_count = 15,
  active_instances = 12
WHERE code = 'BAG_TRACK_001';

UPDATE agents SET
  workflow_count = 10,
  active_instances = 6
WHERE code = 'CONN_RISK_001';

UPDATE agents SET
  workflow_count = 18,
  active_instances = 10
WHERE code = 'BAG_EXCEPT_001';

UPDATE agents SET
  workflow_count = 6,
  active_instances = 3
WHERE code = 'LNF_MATCH_001';

UPDATE agents SET
  workflow_count = 14,
  active_instances = 7
WHERE code = 'COMP_AUTO_001';

UPDATE agents SET
  workflow_count = 9,
  active_instances = 5
WHERE code = 'INTER_COORD_001';

-- Update Supporting Baggage Agents with workflow_count and active_instances
UPDATE agents SET
  workflow_count = 5,
  active_instances = 3
WHERE code = 'TSA_COORD_001';

UPDATE agents SET
  workflow_count = 7,
  active_instances = 4
WHERE code = 'DELIVERY_SCHED_001';

UPDATE agents SET
  workflow_count = 6,
  active_instances = 3
WHERE code = 'DAMAGE_ASSESS_001';

UPDATE agents SET
  workflow_count = 12,
  active_instances = 8
WHERE code = 'PASSENGER_COMM_001';

UPDATE agents SET
  workflow_count = 8,
  active_instances = 4
WHERE code = 'SPECIAL_HANDLE_001';

UPDATE agents SET
  workflow_count = 4,
  active_instances = 2
WHERE code = 'RUSH_TAG_MGR_001';

UPDATE agents SET
  workflow_count = 5,
  active_instances = 2
WHERE code = 'DOC_VALIDATOR_001';

UPDATE agents SET
  workflow_count = 6,
  active_instances = 3
WHERE code = 'COST_ALLOC_001';

UPDATE agents SET
  workflow_count = 10,
  active_instances = 5
WHERE code = 'PERF_ANALYTICS_001';

UPDATE agents SET
  workflow_count = 8,
  active_instances = 4
WHERE code = 'ROOT_CAUSE_001';

-- Verification
DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_updated_count
  FROM agents
  WHERE code IN (
    'BAG_INTAKE_001', 'LOAD_PLAN_001', 'BAG_TRACK_001', 'CONN_RISK_001',
    'BAG_EXCEPT_001', 'LNF_MATCH_001', 'COMP_AUTO_001', 'INTER_COORD_001',
    'TSA_COORD_001', 'DELIVERY_SCHED_001', 'DAMAGE_ASSESS_001',
    'PASSENGER_COMM_001', 'SPECIAL_HANDLE_001', 'RUSH_TAG_MGR_001',
    'DOC_VALIDATOR_001', 'COST_ALLOC_001', 'PERF_ANALYTICS_001', 'ROOT_CAUSE_001'
  )
  AND workflow_count IS NOT NULL
  AND active_instances IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION 006 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Updated % baggage agents with workflow_count and active_instances', v_updated_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Agents should now appear properly in Agent Network view';
  RAISE NOTICE '========================================';
END $$;

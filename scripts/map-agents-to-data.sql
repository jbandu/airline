-- Map Agents to Data Entities
-- This script creates intelligent mappings between AI agents and data entities
-- based on agent names, types, and capabilities

-- =====================================================
-- DELAY & DISRUPTION AGENTS → FLIFO
-- =====================================================

INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'stream',
  'real-time',
  'continuous',
  true
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%delay%'
    OR a.name ILIKE '%disruption%'
    OR a.name ILIKE '%schedule monitor%'
    OR a.name ILIKE '%flight%'
    OR a.name ILIKE '%weather%'
    OR a.name ILIKE '%crew%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- CUSTOMER SERVICE AGENTS → PNR + LOYALTY
-- =====================================================

-- Map customer agents to PNR
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'on_demand',
  'near-real-time',
  'per_minute',
  false
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%customer%'
    OR a.name ILIKE '%context%'
    OR a.name ILIKE '%rebooking%'
    OR a.name ILIKE '%reaccommodation%'
  )
ON CONFLICT DO NOTHING;

-- Map customer agents to LOYALTY
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'LOYALTY'),
  'on_demand',
  'near-real-time',
  'per_minute',
  false
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%customer%'
    OR a.name ILIKE '%loyalty%'
    OR a.name ILIKE '%tier%'
    OR a.name ILIKE '%member%'
    OR a.name ILIKE '%recognition%'
    OR a.name ILIKE '%clv%'
    OR a.name ILIKE '%value%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- REBOOKING AGENTS → PNR + FLIFO + INVENTORY
-- =====================================================

-- Rebooking agents need PNR
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'stream',
  'real-time',
  'per_minute',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%rebooking%'
ON CONFLICT DO NOTHING;

-- Rebooking agents need FLIFO
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'stream',
  'real-time',
  'per_minute',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%rebooking%'
ON CONFLICT DO NOTHING;

-- Rebooking agents need INVENTORY
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'INVENTORY'),
  'stream',
  'real-time',
  'per_minute',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%rebooking%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- REVENUE MANAGEMENT AGENTS → INVENTORY + E-TKT
-- =====================================================

-- Pricing/Revenue agents → INVENTORY
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'INVENTORY'),
  CASE
    WHEN a.name ILIKE '%real%time%' OR a.name ILIKE '%dynamic%' THEN 'stream'
    ELSE 'batch'
  END,
  CASE
    WHEN a.name ILIKE '%real%time%' OR a.name ILIKE '%dynamic%' THEN 'near-real-time'
    ELSE 'batch'
  END,
  'per_hour',
  false
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%pricing%'
    OR a.name ILIKE '%revenue%'
    OR a.name ILIKE '%yield%'
    OR a.name ILIKE '%overbooking%'
    OR a.name ILIKE '%demand%'
    OR a.name ILIKE '%forecast%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- BAGGAGE AGENTS → BAGGAGE
-- =====================================================

INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'BAGGAGE'),
  'stream',
  'real-time',
  'continuous',
  true
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%bag%'
    OR a.name ILIKE '%luggage%'
    OR a.name ILIKE '%misconnect%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- TICKETING AGENTS → E-TKT
-- =====================================================

INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'E_TKT'),
  'on_demand',
  'near-real-time',
  'per_minute',
  false
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%refund%'
    OR a.name ILIKE '%ticket%'
    OR a.name ILIKE '%exchange%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONNECTION PROTECTION AGENTS → FLIFO + PNR + MCT
-- =====================================================

-- Connection agents need FLIFO
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'stream',
  'real-time',
  'continuous',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%connection%'
ON CONFLICT DO NOTHING;

-- Connection agents need PNR
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'stream',
  'real-time',
  'per_minute',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%connection%'
ON CONFLICT DO NOTHING;

-- Connection agents need MCT
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'MCT'),
  'on_demand',
  'real-time',
  'per_minute',
  true
FROM agents a
WHERE
  a.active = true
  AND a.name ILIKE '%connection%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCHEDULE PLANNING AGENTS → SSM
-- =====================================================

INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, query_frequency, is_critical)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'SSM'),
  'batch',
  'batch',
  'per_day',
  false
FROM agents a
WHERE
  a.active = true
  AND (
    a.name ILIKE '%schedule%'
    OR a.name ILIKE '%planning%'
    OR a.name ILIKE '%network%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count mappings per data entity
SELECT
  de.code,
  de.name,
  COUNT(adm.id) as agent_count,
  COUNT(CASE WHEN adm.is_critical = true THEN 1 END) as critical_count
FROM data_entities de
LEFT JOIN agent_data_mappings adm ON de.id = adm.data_entity_id
GROUP BY de.id, de.code, de.name
ORDER BY agent_count DESC;

-- Show agents mapped to each entity
SELECT
  de.name as entity_name,
  a.name as agent_name,
  adm.access_pattern,
  adm.latency_requirement,
  adm.query_frequency,
  adm.is_critical
FROM agent_data_mappings adm
JOIN data_entities de ON adm.data_entity_id = de.id
JOIN agents a ON adm.agent_id = a.id
ORDER BY de.name, adm.is_critical DESC, a.name;

-- Critical real-time agents
SELECT
  de.code,
  a.name,
  adm.access_pattern,
  adm.latency_requirement
FROM agent_data_mappings adm
JOIN data_entities de ON adm.data_entity_id = de.id
JOIN agents a ON adm.agent_id = a.id
WHERE adm.is_critical = true
  AND adm.latency_requirement = 'real-time'
ORDER BY de.code, a.name;

-- Summary stats
SELECT
  'Total Agents' as metric,
  COUNT(DISTINCT id) as value
FROM agents
WHERE active = true

UNION ALL

SELECT
  'Total Agent Mappings' as metric,
  COUNT(*) as value
FROM agent_data_mappings

UNION ALL

SELECT
  'Agents with Mappings' as metric,
  COUNT(DISTINCT agent_id) as value
FROM agent_data_mappings

UNION ALL

SELECT
  'Agents without Mappings' as metric,
  COUNT(DISTINCT a.id) as value
FROM agents a
WHERE a.active = true
  AND a.id NOT IN (SELECT agent_id FROM agent_data_mappings)

UNION ALL

SELECT
  'Critical Mappings' as metric,
  COUNT(*) as value
FROM agent_data_mappings
WHERE is_critical = true;

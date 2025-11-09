-- Map Workflows to Data Entities
-- This script creates intelligent mappings between workflows and data entities
-- based on workflow names, descriptions, and subdomains

-- =====================================================
-- FLIGHT OPERATIONS WORKFLOWS → FLIFO
-- =====================================================

-- Map flight operations workflows to FLIFO
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'read_write',
  true,
  'high',
  'real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%flight%'
    OR w.name ILIKE '%delay%'
    OR w.name ILIKE '%departure%'
    OR w.name ILIKE '%arrival%'
    OR w.name ILIKE '%dispatch%'
    OR w.name ILIKE '%operations%'
    OR w.subdomain_id IN (
      SELECT id FROM subdomains WHERE name ILIKE '%flight%' OR name ILIKE '%operations%'
    )
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- CUSTOMER SERVICE WORKFLOWS → PNR + LOYALTY
-- =====================================================

-- Map customer service workflows to PNR
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'read_write',
  true,
  'high',
  'near-real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%customer%'
    OR w.name ILIKE '%passenger%'
    OR w.name ILIKE '%booking%'
    OR w.name ILIKE '%reservation%'
    OR w.name ILIKE '%check-in%'
    OR w.name ILIKE '%rebooking%'
    OR w.name ILIKE '%service%'
    OR w.subdomain_id IN (
      SELECT id FROM subdomains WHERE name ILIKE '%customer%' OR name ILIKE '%service%'
    )
  )
ON CONFLICT DO NOTHING;

-- Map customer workflows to LOYALTY
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'LOYALTY'),
  'read',
  false,
  'medium',
  'near-real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%customer%'
    OR w.name ILIKE '%passenger%'
    OR w.name ILIKE '%loyalty%'
    OR w.name ILIKE '%member%'
    OR w.name ILIKE '%upgrade%'
    OR w.name ILIKE '%recognition%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- REVENUE MANAGEMENT WORKFLOWS → INVENTORY + E-TKT
-- =====================================================

-- Map revenue workflows to INVENTORY
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'INVENTORY'),
  'read_write',
  true,
  'very_high',
  'real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%revenue%'
    OR w.name ILIKE '%pricing%'
    OR w.name ILIKE '%yield%'
    OR w.name ILIKE '%inventory%'
    OR w.name ILIKE '%seat%'
    OR w.name ILIKE '%availability%'
    OR w.name ILIKE '%capacity%'
    OR w.subdomain_id IN (
      SELECT id FROM subdomains WHERE name ILIKE '%revenue%' OR name ILIKE '%pricing%'
    )
  )
ON CONFLICT DO NOTHING;

-- Map ticketing workflows to E-TKT
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'E_TKT'),
  'read_write',
  true,
  'high',
  'near-real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%ticket%'
    OR w.name ILIKE '%fare%'
    OR w.name ILIKE '%refund%'
    OR w.name ILIKE '%exchange%'
    OR w.name ILIKE '%payment%'
    OR w.name ILIKE '%revenue accounting%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- GROUND OPERATIONS WORKFLOWS → BAGGAGE
-- =====================================================

-- Map baggage workflows to BAGGAGE
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'BAGGAGE'),
  'read_write',
  true,
  'high',
  'real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%bag%'
    OR w.name ILIKE '%luggage%'
    OR w.name ILIKE '%misconnect%'
    OR w.name ILIKE '%ground%'
    OR w.name ILIKE '%ramp%'
    OR w.subdomain_id IN (
      SELECT id FROM subdomains WHERE name ILIKE '%ground%' OR name ILIKE '%baggage%'
    )
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCHEDULE PLANNING WORKFLOWS → SSM + MCT
-- =====================================================

-- Map schedule workflows to SSM
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'SSM'),
  'read_write',
  true,
  'low',
  'batch'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%schedule%'
    OR w.name ILIKE '%planning%'
    OR w.name ILIKE '%network%'
    OR w.name ILIKE '%route%'
    OR w.subdomain_id IN (
      SELECT id FROM subdomains WHERE name ILIKE '%schedule%' OR name ILIKE '%planning%'
    )
  )
ON CONFLICT DO NOTHING;

-- Map connection workflows to MCT
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'MCT'),
  'read',
  false,
  'low',
  'on-demand'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND (
    w.name ILIKE '%connect%'
    OR w.name ILIKE '%transfer%'
    OR w.name ILIKE '%rebooking%'
    OR w.name ILIKE '%disruption%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- GENERAL: All booking/reservation workflows → PNR
-- =====================================================

-- Ensure all booking-related workflows have PNR access
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data, volume_estimate, latency_requirement)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'read',
  false,
  'medium',
  'near-real-time'
FROM workflows w
WHERE
  w.archived_at IS NULL
  AND w.id NOT IN (
    SELECT workflow_id FROM workflow_data_mappings
    WHERE data_entity_id = (SELECT id FROM data_entities WHERE code = 'PNR')
  )
  AND (
    w.name ILIKE '%pnr%'
    OR w.name ILIKE '%guest%'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count mappings per data entity
SELECT
  de.code,
  de.name,
  COUNT(wdm.id) as workflow_count
FROM data_entities de
LEFT JOIN workflow_data_mappings wdm ON de.id = wdm.data_entity_id
GROUP BY de.id, de.code, de.name
ORDER BY workflow_count DESC;

-- Show workflows mapped to each entity
SELECT
  de.name as entity_name,
  w.name as workflow_name,
  wdm.access_type,
  wdm.is_primary_data,
  wdm.volume_estimate,
  wdm.latency_requirement
FROM workflow_data_mappings wdm
JOIN data_entities de ON wdm.data_entity_id = de.id
JOIN workflows w ON wdm.workflow_id = w.id
ORDER BY de.name, w.name;

-- Summary stats
SELECT
  'Total Workflows' as metric,
  COUNT(DISTINCT id) as value
FROM workflows
WHERE archived_at IS NULL

UNION ALL

SELECT
  'Total Mappings' as metric,
  COUNT(*) as value
FROM workflow_data_mappings

UNION ALL

SELECT
  'Workflows with Mappings' as metric,
  COUNT(DISTINCT workflow_id) as value
FROM workflow_data_mappings

UNION ALL

SELECT
  'Workflows without Mappings' as metric,
  COUNT(DISTINCT w.id) as value
FROM workflows w
WHERE w.archived_at IS NULL
  AND w.id NOT IN (SELECT workflow_id FROM workflow_data_mappings);

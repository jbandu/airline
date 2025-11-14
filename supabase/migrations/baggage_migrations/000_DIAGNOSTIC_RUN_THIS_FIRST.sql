-- ============================================================================
-- DIAGNOSTIC: Understand Type Mismatches
-- ============================================================================
-- Run this FIRST to see what we're dealing with

-- Check domains table structure
SELECT
  'domains.id' as column_ref,
  c.data_type,
  c.column_default,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'domains' AND c.column_name = 'id';

-- Check subdomains table structure
SELECT
  'subdomains.id' as column_ref,
  c.data_type,
  c.column_default,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'subdomains' AND c.column_name = 'id'
UNION ALL
SELECT
  'subdomains.domain_id',
  c.data_type,
  c.column_default,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'subdomains' AND c.column_name = 'domain_id';

-- Check workflows table structure
SELECT
  'workflows.id' as column_ref,
  c.data_type,
  c.column_default,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'workflows' AND c.column_name = 'id'
UNION ALL
SELECT
  'workflows.subdomain_id',
  c.data_type,
  c.column_default,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'workflows' AND c.column_name = 'subdomain_id';

-- Summary
SELECT
  '=== TYPE SUMMARY ===' as info,
  '' as details
UNION ALL
SELECT
  'If domains.id is BIGINT',
  '→ Problem: subdomains expects UUID domain_id'
UNION ALL
SELECT
  'If subdomains.id is BIGINT',
  '→ Problem: workflows expects UUID subdomain_id'
UNION ALL
SELECT
  'Solution needed',
  '→ All must be same type (UUID or BIGINT)';

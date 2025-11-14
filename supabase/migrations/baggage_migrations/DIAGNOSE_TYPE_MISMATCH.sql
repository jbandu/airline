-- Quick diagnostic query to understand the type mismatch
-- Run this first to see what types we're dealing with

-- Check domains table ID type
SELECT
  'domains.id' as column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'domains' AND column_name = 'id';

-- Check subdomains table ID type
SELECT
  'subdomains.id' as column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'subdomains' AND column_name = 'id';

-- Check workflows table subdomain_id type
SELECT
  'workflows.subdomain_id' as column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'workflows' AND column_name = 'subdomain_id';

-- Check if we have baggage subdomains
SELECT
  'Baggage subdomains count' as info,
  COUNT(*)::TEXT as value
FROM subdomains sd
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%';

-- Show actual subdomain IDs and types
SELECT
  d.name as domain_name,
  sd.id as subdomain_id,
  sd.name as subdomain_name,
  pg_typeof(sd.id) as id_type
FROM subdomains sd
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
LIMIT 5;

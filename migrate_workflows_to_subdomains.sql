-- Migration: Link workflows to subdomains
--
-- Problem: 163 workflows have domain_id but no subdomain_id
-- Solution: Assign each workflow to the first subdomain in its domain
--
-- Run this in Supabase SQL Editor

-- Step 1: Create a temporary table with workflow -> subdomain mapping
CREATE TEMP TABLE workflow_subdomain_mapping AS
SELECT
  w.id AS workflow_id,
  w.domain_id,
  (
    SELECT s.id
    FROM subdomains s
    WHERE s.domain_id = w.domain_id
    ORDER BY s.created_at ASC
    LIMIT 1
  ) AS subdomain_id
FROM workflows w
WHERE w.subdomain_id IS NULL
  AND w.domain_id IS NOT NULL;

-- Step 2: Show what will be updated (review this first!)
SELECT
  w.id,
  w.name,
  d.name AS domain_name,
  s.name AS subdomain_name
FROM workflows w
JOIN workflow_subdomain_mapping wsm ON w.id = wsm.workflow_id
JOIN domains d ON wsm.domain_id = d.id
LEFT JOIN subdomains s ON wsm.subdomain_id = s.id
ORDER BY d.name, w.name;

-- Step 3: Perform the update (uncomment to execute)
-- UPDATE workflows w
-- SET
--   subdomain_id = wsm.subdomain_id,
--   updated_at = NOW()
-- FROM workflow_subdomain_mapping wsm
-- WHERE w.id = wsm.workflow_id
--   AND wsm.subdomain_id IS NOT NULL;

-- Step 4: Verify the results (run after update)
-- SELECT
--   COUNT(*) FILTER (WHERE subdomain_id IS NULL) AS workflows_without_subdomain,
--   COUNT(*) FILTER (WHERE subdomain_id IS NOT NULL) AS workflows_with_subdomain
-- FROM workflows
-- WHERE archived_at IS NULL;

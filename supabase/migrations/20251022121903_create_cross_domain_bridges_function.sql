/*
  # Create Cross-Domain Bridges Function

  1. New Functions
    - `get_cross_domain_bridges()` - Identifies workflows that bridge multiple domains
  
  2. Structure
    - Finds workflows that share stakeholders across domains
    - Shows relationships between different domain areas
    - Includes strength metrics based on shared stakeholders

  ## Notes
  - Returns array of bridge connections
  - Only includes non-archived workflows
  - Useful for identifying integration opportunities
*/

CREATE OR REPLACE FUNCTION get_cross_domain_bridges()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH domain_stakeholder_connections AS (
    SELECT 
      d1.id as domain1_id,
      d1.name as domain1_name,
      d2.id as domain2_id,
      d2.name as domain2_name,
      COUNT(DISTINCT ws1.stakeholder_id) as shared_stakeholders,
      jsonb_agg(DISTINCT s.name) as stakeholder_names
    FROM workflows w1
    INNER JOIN subdomains s1 ON w1.subdomain_id = s1.id
    INNER JOIN domains d1 ON s1.domain_id = d1.id
    INNER JOIN workflow_stakeholders ws1 ON w1.id = ws1.workflow_id
    INNER JOIN workflow_stakeholders ws2 ON ws1.stakeholder_id = ws2.stakeholder_id AND ws1.workflow_id != ws2.workflow_id
    INNER JOIN workflows w2 ON ws2.workflow_id = w2.id
    INNER JOIN subdomains s2 ON w2.subdomain_id = s2.id
    INNER JOIN domains d2 ON s2.domain_id = d2.id
    INNER JOIN stakeholders s ON ws1.stakeholder_id = s.id
    WHERE w1.archived_at IS NULL 
      AND w2.archived_at IS NULL
      AND d1.id < d2.id
    GROUP BY d1.id, d1.name, d2.id, d2.name
    HAVING COUNT(DISTINCT ws1.stakeholder_id) > 0
  ),
  workflow_connections AS (
    SELECT 
      w1.id as workflow1_id,
      w1.name as workflow1_name,
      d1.name as domain1,
      w2.id as workflow2_id,
      w2.name as workflow2_name,
      d2.name as domain2,
      COUNT(DISTINCT ws1.stakeholder_id) as connection_strength
    FROM workflows w1
    INNER JOIN subdomains s1 ON w1.subdomain_id = s1.id
    INNER JOIN domains d1 ON s1.domain_id = d1.id
    INNER JOIN workflow_stakeholders ws1 ON w1.id = ws1.workflow_id
    INNER JOIN workflow_stakeholders ws2 ON ws1.stakeholder_id = ws2.stakeholder_id AND ws1.workflow_id < ws2.workflow_id
    INNER JOIN workflows w2 ON ws2.workflow_id = w2.id
    INNER JOIN subdomains s2 ON w2.subdomain_id = s2.id
    INNER JOIN domains d2 ON s2.domain_id = d2.id
    WHERE w1.archived_at IS NULL 
      AND w2.archived_at IS NULL
      AND d1.id != d2.id
    GROUP BY w1.id, w1.name, d1.name, w2.id, w2.name, d2.name
  )
  SELECT jsonb_build_object(
    'domain_bridges', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'domain1', domain1_name,
          'domain2', domain2_name,
          'shared_stakeholders', shared_stakeholders,
          'stakeholders', stakeholder_names
        )
      ), '[]'::jsonb)
      FROM domain_stakeholder_connections
    ),
    'workflow_connections', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'workflow1', workflow1_name,
          'domain1', domain1,
          'workflow2', workflow2_name,
          'domain2', domain2,
          'connection_strength', connection_strength
        )
      ), '[]'::jsonb)
      FROM workflow_connections
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

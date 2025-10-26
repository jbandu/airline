/*
  # Create Ontology Tree Function

  1. New Functions
    - `get_ontology_tree()` - Returns hierarchical tree structure of domains, subdomains, and workflows
  
  2. Structure
    - Root level: All domains
    - Second level: Subdomains under each domain
    - Third level: Active workflows under each subdomain
    - Includes aggregate metrics (workflow counts, average complexity/potential)

  ## Notes
  - Returns JSON structure compatible with react-d3-tree
  - Only includes non-archived workflows
  - Provides metrics for data-driven visualization
*/

CREATE OR REPLACE FUNCTION get_ontology_tree()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH workflow_data AS (
    SELECT 
      w.id,
      w.name,
      w.subdomain_id,
      wv.status,
      wv.complexity,
      wv.agentic_potential,
      wv.implementation_wave
    FROM workflows w
    LEFT JOIN workflow_versions wv ON w.current_version_id = wv.id
    WHERE w.archived_at IS NULL
  ),
  subdomain_tree AS (
    SELECT 
      s.id,
      s.name,
      s.domain_id,
      jsonb_agg(
        jsonb_build_object(
          'name', wd.name,
          'id', wd.id,
          'type', 'workflow',
          'status', wd.status,
          'complexity', wd.complexity,
          'agentic_potential', wd.agentic_potential,
          'implementation_wave', wd.implementation_wave
        ) ORDER BY wd.name
      ) FILTER (WHERE wd.id IS NOT NULL) as workflows,
      COUNT(wd.id) as workflow_count,
      AVG(wd.complexity) as avg_complexity,
      AVG(wd.agentic_potential) as avg_potential
    FROM subdomains s
    LEFT JOIN workflow_data wd ON s.id = wd.subdomain_id
    GROUP BY s.id, s.name, s.domain_id
  ),
  domain_tree AS (
    SELECT 
      d.id,
      d.name,
      jsonb_agg(
        jsonb_build_object(
          'name', st.name,
          'id', st.id,
          'type', 'subdomain',
          'workflow_count', st.workflow_count,
          'avg_complexity', ROUND(st.avg_complexity::numeric, 1),
          'avg_potential', ROUND(st.avg_potential::numeric, 1),
          'children', COALESCE(st.workflows, '[]'::jsonb)
        ) ORDER BY st.name
      ) FILTER (WHERE st.id IS NOT NULL) as subdomains,
      SUM(st.workflow_count) as total_workflows
    FROM domains d
    LEFT JOIN subdomain_tree st ON d.id = st.domain_id
    GROUP BY d.id, d.name
  )
  SELECT jsonb_build_object(
    'name', 'Airline AI Ontology',
    'type', 'root',
    'children', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', dt.name,
          'id', dt.id,
          'type', 'domain',
          'workflow_count', dt.total_workflows,
          'children', COALESCE(dt.subdomains, '[]'::jsonb)
        ) ORDER BY dt.name
      )
      FROM domain_tree dt
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

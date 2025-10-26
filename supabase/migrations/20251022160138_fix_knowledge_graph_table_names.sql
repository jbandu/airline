/*
  # Fix Knowledge Graph Functions - Table Names

  1. Changes
    - Update functions to use workflow_version_stakeholders instead of workflow_stakeholders
    - This is the correct join table name in the schema

  2. Notes
    - The table links workflow versions to stakeholders
*/

-- Fix get_knowledge_graph function
CREATE OR REPLACE FUNCTION get_knowledge_graph()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH workflow_nodes AS (
    SELECT jsonb_build_object(
      'id', 'workflow_' || w.id::text,
      'label', w.name,
      'type', 'workflow',
      'metadata', jsonb_build_object(
        'complexity', COALESCE(wv.complexity, 1),
        'potential', COALESCE(wv.agentic_potential, 1),
        'status', COALESCE(wv.status, 'pending'),
        'wave', COALESCE(wv.implementation_wave, 1)
      )
    ) as node
    FROM workflows w
    LEFT JOIN workflow_versions wv ON w.current_version_id = wv.id
    WHERE w.archived_at IS NULL
  ),
  domain_nodes AS (
    SELECT jsonb_build_object(
      'id', 'domain_' || d.id::text,
      'label', d.name,
      'type', 'domain',
      'metadata', jsonb_build_object()
    ) as node
    FROM domains d
  ),
  stakeholder_nodes AS (
    SELECT jsonb_build_object(
      'id', 'stakeholder_' || s.id::text,
      'label', s.name,
      'type', 'stakeholder',
      'metadata', jsonb_build_object(
        'kind', s.kind
      )
    ) as node
    FROM stakeholders s
  ),
  all_nodes AS (
    SELECT node FROM workflow_nodes
    UNION ALL
    SELECT node FROM domain_nodes
    UNION ALL
    SELECT node FROM stakeholder_nodes
  ),
  workflow_domain_links AS (
    SELECT jsonb_build_object(
      'source', 'workflow_' || w.id::text,
      'target', 'domain_' || s.domain_id::text,
      'relationship', 'belongs_to',
      'weight', 'strong'
    ) as link
    FROM workflows w
    INNER JOIN subdomains s ON w.subdomain_id = s.id
    WHERE w.archived_at IS NULL
  ),
  workflow_stakeholder_links AS (
    SELECT jsonb_build_object(
      'source', 'workflow_' || w.id::text,
      'target', 'stakeholder_' || wvs.stakeholder_id::text,
      'relationship', 'involves',
      'weight', 'medium'
    ) as link
    FROM workflows w
    INNER JOIN workflow_version_stakeholders wvs ON w.current_version_id = wvs.workflow_version_id
    WHERE w.archived_at IS NULL AND w.current_version_id IS NOT NULL
  ),
  all_links AS (
    SELECT link FROM workflow_domain_links
    UNION ALL
    SELECT link FROM workflow_stakeholder_links
  )
  SELECT jsonb_build_object(
    'nodes', COALESCE((SELECT jsonb_agg(node) FROM all_nodes), '[]'::jsonb),
    'links', COALESCE((SELECT jsonb_agg(link) FROM all_links), '[]'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix get_cross_domain_bridges function
CREATE OR REPLACE FUNCTION get_cross_domain_bridges()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH stakeholder_workflows AS (
    SELECT 
      st.id as stakeholder_id,
      st.name as stakeholder_name,
      st.kind as stakeholder_kind,
      w.id as workflow_id,
      w.name as workflow_name,
      d.id as domain_id,
      d.name as domain_name
    FROM stakeholders st
    INNER JOIN workflow_version_stakeholders wvs ON st.id = wvs.stakeholder_id
    INNER JOIN workflows w ON wvs.workflow_version_id = w.current_version_id
    INNER JOIN subdomains s ON w.subdomain_id = s.id
    INNER JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL AND w.current_version_id IS NOT NULL
  ),
  stakeholder_domains AS (
    SELECT 
      stakeholder_id,
      stakeholder_name,
      stakeholder_kind,
      array_agg(DISTINCT domain_id) as domain_ids,
      array_agg(DISTINCT domain_name) as domain_names,
      count(DISTINCT domain_id) as domain_count
    FROM stakeholder_workflows
    GROUP BY stakeholder_id, stakeholder_name, stakeholder_kind
    HAVING count(DISTINCT domain_id) > 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'stakeholder_id', stakeholder_id,
      'stakeholder_name', stakeholder_name,
      'stakeholder_kind', stakeholder_kind,
      'domains', domain_names,
      'bridge_strength', domain_count
    )
  ) INTO result
  FROM stakeholder_domains;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

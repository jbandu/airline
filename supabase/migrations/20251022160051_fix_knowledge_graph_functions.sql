/*
  # Fix Knowledge Graph Functions

  1. Changes
    - Update get_knowledge_graph to use correct stakeholder columns (kind instead of role/department)
    - Update get_semantic_similarity_matrix to use correct columns
    - Update get_cross_domain_bridges to use correct columns
    - Update get_knowledge_timeline to use correct columns

  2. Notes
    - Stakeholders table has: id, name, kind
    - Not role and department
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
      'source', 'workflow_' || ws.workflow_id::text,
      'target', 'stakeholder_' || ws.stakeholder_id::text,
      'relationship', 'involves',
      'weight', 'medium'
    ) as link
    FROM workflow_stakeholders ws
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

-- Fix get_semantic_similarity_matrix function
CREATE OR REPLACE FUNCTION get_semantic_similarity_matrix()
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
      d.name as domain_name,
      s.name as subdomain_name,
      COALESCE(wv.complexity, 1) as complexity,
      COALESCE(wv.agentic_potential, 1) as potential,
      COALESCE(wv.implementation_wave, 1) as wave
    FROM workflows w
    LEFT JOIN workflow_versions wv ON w.current_version_id = wv.id
    LEFT JOIN subdomains s ON w.subdomain_id = s.id
    LEFT JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL
  ),
  similarity_pairs AS (
    SELECT 
      w1.id as workflow1_id,
      w1.name as workflow1_name,
      w2.id as workflow2_id,
      w2.name as workflow2_name,
      CASE 
        WHEN w1.domain_name = w2.domain_name THEN 0.5
        ELSE 0.0
      END +
      CASE 
        WHEN w1.subdomain_name = w2.subdomain_name THEN 0.3
        ELSE 0.0
      END +
      CASE 
        WHEN ABS(w1.complexity - w2.complexity) <= 1 THEN 0.1
        ELSE 0.0
      END +
      CASE 
        WHEN w1.wave = w2.wave THEN 0.1
        ELSE 0.0
      END as similarity
    FROM workflow_data w1
    CROSS JOIN workflow_data w2
    WHERE w1.id < w2.id
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'workflow1_id', workflow1_id,
      'workflow1_name', workflow1_name,
      'workflow2_id', workflow2_id,
      'workflow2_name', workflow2_name,
      'similarity', similarity
    )
  ) INTO result
  FROM similarity_pairs
  WHERE similarity > 0;
  
  RETURN COALESCE(result, '[]'::jsonb);
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
    INNER JOIN workflow_stakeholders ws ON st.id = ws.stakeholder_id
    INNER JOIN workflows w ON ws.workflow_id = w.id
    INNER JOIN subdomains s ON w.subdomain_id = s.id
    INNER JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL
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

-- Fix get_knowledge_timeline function  
CREATE OR REPLACE FUNCTION get_knowledge_timeline()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH workflow_timeline AS (
    SELECT 
      w.id,
      w.name,
      w.created_at,
      d.name as domain_name,
      s.name as subdomain_name,
      COALESCE(wv.implementation_wave, 1) as wave,
      COALESCE(wv.complexity, 1) as complexity,
      COALESCE(wv.agentic_potential, 1) as potential
    FROM workflows w
    LEFT JOIN workflow_versions wv ON w.current_version_id = wv.id
    LEFT JOIN subdomains s ON w.subdomain_id = s.id
    LEFT JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL
    ORDER BY w.created_at
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'created_at', created_at,
      'domain', domain_name,
      'subdomain', subdomain_name,
      'wave', wave,
      'complexity', complexity,
      'potential', potential
    )
  ) INTO result
  FROM workflow_timeline;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

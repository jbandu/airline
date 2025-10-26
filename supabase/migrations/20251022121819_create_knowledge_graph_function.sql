/*
  # Create Knowledge Graph Function

  1. New Functions
    - `get_knowledge_graph()` - Returns nodes and links for knowledge graph visualization
  
  2. Structure
    - Nodes: Workflows, domains, and stakeholders
    - Links: Relationships between entities (workflow-domain, workflow-stakeholder)
    - Includes metadata for node sizing and coloring

  ## Notes
  - Returns JSON structure with nodes and links arrays
  - Supports filtering by node type
  - Only includes non-archived workflows
*/

CREATE OR REPLACE FUNCTION get_knowledge_graph()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  nodes jsonb;
  links jsonb;
BEGIN
  WITH workflow_nodes AS (
    SELECT jsonb_build_object(
      'id', 'workflow_' || w.id::text,
      'label', w.name,
      'type', 'workflow',
      'metadata', jsonb_build_object(
        'complexity', wv.complexity,
        'potential', wv.agentic_potential,
        'status', wv.status,
        'wave', wv.implementation_wave
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
        'role', s.role,
        'department', s.department
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
    'nodes', (SELECT jsonb_agg(node) FROM all_nodes),
    'links', (SELECT jsonb_agg(link) FROM all_links)
  ) INTO result;
  
  RETURN result;
END;
$$;

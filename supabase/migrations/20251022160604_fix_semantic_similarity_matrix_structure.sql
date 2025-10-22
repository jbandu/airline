/*
  # Fix Semantic Similarity Matrix Structure

  1. Changes
    - Update get_semantic_similarity_matrix to return proper structure
    - Return: { workflows: [...], matrix: [...] }
    - workflows: list of unique workflows with id, name, domain
    - matrix: array of similarity pairs

  2. Notes
    - Component expects this specific structure
    - Matrix should include workflow names and domain info
*/

CREATE OR REPLACE FUNCTION get_semantic_similarity_matrix()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  workflows_list jsonb;
  matrix_data jsonb;
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
  workflow_list AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id::text,
        'name', name,
        'domain', domain_name
      )
    ) as workflows
    FROM workflow_data
  ),
  similarity_pairs AS (
    SELECT 
      w1.id::text as workflow1_id,
      w1.name as workflow1_name,
      w1.domain_name as domain1,
      w2.id::text as workflow2_id,
      w2.name as workflow2_name,
      w2.domain_name as domain2,
      (
        CASE 
          WHEN w1.domain_name = w2.domain_name THEN 50
          ELSE 0
        END +
        CASE 
          WHEN w1.subdomain_name = w2.subdomain_name THEN 30
          ELSE 0
        END +
        CASE 
          WHEN ABS(w1.complexity - w2.complexity) <= 1 THEN 10
          ELSE 0
        END +
        CASE 
          WHEN w1.wave = w2.wave THEN 10
          ELSE 0
        END
      ) as similarity,
      0 as common_count
    FROM workflow_data w1
    CROSS JOIN workflow_data w2
    WHERE w1.id < w2.id
  ),
  matrix_pairs AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'workflow1_id', workflow1_id,
        'workflow1', workflow1_name,
        'domain1', domain1,
        'workflow2_id', workflow2_id,
        'workflow2', workflow2_name,
        'domain2', domain2,
        'similarity', similarity,
        'commonCount', common_count
      )
    ) as matrix
    FROM similarity_pairs
    WHERE similarity > 0
  )
  SELECT jsonb_build_object(
    'workflows', (SELECT workflows FROM workflow_list),
    'matrix', COALESCE((SELECT matrix FROM matrix_pairs), '[]'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$;

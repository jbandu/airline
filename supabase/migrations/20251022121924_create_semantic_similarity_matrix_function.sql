/*
  # Create Semantic Similarity Matrix Function

  1. New Functions
    - `get_semantic_similarity_matrix()` - Calculates similarity between workflows
  
  2. Structure
    - Compares workflows based on shared attributes
    - Calculates similarity scores (0-1)
    - Returns matrix format for heatmap visualization

  ## Notes
  - Similarity based on: domain, complexity, potential, AI enablers
  - Returns matrix with workflow pairs and similarity scores
  - Only includes non-archived workflows
*/

CREATE OR REPLACE FUNCTION get_semantic_similarity_matrix()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH workflow_features AS (
    SELECT 
      w.id,
      w.name,
      d.name as domain,
      wv.complexity,
      wv.agentic_potential,
      wv.autonomy_level,
      wv.ai_enabler_type,
      wv.implementation_wave,
      wv.status
    FROM workflows w
    INNER JOIN workflow_versions wv ON w.current_version_id = wv.id
    INNER JOIN subdomains s ON w.subdomain_id = s.id
    INNER JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL
  ),
  similarity_pairs AS (
    SELECT 
      w1.id as workflow1_id,
      w1.name as workflow1_name,
      w2.id as workflow2_id,
      w2.name as workflow2_name,
      (
        (CASE WHEN w1.domain = w2.domain THEN 0.3 ELSE 0.0 END) +
        (CASE WHEN ABS(w1.complexity - w2.complexity) <= 1 THEN 0.2 ELSE 0.0 END) +
        (CASE WHEN ABS(w1.agentic_potential - w2.agentic_potential) <= 1 THEN 0.2 ELSE 0.0 END) +
        (CASE WHEN w1.ai_enabler_type = w2.ai_enabler_type THEN 0.15 ELSE 0.0 END) +
        (CASE WHEN w1.implementation_wave = w2.implementation_wave THEN 0.1 ELSE 0.0 END) +
        (CASE WHEN w1.status = w2.status THEN 0.05 ELSE 0.0 END)
      ) as similarity_score
    FROM workflow_features w1
    CROSS JOIN workflow_features w2
    WHERE w1.id < w2.id
  ),
  workflow_list AS (
    SELECT DISTINCT id, name
    FROM workflow_features
    ORDER BY name
  )
  SELECT jsonb_build_object(
    'workflows', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name
        )
      )
      FROM workflow_list
    ),
    'similarities', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'workflow1_id', workflow1_id,
          'workflow1_name', workflow1_name,
          'workflow2_id', workflow2_id,
          'workflow2_name', workflow2_name,
          'similarity', ROUND(similarity_score::numeric, 2)
        )
      ), '[]'::jsonb)
      FROM similarity_pairs
      WHERE similarity_score > 0.3
      ORDER BY similarity_score DESC
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

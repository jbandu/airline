/*
  # Create Knowledge Timeline Function

  1. New Functions
    - `get_knowledge_timeline()` - Returns timeline of workflow evolution by implementation wave
  
  2. Structure
    - Groups workflows by implementation wave
    - Shows workflow counts and metrics over time
    - Includes domain breakdown per wave

  ## Notes
  - Returns array of timeline entries
  - Only includes non-archived workflows
  - Useful for tracking implementation progress
*/

CREATE OR REPLACE FUNCTION get_knowledge_timeline()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH wave_data AS (
    SELECT 
      wv.implementation_wave,
      COUNT(w.id) as workflow_count,
      AVG(wv.complexity) as avg_complexity,
      AVG(wv.agentic_potential) as avg_potential,
      jsonb_agg(DISTINCT jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'domain', d.name,
        'subdomain', s.name,
        'status', wv.status,
        'complexity', wv.complexity,
        'potential', wv.agentic_potential
      )) as workflows
    FROM workflows w
    INNER JOIN workflow_versions wv ON w.current_version_id = wv.id
    INNER JOIN subdomains s ON w.subdomain_id = s.id
    INNER JOIN domains d ON s.domain_id = d.id
    WHERE w.archived_at IS NULL
    GROUP BY wv.implementation_wave
    ORDER BY wv.implementation_wave
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'wave', implementation_wave,
      'workflow_count', workflow_count,
      'avg_complexity', ROUND(avg_complexity::numeric, 2),
      'avg_potential', ROUND(avg_potential::numeric, 2),
      'workflows', workflows
    )
  ) INTO result
  FROM wave_data;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

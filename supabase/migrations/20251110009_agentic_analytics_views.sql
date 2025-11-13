/*
  Migration 009: Agentic Distribution Analytics Views

  Purpose: Create analytical views for AI readiness scorecard and operational dashboards

  Views Created:
  - ai_readiness_scorecard: Overall AI maturity assessment per airline
  - workflow_agentic_potential: Workflow prioritization by agentic opportunity
  - agent_utilization_metrics: Agent usage and performance tracking
  - cross_domain_complexity: Cross-domain workflow analysis
  - api_health_dashboard: Real-time API performance monitoring
  - loyalty_personalization_readiness: FFP AI integration assessment
  - content_syndication_coverage: Brand content distribution tracking
  - ndc_adoption_metrics: NDC compliance and usage statistics
*/

-- ============================================================================
-- VIEW 1: AI Readiness Scorecard
-- ============================================================================
-- Comprehensive AI maturity assessment per airline

CREATE OR REPLACE VIEW ai_readiness_scorecard AS
WITH airline_api_metrics AS (
  SELECT
    a.id AS airline_id,
    a.airline_name,
    a.iata_code,
    a.ndc_capable,
    a.api_maturity_score,
    COUNT(DISTINCT ae.id) AS total_api_endpoints,
    COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true) AS ndc_endpoints_count,
    COUNT(DISTINCT ae.id) FILTER (WHERE ae.is_ai_accessible = true) AS ai_accessible_endpoints,
    AVG((ae.metadata->>'response_time_p95_ms')::numeric) AS avg_api_response_time_ms
  FROM airlines a
  LEFT JOIN systems s ON s.airline_id = a.id
  LEFT JOIN api_endpoints ae ON ae.system_id = s.id
  GROUP BY a.id, a.airline_name, a.iata_code, a.ndc_capable, a.api_maturity_score
),
airline_ai_platform_metrics AS (
  SELECT
    a.id AS airline_id,
    COUNT(DISTINCT api.id) AS ai_platform_integrations_count,
    COUNT(DISTINCT api.id) FILTER (WHERE api.integration_status = 'production') AS production_integrations,
    AVG((api.usage_metrics->>'conversion_rate')::numeric) AS avg_ai_conversion_rate,
    SUM((api.usage_metrics->>'monthly_queries')::integer) AS total_monthly_ai_queries
  FROM airlines a
  LEFT JOIN ai_platform_integrations api ON api.airline_id = a.id
  GROUP BY a.id
),
airline_content_metrics AS (
  SELECT
    a.id AS airline_id,
    COUNT(DISTINCT csf.id) AS content_feeds_count,
    COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true) AS ai_optimized_feeds,
    COUNT(DISTINCT bff.id) AS branded_fare_families,
    AVG(LENGTH(bff.ai_description_optimized)) AS avg_ai_description_length
  FROM airlines a
  LEFT JOIN content_syndication_feeds csf ON csf.airline_id = a.id
  LEFT JOIN branded_fare_families bff ON bff.airline_id = a.id
  GROUP BY a.id
),
airline_operational_metrics AS (
  SELECT
    airline_id,
    AVG(on_time_performance_pct) AS avg_otp,
    AVG(api_uptime_pct) AS avg_api_uptime,
    AVG(ai_booking_percentage) AS avg_ai_booking_pct,
    AVG(nps_score) AS avg_nps
  FROM airline_operational_metrics
  WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY airline_id
)
SELECT
  am.airline_id,
  am.airline_name,
  am.iata_code,
  am.ndc_capable,
  am.api_maturity_score,

  -- API Infrastructure Score (0-100)
  LEAST(100, (
    (CASE WHEN am.ndc_capable THEN 25 ELSE 0 END) +
    (LEAST(25, am.total_api_endpoints::numeric / 20 * 25)) +
    (CASE WHEN am.ai_accessible_endpoints > 0 THEN 25 ELSE 0 END) +
    (CASE WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 500 THEN 25
          WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 1000 THEN 15
          ELSE 5 END)
  ))::numeric(5,2) AS api_infrastructure_score,

  -- AI Platform Integration Score (0-100)
  LEAST(100, (
    (LEAST(40, COALESCE(apm.ai_platform_integrations_count, 0)::numeric / 5 * 40)) +
    (LEAST(30, COALESCE(apm.production_integrations, 0)::numeric / 3 * 30)) +
    (LEAST(30, COALESCE(apm.avg_ai_conversion_rate, 0) * 300))
  ))::numeric(5,2) AS ai_platform_integration_score,

  -- Content Syndication Score (0-100)
  LEAST(100, (
    (LEAST(40, COALESCE(acm.content_feeds_count, 0)::numeric / 4 * 40)) +
    (LEAST(30, COALESCE(acm.ai_optimized_feeds, 0)::numeric / 3 * 30)) +
    (LEAST(30, COALESCE(acm.branded_fare_families, 0)::numeric / 4 * 30))
  ))::numeric(5,2) AS content_syndication_score,

  -- Operational Excellence Score (0-100)
  LEAST(100, (
    (LEAST(30, COALESCE(aom.avg_otp, 0) / 95 * 30)) +
    (LEAST(30, COALESCE(aom.avg_api_uptime, 0) / 99.9 * 30)) +
    (LEAST(20, (COALESCE(aom.avg_nps, -100) + 100) / 200 * 20)) +
    (LEAST(20, COALESCE(aom.avg_ai_booking_pct, 0) / 10 * 20))
  ))::numeric(5,2) AS operational_excellence_score,

  -- Overall AI Readiness Score (weighted average)
  (
    (LEAST(100, (
      (CASE WHEN am.ndc_capable THEN 25 ELSE 0 END) +
      (LEAST(25, am.total_api_endpoints::numeric / 20 * 25)) +
      (CASE WHEN am.ai_accessible_endpoints > 0 THEN 25 ELSE 0 END) +
      (CASE WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 500 THEN 25
            WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 1000 THEN 15
            ELSE 5 END)
    )) * 0.35) +
    (LEAST(100, (
      (LEAST(40, COALESCE(apm.ai_platform_integrations_count, 0)::numeric / 5 * 40)) +
      (LEAST(30, COALESCE(apm.production_integrations, 0)::numeric / 3 * 30)) +
      (LEAST(30, COALESCE(apm.avg_ai_conversion_rate, 0) * 300))
    )) * 0.25) +
    (LEAST(100, (
      (LEAST(40, COALESCE(acm.content_feeds_count, 0)::numeric / 4 * 40)) +
      (LEAST(30, COALESCE(acm.ai_optimized_feeds, 0)::numeric / 3 * 30)) +
      (LEAST(30, COALESCE(acm.branded_fare_families, 0)::numeric / 4 * 30))
    )) * 0.20) +
    (LEAST(100, (
      (LEAST(30, COALESCE(aom.avg_otp, 0) / 95 * 30)) +
      (LEAST(30, COALESCE(aom.avg_api_uptime, 0) / 99.9 * 30)) +
      (LEAST(20, (COALESCE(aom.avg_nps, -100) + 100) / 200 * 20)) +
      (LEAST(20, COALESCE(aom.avg_ai_booking_pct, 0) / 10 * 20))
    )) * 0.20)
  )::numeric(5,2) AS overall_ai_readiness_score,

  -- Maturity Tier
  CASE
    WHEN (
      (LEAST(100, (
        (CASE WHEN am.ndc_capable THEN 25 ELSE 0 END) +
        (LEAST(25, am.total_api_endpoints::numeric / 20 * 25)) +
        (CASE WHEN am.ai_accessible_endpoints > 0 THEN 25 ELSE 0 END) +
        (CASE WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 500 THEN 25
              WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 1000 THEN 15
              ELSE 5 END)
      )) * 0.35) +
      (LEAST(100, (
        (LEAST(40, COALESCE(apm.ai_platform_integrations_count, 0)::numeric / 5 * 40)) +
        (LEAST(30, COALESCE(apm.production_integrations, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(apm.avg_ai_conversion_rate, 0) * 300))
      )) * 0.25) +
      (LEAST(100, (
        (LEAST(40, COALESCE(acm.content_feeds_count, 0)::numeric / 4 * 40)) +
        (LEAST(30, COALESCE(acm.ai_optimized_feeds, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(acm.branded_fare_families, 0)::numeric / 4 * 30))
      )) * 0.20) +
      (LEAST(100, (
        (LEAST(30, COALESCE(aom.avg_otp, 0) / 95 * 30)) +
        (LEAST(30, COALESCE(aom.avg_api_uptime, 0) / 99.9 * 30)) +
        (LEAST(20, (COALESCE(aom.avg_nps, -100) + 100) / 200 * 20)) +
        (LEAST(20, COALESCE(aom.avg_ai_booking_pct, 0) / 10 * 20))
      )) * 0.20)
    ) >= 80 THEN 'AI Leader'
    WHEN (
      (LEAST(100, (
        (CASE WHEN am.ndc_capable THEN 25 ELSE 0 END) +
        (LEAST(25, am.total_api_endpoints::numeric / 20 * 25)) +
        (CASE WHEN am.ai_accessible_endpoints > 0 THEN 25 ELSE 0 END) +
        (CASE WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 500 THEN 25
              WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 1000 THEN 15
              ELSE 5 END)
      )) * 0.35) +
      (LEAST(100, (
        (LEAST(40, COALESCE(apm.ai_platform_integrations_count, 0)::numeric / 5 * 40)) +
        (LEAST(30, COALESCE(apm.production_integrations, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(apm.avg_ai_conversion_rate, 0) * 300))
      )) * 0.25) +
      (LEAST(100, (
        (LEAST(40, COALESCE(acm.content_feeds_count, 0)::numeric / 4 * 40)) +
        (LEAST(30, COALESCE(acm.ai_optimized_feeds, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(acm.branded_fare_families, 0)::numeric / 4 * 30))
      )) * 0.20) +
      (LEAST(100, (
        (LEAST(30, COALESCE(aom.avg_otp, 0) / 95 * 30)) +
        (LEAST(30, COALESCE(aom.avg_api_uptime, 0) / 99.9 * 30)) +
        (LEAST(20, (COALESCE(aom.avg_nps, -100) + 100) / 200 * 20)) +
        (LEAST(20, COALESCE(aom.avg_ai_booking_pct, 0) / 10 * 20))
      )) * 0.20)
    ) >= 60 THEN 'AI Adopter'
    WHEN (
      (LEAST(100, (
        (CASE WHEN am.ndc_capable THEN 25 ELSE 0 END) +
        (LEAST(25, am.total_api_endpoints::numeric / 20 * 25)) +
        (CASE WHEN am.ai_accessible_endpoints > 0 THEN 25 ELSE 0 END) +
        (CASE WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 500 THEN 25
              WHEN COALESCE(am.avg_api_response_time_ms, 1000) < 1000 THEN 15
              ELSE 5 END)
      )) * 0.35) +
      (LEAST(100, (
        (LEAST(40, COALESCE(apm.ai_platform_integrations_count, 0)::numeric / 5 * 40)) +
        (LEAST(30, COALESCE(apm.production_integrations, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(apm.avg_ai_conversion_rate, 0) * 300))
      )) * 0.25) +
      (LEAST(100, (
        (LEAST(40, COALESCE(acm.content_feeds_count, 0)::numeric / 4 * 40)) +
        (LEAST(30, COALESCE(acm.ai_optimized_feeds, 0)::numeric / 3 * 30)) +
        (LEAST(30, COALESCE(acm.branded_fare_families, 0)::numeric / 4 * 30))
      )) * 0.20) +
      (LEAST(100, (
        (LEAST(30, COALESCE(aom.avg_otp, 0) / 95 * 30)) +
        (LEAST(30, COALESCE(aom.avg_api_uptime, 0) / 99.9 * 30)) +
        (LEAST(20, (COALESCE(aom.avg_nps, -100) + 100) / 200 * 20)) +
        (LEAST(20, COALESCE(aom.avg_ai_booking_pct, 0) / 10 * 20))
      )) * 0.20)
    ) >= 40 THEN 'AI Explorer'
    ELSE 'AI Laggard'
  END AS ai_maturity_tier,

  -- Supporting Metrics
  am.total_api_endpoints,
  am.ndc_endpoints_count,
  am.ai_accessible_endpoints,
  am.avg_api_response_time_ms,
  apm.ai_platform_integrations_count,
  apm.production_integrations,
  apm.total_monthly_ai_queries,
  acm.content_feeds_count,
  acm.ai_optimized_feeds,
  acm.branded_fare_families,
  aom.avg_otp,
  aom.avg_api_uptime,
  aom.avg_ai_booking_pct,
  aom.avg_nps
FROM airline_api_metrics am
LEFT JOIN airline_ai_platform_metrics apm ON apm.airline_id = am.airline_id
LEFT JOIN airline_content_metrics acm ON acm.airline_id = am.airline_id
LEFT JOIN airline_operational_metrics aom ON aom.airline_id = am.airline_id
ORDER BY overall_ai_readiness_score DESC;

COMMENT ON VIEW ai_readiness_scorecard IS 'Comprehensive AI maturity assessment per airline with weighted scoring across API infrastructure, AI platform integrations, content syndication, and operational excellence';

-- ============================================================================
-- VIEW 2: Workflow Agentic Potential
-- ============================================================================
-- Workflow prioritization matrix by agentic opportunity

CREATE OR REPLACE VIEW workflow_agentic_potential AS
SELECT
  w.id AS workflow_id,
  w.name AS workflow_name,
  w.description,
  d.name AS domain_name,
  sd.name AS subdomain_name,
  w.complexity,
  w.agentic_potential,
  w.autonomy_level,
  w.implementation_wave,
  w.status,

  -- Agentic Opportunity Score (complexity × agentic_potential × autonomy_level)
  (w.complexity::numeric * w.agentic_potential::numeric * w.autonomy_level::numeric / 125 * 100)::numeric(5,2) AS agentic_opportunity_score,

  -- Implementation Priority (higher score = higher priority)
  (
    (w.agentic_potential::numeric * 0.4) +
    (w.autonomy_level::numeric * 0.3) +
    ((6 - w.complexity::numeric) * 0.2) + -- Inverse complexity (easier = higher priority)
    ((5 - w.implementation_wave::numeric) * 0.1) -- Earlier wave = higher priority
  ) * 20 AS implementation_priority_score,

  -- ROI Potential Tier
  CASE
    WHEN w.expected_roi ILIKE '%$%M%' OR w.expected_roi ILIKE '%million%' THEN 'High ROI'
    WHEN w.expected_roi ILIKE '%$%K%' OR w.expected_roi ILIKE '%thousand%' THEN 'Medium ROI'
    WHEN w.expected_roi ILIKE '%incremental%' THEN 'Incremental ROI'
    ELSE 'ROI Unknown'
  END AS roi_tier,

  -- Agent Count
  (SELECT COUNT(*) FROM workflow_agents wa WHERE wa.workflow_id = w.id) AS assigned_agents_count,

  -- Cross-Domain Indicator
  (SELECT COUNT(*) FROM workflow_cross_domain_bridges wcdb WHERE wcdb.workflow_id = w.id) > 0 AS is_cross_domain,

  -- System Dependencies Count
  (SELECT COUNT(*) FROM workflow_system_dependencies wsd WHERE wsd.workflow_id = w.id) AS system_dependencies_count,

  w.expected_roi,
  w.business_context,
  w.created_at,
  w.updated_at
FROM workflows w
LEFT JOIN domains d ON d.id = w.domain_id
LEFT JOIN subdomains sd ON sd.id = w.subdomain_id
WHERE w.archived_at IS NULL
ORDER BY agentic_opportunity_score DESC, implementation_priority_score DESC;

COMMENT ON VIEW workflow_agentic_potential IS 'Workflow prioritization matrix showing agentic opportunity and implementation priority scores';

-- ============================================================================
-- VIEW 3: Agent Utilization Metrics
-- ============================================================================
-- Agent usage and performance tracking

CREATE OR REPLACE VIEW agent_utilization_metrics AS
SELECT
  a.id AS agent_id,
  a.code AS agent_code,
  a.name AS agent_name,
  ac.name AS category_name,
  a.autonomy_level,
  a.workflow_count AS declared_workflow_count,
  a.active_instances,

  -- Actual Workflow Assignments
  COUNT(DISTINCT wa.workflow_id) AS actual_assigned_workflows,
  COUNT(DISTINCT wa.workflow_id) FILTER (WHERE wa.role = 'primary') AS primary_workflow_assignments,
  COUNT(DISTINCT wa.workflow_id) FILTER (WHERE wa.role = 'supporting') AS supporting_workflow_assignments,

  -- Collaboration Network
  (SELECT COUNT(*) FROM agent_relationships ar WHERE ar.from_agent_id = a.id) AS outbound_relationships,
  (SELECT COUNT(*) FROM agent_relationships ar WHERE ar.to_agent_id = a.id) AS inbound_relationships,
  (SELECT COUNT(*) FROM agent_relationships ar WHERE ar.from_agent_id = a.id OR ar.to_agent_id = a.id) AS total_relationships,

  -- Average Relationship Strength
  (SELECT AVG(strength) FROM agent_relationships ar WHERE ar.from_agent_id = a.id)::numeric(3,2) AS avg_outbound_strength,

  -- Cross-Domain Participation
  COUNT(DISTINCT w.domain_id) AS domains_served,

  -- Utilization Rate
  CASE
    WHEN a.workflow_count > 0 THEN (COUNT(DISTINCT wa.workflow_id)::numeric / a.workflow_count * 100)::numeric(5,2)
    ELSE 0
  END AS utilization_rate_pct,

  -- Agent Status
  a.active AS is_active,

  -- Metadata
  a.metadata,
  a.created_at,
  a.updated_at
FROM agents a
LEFT JOIN agent_categories ac ON ac.code = a.category_code
LEFT JOIN workflow_agents wa ON wa.agent_id = a.id
LEFT JOIN workflows w ON w.id = wa.workflow_id AND w.archived_at IS NULL
GROUP BY a.id, a.code, a.name, ac.name, a.autonomy_level, a.workflow_count, a.active_instances, a.active, a.metadata, a.created_at, a.updated_at
ORDER BY total_relationships DESC, actual_assigned_workflows DESC;

COMMENT ON VIEW agent_utilization_metrics IS 'Agent usage statistics including workflow assignments, collaboration network size, and utilization rates';

-- ============================================================================
-- VIEW 4: Cross-Domain Complexity Analysis
-- ============================================================================
-- Workflows spanning multiple domains with complexity assessment

CREATE OR REPLACE VIEW cross_domain_complexity AS
SELECT
  w.id AS workflow_id,
  w.name AS workflow_name,
  d_primary.name AS primary_domain,
  w.complexity,
  w.agentic_potential,

  -- Cross-Domain Bridges
  COUNT(DISTINCT wcdb.secondary_domain_id) AS secondary_domains_count,
  STRING_AGG(DISTINCT d_secondary.name, ', ' ORDER BY d_secondary.name) AS secondary_domains,
  AVG(wcdb.bridge_strength)::numeric(3,2) AS avg_bridge_strength,
  MAX(wcdb.bridge_strength)::numeric(3,2) AS max_bridge_strength,

  -- Integration Complexity Score
  (
    (w.complexity::numeric * 0.4) +
    (COUNT(DISTINCT wcdb.secondary_domain_id)::numeric * 10 * 0.3) +
    ((5 - AVG(wcdb.bridge_strength))::numeric * 20 * 0.3)
  )::numeric(5,2) AS integration_complexity_score,

  -- Agent Diversity (agents from different categories)
  COUNT(DISTINCT a.category_code) AS agent_categories_involved,

  -- System Dependencies
  (SELECT COUNT(DISTINCT system_id) FROM workflow_system_dependencies wsd WHERE wsd.workflow_id = w.id) AS systems_involved,

  w.status,
  w.implementation_wave,
  w.business_context
FROM workflows w
LEFT JOIN domains d_primary ON d_primary.id = w.domain_id
LEFT JOIN workflow_cross_domain_bridges wcdb ON wcdb.workflow_id = w.id
LEFT JOIN domains d_secondary ON d_secondary.id = wcdb.secondary_domain_id
LEFT JOIN workflow_agents wa ON wa.workflow_id = w.id
LEFT JOIN agents a ON a.id = wa.agent_id
WHERE w.archived_at IS NULL
  AND EXISTS (SELECT 1 FROM workflow_cross_domain_bridges wcdb2 WHERE wcdb2.workflow_id = w.id)
GROUP BY w.id, w.name, d_primary.name, w.complexity, w.agentic_potential, w.status, w.implementation_wave, w.business_context
ORDER BY integration_complexity_score DESC;

COMMENT ON VIEW cross_domain_complexity IS 'Analysis of workflows spanning multiple business domains with integration complexity scoring';

-- ============================================================================
-- VIEW 5: API Health Dashboard
-- ============================================================================
-- Real-time API performance monitoring for AI platforms

CREATE OR REPLACE VIEW api_health_dashboard AS
SELECT
  al.id AS airline_id,
  al.airline_name,
  al.iata_code,
  s.system_name,
  ae.endpoint_name,
  ae.endpoint_url,
  ae.http_method,
  ae.is_ai_accessible,
  ae.ndc_compliant,

  -- Rate Limiting
  ae.rate_limit->>'requests_per_minute' AS rate_limit_per_minute,
  ae.rate_limit->>'requests_per_day' AS rate_limit_per_day,

  -- Performance Metrics
  (ae.metadata->>'response_time_p95_ms')::integer AS response_time_p95_ms,
  CASE
    WHEN (ae.metadata->>'response_time_p95_ms')::integer < 200 THEN 'Excellent'
    WHEN (ae.metadata->>'response_time_p95_ms')::integer < 500 THEN 'Good'
    WHEN (ae.metadata->>'response_time_p95_ms')::integer < 1000 THEN 'Acceptable'
    ELSE 'Poor'
  END AS performance_tier,

  -- Security
  ae.auth_type,
  (ae.metadata->>'requires_pci_compliance')::boolean AS requires_pci_compliance,

  -- AI Platform Whitelisting
  ae.metadata->'ai_platform_whitelist' AS ai_platform_whitelist,

  -- Supported Features
  ae.metadata->'supported_features' AS supported_features,

  -- NDC Info
  CASE WHEN ae.ndc_compliant THEN ae.metadata->>'ndc_version' ELSE NULL END AS ndc_version,

  ae.documentation_url,
  ae.created_at,
  ae.updated_at
FROM api_endpoints ae
JOIN systems s ON s.id = ae.system_id
JOIN airlines al ON al.id = s.airline_id
WHERE ae.is_ai_accessible = true
ORDER BY al.airline_name, s.system_name, ae.endpoint_name;

COMMENT ON VIEW api_health_dashboard IS 'Real-time API performance monitoring for AI platform integrations';

-- ============================================================================
-- VIEW 6: Loyalty & Personalization Readiness
-- ============================================================================
-- FFP AI integration assessment

CREATE OR REPLACE VIEW loyalty_personalization_readiness AS
SELECT
  al.id AS airline_id,
  al.airline_name,
  al.iata_code,

  -- FFP Program Details
  al.metadata->>'ffp_name' AS ffp_program_name,
  COUNT(DISTINCT ft.id) AS total_tiers,
  MAX(ft.tier_level) AS max_tier_level,

  -- Loyalty API Endpoints
  COUNT(DISTINCT ae.id) FILTER (
    WHERE s.system_type = 'Loyalty' AND ae.is_ai_accessible = true
  ) AS loyalty_api_endpoints,

  -- Passenger Preference Coverage
  (SELECT COUNT(*) FROM passenger_preferences pp WHERE pp.airline_id = al.id) AS stored_preferences_count,

  -- AI Platform Integration for Loyalty
  COUNT(DISTINCT api.id) FILTER (
    WHERE 'loyalty_lookup' = ANY(api.supported_capabilities)
  ) AS ai_platforms_with_loyalty,

  -- Personalization Features Availability
  EXISTS (
    SELECT 1 FROM api_endpoints ae2
    JOIN systems s2 ON s2.id = ae2.system_id
    WHERE s2.airline_id = al.id
      AND ae2.endpoint_name ILIKE '%preference%'
  ) AS has_preference_api,

  EXISTS (
    SELECT 1 FROM api_endpoints ae2
    JOIN systems s2 ON s2.id = ae2.system_id
    WHERE s2.airline_id = al.id
      AND ae2.endpoint_name ILIKE '%recommendation%'
  ) AS has_recommendation_api,

  -- Personalization Readiness Score (0-100)
  (
    (CASE WHEN COUNT(DISTINCT ft.id) >= 4 THEN 20 ELSE COUNT(DISTINCT ft.id) * 5 END) +
    (LEAST(30, COUNT(DISTINCT ae.id) FILTER (WHERE s.system_type = 'Loyalty' AND ae.is_ai_accessible = true) * 10)) +
    (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%preference%') THEN 25 ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%recommendation%') THEN 25 ELSE 0 END)
  )::numeric(5,2) AS personalization_readiness_score,

  CASE
    WHEN (
      (CASE WHEN COUNT(DISTINCT ft.id) >= 4 THEN 20 ELSE COUNT(DISTINCT ft.id) * 5 END) +
      (LEAST(30, COUNT(DISTINCT ae.id) FILTER (WHERE s.system_type = 'Loyalty' AND ae.is_ai_accessible = true) * 10)) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%preference%') THEN 25 ELSE 0 END) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%recommendation%') THEN 25 ELSE 0 END)
    ) >= 75 THEN 'Advanced'
    WHEN (
      (CASE WHEN COUNT(DISTINCT ft.id) >= 4 THEN 20 ELSE COUNT(DISTINCT ft.id) * 5 END) +
      (LEAST(30, COUNT(DISTINCT ae.id) FILTER (WHERE s.system_type = 'Loyalty' AND ae.is_ai_accessible = true) * 10)) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%preference%') THEN 25 ELSE 0 END) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%recommendation%') THEN 25 ELSE 0 END)
    ) >= 50 THEN 'Moderate'
    WHEN (
      (CASE WHEN COUNT(DISTINCT ft.id) >= 4 THEN 20 ELSE COUNT(DISTINCT ft.id) * 5 END) +
      (LEAST(30, COUNT(DISTINCT ae.id) FILTER (WHERE s.system_type = 'Loyalty' AND ae.is_ai_accessible = true) * 10)) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%preference%') THEN 25 ELSE 0 END) +
      (CASE WHEN EXISTS (SELECT 1 FROM api_endpoints ae2 JOIN systems s2 ON s2.id = ae2.system_id WHERE s2.airline_id = al.id AND ae2.endpoint_name ILIKE '%recommendation%') THEN 25 ELSE 0 END)
    ) >= 25 THEN 'Basic'
    ELSE 'Minimal'
  END AS personalization_maturity
FROM airlines al
LEFT JOIN ffp_tiers ft ON ft.airline_id = al.id
LEFT JOIN systems s ON s.airline_id = al.id
LEFT JOIN api_endpoints ae ON ae.system_id = s.id
LEFT JOIN ai_platform_integrations api ON api.airline_id = al.id
GROUP BY al.id, al.airline_name, al.iata_code, al.metadata
ORDER BY personalization_readiness_score DESC;

COMMENT ON VIEW loyalty_personalization_readiness IS 'FFP and personalization capabilities assessment for AI-driven loyalty experiences';

-- ============================================================================
-- VIEW 7: Content Syndication Coverage
-- ============================================================================
-- Brand content distribution tracking across AI platforms

CREATE OR REPLACE VIEW content_syndication_coverage AS
SELECT
  al.id AS airline_id,
  al.airline_name,
  al.iata_code,

  -- Content Feeds
  COUNT(DISTINCT csf.id) AS total_content_feeds,
  COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true) AS ai_optimized_feeds,
  COUNT(DISTINCT csf.id) FILTER (WHERE csf.schema_org_compliant = true) AS schema_compliant_feeds,

  -- Feed Types Coverage
  STRING_AGG(DISTINCT csf.feed_type, ', ' ORDER BY csf.feed_type) AS covered_feed_types,

  -- Update Frequency
  STRING_AGG(DISTINCT csf.update_frequency, ', ') AS update_frequencies,

  -- Target Platform Coverage
  (SELECT COUNT(DISTINCT platform) FROM (
    SELECT unnest(target_platforms) AS platform FROM content_syndication_feeds WHERE airline_id = al.id
  ) platforms) AS unique_target_platforms,

  -- Branded Fares
  COUNT(DISTINCT bff.id) AS branded_fare_families,
  COUNT(DISTINCT bff.id) FILTER (WHERE bff.ai_description_optimized IS NOT NULL) AS ai_optimized_fares,
  COUNT(DISTINCT bff.id) FILTER (WHERE bff.schema_org_markup IS NOT NULL) AS schema_marked_fares,

  -- Content Syndication Score (0-100)
  (
    (LEAST(30, COUNT(DISTINCT csf.id)::numeric / 4 * 30)) +
    (LEAST(20, COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true)::numeric / 3 * 20)) +
    (LEAST(25, COUNT(DISTINCT bff.id)::numeric / 4 * 25)) +
    (LEAST(25, COUNT(DISTINCT bff.id) FILTER (WHERE bff.ai_description_optimized IS NOT NULL)::numeric / 4 * 25))
  )::numeric(5,2) AS content_syndication_score,

  CASE
    WHEN (
      (LEAST(30, COUNT(DISTINCT csf.id)::numeric / 4 * 30)) +
      (LEAST(20, COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true)::numeric / 3 * 20)) +
      (LEAST(25, COUNT(DISTINCT bff.id)::numeric / 4 * 25)) +
      (LEAST(25, COUNT(DISTINCT bff.id) FILTER (WHERE bff.ai_description_optimized IS NOT NULL)::numeric / 4 * 25))
    ) >= 80 THEN 'Comprehensive'
    WHEN (
      (LEAST(30, COUNT(DISTINCT csf.id)::numeric / 4 * 30)) +
      (LEAST(20, COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true)::numeric / 3 * 20)) +
      (LEAST(25, COUNT(DISTINCT bff.id)::numeric / 4 * 25)) +
      (LEAST(25, COUNT(DISTINCT bff.id) FILTER (WHERE bff.ai_description_optimized IS NOT NULL)::numeric / 4 * 25))
    ) >= 60 THEN 'Strong'
    WHEN (
      (LEAST(30, COUNT(DISTINCT csf.id)::numeric / 4 * 30)) +
      (LEAST(20, COUNT(DISTINCT csf.id) FILTER (WHERE csf.ai_optimized = true)::numeric / 3 * 20)) +
      (LEAST(25, COUNT(DISTINCT bff.id)::numeric / 4 * 25)) +
      (LEAST(25, COUNT(DISTINCT bff.id) FILTER (WHERE bff.ai_description_optimized IS NOT NULL)::numeric / 4 * 25))
    ) >= 40 THEN 'Developing'
    ELSE 'Minimal'
  END AS syndication_maturity
FROM airlines al
LEFT JOIN content_syndication_feeds csf ON csf.airline_id = al.id
LEFT JOIN branded_fare_families bff ON bff.airline_id = al.id
GROUP BY al.id, al.airline_name, al.iata_code
ORDER BY content_syndication_score DESC;

COMMENT ON VIEW content_syndication_coverage IS 'Brand content distribution and Schema.org compliance tracking for AI platform discoverability';

-- ============================================================================
-- VIEW 8: NDC Adoption Metrics
-- ============================================================================
-- NDC compliance and usage statistics

CREATE OR REPLACE VIEW ndc_adoption_metrics AS
SELECT
  al.id AS airline_id,
  al.airline_name,
  al.iata_code,
  al.ndc_capable,

  -- NDC API Endpoints
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true) AS ndc_endpoints,
  COUNT(DISTINCT ae.id) AS total_endpoints,
  CASE
    WHEN COUNT(DISTINCT ae.id) > 0
    THEN (COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true)::numeric / COUNT(DISTINCT ae.id) * 100)::numeric(5,2)
    ELSE 0
  END AS ndc_endpoint_coverage_pct,

  -- NDC Versions
  STRING_AGG(DISTINCT ae.metadata->>'ndc_version', ', ') FILTER (WHERE ae.ndc_compliant = true) AS ndc_versions_supported,

  -- NDC Certification Levels
  STRING_AGG(DISTINCT s.ndc_support->>'certification_level', ', ') FILTER (WHERE s.ndc_support IS NOT NULL) AS certification_levels,

  -- System NDC Readiness
  COUNT(DISTINCT s.id) FILTER (WHERE s.ndc_support IS NOT NULL) AS ndc_ready_systems,
  COUNT(DISTINCT s.id) AS total_systems,

  -- NDC Adoption Score (0-100)
  (
    (CASE WHEN al.ndc_capable THEN 40 ELSE 0 END) +
    (CASE
      WHEN COUNT(DISTINCT ae.id) > 0
      THEN LEAST(30, (COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true)::numeric / COUNT(DISTINCT ae.id) * 30))
      ELSE 0
    END) +
    (LEAST(30, COUNT(DISTINCT s.id) FILTER (WHERE s.ndc_support IS NOT NULL)::numeric / GREATEST(1, COUNT(DISTINCT s.id)) * 30))
  )::numeric(5,2) AS ndc_adoption_score,

  CASE
    WHEN (
      (CASE WHEN al.ndc_capable THEN 40 ELSE 0 END) +
      (CASE
        WHEN COUNT(DISTINCT ae.id) > 0
        THEN LEAST(30, (COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true)::numeric / COUNT(DISTINCT ae.id) * 30))
        ELSE 0
      END) +
      (LEAST(30, COUNT(DISTINCT s.id) FILTER (WHERE s.ndc_support IS NOT NULL)::numeric / GREATEST(1, COUNT(DISTINCT s.id)) * 30))
    ) >= 80 THEN 'NDC Leader'
    WHEN (
      (CASE WHEN al.ndc_capable THEN 40 ELSE 0 END) +
      (CASE
        WHEN COUNT(DISTINCT ae.id) > 0
        THEN LEAST(30, (COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true)::numeric / COUNT(DISTINCT ae.id) * 30))
        ELSE 0
      END) +
      (LEAST(30, COUNT(DISTINCT s.id) FILTER (WHERE s.ndc_support IS NOT NULL)::numeric / GREATEST(1, COUNT(DISTINCT s.id)) * 30))
    ) >= 50 THEN 'NDC Capable'
    WHEN (
      (CASE WHEN al.ndc_capable THEN 40 ELSE 0 END) +
      (CASE
        WHEN COUNT(DISTINCT ae.id) > 0
        THEN LEAST(30, (COUNT(DISTINCT ae.id) FILTER (WHERE ae.ndc_compliant = true)::numeric / COUNT(DISTINCT ae.id) * 30))
        ELSE 0
      END) +
      (LEAST(30, COUNT(DISTINCT s.id) FILTER (WHERE s.ndc_support IS NOT NULL)::numeric / GREATEST(1, COUNT(DISTINCT s.id)) * 30))
    ) >= 25 THEN 'NDC Developing'
    ELSE 'NDC Laggard'
  END AS ndc_maturity_tier
FROM airlines al
LEFT JOIN systems s ON s.airline_id = al.id
LEFT JOIN api_endpoints ae ON ae.system_id = s.id
GROUP BY al.id, al.airline_name, al.iata_code, al.ndc_capable
ORDER BY ndc_adoption_score DESC;

COMMENT ON VIEW ndc_adoption_metrics IS 'NDC compliance and adoption tracking across airline systems and APIs';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Views Created: 8
-- 1. ai_readiness_scorecard: Overall AI maturity with weighted scoring
-- 2. workflow_agentic_potential: Workflow prioritization matrix
-- 3. agent_utilization_metrics: Agent usage and collaboration network
-- 4. cross_domain_complexity: Integration complexity analysis
-- 5. api_health_dashboard: Real-time API performance monitoring
-- 6. loyalty_personalization_readiness: FFP AI integration assessment
-- 7. content_syndication_coverage: Brand content distribution tracking
-- 8. ndc_adoption_metrics: NDC compliance statistics
--
-- All views support the AI readiness scorecard and operational dashboards
-- for tracking agentic distribution transformation progress
--
-- Migration sequence complete (001-009)

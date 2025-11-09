-- Generate Cross-Domain Bridge Data
-- This script creates linkages between workflows and domains they interact with

-- First, get domain IDs for reference
WITH domain_ids AS (
  SELECT id, name FROM domains
),
workflow_data AS (
  SELECT w.id, w.name, d.id as domain_id, d.name as domain_name
  FROM workflows w
  JOIN subdomains s ON w.subdomain_id = s.id
  JOIN domains d ON s.domain_id = d.id
)

-- Insert cross-domain linkages based on workflow characteristics
INSERT INTO cross_domain_linkages (workflow_id, linked_domain_id, linkage_type, linkage_strength, description)
SELECT DISTINCT w.id, d.id, linkage.type, linkage.strength, linkage.description
FROM workflow_data w
CROSS JOIN domain_ids d
CROSS JOIN LATERAL (
  VALUES
    -- Commercial & Distribution workflows connecting to other domains
    (CASE WHEN w.name ILIKE '%rebooking%' AND w.domain_name = 'Commercial & Distribution' AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Revenue Management')
      THEN 'process_handoff'::text END,
     CASE WHEN w.name ILIKE '%rebooking%' AND w.domain_name = 'Commercial & Distribution' AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Revenue Management')
      THEN 5 END,
     CASE WHEN w.name ILIKE '%rebooking%' AND w.domain_name = 'Commercial & Distribution' AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Revenue Management')
      THEN 'Automated rebooking requires flight status, customer context, and pricing rules' END),

    -- Customer Service workflows
    (CASE WHEN w.name ILIKE '%chatbot%' AND d.name IN ('Flight Operations', 'Loyalty & Personalization', 'Cargo & Logistics', 'Ground Operations')
      THEN 'data_sharing'::text END,
     CASE WHEN w.name ILIKE '%chatbot%' AND d.name IN ('Flight Operations', 'Loyalty & Personalization', 'Cargo & Logistics', 'Ground Operations')
      THEN 4 END,
     CASE WHEN w.name ILIKE '%chatbot%' AND d.name IN ('Flight Operations', 'Loyalty & Personalization', 'Cargo & Logistics', 'Ground Operations')
      THEN 'Customer service needs real-time data from operations' END),

    -- Crew Management workflows
    (CASE WHEN w.name ILIKE '%crew%' AND w.name ILIKE '%training%' AND d.name IN ('Safety, Security & Compliance', 'MRO / Engineering', 'Flight Operations')
      THEN 'coordination'::text END,
     CASE WHEN w.name ILIKE '%crew%' AND w.name ILIKE '%training%' AND d.name IN ('Safety, Security & Compliance', 'MRO / Engineering', 'Flight Operations')
      THEN 5 END,
     CASE WHEN w.name ILIKE '%crew%' AND w.name ILIKE '%training%' AND d.name IN ('Safety, Security & Compliance', 'MRO / Engineering', 'Flight Operations')
      THEN 'Crew training must comply with safety regulations and operational requirements' END),

    -- Baggage workflows
    (CASE WHEN w.name ILIKE '%baggage%' AND d.name IN ('Customer Experience & Servicing', 'Ground Operations', 'IT & Digital Platforms')
      THEN 'process_handoff'::text END,
     CASE WHEN w.name ILIKE '%baggage%' AND d.name IN ('Customer Experience & Servicing', 'Ground Operations', 'IT & Digital Platforms')
      THEN 4 END,
     CASE WHEN w.name ILIKE '%baggage%' AND d.name IN ('Customer Experience & Servicing', 'Ground Operations', 'IT & Digital Platforms')
      THEN 'Baggage handling requires coordination between customer service, ground ops, and tracking systems' END),

    -- Ground Operations connecting to Flight Ops
    (CASE WHEN (w.name ILIKE '%gate%' OR w.name ILIKE '%stand%' OR w.name ILIKE '%turnaround%')
          AND d.name IN ('Flight Operations', 'Airport & Station Management', 'MRO / Engineering')
      THEN 'coordination'::text END,
     CASE WHEN (w.name ILIKE '%gate%' OR w.name ILIKE '%stand%' OR w.name ILIKE '%turnaround%')
          AND d.name IN ('Flight Operations', 'Airport & Station Management', 'MRO / Engineering')
      THEN 5 END,
     CASE WHEN (w.name ILIKE '%gate%' OR w.name ILIKE '%stand%' OR w.name ILIKE '%turnaround%')
          AND d.name IN ('Flight Operations', 'Airport & Station Management', 'MRO / Engineering')
      THEN 'Ground operations require tight coordination with flight ops and airport management' END),

    -- Revenue Management connecting to Commercial
    (CASE WHEN (w.name ILIKE '%pricing%' OR w.name ILIKE '%forecast%' OR w.name ILIKE '%demand%')
          AND w.domain_name = 'Revenue Management'
          AND d.name IN ('Commercial & Distribution', 'Network Planning & Strategy', 'Data, Analytics & Innovation')
      THEN 'decision_dependency'::text END,
     CASE WHEN (w.name ILIKE '%pricing%' OR w.name ILIKE '%forecast%' OR w.name ILIKE '%demand%')
          AND w.domain_name = 'Revenue Management'
          AND d.name IN ('Commercial & Distribution', 'Network Planning & Strategy', 'Data, Analytics & Innovation')
      THEN 5 END,
     CASE WHEN (w.name ILIKE '%pricing%' OR w.name ILIKE '%forecast%' OR w.name ILIKE '%demand%')
          AND w.domain_name = 'Revenue Management'
          AND d.name IN ('Commercial & Distribution', 'Network Planning & Strategy', 'Data, Analytics & Innovation')
      THEN 'Revenue decisions depend on sales channels, network strategy, and analytics' END),

    -- Flight Operations connecting to Crew
    (CASE WHEN w.name ILIKE '%dispatch%' OR w.name ILIKE '%flight plan%'
          AND d.name IN ('Crew Management', 'MRO / Engineering', 'Ground Operations', 'Network Planning & Strategy')
      THEN 'coordination'::text END,
     CASE WHEN w.name ILIKE '%dispatch%' OR w.name ILIKE '%flight plan%'
          AND d.name IN ('Crew Management', 'MRO / Engineering', 'Ground Operations', 'Network Planning & Strategy')
      THEN 5 END,
     CASE WHEN w.name ILIKE '%dispatch%' OR w.name ILIKE '%flight plan%'
          AND d.name IN ('Crew Management', 'MRO / Engineering', 'Ground Operations', 'Network Planning & Strategy')
      THEN 'Flight operations require crew assignments, maintenance status, and ground support' END),

    -- Disruption Management (multi-domain)
    (CASE WHEN (w.name ILIKE '%disruption%' OR w.name ILIKE '%irregular%' OR w.name ILIKE '%irop%')
          AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Crew Management', 'Revenue Management', 'Ground Operations')
      THEN 'coordination'::text END,
     CASE WHEN (w.name ILIKE '%disruption%' OR w.name ILIKE '%irregular%' OR w.name ILIKE '%irop%')
          AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Crew Management', 'Revenue Management', 'Ground Operations')
      THEN 5 END,
     CASE WHEN (w.name ILIKE '%disruption%' OR w.name ILIKE '%irregular%' OR w.name ILIKE '%irop%')
          AND d.name IN ('Flight Operations', 'Customer Experience & Servicing', 'Crew Management', 'Revenue Management', 'Ground Operations')
      THEN 'Disruptions require coordination across all operational domains' END),

    -- Cargo workflows
    (CASE WHEN w.domain_name = 'Cargo & Logistics' AND w.name ILIKE '%cargo%'
          AND d.name IN ('Commercial & Distribution', 'Ground Operations', 'Flight Operations', 'Finance & Revenue Accounting')
      THEN 'process_handoff'::text END,
     CASE WHEN w.domain_name = 'Cargo & Logistics' AND w.name ILIKE '%cargo%'
          AND d.name IN ('Commercial & Distribution', 'Ground Operations', 'Flight Operations', 'Finance & Revenue Accounting')
      THEN 4 END,
     CASE WHEN w.domain_name = 'Cargo & Logistics' AND w.name ILIKE '%cargo%'
          AND d.name IN ('Commercial & Distribution', 'Ground Operations', 'Flight Operations', 'Finance & Revenue Accounting')
      THEN 'Cargo operations span sales, ground handling, flight loading, and accounting' END),

    -- Maintenance workflows
    (CASE WHEN w.domain_name = 'MRO / Engineering'
          AND d.name IN ('Flight Operations', 'Network Planning & Strategy', 'Procurement & Supply Chain', 'Safety, Security & Compliance')
      THEN 'coordination'::text END,
     CASE WHEN w.domain_name = 'MRO / Engineering'
          AND d.name IN ('Flight Operations', 'Network Planning & Strategy', 'Procurement & Supply Chain', 'Safety, Security & Compliance')
      THEN 5 END,
     CASE WHEN w.domain_name = 'MRO / Engineering'
          AND d.name IN ('Flight Operations', 'Network Planning & Strategy', 'Procurement & Supply Chain', 'Safety, Security & Compliance')
      THEN 'Maintenance impacts flight schedules, network planning, parts procurement, and safety compliance' END),

    -- Network Planning workflows
    (CASE WHEN w.domain_name = 'Network Planning & Strategy'
          AND d.name IN ('Revenue Management', 'Commercial & Distribution', 'Flight Operations', 'Alliances & Partnerships')
      THEN 'decision_dependency'::text END,
     CASE WHEN w.domain_name = 'Network Planning & Strategy'
          AND d.name IN ('Revenue Management', 'Commercial & Distribution', 'Flight Operations', 'Alliances & Partnerships')
      THEN 5 END,
     CASE WHEN w.domain_name = 'Network Planning & Strategy'
          AND d.name IN ('Revenue Management', 'Commercial & Distribution', 'Flight Operations', 'Alliances & Partnerships')
      THEN 'Network decisions drive revenue strategy, sales, operations, and partnerships' END),

    -- Loyalty programs
    (CASE WHEN w.domain_name = 'Loyalty & Personalization'
          AND d.name IN ('Commercial & Distribution', 'Customer Experience & Servicing', 'Revenue Management', 'Data, Analytics & Innovation')
      THEN 'data_sharing'::text END,
     CASE WHEN w.domain_name = 'Loyalty & Personalization'
          AND d.name IN ('Commercial & Distribution', 'Customer Experience & Servicing', 'Revenue Management', 'Data, Analytics & Innovation')
      THEN 4 END,
     CASE WHEN w.domain_name = 'Loyalty & Personalization'
          AND d.name IN ('Commercial & Distribution', 'Customer Experience & Servicing', 'Revenue Management', 'Data, Analytics & Innovation')
      THEN 'Loyalty programs share data with sales, service, pricing, and analytics' END),

    -- Safety & Compliance
    (CASE WHEN w.domain_name = 'Safety, Security & Compliance'
          AND d.name IN ('Flight Operations', 'Crew Management', 'MRO / Engineering', 'Ground Operations', 'Cybersecurity & Risk')
      THEN 'coordination'::text END,
     CASE WHEN w.domain_name = 'Safety, Security & Compliance'
          AND d.name IN ('Flight Operations', 'Crew Management', 'MRO / Engineering', 'Ground Operations', 'Cybersecurity & Risk')
      THEN 5 END,
     CASE WHEN w.domain_name = 'Safety, Security & Compliance'
          AND d.name IN ('Flight Operations', 'Crew Management', 'MRO / Engineering', 'Ground Operations', 'Cybersecurity & Risk')
      THEN 'Safety compliance spans all operational areas and cyber risk' END),

    -- Data & Analytics
    (CASE WHEN w.domain_name = 'Data, Analytics & Innovation'
          AND d.name NOT IN ('Data, Analytics & Innovation')
      THEN 'data_sharing'::text END,
     CASE WHEN w.domain_name = 'Data, Analytics & Innovation'
          AND d.name NOT IN ('Data, Analytics & Innovation')
      THEN 3 END,
     CASE WHEN w.domain_name = 'Data, Analytics & Innovation'
          AND d.name NOT IN ('Data, Analytics & Innovation')
      THEN 'Analytics requires data from all domains for insights' END),

    -- IT & Digital Platforms
    (CASE WHEN w.domain_name = 'IT & Digital Platforms'
          AND d.name NOT IN ('IT & Digital Platforms', 'Cybersecurity & Risk')
      THEN 'resource_sharing'::text END,
     CASE WHEN w.domain_name = 'IT & Digital Platforms'
          AND d.name NOT IN ('IT & Digital Platforms', 'Cybersecurity & Risk')
      THEN 4 END,
     CASE WHEN w.domain_name = 'IT & Digital Platforms'
          AND d.name NOT IN ('IT & Digital Platforms', 'Cybersecurity & Risk')
      THEN 'IT platforms provide shared services to all business domains' END)

) AS linkage(type, strength, description)
WHERE linkage.type IS NOT NULL
  AND w.domain_id != d.id  -- Don't create self-referential linkages
ON CONFLICT DO NOTHING;

-- Summary of bridges created
SELECT
  d.name as domain,
  COUNT(*) as bridge_count
FROM cross_domain_linkages cdl
JOIN workflows w ON cdl.workflow_id = w.id
JOIN subdomains s ON w.subdomain_id = s.id
JOIN domains d ON s.domain_id = d.id
GROUP BY d.name
ORDER BY bridge_count DESC;

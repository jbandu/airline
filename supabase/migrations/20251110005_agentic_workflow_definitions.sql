/*
  Migration 005: Agentic Distribution Workflow Definitions

  Purpose: Create workflow definitions for AI-driven distribution capabilities
  Based on: Agent and domain structures from migrations 001-004

  Workflows by Domain:
  - Agentic Distribution & Discovery (4 workflows)
  - Brand & Product Management (3 workflows)
  - Agentic Transaction Execution (4 workflows)
  - API-First Architecture (3 workflows)
  - Loyalty & Personalization (3 workflows)

  Total New Workflows: 17 (representative samples)
*/

-- First, get domain and subdomain IDs
DO $$
DECLARE
  -- Domain IDs
  v_domain_discovery_id uuid;
  v_domain_brand_id uuid;
  v_domain_transaction_id uuid;
  v_domain_api_id uuid;
  v_domain_loyalty_id uuid;

  -- Subdomain IDs
  v_subdomain_conv_shop_id uuid;
  v_subdomain_fare_intel_id uuid;
  v_subdomain_ancillary_id uuid;
  v_subdomain_content_sync_id uuid;
  v_subdomain_ai_discov_id uuid;
  v_subdomain_booking_orch_id uuid;
  v_subdomain_payment_id uuid;
  v_subdomain_postbook_id uuid;
  v_subdomain_gateway_id uuid;
  v_subdomain_realtime_id uuid;
  v_subdomain_ffp_int_id uuid;
  v_subdomain_preference_id uuid;
  v_subdomain_personalized_rec_id uuid;
BEGIN
  -- Get domain IDs
  SELECT id INTO v_domain_discovery_id FROM domains WHERE name = 'Agentic Distribution & Discovery';
  SELECT id INTO v_domain_brand_id FROM domains WHERE name = 'Brand & Product Management';
  SELECT id INTO v_domain_transaction_id FROM domains WHERE name = 'Agentic Transaction Execution';
  SELECT id INTO v_domain_api_id FROM domains WHERE name = 'API-First Architecture';
  SELECT id INTO v_domain_loyalty_id FROM domains WHERE name = 'Loyalty & Personalization';

  -- Get subdomain IDs
  SELECT id INTO v_subdomain_conv_shop_id FROM subdomains WHERE name = 'Conversational Shopping Experience' AND domain_id = v_domain_discovery_id;
  SELECT id INTO v_subdomain_fare_intel_id FROM subdomains WHERE name = 'Fare Intelligence & Recommendation' AND domain_id = v_domain_discovery_id;
  SELECT id INTO v_subdomain_ancillary_id FROM subdomains WHERE name = 'Ancillary Discovery & Bundling' AND domain_id = v_domain_discovery_id;
  SELECT id INTO v_subdomain_content_sync_id FROM subdomains WHERE name = 'Content Syndication & Governance' AND domain_id = v_domain_brand_id;
  SELECT id INTO v_subdomain_ai_discov_id FROM subdomains WHERE name = 'AI Discoverability Optimization' AND domain_id = v_domain_brand_id;
  SELECT id INTO v_subdomain_booking_orch_id FROM subdomains WHERE name = 'Booking Orchestration' AND domain_id = v_domain_transaction_id;
  SELECT id INTO v_subdomain_payment_id FROM subdomains WHERE name = 'Payment & Ticketing' AND domain_id = v_domain_transaction_id;
  SELECT id INTO v_subdomain_postbook_id FROM subdomains WHERE name = 'Post-Booking Services' AND domain_id = v_domain_transaction_id;
  SELECT id INTO v_subdomain_gateway_id FROM subdomains WHERE name = 'API Gateway Management' AND domain_id = v_domain_api_id;
  SELECT id INTO v_subdomain_realtime_id FROM subdomains WHERE name = 'Real-Time Data Syndication' AND domain_id = v_domain_api_id;
  SELECT id INTO v_subdomain_ffp_int_id FROM subdomains WHERE name = 'FFP Integration' AND domain_id = v_domain_loyalty_id;
  SELECT id INTO v_subdomain_preference_id FROM subdomains WHERE name = 'Preference Management' AND domain_id = v_domain_loyalty_id;
  SELECT id INTO v_subdomain_personalized_rec_id FROM subdomains WHERE name = 'Personalized Recommendations' AND domain_id = v_domain_loyalty_id;

-- ============================================================================
-- DOMAIN 1: Agentic Distribution & Discovery (4 workflows)
-- ============================================================================

  -- Workflow 1: Complex Natural Language Flight Search
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Complex Natural Language Flight Search',
    'Enables conversational AI platforms (ChatGPT, Claude, Perplexity) to process complex flight search requests with multiple constraints. Translates natural language queries like "Find me a morning flight to London next Tuesday with WiFi and flat-bed seats under $1500" into structured API calls.',
    v_domain_discovery_id,
    v_subdomain_conv_shop_id,
    5, -- complexity
    5, -- agentic potential
    4, -- autonomy level
    1, -- implementation wave
    'planned',
    ARRAY['Full Service', 'Low Cost'],
    'agentic_discovery',
    ARRAY['NLP', 'Intent Recognition', 'Entity Extraction', 'API Integration'],
    ARRAY['NDC API', 'PSS', 'Content Management System'],
    'Captures demand from conversational AI platforms which represent 15-20% of Gen Z travel research. Reduces dependency on GDS distribution while maintaining brand control.',
    '8-12% incremental bookings from AI platforms, estimated $2-3M annual revenue for mid-size carrier',
    ARRAY['NDC implementation', 'API gateway', 'AI platform partnerships'],
    '[{"metric": "AI platform queries processed", "target": 10000, "period": "monthly"}, {"metric": "Query understanding accuracy", "target": 0.93, "period": "ongoing"}, {"metric": "Conversion rate", "target": 0.06, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 2: Dynamic Fare Family Recommendation
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Dynamic Fare Family Recommendation',
    'AI agent analyzes passenger profile, route characteristics, and booking context to recommend optimal fare family. Personalizes fare display based on FFP status, route frequency, and upgrade propensity.',
    v_domain_discovery_id,
    v_subdomain_fare_intel_id,
    4,
    5,
    4,
    1,
    'in-progress',
    ARRAY['Full Service', 'Premium Economy', 'Low Cost'],
    'agentic_discovery',
    ARRAY['Collaborative Filtering', 'Contextual Bandits', 'A/B Testing', 'Real-time Personalization'],
    ARRAY['NDC API', 'FFP System', 'CRM', 'Revenue Management'],
    'Increases ancillary revenue by matching passengers with fare families that align with their needs. Reduces choice overload and decision fatigue. Hotel industry analogue: Marriott''s room type recommendations.',
    '$45-65 average basket increase per booking, 23% lift in bundled fare selection',
    ARRAY['Branded fare families defined', 'Passenger segmentation', 'A/B testing framework'],
    '[{"metric": "Fare family upsell rate", "target": 0.23, "period": "monthly"}, {"metric": "Average basket value increase", "target": 55.00, "period": "monthly"}, {"metric": "Customer satisfaction", "target": 0.85, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 3: Intelligent Ancillary Bundling
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Intelligent Ancillary Bundling',
    'Creates personalized ancillary bundles (seats + bags + meals + WiFi) based on passenger preferences, route characteristics, and historical purchase patterns. Optimizes bundle pricing for maximum conversion.',
    v_domain_discovery_id,
    v_subdomain_ancillary_id,
    4,
    4,
    3,
    2,
    'planned',
    ARRAY['Low Cost', 'Ultra Low Cost', 'Full Service'],
    'agentic_discovery',
    ARRAY['Bundle Optimization', 'Price Elasticity Modeling', 'Preference Learning'],
    ARRAY['Ancillary Platform', 'PSS', 'Pricing Engine'],
    'ULCC model depends on ancillary revenue (30-40% of total). Intelligent bundling increases take rates while improving passenger satisfaction. Similar to hotel early/late check-in bundling.',
    'Ancillary revenue per passenger increase of $12-18, overall ancillary take rate +15%',
    ARRAY['Ancillary product catalog', 'Historical purchase data', 'Dynamic pricing capability'],
    '[{"metric": "Bundle attach rate", "target": 0.35, "period": "monthly"}, {"metric": "Revenue per ancillary customer", "target": 47.00, "period": "monthly"}, {"metric": "NPS impact", "target": 8, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 4: Visual Cabin Search
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Visual Cabin Search and Matching',
    'Passengers can search flights by uploading photos of desired cabin features (lie-flat seats, privacy pods, IFE screens). Computer vision matches visual preferences with aircraft configurations.',
    v_domain_discovery_id,
    v_subdomain_conv_shop_id,
    5,
    3,
    3,
    3,
    'not_started',
    ARRAY['Full Service', 'Premium Economy'],
    'agentic_discovery',
    ARRAY['Computer Vision', 'Image Similarity', 'Visual Search', 'CNN'],
    ARRAY['Content Management', 'Aircraft Configuration Database', 'NDC API'],
    'Premium cabin passengers research extensively. Visual search reduces friction and increases aspirational bookings. Hotel analogue: Airbnb visual search for unique properties.',
    'Premium cabin booking increase of 8-12%, particularly effective for business/first class',
    ARRAY['High-quality cabin photography', 'Aircraft config database', 'Image processing pipeline'],
    '[{"metric": "Visual searches per month", "target": 5000, "period": "monthly"}, {"metric": "Premium cabin conversion lift", "target": 0.10, "period": "quarterly"}, {"metric": "Feature adoption rate", "target": 0.05, "period": "annually"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

-- ============================================================================
-- DOMAIN 2: Brand & Product Management (3 workflows)
-- ============================================================================

  -- Workflow 5: NDC Content Standardization
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Automated NDC Content Standardization',
    'Transforms airline product content into IATA NDC-compliant format. Validates against schema, enriches metadata, and publishes to all distribution channels. Maintains single source of truth.',
    v_domain_brand_id,
    v_subdomain_content_sync_id,
    5,
    4,
    4,
    1,
    'in-progress',
    ARRAY['Full Service', 'Low Cost', 'Regional'],
    'content_syndication',
    ARRAY['Schema Validation', 'Content Transformation', 'ETL', 'API Integration'],
    ARRAY['NDC API', 'GDS', 'Content CMS', 'PIM'],
    'NDC adoption critical for retaining control of product presentation and ancillary attach. Manual content management doesn''t scale. Automation reduces time-to-market from 2 weeks to 2 hours.',
    'Operational cost savings of $150-200K annually, time-to-market reduction of 95%',
    ARRAY['NDC certification', 'Content taxonomy defined', 'Product information management system'],
    '[{"metric": "Content validation accuracy", "target": 0.98, "period": "ongoing"}, {"metric": "Channels synchronized", "target": 15, "period": "quarterly"}, {"metric": "Manual intervention rate", "target": 0.05, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 6: AI-Optimized Content Generation
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'LLM-Optimized Fare Descriptions',
    'Generates multiple variants of fare family descriptions optimized for LLM retrieval and understanding. Includes Schema.org markup, natural language explanations, and competitive differentiation.',
    v_domain_brand_id,
    v_subdomain_ai_discov_id,
    4,
    5,
    4,
    1,
    'planned',
    ARRAY['Full Service', 'Low Cost'],
    'content_syndication',
    ARRAY['LLM Fine-tuning', 'Schema.org Generation', 'SEO', 'Content Generation'],
    ARRAY['Content CMS', 'NDC API', 'Marketing Automation'],
    'AI platforms prioritize airlines with clear, structured product information. Poor content = invisibility. Hotel example: Marriott optimizing for "hotels with pools near me" queries.',
    'Improved AI platform visibility leading to 10-15% more organic referrals',
    ARRAY['Fare family definitions', 'Competitive positioning', 'Schema.org integration'],
    '[{"metric": "AI platform mentions", "target": 1000, "period": "monthly"}, {"metric": "Content comprehension score", "target": 0.90, "period": "quarterly"}, {"metric": "Structured data coverage", "target": 1.0, "period": "ongoing"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 7: Multi-Channel Brand Monitoring
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Automated Brand Accuracy Monitoring',
    'Continuously monitors airline brand representation across OTAs, metasearch, and AI platforms. Detects pricing errors, outdated content, and competitive misrepresentations. Auto-generates correction requests.',
    v_domain_brand_id,
    v_subdomain_content_sync_id,
    4,
    3,
    3,
    2,
    'planned',
    ARRAY['Full Service', 'Low Cost', 'Ultra Low Cost'],
    'content_syndication',
    ARRAY['Web Scraping', 'Content Comparison', 'Anomaly Detection', 'Alert Management'],
    ARRAY['Content CMS', 'GDS', 'Channel Manager'],
    'Revenue leakage from content inaccuracies estimated at 1-2% of total bookings. Hotels solve this with rate parity tools. Airlines need equivalent for complex ancillary products.',
    'Revenue protection of $500K-2M annually by catching display errors and pricing discrepancies',
    ARRAY['Channel inventory', 'Content baseline', 'Alert routing system'],
    '[{"metric": "Channels monitored", "target": 45, "period": "ongoing"}, {"metric": "Issues detected", "target": 200, "period": "monthly"}, {"metric": "Mean time to resolution", "target": 24, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

-- ============================================================================
-- DOMAIN 3: Agentic Transaction Execution (4 workflows)
-- ============================================================================

  -- Workflow 8: End-to-End Booking Orchestration
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'AI-Driven Booking Orchestration',
    'Fully autonomous booking creation from AI platform offers. Handles PNR creation, seat assignment, SSR requests, and confirmation. Includes error recovery and fallback logic.',
    v_domain_transaction_id,
    v_subdomain_booking_orch_id,
    5,
    5,
    5,
    1,
    'in-progress',
    ARRAY['Full Service', 'Low Cost', 'Regional'],
    'transaction_execution',
    ARRAY['Workflow Orchestration', 'Error Recovery', 'State Management', 'API Integration'],
    ARRAY['PSS', 'NDC API', 'GDS', 'Payment Gateway'],
    'Reduces booking completion time from 45 seconds to 4 seconds. Eliminates human errors in data entry. Critical for AI platform transactions where speed = conversion.',
    '97% booking success rate, operational cost per booking reduced from $8.50 to $0.15',
    ARRAY['API-first PSS', 'NDC shopping and order', 'Automated testing framework'],
    '[{"metric": "Booking success rate", "target": 0.97, "period": "monthly"}, {"metric": "Average completion time", "target": 4.2, "period": "ongoing"}, {"metric": "Automated bookings per month", "target": 50000, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 9: Multi-FOP Payment Orchestration
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Multi-Form of Payment Processing',
    'Processes split payments (card + miles, BNPL + gift card, etc) with integrated fraud detection. Handles 3DS authentication, currency conversion, and PCI compliance across all payment methods.',
    v_domain_transaction_id,
    v_subdomain_payment_id,
    5,
    4,
    5,
    1,
    'in-progress',
    ARRAY['Full Service', 'Low Cost'],
    'transaction_execution',
    ARRAY['Payment Gateway Integration', '3DS', 'Fraud Detection', 'Tokenization'],
    ARRAY['Payment Processor', 'Fraud Detection', 'PSS', 'FFP System'],
    'Gen Z expects flexible payment options (BNPL increasing 40% YoY). Split FOPs increase conversion by 12-15%. Hotel booking.com analogue: crypto + traditional payment combinations.',
    'Conversion rate increase of 12%, fraud reduction of $200K annually',
    ARRAY['PCI DSS Level 1 certification', 'Payment gateway contracts', 'Fraud detection rules'],
    '[{"metric": "Payment success rate", "target": 0.983, "period": "monthly"}, {"metric": "Fraud chargeback rate", "target": 0.002, "period": "monthly"}, {"metric": "Split payment adoption", "target": 0.18, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 10: Intelligent Seat Assignment
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Preference-Based Automated Seat Assignment',
    'Assigns optimal seats based on passenger preferences, FFP status, family grouping, and wheelchair/bassinet requirements. Learns from historical selections to improve accuracy.',
    v_domain_transaction_id,
    v_subdomain_postbook_id,
    4,
    4,
    4,
    2,
    'planned',
    ARRAY['Full Service', 'Low Cost', 'Regional'],
    'transaction_execution',
    ARRAY['Constraint Satisfaction', 'Preference Learning', 'Optimization'],
    ARRAY['DCS', 'PSS', 'FFP System', 'Preference Database'],
    'Manual seat assignment costly (5 min per family group). Automated assignment improves passenger satisfaction while reducing agent workload. Target: 85%+ auto-assignment rate.',
    'Cost savings of $1.2M annually (12 FTE replaced), NPS improvement of +8 points',
    ARRAY['Seat map data', 'Passenger preference history', 'Group travel detection'],
    '[{"metric": "Auto-assignment success rate", "target": 0.85, "period": "monthly"}, {"metric": "Passenger satisfaction", "target": 0.88, "period": "quarterly"}, {"metric": "Reassignment requests", "target": 0.12, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 11: Post-Booking Ancillary Upsell
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Dynamic Post-Booking Ancillary Offers',
    'Proactively offers relevant ancillaries post-booking based on route, passenger segment, and trip characteristics. Optimizes timing (check-in - 24h) for maximum conversion.',
    v_domain_transaction_id,
    v_subdomain_postbook_id,
    3,
    4,
    3,
    2,
    'planned',
    ARRAY['Low Cost', 'Ultra Low Cost', 'Full Service'],
    'transaction_execution',
    ARRAY['Propensity Modeling', 'Dynamic Offers', 'Channel Optimization'],
    ARRAY['Ancillary Platform', 'CRM', 'Email/Push Notification'],
    'Post-booking window represents 30-40% of total ancillary revenue for LCCs. Seat selection peaks at T-48h, bags at T-24h. Timing optimization increases take rates by 25-35%.',
    'Ancillary revenue increase of $8-12 per booking, 15% higher take rates vs generic offers',
    ARRAY['Ancillary product catalog', 'Communication channels', 'Propensity models'],
    '[{"metric": "Post-booking ancillary revenue", "target": 10.50, "period": "monthly"}, {"metric": "Offer conversion rate", "target": 0.22, "period": "monthly"}, {"metric": "Unsubscribe rate", "target": 0.03, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

-- ============================================================================
-- DOMAIN 4: API-First Architecture (3 workflows)
-- ============================================================================

  -- Workflow 12: Adaptive API Rate Limiting
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Adaptive API Rate Limiting and Throttling',
    'Dynamically adjusts rate limits per consumer based on usage patterns, payment tier, and system load. Prevents abuse while maximizing API utilization. Implements token bucket and sliding window algorithms.',
    v_domain_api_id,
    v_subdomain_gateway_id,
    4,
    3,
    4,
    1,
    'in-progress',
    ARRAY['Full Service', 'Low Cost', 'Regional'],
    'api_gateway',
    ARRAY['Rate Limiting', 'Traffic Shaping', 'Anomaly Detection'],
    ARRAY['API Gateway', 'Load Balancer', 'Monitoring'],
    'Uncontrolled API usage can overwhelm PSS. Rate limiting prevents costly outages while enabling fair resource allocation. Hotel example: Amadeus/Sabre rate limits protect GDS infrastructure.',
    'Prevents estimated $500K-1M in PSS overload incidents annually, enables 10x API traffic growth',
    ARRAY['API gateway infrastructure', 'Consumer tiering model', 'Monitoring dashboard'],
    '[{"metric": "API requests per second", "target": 10000, "period": "ongoing"}, {"metric": "Rate limit violations", "target": 0.02, "period": "monthly"}, {"metric": "P99 latency", "target": 150, "period": "ongoing"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 13: Real-Time Inventory Synchronization
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Real-Time Inventory Sync to AI Platforms',
    'Pushes inventory updates to subscribed AI platforms within 150ms of PSS changes. Uses webhooks for immediate notification of sold-out flights, schedule changes, and price updates.',
    v_domain_api_id,
    v_subdomain_realtime_id,
    5,
    4,
    5,
    1,
    'planned',
    ARRAY['Full Service', 'Low Cost'],
    'api_gateway',
    ARRAY['Event Streaming', 'Webhook Delivery', 'Change Data Capture'],
    ARRAY['PSS', 'API Gateway', 'Message Queue', 'CDN'],
    'Stale inventory causes booking failures and passenger frustration. Real-time sync essential for AI platforms with high query volumes. Hotels solve this with Expedia/Booking.com cache invalidation.',
    'Reduces booking failures by 80%, improves AI platform conversion by 15%',
    ARRAY['PSS event stream', 'Webhook infrastructure', 'Retry logic'],
    '[{"metric": "Sync latency (ms)", "target": 150, "period": "ongoing"}, {"metric": "Webhook delivery success", "target": 0.994, "period": "monthly"}, {"metric": "Cache hit rate", "target": 0.92, "period": "ongoing"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 14: OAuth 2.0 Authentication
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Centralized OAuth 2.0 API Authentication',
    'Manages authentication for all external API consumers (AI platforms, OTAs, corporate clients). Supports OAuth 2.0, mTLS, and API keys. Integrates with identity providers for SSO.',
    v_domain_api_id,
    v_subdomain_gateway_id,
    5,
    4,
    5,
    1,
    'in-progress',
    ARRAY['Full Service', 'Low Cost', 'Regional'],
    'api_gateway',
    ARRAY['OAuth 2.0', 'JWT', 'mTLS', 'Identity Provider Integration'],
    ARRAY['API Gateway', 'IAM', 'Certificate Authority'],
    'Secure API access essential for PCI compliance and data protection. Centralized auth simplifies consumer onboarding (hours vs weeks) and enables fine-grained access control.',
    'Reduces consumer onboarding time from 2 weeks to 4 hours, prevents security breaches',
    ARRAY['OAuth 2.0 server', 'Identity provider integration', 'Certificate management'],
    '[{"metric": "Auth requests per second", "target": 5000, "period": "ongoing"}, {"metric": "Token validation latency", "target": 12, "period": "ongoing"}, {"metric": "Security incidents", "target": 0, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

-- ============================================================================
-- DOMAIN 5: Loyalty & Personalization (3 workflows)
-- ============================================================================

  -- Workflow 15: Real-Time FFP Status Recognition
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Real-Time FFP Status Recognition',
    'Recognizes frequent flyer status across all channels (web, mobile, AI platforms, call center). Applies tier benefits automatically to search results and offers. Supports partner airlines.',
    v_domain_loyalty_id,
    v_subdomain_ffp_int_id,
    4,
    4,
    4,
    1,
    'in-progress',
    ARRAY['Full Service'],
    'personalization',
    ARRAY['Member Recognition', 'Benefit Calculation', 'Partner Integration'],
    ARRAY['FFP System', 'Alliance APIs', 'CRM'],
    'Status recognition drives loyalty program engagement. 73% of elites say recognition influences airline choice. AI platforms need real-time benefit visibility to recommend carriers effectively.',
    'Incremental bookings from elite members +8%, alliance partner booking value +12%',
    ARRAY['FFP API access', 'Alliance integration', 'Benefit rule engine'],
    '[{"metric": "Status lookup latency", "target": 80, "period": "ongoing"}, {"metric": "Recognition accuracy", "target": 0.98, "period": "monthly"}, {"metric": "Partner verification rate", "target": 0.95, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 16: Privacy-Preserving Preference Learning
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Privacy-Preserving Preference Learning',
    'Learns passenger preferences from behavior (seat selections, meal choices, route patterns) without storing PII. Implements differential privacy and federated learning. GDPR/CCPA compliant.',
    v_domain_loyalty_id,
    v_subdomain_preference_id,
    5,
    4,
    3,
    2,
    'planned',
    ARRAY['Full Service', 'Low Cost'],
    'personalization',
    ARRAY['Federated Learning', 'Differential Privacy', 'Behavioral Analysis'],
    ARRAY['Preference Database', 'Analytics Platform', 'Consent Management'],
    'Personalization increases conversion by 15-25% but privacy regulations restrict data use. Privacy-preserving ML enables personalization while respecting consent. Hotel example: Marriott''s privacy-first recommendations.',
    'Conversion increase of 18% among consenting passengers, zero privacy violations',
    ARRAY['Consent management platform', 'Preference schema', 'Privacy budget allocation'],
    '[{"metric": "Consent opt-in rate", "target": 0.62, "period": "quarterly"}, {"metric": "Preference accuracy", "target": 0.87, "period": "ongoing"}, {"metric": "Privacy budget remaining", "target": 0.30, "period": "monthly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

  -- Workflow 17: Contextual Upgrade Offers
  INSERT INTO workflows (
    id, name, description, domain_id, subdomain_id,
    complexity, agentic_potential, autonomy_level, implementation_wave, status,
    airline_type, agentic_function_type, ai_enablers, systems_involved,
    business_context, expected_roi, dependencies, success_metrics, version, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Contextual Upgrade Opportunity Detection',
    'Identifies upgrade opportunities (operational, mileage, paid) and offers them at optimal moments. Considers passenger status, route, seat availability, and willingness to pay.',
    v_domain_loyalty_id,
    v_subdomain_personalized_rec_id,
    4,
    4,
    4,
    2,
    'planned',
    ARRAY['Full Service'],
    'personalization',
    ARRAY['Propensity Modeling', 'Dynamic Pricing', 'Notification Optimization'],
    ARRAY['Revenue Management', 'DCS', 'FFP System', 'Mobile Push'],
    'Upgrade revenue underutilized ($200-400 average vs $50-80 realized). Contextual offers (check-in, gate) convert 3-5x better than email. Hotel example: Hilton''s "upgrade for $39 more" at check-in.',
    'Upgrade revenue increase of $15-22 per eligible passenger, 18% conversion rate',
    ARRAY['Upgrade pricing model', 'Notification channels', 'Availability prediction'],
    '[{"metric": "Upgrade conversion rate", "target": 0.18, "period": "monthly"}, {"metric": "Revenue per upgrade offer", "target": 67.00, "period": "monthly"}, {"metric": "Notification opt-out rate", "target": 0.04, "period": "quarterly"}]'::jsonb,
    1,
    NOW(),
    NOW()
  );

END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- New workflows created: 17
-- Distribution by domain:
--   - Agentic Distribution & Discovery: 4
--   - Brand & Product Management: 3
--   - Agentic Transaction Execution: 4
--   - API-First Architecture: 3
--   - Loyalty & Personalization: 3
--
-- Complexity distribution:
--   - 5 (Very High): 7 workflows
--   - 4 (High): 9 workflows
--   - 3 (Medium): 1 workflow
--
-- Implementation waves:
--   - Wave 1 (foundation): 10 workflows
--   - Wave 2 (enhancement): 7 workflows
--   - Wave 3 (advanced): 0 workflows
--
-- Expected combined ROI: $5-8M annually for mid-size carrier
--
-- Next step: Populate reference data (migration 006)

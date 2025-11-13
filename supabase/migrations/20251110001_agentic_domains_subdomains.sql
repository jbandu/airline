/*
  Migration 001: Agentic Distribution Domains and Subdomains

  Purpose: Add new business domains and subdomains for AI-driven distribution capabilities
  Based on: PwC hotel agentic commerce model applied to airline industry

  New Domains (5):
  1. Agentic Distribution & Discovery
  2. Brand & Product Management
  3. Agentic Transaction Execution
  4. API-First Architecture
  5. Loyalty & Personalization

  Total New Subdomains: 15 (3 per domain)
*/

-- ============================================================================
-- DOMAIN 1: Agentic Distribution & Discovery
-- ============================================================================

INSERT INTO domains (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Agentic Distribution & Discovery',
  'AI-powered flight shopping, fare intelligence, and ancillary discovery across conversational platforms and digital assistants. Enables natural language queries, multi-constraint search, and intelligent product recommendations.',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Get the domain ID for subdomain insertion
DO $$
DECLARE
  v_domain_id uuid;
BEGIN
  SELECT id INTO v_domain_id FROM domains WHERE name = 'Agentic Distribution & Discovery';

  -- Subdomain 1.1: Conversational Shopping Experience
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Conversational Shopping Experience',
    'Multi-constraint query parsing, natural language to flight search translation, and complex itinerary construction via AI agents. Handles requests like "Find me a direct flight to Paris next Tuesday that allows 2 checked bags and has WiFi".',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 1.2: Fare Intelligence & Recommendation
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Fare Intelligence & Recommendation',
    'Dynamic fare family matching, price prediction and alerts, upsell opportunity identification. AI analyzes passenger preferences, route history, and willingness to pay to recommend optimal fare products.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 1.3: Ancillary Discovery & Bundling
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Ancillary Discovery & Bundling',
    'Seat preference matching, meal/baggage/service recommendations, and bundle optimization. Learns from passenger behavior to suggest relevant ancillaries at optimal moments in the booking journey.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;
END $$;

-- ============================================================================
-- DOMAIN 2: Brand & Product Management
-- ============================================================================

INSERT INTO domains (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Brand & Product Management',
  'Content governance, product differentiation, and AI discoverability optimization. Ensures airline brand accuracy across all distribution channels and AI platforms through standardized content syndication.',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  v_domain_id uuid;
BEGIN
  SELECT id INTO v_domain_id FROM domains WHERE name = 'Brand & Product Management';

  -- Subdomain 2.1: Content Syndication & Governance
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Content Syndication & Governance',
    'Single source of truth management for airline product content, multi-channel distribution orchestration, and version control with approval workflows. Ensures consistency across GDS, OTAs, metasearch, and AI platforms.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 2.2: Product Differentiation
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Product Differentiation',
    'Branded fare accuracy, competitive positioning visualization, and alliance partnership benefit visibility. Helps airlines articulate unique value propositions to AI agents for better representation.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 2.3: AI Discoverability Optimization
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'AI Discoverability Optimization',
    'Schema.org markup generation, NDC content enhancement, and LLM-friendly product descriptions. Optimizes airline content for retrieval and understanding by conversational AI platforms.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;
END $$;

-- ============================================================================
-- DOMAIN 3: Agentic Transaction Execution
-- ============================================================================

INSERT INTO domains (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Agentic Transaction Execution',
  'End-to-end booking, payment, and ticketing orchestration executed by AI agents. Enables seamless transaction flows from offer creation through post-booking services without human intervention.',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  v_domain_id uuid;
BEGIN
  SELECT id INTO v_domain_id FROM domains WHERE name = 'Agentic Transaction Execution';

  -- Subdomain 3.1: Booking Orchestration
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Booking Orchestration',
    'PNR creation via API, multi-segment booking coordination, and inventory hold management. Handles complex itineraries with multiple airlines, fare combinations, and special service requests.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 3.2: Payment & Ticketing
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Payment & Ticketing',
    'Payment method orchestration across multiple forms of payment, e-ticket issuance via BSP/ARC, and receipt generation. Supports split payments, corporate accounts, and loyalty point redemption.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 3.3: Post-Booking Services
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Post-Booking Services',
    'Automated seat assignment based on preferences, ancillary addition post-purchase, and itinerary modification handling. Supports exchanges, refunds, and schedule change accommodation.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;
END $$;

-- ============================================================================
-- DOMAIN 4: API-First Architecture
-- ============================================================================

INSERT INTO domains (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'API-First Architecture',
  'Modern API infrastructure for real-time distribution. Gateway management, rate limiting, authentication, and standardized integration patterns enabling AI platforms to access airline services programmatically.',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  v_domain_id uuid;
BEGIN
  SELECT id INTO v_domain_id FROM domains WHERE name = 'API-First Architecture';

  -- Subdomain 4.1: API Gateway Management
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'API Gateway Management',
    'Rate limiting & throttling per consumer, authentication & authorization (OAuth2, API keys, mTLS), and request/response transformation. Ensures fair resource allocation and prevents abuse.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 4.2: Real-Time Data Syndication
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Real-Time Data Syndication',
    'Inventory synchronization, dynamic pricing updates, and schedule change propagation. Pushes updates to subscribed AI platforms within milliseconds for accurate availability display.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 4.3: Integration Standards
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Integration Standards',
    'NDC (IATA New Distribution Capability) compliance, IATA standards alignment for interoperability, and OpenTravel alliance schema adoption. Ensures consistent data exchange formats.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;
END $$;

-- ============================================================================
-- DOMAIN 5: Loyalty & Personalization
-- ============================================================================

INSERT INTO domains (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Loyalty & Personalization',
  'FFP integration, privacy-preserving preference management, and personalized recommendations. Enables AI platforms to recognize status, apply benefits, and tailor offers while respecting passenger privacy.',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  v_domain_id uuid;
BEGIN
  SELECT id INTO v_domain_id FROM domains WHERE name = 'Loyalty & Personalization';

  -- Subdomain 5.1: FFP Integration
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'FFP Integration',
    'Status recognition across all platforms (own and partner airlines), benefits eligibility calculation in real-time, and partner airline coordination for accrual and redemption. Supports Star Alliance, Oneworld, SkyTeam.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 5.2: Preference Management
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Preference Management',
    'Learns from booking behavior and service usage patterns, privacy-preserving storage with encryption, and explicit consent management per GDPR/CCPA. Passenger controls data sharing granularly.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;

  -- Subdomain 5.3: Personalized Recommendations
  INSERT INTO subdomains (id, domain_id, name, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_domain_id,
    'Personalized Recommendations',
    'Route suggestions based on travel history, service bundling aligned with preferences, and upgrade opportunity identification. Uses collaborative filtering and contextual signals for relevance.',
    NOW(),
    NOW()
  ) ON CONFLICT (domain_id, name) DO NOTHING;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Domains added: 5
-- Subdomains added: 15 (3 per domain)
-- Total new organizational units: 20
--
-- Next steps:
-- 1. Create agent categories (migration 002)
-- 2. Create supporting tables (migration 003)
-- 3. Define agent instances (migration 004)
-- 4. Create workflow definitions (migration 005)

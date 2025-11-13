/*
  Migration 003: Agentic Distribution Infrastructure Tables

  Purpose: Create core tables supporting AI-driven distribution capabilities

  New Tables (10):
  1. airlines - Reference data for airline carriers
  2. systems - Airline IT systems (PSS, DCS, NDC, etc.)
  3. api_endpoints - API inventory and performance metrics
  4. branded_fare_families - NDC fare products with AI-optimized content
  5. ffp_tiers - Frequent flyer program status levels and benefits
  6. ai_platform_integrations - Integration status with ChatGPT, Claude, etc.
  7. passenger_preferences - Privacy-preserving personalization data
  8. content_syndication_feeds - Multi-channel content distribution
  9. aircraft_configurations - Seat maps, IFE, WiFi by tail number
  10. ndc_offers - Cached airline offers for AI platforms
*/

-- ============================================================================
-- TABLE 1: airlines (Reference Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS airlines (
  id BIGSERIAL PRIMARY KEY,
  iata_code CHAR(2) UNIQUE NOT NULL,
  icao_code CHAR(3) UNIQUE,
  name TEXT NOT NULL,
  alliance TEXT CHECK (alliance IN ('Star Alliance', 'Oneworld', 'SkyTeam', 'None')),
  region TEXT, -- 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
  airline_type TEXT CHECK (airline_type IN ('Full Service', 'Low Cost', 'Ultra Low Cost', 'Regional', 'Charter', 'Cargo')),
  ai_maturity_level INTEGER DEFAULT 1 CHECK (ai_maturity_level BETWEEN 1 AND 5),
  headquarters_country TEXT,
  website_url TEXT,
  api_base_url TEXT,
  ndc_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_airlines_iata ON airlines(iata_code);
CREATE INDEX idx_airlines_alliance ON airlines(alliance);
CREATE INDEX idx_airlines_type ON airlines(airline_type);

COMMENT ON TABLE airlines IS 'Airline carriers with digital maturity indicators';
COMMENT ON COLUMN airlines.ai_maturity_level IS '1=Traditional, 2=Digitizing, 3=API-Enabled, 4=AI-Ready, 5=AI-First';

-- ============================================================================
-- TABLE 2: systems (Airline IT Systems)
-- ============================================================================

CREATE TABLE IF NOT EXISTS systems (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL CHECK (system_type IN ('PSS', 'DCS', 'CMS', 'RMS', 'IMS', 'NDC', 'FFP', 'Ancillary', 'Payment', 'BI')),
  system_name TEXT NOT NULL,
  vendor TEXT,
  version TEXT,
  cloud_hosted BOOLEAN DEFAULT false,
  api_available BOOLEAN DEFAULT false,
  real_time_capable BOOLEAN DEFAULT false,
  integration_complexity INTEGER DEFAULT 3 CHECK (integration_complexity BETWEEN 1 AND 5),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_systems_airline ON systems(airline_id);
CREATE INDEX idx_systems_type ON systems(system_type);

COMMENT ON TABLE systems IS 'Core airline IT systems inventory';
COMMENT ON COLUMN systems.system_type IS 'PSS=Passenger Service System, DCS=Departure Control, CMS=Content Management, RMS=Revenue Management, IMS=Inventory, NDC=New Distribution Capability, FFP=Frequent Flyer, BI=Business Intelligence';

-- ============================================================================
-- TABLE 3: api_endpoints (API Inventory)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_endpoints (
  id BIGSERIAL PRIMARY KEY,
  system_id BIGINT REFERENCES systems(id) ON DELETE CASCADE,
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  http_method TEXT CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')) DEFAULT 'GET',
  auth_type TEXT CHECK (auth_type IN ('oauth2', 'api_key', 'bearer', 'basic', 'mtls', 'none')) DEFAULT 'oauth2',
  response_format TEXT CHECK (response_format IN ('json', 'xml', 'protobuf', 'graphql')) DEFAULT 'json',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  avg_latency_ms INTEGER DEFAULT 500,
  success_rate_percent NUMERIC(5,2) DEFAULT 99.00,
  is_real_time BOOLEAN DEFAULT false,
  is_ai_accessible BOOLEAN DEFAULT false,
  ndc_compliant BOOLEAN DEFAULT false,
  requires_pci_compliance BOOLEAN DEFAULT false,
  documentation_url TEXT,
  example_request JSONB,
  example_response JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_endpoints_system ON api_endpoints(system_id);
CREATE INDEX idx_api_endpoints_ai_accessible ON api_endpoints(is_ai_accessible);
CREATE INDEX idx_api_endpoints_ndc ON api_endpoints(ndc_compliant);

COMMENT ON TABLE api_endpoints IS 'Airline API inventory with performance metrics and AI accessibility';
COMMENT ON COLUMN api_endpoints.is_ai_accessible IS 'Whether this endpoint can be safely called by AI agents';

-- ============================================================================
-- TABLE 4: branded_fare_families (NDC Fare Products)
-- ============================================================================

CREATE TABLE IF NOT EXISTS branded_fare_families (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  fare_family_code TEXT NOT NULL,
  fare_family_name TEXT NOT NULL,
  cabin_class TEXT CHECK (cabin_class IN ('Economy', 'Premium Economy', 'Business', 'First')) DEFAULT 'Economy',
  marketing_description TEXT,

  -- Included amenities (JSONB for flexibility)
  included_amenities JSONB DEFAULT '{
    "cabin_bag": true,
    "checked_bag": 0,
    "seat_selection": "standard",
    "changes": false,
    "refunds": false,
    "upgrades": false,
    "lounge": false,
    "priority_boarding": false,
    "extra_legroom": false,
    "meals": "purchase",
    "wifi": false,
    "entertainment": true
  }'::jsonb,

  -- Excluded amenities for clarity
  excluded_amenities JSONB DEFAULT '[]'::jsonb,

  -- NDC machine-readable metadata
  ndc_metadata JSONB DEFAULT '{}'::jsonb,

  -- Schema.org structured data for AI discoverability
  schema_org_markup JSONB DEFAULT '{
    "@context": "https://schema.org",
    "@type": "Offer",
    "category": "airline_fare"
  }'::jsonb,

  -- LLM-optimized description
  ai_description_optimized TEXT,

  -- Positioning
  target_persona TEXT, -- 'Business Traveler', 'Leisure', 'Budget Conscious', 'Premium'
  competitive_positioning TEXT,
  price_range_description TEXT, -- 'Entry', 'Mid-tier', 'Premium', 'Ultra-premium'

  -- Metadata
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, fare_family_code)
);

CREATE INDEX idx_branded_fares_airline ON branded_fare_families(airline_id);
CREATE INDEX idx_branded_fares_cabin ON branded_fare_families(cabin_class);
CREATE INDEX idx_branded_fares_active ON branded_fare_families(active);

COMMENT ON TABLE branded_fare_families IS 'Branded fare products with AI-optimized content for conversational platforms';
COMMENT ON COLUMN branded_fare_families.ai_description_optimized IS 'Natural language description optimized for LLM retrieval and understanding';

-- ============================================================================
-- TABLE 5: ffp_tiers (Frequent Flyer Program Tiers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ffp_tiers (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  tier_code TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  tier_level INTEGER CHECK (tier_level BETWEEN 1 AND 5), -- 1=Base, 2=Silver, 3=Gold, 4=Platinum, 5=Elite
  alliance TEXT, -- Inherited from airline or specific to tier

  -- Benefits (JSONB for flexibility)
  benefits JSONB DEFAULT '{
    "lounge_access": false,
    "priority_boarding": false,
    "extra_baggage_pieces": 0,
    "extra_baggage_weight_kg": 0,
    "free_upgrades": 0,
    "partner_benefits": false,
    "award_bonus_percent": 0,
    "status_bonus_percent": 0,
    "preferred_seating": false,
    "priority_check_in": false,
    "priority_security": false,
    "waitlist_priority": false,
    "award_redemption_discount": 0
  }'::jsonb,

  -- Qualification criteria
  qualification_criteria JSONB DEFAULT '{
    "required_segments": 0,
    "required_miles": 0,
    "required_spend": 0,
    "calendar_year": true
  }'::jsonb,

  -- Technical
  api_accessible BOOLEAN DEFAULT false,
  real_time_verification BOOLEAN DEFAULT false,

  -- Metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, tier_code)
);

CREATE INDEX idx_ffp_tiers_airline ON ffp_tiers(airline_id);
CREATE INDEX idx_ffp_tiers_level ON ffp_tiers(tier_level);

COMMENT ON TABLE ffp_tiers IS 'Frequent flyer program status tiers with benefits and qualification criteria';
COMMENT ON COLUMN ffp_tiers.api_accessible IS 'Whether tier benefits can be verified via API for AI platforms';

-- ============================================================================
-- TABLE 6: ai_platform_integrations (AI Platform Status)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_platform_integrations (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL, -- 'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Poe', 'Character.AI'
  platform_type TEXT CHECK (platform_type IN ('conversational_ai', 'travel_agent_ai', 'metasearch_ai', 'ota', 'voice_assistant')) DEFAULT 'conversational_ai',

  -- Integration status
  integration_status TEXT CHECK (integration_status IN ('not_started', 'in_progress', 'testing', 'live', 'paused', 'deprecated')) DEFAULT 'not_started',
  go_live_date DATE,

  -- Technical details
  api_endpoint TEXT,
  auth_method TEXT,
  content_feed_url TEXT,
  webhook_url TEXT,

  -- Sync details
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT CHECK (sync_frequency IN ('real_time', 'hourly', 'daily', 'weekly', 'on_demand')) DEFAULT 'daily',
  sync_errors INTEGER DEFAULT 0,

  -- Capabilities
  supports_search BOOLEAN DEFAULT false,
  supports_booking BOOLEAN DEFAULT false,
  supports_ancillaries BOOLEAN DEFAULT false,
  supports_checkin BOOLEAN DEFAULT false,
  supports_seat_selection BOOLEAN DEFAULT false,

  -- Business terms
  revenue_share_percent NUMERIC(5,2) DEFAULT 0.00,
  cost_per_booking NUMERIC(10,2),
  monthly_minimum NUMERIC(12,2),

  -- Performance metrics
  monthly_queries INTEGER DEFAULT 0,
  monthly_bookings INTEGER DEFAULT 0,
  conversion_rate_percent NUMERIC(5,2),
  avg_booking_value NUMERIC(10,2),

  -- Metadata
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, platform_name)
);

CREATE INDEX idx_ai_platforms_airline ON ai_platform_integrations(airline_id);
CREATE INDEX idx_ai_platforms_status ON ai_platform_integrations(integration_status);
CREATE INDEX idx_ai_platforms_type ON ai_platform_integrations(platform_type);

COMMENT ON TABLE ai_platform_integrations IS 'Integration status and performance metrics for AI platforms (ChatGPT, Claude, etc.)';
COMMENT ON COLUMN ai_platform_integrations.supports_booking IS 'Whether platform can execute bookings or just provide information';

-- ============================================================================
-- TABLE 7: passenger_preferences (Privacy-Preserving Personalization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS passenger_preferences (
  id BIGSERIAL PRIMARY KEY,
  passenger_profile_id UUID NOT NULL, -- External FFP member ID or hashed identifier
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,

  -- Preferences (all nullable, opt-in)
  seat_preferences JSONB DEFAULT '{
    "location": null,
    "position": null,
    "legroom": null,
    "aisle_window": null
  }'::jsonb,

  meal_preferences JSONB DEFAULT '{
    "dietary_restrictions": [],
    "favorite_meals": [],
    "allergies": []
  }'::jsonb,

  service_preferences JSONB DEFAULT '{
    "preferred_language": null,
    "special_assistance": [],
    "communication_channel": "email"
  }'::jsonb,

  notification_preferences JSONB DEFAULT '{
    "flight_status": true,
    "gate_changes": true,
    "promotions": false,
    "surveys": false
  }'::jsonb,

  -- Travel patterns (learned, not explicitly provided)
  travel_patterns JSONB DEFAULT '{
    "frequency": null,
    "preferred_routes": [],
    "booking_window_days": null,
    "price_sensitivity": null,
    "upgrade_propensity": null
  }'::jsonb,

  -- Consent management (GDPR/CCPA compliance)
  consent_for_personalization BOOLEAN DEFAULT false,
  consent_updated_at TIMESTAMPTZ,
  consent_version INTEGER DEFAULT 1,
  gdpr_compliant BOOLEAN DEFAULT true,

  -- Privacy settings
  privacy_settings JSONB DEFAULT '{
    "share_with_partners": false,
    "use_for_ai_training": false,
    "data_retention_months": 24
  }'::jsonb,

  -- Metadata
  last_flight_date DATE,
  total_flights INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(passenger_profile_id, airline_id)
);

CREATE INDEX idx_passenger_prefs_airline ON passenger_preferences(airline_id);
CREATE INDEX idx_passenger_prefs_consent ON passenger_preferences(consent_for_personalization);

COMMENT ON TABLE passenger_preferences IS 'Privacy-preserving passenger preferences and learned travel patterns';
COMMENT ON COLUMN passenger_preferences.passenger_profile_id IS 'External identifier (FFP number or hashed email) - never store PII directly';

-- ============================================================================
-- TABLE 8: content_syndication_feeds (Multi-Channel Distribution)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_syndication_feeds (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  feed_type TEXT CHECK (feed_type IN ('ndc', 'schema_org', 'json_ld', 'rss', 'atom', 'odata', 'graphql')) DEFAULT 'ndc',
  feed_url TEXT NOT NULL,

  -- Content types included
  content_types TEXT[] DEFAULT ARRAY['fares', 'schedules', 'amenities', 'aircraft_config', 'policies'],

  -- Syndication details
  update_frequency TEXT CHECK (update_frequency IN ('real_time', 'hourly', 'daily', 'weekly', 'on_change')) DEFAULT 'daily',
  last_published_at TIMESTAMPTZ,
  next_publish_at TIMESTAMPTZ,

  -- Quality control
  is_authoritative_source BOOLEAN DEFAULT true,
  validation_status TEXT CHECK (validation_status IN ('valid', 'warning', 'error', 'not_validated')) DEFAULT 'not_validated',
  validation_errors JSONB DEFAULT '[]'::jsonb,

  -- Subscribers
  ai_platforms_subscribed TEXT[] DEFAULT '{}',
  subscriber_count INTEGER DEFAULT 0,

  -- Performance
  monthly_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  uptime_percent NUMERIC(5,2) DEFAULT 99.00,

  -- Metadata
  documentation_url TEXT,
  sample_content JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, feed_name)
);

CREATE INDEX idx_content_feeds_airline ON content_syndication_feeds(airline_id);
CREATE INDEX idx_content_feeds_type ON content_syndication_feeds(feed_type);
CREATE INDEX idx_content_feeds_active ON content_syndication_feeds(active);

COMMENT ON TABLE content_syndication_feeds IS 'Multi-channel content distribution feeds for AI platforms, OTAs, and metasearch';
COMMENT ON COLUMN content_syndication_feeds.is_authoritative_source IS 'Whether this feed is the single source of truth (vs aggregated)';

-- ============================================================================
-- TABLE 9: aircraft_configurations (Seat Maps, IFE, Amenities)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aircraft_configurations (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  aircraft_type TEXT NOT NULL, -- 'Boeing 737-800', 'Airbus A320neo', etc.
  tail_number TEXT, -- Specific registration if config varies by aircraft
  configuration_code TEXT, -- Internal airline code

  -- Cabin layout
  total_seats INTEGER NOT NULL,
  cabin_classes JSONB DEFAULT '{
    "first": 0,
    "business": 0,
    "premium_economy": 0,
    "economy": 0
  }'::jsonb,

  -- Seat characteristics
  seat_pitch_inches JSONB DEFAULT '{}'::jsonb, -- By cabin class
  seat_width_inches JSONB DEFAULT '{}'::jsonb,
  recline_inches JSONB DEFAULT '{}'::jsonb,

  -- Amenities
  wifi_available BOOLEAN DEFAULT false,
  wifi_type TEXT, -- 'Free', 'Paid', 'Free for status', 'Messaging only'
  power_outlets TEXT, -- 'All seats', 'Select seats', 'None'
  usb_ports BOOLEAN DEFAULT false,

  ife_available BOOLEAN DEFAULT false,
  ife_type TEXT, -- 'Seatback screens', 'Wireless streaming', 'None'
  ife_content_hours INTEGER,

  -- Additional features
  mood_lighting BOOLEAN DEFAULT false,
  extra_legroom_seats INTEGER DEFAULT 0,
  bassinet_locations INTEGER DEFAULT 0,
  lavatory_count INTEGER,

  -- Metadata (for AI description generation)
  ai_friendly_description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, aircraft_type, configuration_code)
);

CREATE INDEX idx_aircraft_config_airline ON aircraft_configurations(airline_id);
CREATE INDEX idx_aircraft_config_type ON aircraft_configurations(aircraft_type);

COMMENT ON TABLE aircraft_configurations IS 'Detailed aircraft configurations for accurate seat maps and amenity information';
COMMENT ON COLUMN aircraft_configurations.ai_friendly_description IS 'Natural language description of aircraft for conversational AI platforms';

-- ============================================================================
-- TABLE 10: ndc_offers (Cached Airline Offers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ndc_offers (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  origin_iata CHAR(3) NOT NULL,
  destination_iata CHAR(3) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  cabin_class TEXT,

  -- Offer details (NDC format)
  offer_data JSONB NOT NULL,
  price_total NUMERIC(12,2),
  price_currency CHAR(3) DEFAULT 'USD',

  -- Fare families included
  fare_families_available TEXT[],

  -- Ancillaries
  ancillaries_available JSONB DEFAULT '[]'::jsonb,

  -- Validity
  valid_until TIMESTAMPTZ NOT NULL,
  booking_deadline TIMESTAMPTZ,

  -- Metadata
  query_hash TEXT, -- For caching duplicate queries
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(airline_id, offer_id)
);

CREATE INDEX idx_ndc_offers_airline ON ndc_offers(airline_id);
CREATE INDEX idx_ndc_offers_route ON ndc_offers(origin_iata, destination_iata, departure_date);
CREATE INDEX idx_ndc_offers_valid ON ndc_offers(valid_until);
CREATE INDEX idx_ndc_offers_query_hash ON ndc_offers(query_hash);

COMMENT ON TABLE ndc_offers IS 'Cached NDC offers to reduce API calls and improve AI platform response times';
COMMENT ON COLUMN ndc_offers.query_hash IS 'Hash of query parameters for deduplication';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE branded_fare_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE ffp_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_syndication_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndc_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (read-only for now)
CREATE POLICY "Authenticated users can view airlines"
  ON airlines FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view systems"
  ON systems FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view api_endpoints"
  ON api_endpoints FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view branded_fare_families"
  ON branded_fare_families FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view ffp_tiers"
  ON ffp_tiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view ai_platform_integrations"
  ON ai_platform_integrations FOR SELECT TO authenticated USING (true);

-- Passenger preferences: more restrictive (would need user ID matching in production)
CREATE POLICY "Users can view their own preferences"
  ON passenger_preferences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view content_syndication_feeds"
  ON content_syndication_feeds FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view aircraft_configurations"
  ON aircraft_configurations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view ndc_offers"
  ON ndc_offers FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables created: 10
-- Indexes created: ~30
-- RLS policies created: 10
--
-- Next steps:
-- 1. Populate reference data (airlines, systems)
-- 2. Define agent instances
-- 3. Create workflows
-- 4. Seed Copa Airlines data

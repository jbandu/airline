/*
  Migration 008: Copa Airlines Complete Seed Data

  Purpose: Populate comprehensive operational data for Copa Airlines as reference implementation

  Includes:
  - Complete route network (Hub-and-spoke from Panama City)
  - Additional API endpoints (operations, ancillaries, disruption management)
  - Passenger preference profiles (anonymized archetypes)
  - NDC offer templates
  - Sample content syndication data
  - Operational metrics baseline
*/

-- ============================================================================
-- COPA AIRLINES ROUTE NETWORK
-- ============================================================================
-- Hub: Panama City (PTY) - Key routes to North/South America

DO $$
DECLARE
  v_copa_id BIGINT;
BEGIN
  SELECT id INTO v_copa_id FROM airlines WHERE iata_code = 'CM';

  -- Create routes table if not exists
  CREATE TABLE IF NOT EXISTS airline_routes (
    id BIGSERIAL PRIMARY KEY,
    airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
    origin_airport_code TEXT NOT NULL,
    origin_city TEXT NOT NULL,
    origin_country TEXT NOT NULL,
    destination_airport_code TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    route_type TEXT CHECK (route_type IN ('domestic', 'regional', 'international', 'long_haul')),
    frequency_weekly INTEGER,
    aircraft_types TEXT[],
    travel_time_minutes INTEGER,
    distance_km INTEGER,
    hub_connection BOOLEAN DEFAULT false,
    is_ai_searchable BOOLEAN DEFAULT true,
    ndc_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(airline_id, origin_airport_code, destination_airport_code)
  );

  COMMENT ON TABLE airline_routes IS 'Airline route networks for AI-powered search and discovery';

  -- Insert Copa Airlines routes
  INSERT INTO airline_routes (airline_id, origin_airport_code, origin_city, origin_country, destination_airport_code, destination_city, destination_country, route_type, frequency_weekly, aircraft_types, travel_time_minutes, distance_km, hub_connection, metadata) VALUES
    -- North America Routes (from PTY hub)
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'MIA', 'Miami', 'United States', 'international', 42, ARRAY['737-800', '737 MAX 9'], 165, 2253, true, '{"codeshare": ["UA"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'JFK', 'New York', 'United States', 'international', 21, ARRAY['737-800', '737 MAX 9'], 305, 3512, true, '{"codeshare": ["UA", "AC"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'LAX', 'Los Angeles', 'United States', 'long_haul', 14, ARRAY['737 MAX 9'], 390, 5124, true, '{"codeshare": ["UA"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'ORD', 'Chicago', 'United States', 'international', 14, ARRAY['737-800', '737 MAX 9'], 315, 3689, true, '{"codeshare": ["UA"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'IAD', 'Washington DC', 'United States', 'international', 14, ARRAY['737-800'], 275, 3256, true, '{"codeshare": ["UA"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'SFO', 'San Francisco', 'United States', 'long_haul', 7, ARRAY['737 MAX 9'], 410, 5432, true, '{"codeshare": ["UA"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'MCO', 'Orlando', 'United States', 'international', 21, ARRAY['737-800'], 180, 2145, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'YYZ', 'Toronto', 'Canada', 'international', 14, ARRAY['737-800'], 305, 3542, true, '{"codeshare": ["AC"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'MEX', 'Mexico City', 'Mexico', 'international', 28, ARRAY['737-800', '737 MAX 9'], 210, 2345, true, '{"codeshare": ["AM"], "alliance_eligible": false}'::jsonb),

    -- South America Routes (from PTY hub)
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'BOG', 'Bogota', 'Colombia', 'regional', 42, ARRAY['737-800'], 95, 1056, true, '{"codeshare": ["AV"], "alliance_eligible": true}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'LIM', 'Lima', 'Peru', 'international', 28, ARRAY['737-800', '737 MAX 9'], 185, 2145, true, '{"codeshare": ["LA"], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'GYE', 'Guayaquil', 'Ecuador', 'regional', 21, ARRAY['737-800'], 125, 1234, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'GIG', 'Rio de Janeiro', 'Brazil', 'international', 14, ARRAY['737-800'], 380, 4523, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'GRU', 'Sao Paulo', 'Brazil', 'international', 21, ARRAY['737 MAX 9'], 395, 4765, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'EZE', 'Buenos Aires', 'Argentina', 'long_haul', 14, ARRAY['737 MAX 9'], 470, 6234, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'SCL', 'Santiago', 'Chile', 'long_haul', 14, ARRAY['737 MAX 9'], 425, 5678, true, '{"codeshare": ["LA"], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'CCS', 'Caracas', 'Venezuela', 'regional', 7, ARRAY['737-800'], 145, 1456, true, '{"codeshare": [], "alliance_eligible": false, "service_suspended": false}'::jsonb),

    -- Central America & Caribbean Routes
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'SJO', 'San Jose', 'Costa Rica', 'regional', 35, ARRAY['737-800', '737-700'], 65, 678, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'SAL', 'San Salvador', 'El Salvador', 'regional', 28, ARRAY['737-800'], 95, 845, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'GUA', 'Guatemala City', 'Guatemala', 'regional', 28, ARRAY['737-800'], 125, 1234, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'MBJ', 'Montego Bay', 'Jamaica', 'regional', 14, ARRAY['737-800'], 145, 1345, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'PUJ', 'Punta Cana', 'Dominican Republic', 'regional', 14, ARRAY['737-800'], 165, 1567, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'PTY', 'Panama City', 'Panama', 'CUN', 'Cancun', 'Mexico', 'regional', 21, ARRAY['737-800'], 175, 1789, true, '{"codeshare": [], "alliance_eligible": false}'::jsonb),

    -- Point-to-Point Routes (non-hub)
    (v_copa_id, 'MIA', 'Miami', 'United States', 'BOG', 'Bogota', 'Colombia', 'international', 7, ARRAY['737-800'], 210, 2345, false, '{"codeshare": [], "alliance_eligible": false}'::jsonb),
    (v_copa_id, 'MIA', 'Miami', 'United States', 'GUA', 'Guatemala City', 'Guatemala', 'international', 7, ARRAY['737-800'], 165, 1876, false, '{"codeshare": [], "alliance_eligible": false}'::jsonb)
  ON CONFLICT (airline_id, origin_airport_code, destination_airport_code) DO NOTHING;

END $$;

-- ============================================================================
-- ADDITIONAL API ENDPOINTS: Operations, Ancillaries, Disruption Management
-- ============================================================================

DO $$
DECLARE
  v_copa_pss_id BIGINT;
  v_copa_loyalty_id BIGINT;
BEGIN
  SELECT id INTO v_copa_pss_id
  FROM systems
  WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');

  SELECT id INTO v_copa_loyalty_id
  FROM systems
  WHERE system_name = 'Copa ConnectMiles Platform';

  INSERT INTO api_endpoints (system_id, endpoint_name, endpoint_url, http_method, auth_type, is_ai_accessible, ndc_compliant, rate_limit, documentation_url, metadata) VALUES
    -- Flight Operations APIs
    (
      v_copa_pss_id,
      'Flight Status Lookup',
      'https://api.copaair.com/operations/v2/flights/{flight_number}/status',
      'GET',
      'api_key',
      true,
      false,
      '{"requests_per_minute": 500, "requests_per_day": 250000}'::jsonb,
      'https://developers.copaair.com/operations/flight-status',
      '{
        "supported_features": ["real_time_position", "delay_predictions", "gate_info", "baggage_claim"],
        "response_time_p95_ms": 80,
        "data_freshness_seconds": 30
      }'::jsonb
    ),

    (
      v_copa_pss_id,
      'Schedule Search',
      'https://api.copaair.com/operations/v2/schedules/search',
      'POST',
      'oauth2',
      true,
      false,
      '{"requests_per_minute": 200, "requests_per_day": 100000}'::jsonb,
      'https://developers.copaair.com/operations/schedules',
      '{
        "supported_features": ["route_lookup", "aircraft_type", "codeshare_info", "seasonal_variations"],
        "response_time_p95_ms": 150,
        "lookahead_days": 331
      }'::jsonb
    ),

    -- Ancillary Service APIs
    (
      v_copa_pss_id,
      'Ancillary Service Catalog',
      'https://api.copaair.com/ancillaries/v2/catalog',
      'GET',
      'oauth2',
      true,
      true,
      '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
      'https://developers.copaair.com/ancillaries/catalog',
      '{
        "supported_features": ["seat_selection", "baggage", "meals", "lounge_access", "wifi", "priority_boarding", "fast_track"],
        "response_time_p95_ms": 120,
        "ndc_version": "21.3",
        "dynamic_pricing": true
      }'::jsonb
    ),

    (
      v_copa_pss_id,
      'Ancillary Purchase',
      'https://api.copaair.com/ancillaries/v2/purchase',
      'POST',
      'oauth2',
      true,
      true,
      '{"requests_per_minute": 50, "requests_per_day": 25000}'::jsonb,
      'https://developers.copaair.com/ancillaries/purchase',
      '{
        "supported_features": ["pre_booking", "post_booking", "payment_processing", "instant_confirmation"],
        "response_time_p95_ms": 800,
        "requires_pci_compliance": true
      }'::jsonb
    ),

    -- Disruption Management APIs
    (
      v_copa_pss_id,
      'Rebooking Options',
      'https://api.copaair.com/disruptions/v2/rebooking/options',
      'POST',
      'oauth2',
      true,
      true,
      '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
      'https://developers.copaair.com/disruptions/rebooking',
      '{
        "supported_features": ["schedule_change", "cancellation", "delay", "alternate_routing", "refund_calculation"],
        "response_time_p95_ms": 450,
        "ndc_version": "21.3",
        "ai_recommendation_engine": true
      }'::jsonb
    ),

    (
      v_copa_pss_id,
      'Self-Service Rebooking',
      'https://api.copaair.com/disruptions/v2/rebooking/execute',
      'POST',
      'oauth2',
      true,
      true,
      '{"requests_per_minute": 50, "requests_per_day": 25000}'::jsonb,
      'https://developers.copaair.com/disruptions/execute',
      '{
        "supported_features": ["automatic_rebooking", "same_day_standby", "hotel_vouchers", "meal_vouchers"],
        "response_time_p95_ms": 1200,
        "requires_disruption_code": true
      }'::jsonb
    ),

    -- Check-in APIs
    (
      v_copa_pss_id,
      'Online Check-in',
      'https://api.copaair.com/checkin/v2/start',
      'POST',
      'oauth2',
      true,
      false,
      '{"requests_per_minute": 200, "requests_per_day": 100000}'::jsonb,
      'https://developers.copaair.com/checkin/online',
      '{
        "supported_features": ["mobile_boarding_pass", "seat_selection", "baggage_declaration", "upgrade_offers"],
        "response_time_p95_ms": 650,
        "check_in_window_hours": 24
      }'::jsonb
    ),

    -- Loyalty Enhancement APIs
    (
      v_copa_loyalty_id,
      'Tier Status Projection',
      'https://api.copaair.com/loyalty/v2/tier-projection',
      'POST',
      'oauth2',
      true,
      false,
      '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
      'https://developers.copaair.com/loyalty/tier-projection',
      '{
        "supported_features": ["status_forecast", "miles_needed", "segments_needed", "upgrade_timeline"],
        "response_time_p95_ms": 200,
        "forecasting_period_months": 12
      }'::jsonb
    ),

    (
      v_copa_loyalty_id,
      'Partner Miles Accrual',
      'https://api.copaair.com/loyalty/v2/partners/accrual',
      'POST',
      'oauth2',
      true,
      false,
      '{"requests_per_minute": 150, "requests_per_day": 75000}'::jsonb,
      'https://developers.copaair.com/loyalty/partner-accrual',
      '{
        "supported_features": ["star_alliance_partners", "hotel_partners", "car_rental_partners", "credit_card_partners"],
        "response_time_p95_ms": 350,
        "real_time_posting": true
      }'::jsonb
    )
  ON CONFLICT (system_id, endpoint_name) DO NOTHING;

END $$;

-- ============================================================================
-- PASSENGER PREFERENCE ARCHETYPES (Anonymized Profiles)
-- ============================================================================
-- Sample passenger personas for AI training and testing

CREATE TABLE IF NOT EXISTS passenger_preference_archetypes (
  id BIGSERIAL PRIMARY KEY,
  archetype_name TEXT NOT NULL UNIQUE,
  archetype_description TEXT,
  typical_demographics JSONB DEFAULT '{}'::jsonb,
  travel_patterns JSONB DEFAULT '{}'::jsonb,
  booking_preferences JSONB DEFAULT '{}'::jsonb,
  ancillary_preferences JSONB DEFAULT '{}'::jsonb,
  loyalty_characteristics JSONB DEFAULT '{}'::jsonb,
  ai_interaction_style TEXT CHECK (ai_interaction_style IN ('detailed', 'concise', 'visual', 'voice')),
  price_sensitivity TEXT CHECK (price_sensitivity IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE passenger_preference_archetypes IS 'Anonymized passenger personas for AI training and personalization testing';

INSERT INTO passenger_preference_archetypes (archetype_name, archetype_description, typical_demographics, travel_patterns, booking_preferences, ancillary_preferences, loyalty_characteristics, ai_interaction_style, price_sensitivity) VALUES
  (
    'Business Frequent Flyer',
    'High-frequency business traveler, values time and flexibility over cost',
    '{"age_range": "35-55", "income_bracket": "high", "occupation": "executive_professional"}'::jsonb,
    '{"avg_trips_per_year": 48, "advance_booking_days": 7, "typical_routes": ["PTY-MIA", "PTY-NYC", "PTY-BOG"], "cabin_preference": "business", "travel_days": ["monday", "tuesday", "thursday", "friday"]}'::jsonb,
    '{"change_flexibility": "required", "refundability": "preferred", "booking_channel": "mobile_app", "loyalty_program_usage": "always"}'::jsonb,
    '{"priority_boarding": "always", "lounge_access": "always", "wifi": "always", "seat_preference": "aisle_forward", "checked_bags": 0, "meal_preference": "light_meal"}'::jsonb,
    '{"ffp_tier": "platinum", "miles_balance_avg": 250000, "redemption_preference": "upgrades", "tier_retention_focus": true}'::jsonb,
    'concise',
    'low'
  ),

  (
    'Leisure Family Traveler',
    'Infrequent traveler, typically books vacation packages, price-sensitive',
    '{"age_range": "30-50", "income_bracket": "middle", "occupation": "varied", "family_size": "3-5"}'::jsonb,
    '{"avg_trips_per_year": 2, "advance_booking_days": 90, "typical_routes": ["MIA-PTY", "LAX-PTY", "PTY-CUN"], "cabin_preference": "economy", "travel_days": ["saturday", "sunday"]}'::jsonb,
    '{"change_flexibility": "low", "refundability": "not_preferred", "booking_channel": "website", "loyalty_program_usage": "sometimes"}'::jsonb,
    '{"priority_boarding": "rarely", "lounge_access": "never", "wifi": "sometimes", "seat_preference": "together", "checked_bags": 4, "meal_preference": "standard_meal"}'::jsonb,
    '{"ffp_tier": "base", "miles_balance_avg": 8000, "redemption_preference": "free_tickets", "tier_retention_focus": false}'::jsonb,
    'detailed',
    'very_high'
  ),

  (
    'Digital Nomad',
    'Remote worker, flexible schedule, values connectivity and comfort',
    '{"age_range": "25-40", "income_bracket": "middle_to_high", "occupation": "tech_creative"}'::jsonb,
    '{"avg_trips_per_year": 12, "advance_booking_days": 14, "typical_routes": ["PTY-MDE", "PTY-LIM", "PTY-GYE"], "cabin_preference": "economy_premium", "travel_days": ["any"]}'::jsonb,
    '{"change_flexibility": "preferred", "refundability": "sometimes", "booking_channel": "mobile_app", "loyalty_program_usage": "always"}'::jsonb,
    '{"priority_boarding": "sometimes", "lounge_access": "preferred", "wifi": "always", "seat_preference": "window", "checked_bags": 1, "meal_preference": "vegetarian"}'::jsonb,
    '{"ffp_tier": "gold", "miles_balance_avg": 85000, "redemption_preference": "mixed", "tier_retention_focus": true}'::jsonb,
    'detailed',
    'moderate'
  ),

  (
    'Budget Backpacker',
    'Young traveler exploring multiple destinations, extremely price-sensitive',
    '{"age_range": "18-30", "income_bracket": "low_to_middle", "occupation": "student_entry_level"}'::jsonb,
    '{"avg_trips_per_year": 6, "advance_booking_days": 45, "typical_routes": ["PTY-BOG", "PTY-LIM", "PTY-GUA"], "cabin_preference": "economy_basic", "travel_days": ["any"]}'::jsonb,
    '{"change_flexibility": "none", "refundability": "never", "booking_channel": "price_comparison_sites", "loyalty_program_usage": "rarely"}'::jsonb,
    '{"priority_boarding": "never", "lounge_access": "never", "wifi": "rarely", "seat_preference": "any", "checked_bags": 0, "meal_preference": "bring_own"}'::jsonb,
    '{"ffp_tier": "base", "miles_balance_avg": 2000, "redemption_preference": "free_tickets", "tier_retention_focus": false}'::jsonb,
    'concise',
    'very_high'
  ),

  (
    'Senior Leisure Traveler',
    'Retired, values comfort and assistance, moderate frequency',
    '{"age_range": "60-75", "income_bracket": "middle_to_high", "occupation": "retired"}'::jsonb,
    '{"avg_trips_per_year": 4, "advance_booking_days": 120, "typical_routes": ["MIA-PTY", "PTY-LIM", "PTY-CUN"], "cabin_preference": "business", "travel_days": ["tuesday", "wednesday", "thursday"]}'::jsonb,
    '{"change_flexibility": "preferred", "refundability": "preferred", "booking_channel": "phone", "loyalty_program_usage": "always"}'::jsonb,
    '{"priority_boarding": "always", "lounge_access": "preferred", "wifi": "sometimes", "seat_preference": "aisle", "checked_bags": 2, "meal_preference": "standard_meal", "wheelchair_assistance": "sometimes"}'::jsonb,
    '{"ffp_tier": "silver", "miles_balance_avg": 150000, "redemption_preference": "upgrades", "tier_retention_focus": false}'::jsonb,
    'detailed',
    'low'
  )
ON CONFLICT (archetype_name) DO NOTHING;

-- ============================================================================
-- NDC OFFER TEMPLATES
-- ============================================================================
-- Pre-configured offer structures for AI platforms

CREATE TABLE IF NOT EXISTS ndc_offer_templates (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('flight_only', 'flight_plus_ancillary', 'branded_fare_upsell', 'loyalty_redemption')),
  offer_structure JSONB NOT NULL,
  ai_description TEXT,
  typical_use_cases TEXT[],
  conversion_rate_avg NUMERIC(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(airline_id, template_name)
);

COMMENT ON TABLE ndc_offer_templates IS 'NDC offer templates optimized for AI platform presentation';

DO $$
DECLARE
  v_copa_id BIGINT;
BEGIN
  SELECT id INTO v_copa_id FROM airlines WHERE iata_code = 'CM';

  INSERT INTO ndc_offer_templates (airline_id, template_name, template_type, offer_structure, ai_description, typical_use_cases, conversion_rate_avg) VALUES
    (
      v_copa_id,
      'Economy Classic Standard Offer',
      'flight_only',
      '{
        "offer_id": "CM_ECO_CLASSIC_001",
        "fare_family": "ECON_CLASSIC",
        "base_price_usd": 450,
        "taxes_fees_usd": 85,
        "total_price_usd": 535,
        "included_services": ["2_checked_bags", "standard_seat", "meal", "ife"],
        "change_fee_usd": 150,
        "cancellation_policy": "non_refundable"
      }'::jsonb,
      'Copa Economy Classic: Round-trip fare with two free checked bags, complimentary meal, and standard seat selection. Changes permitted with $150 fee. Not refundable.',
      ARRAY['price_conscious_travelers', 'standard_trips', 'ai_platform_default'],
      0.0850
    ),

    (
      v_copa_id,
      'Business Dreams Premium Bundle',
      'flight_plus_ancillary',
      '{
        "offer_id": "CM_BIZ_BUNDLE_001",
        "fare_family": "BIZ_DREAMS",
        "base_price_usd": 1850,
        "taxes_fees_usd": 185,
        "total_price_usd": 2035,
        "included_services": ["3_checked_bags", "lie_flat_seat", "premium_meal", "wifi", "lounge_access", "priority_everything"],
        "ancillary_bundle": {
          "fast_track_security": true,
          "chauffeur_service": "available_for_purchase",
          "hotel_partner_discount": "20_percent"
        },
        "change_fee_usd": 0,
        "cancellation_policy": "fully_refundable"
      }'::jsonb,
      'Copa Dreams Business Class: Lie-flat seats, Copa Club lounge access, gourmet dining, complimentary WiFi, priority services. Fully flexible with free changes and full refunds. Includes fast-track security.',
      ARRAY['business_travelers', 'premium_leisure', 'ai_platform_luxury'],
      0.0320
    ),

    (
      v_copa_id,
      'Eco Flex Upsell from Basic',
      'branded_fare_upsell',
      '{
        "base_offer": {
          "fare_family": "ECON_BASIC",
          "total_price_usd": 385
        },
        "upsell_offer": {
          "fare_family": "ECON_FLEX",
          "total_price_usd": 585,
          "price_difference_usd": 200
        },
        "upsell_value_proposition": [
          "Free changes (save $150 on typical change fee)",
          "Full refundability",
          "Priority boarding",
          "Preferred seat selection",
          "Same-day standby"
        ],
        "ai_recommendation_triggers": ["business_travel", "uncertain_schedule", "important_trip"]
      }'::jsonb,
      'Upgrade to Economy Flex for $200 more: Get free changes, full refund, priority boarding, and preferred seats. Perfect if your schedule might change.',
      ARRAY['upsell_flexibility', 'business_traveler_conversion', 'ai_smart_recommendation'],
      0.1850
    ),

    (
      v_copa_id,
      'ConnectMiles Award Redemption',
      'loyalty_redemption',
      '{
        "offer_id": "CM_AWARD_001",
        "redemption_type": "miles_only",
        "miles_required": 25000,
        "taxes_fees_usd": 45,
        "total_cost": "25000_miles_plus_45_usd",
        "fare_family_equivalent": "ECON_CLASSIC",
        "availability": "limited",
        "blackout_dates": false,
        "change_fee": "5000_miles_or_75_usd"
      }'::jsonb,
      'Redeem 25,000 ConnectMiles + $45 in taxes for a round-trip Economy Classic ticket. Same benefits as paid ticket including two checked bags and meals. No blackout dates.',
      ARRAY['loyalty_member_engagement', 'miles_redemption', 'ai_loyalty_optimization'],
      0.0650
    )
  ON CONFLICT (airline_id, template_name) DO NOTHING;

END $$;

-- ============================================================================
-- OPERATIONAL METRICS BASELINE (for AI performance comparison)
-- ============================================================================

CREATE TABLE IF NOT EXISTS airline_operational_metrics (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  on_time_performance_pct NUMERIC(5,2),
  cancellation_rate_pct NUMERIC(5,2),
  baggage_mishandling_per_1000 NUMERIC(5,2),
  customer_satisfaction_score NUMERIC(3,2) CHECK (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5),
  nps_score INTEGER CHECK (nps_score >= -100 AND nps_score <= 100),
  ai_booking_percentage NUMERIC(5,2) DEFAULT 0,
  api_uptime_pct NUMERIC(5,2),
  avg_api_response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(airline_id, metric_date)
);

COMMENT ON TABLE airline_operational_metrics IS 'Daily operational KPIs for AI readiness tracking';

DO $$
DECLARE
  v_copa_id BIGINT;
  v_date DATE;
BEGIN
  SELECT id INTO v_copa_id FROM airlines WHERE iata_code = 'CM';

  -- Insert last 90 days of baseline metrics
  FOR v_date IN
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '90 days',
      CURRENT_DATE - INTERVAL '1 day',
      '1 day'::interval
    )::date
  LOOP
    INSERT INTO airline_operational_metrics (
      airline_id,
      metric_date,
      on_time_performance_pct,
      cancellation_rate_pct,
      baggage_mishandling_per_1000,
      customer_satisfaction_score,
      nps_score,
      ai_booking_percentage,
      api_uptime_pct,
      avg_api_response_time_ms
    ) VALUES (
      v_copa_id,
      v_date,
      85.5 + (random() * 8 - 4), -- 81.5% to 89.5% OTP
      1.8 + (random() * 1.5 - 0.75), -- 1.05% to 2.55% cancellations
      3.2 + (random() * 2 - 1), -- 2.2 to 4.2 bags per 1000
      4.1 + (random() * 0.6 - 0.3), -- 3.8 to 4.4 CSAT
      42 + (random() * 16 - 8)::INTEGER, -- 34 to 50 NPS
      0.8 + (random() * 1.2 - 0.6), -- 0.2% to 1.4% AI bookings (growing)
      99.2 + (random() * 0.7 - 0.35), -- 98.85% to 99.55% API uptime
      (320 + (random() * 180 - 90))::INTEGER -- 230ms to 410ms API response
    )
    ON CONFLICT (airline_id, metric_date) DO NOTHING;
  END LOOP;

END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Copa Airlines Routes: 25 routes (hub-and-spoke from PTY)
-- API Endpoints: 9 additional endpoints (operations, ancillaries, disruptions, check-in, loyalty)
-- Passenger Archetypes: 5 personas for AI training
-- NDC Offer Templates: 4 templates for different use cases
-- Operational Metrics: 90 days of baseline data for AI performance tracking
--
-- Total Copa Airlines Data Points:
-- - 25 routes covering North/South/Central America
-- - 16 total API endpoints (7 from migration 006 + 9 new)
-- - 4 fare families with detailed Schema.org markup
-- - 5 FFP tiers with Star Alliance recognition
-- - 3 aircraft configurations
-- - 5 passenger preference archetypes
-- - 4 NDC offer templates
-- - 90 days of operational KPIs
--
-- Next: Migration 009 (Database Views for AI Readiness Analytics)

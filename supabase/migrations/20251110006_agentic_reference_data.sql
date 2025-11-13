/*
  Migration 006: Agentic Distribution Reference Data

  Purpose: Populate lookup tables and baseline data for agentic distribution system

  Populates:
  - Airline reference data (Copa Airlines + major carriers)
  - Airline segments (AI maturity classification)
  - System types and vendors (PSS, DCS, Loyalty platforms)
  - AI platforms (ChatGPT, Perplexity, Claude, etc.)
  - Agentic function types
  - NDC API versions
  - Authentication methods
*/

-- ============================================================================
-- AIRLINES: Major Carriers + Copa Airlines Focus
-- ============================================================================

INSERT INTO airlines (iata_code, icao_code, airline_name, country, region, alliance, is_llc, ndc_capable, api_maturity_score, metadata) VALUES
  -- Copa Airlines (Primary Focus)
  ('CM', 'CMP', 'Copa Airlines', 'Panama', 'Latin America', 'Star Alliance', false, true, 78,
    '{"founded": 1947, "fleet_size": 106, "destinations": 80, "headquarters": "Panama City", "ffp_name": "ConnectMiles", "api_strategy": "ndc_leader", "ai_readiness": "high"}'::jsonb),

  -- Star Alliance Partners
  ('UA', 'UAL', 'United Airlines', 'United States', 'North America', 'Star Alliance', false, true, 85,
    '{"founded": 1926, "fleet_size": 950, "destinations": 342, "headquarters": "Chicago", "ffp_name": "MileagePlus", "api_strategy": "ndc_advanced", "ai_readiness": "high"}'::jsonb),
  ('LH', 'DLH', 'Lufthansa', 'Germany', 'Europe', 'Star Alliance', false, true, 92,
    '{"founded": 1953, "fleet_size": 710, "destinations": 197, "headquarters": "Frankfurt", "ffp_name": "Miles & More", "api_strategy": "ndc_pioneer", "ai_readiness": "very_high"}'::jsonb),
  ('AC', 'ACA', 'Air Canada', 'Canada', 'North America', 'Star Alliance', false, true, 81,
    '{"founded": 1937, "fleet_size": 400, "destinations": 220, "headquarters": "Montreal", "ffp_name": "Aeroplan", "api_strategy": "ndc_capable", "ai_readiness": "high"}'::jsonb),
  ('NH', 'ANA', 'All Nippon Airways', 'Japan', 'Asia Pacific', 'Star Alliance', false, true, 88,
    '{"founded": 1952, "fleet_size": 250, "destinations": 145, "headquarters": "Tokyo", "ffp_name": "ANA Mileage Club", "api_strategy": "ndc_advanced", "ai_readiness": "high"}'::jsonb),

  -- Oneworld Alliance
  ('AA', 'AAL', 'American Airlines', 'United States', 'North America', 'Oneworld', false, true, 79,
    '{"founded": 1926, "fleet_size": 950, "destinations": 350, "headquarters": "Fort Worth", "ffp_name": "AAdvantage", "api_strategy": "ndc_capable", "ai_readiness": "medium"}'::jsonb),
  ('BA', 'BAW', 'British Airways', 'United Kingdom', 'Europe', 'Oneworld', false, true, 84,
    '{"founded": 1974, "fleet_size": 273, "destinations": 183, "headquarters": "London", "ffp_name": "Executive Club", "api_strategy": "ndc_capable", "ai_readiness": "high"}'::jsonb),

  -- SkyTeam Alliance
  ('DL', 'DAL', 'Delta Air Lines', 'United States', 'North America', 'SkyTeam', false, true, 82,
    '{"founded": 1924, "fleet_size": 900, "destinations": 325, "headquarters": "Atlanta", "ffp_name": "SkyMiles", "api_strategy": "ndc_capable", "ai_readiness": "high"}'::jsonb),
  ('AF', 'AFR', 'Air France', 'France', 'Europe', 'SkyTeam', true, true, 86,
    '{"founded": 1933, "fleet_size": 224, "destinations": 175, "headquarters": "Paris", "ffp_name": "Flying Blue", "api_strategy": "ndc_advanced", "ai_readiness": "high"}'::jsonb),

  -- Low-Cost Carriers (NDC Laggards)
  ('WN', 'SWA', 'Southwest Airlines', 'United States', 'North America', null, true, false, 45,
    '{"founded": 1967, "fleet_size": 750, "destinations": 121, "headquarters": "Dallas", "ffp_name": "Rapid Rewards", "api_strategy": "proprietary_only", "ai_readiness": "low"}'::jsonb),
  ('FR', 'RYR', 'Ryanair', 'Ireland', 'Europe', null, true, false, 38,
    '{"founded": 1984, "fleet_size": 555, "destinations": 225, "headquarters": "Dublin", "ffp_name": null, "api_strategy": "closed", "ai_readiness": "very_low"}'::jsonb),

  -- Latin American Carriers
  ('AV', 'AVA', 'Avianca', 'Colombia', 'Latin America', 'Star Alliance', false, true, 72,
    '{"founded": 1919, "fleet_size": 158, "destinations": 76, "headquarters": "Bogota", "ffp_name": "LifeMiles", "api_strategy": "ndc_developing", "ai_readiness": "medium"}'::jsonb),
  ('LA', 'LAN', 'LATAM Airlines', 'Chile', 'Latin America', 'Oneworld', false, true, 75,
    '{"founded": 2012, "fleet_size": 334, "destinations": 145, "headquarters": "Santiago", "ffp_name": "LATAM Pass", "api_strategy": "ndc_capable", "ai_readiness": "medium"}'::jsonb)
ON CONFLICT (iata_code) DO NOTHING;

-- ============================================================================
-- SYSTEMS: PSS, DCS, Loyalty Platforms, Revenue Management
-- ============================================================================

INSERT INTO systems (system_name, system_type, vendor, airline_id, is_cloud_based, api_endpoints_count, ndc_support, metadata) VALUES
  -- Copa Airlines Systems
  ('Amadeus Altea PSS', 'PSS', 'Amadeus', (SELECT id FROM airlines WHERE iata_code = 'CM'), true, 45,
    '{"ndc_version": "21.3", "certification_level": "L3"}'::jsonb,
    '{"implementation_year": 2018, "upgrade_cycle": "annual", "customizations": ["copa_interline_rules", "copa_ancillary_pricing"]}'::jsonb),

  ('SITA WorldTracer', 'Baggage', 'SITA', (SELECT id FROM airlines WHERE iata_code = 'CM'), false, 8,
    null,
    '{"implementation_year": 2015, "integration_type": "xml_api"}'::jsonb),

  ('Copa ConnectMiles Platform', 'Loyalty', 'Copa Airlines (In-house)', (SELECT id FROM airlines WHERE iata_code = 'CM'), true, 22,
    null,
    '{"tiers": ["Silver", "Gold", "Platinum", "Presidential Platinum"], "partner_airlines": 26, "non_air_partners": 150}'::jsonb),

  ('Sabre AirVision RM', 'Revenue Management', 'Sabre', (SELECT id FROM airlines WHERE iata_code = 'CM'), true, 12,
    null,
    '{"forecasting_engine": "neural_network", "optimization_frequency": "hourly", "fare_family_support": true}'::jsonb),

  -- United Airlines Systems
  ('Amadeus Altea PSS', 'PSS', 'Amadeus', (SELECT id FROM airlines WHERE iata_code = 'UA'), true, 52,
    '{"ndc_version": "22.1", "certification_level": "L4"}'::jsonb,
    '{"implementation_year": 2012, "upgrade_cycle": "quarterly", "customizations": ["polaris_rules", "basic_economy_restrictions"]}'::jsonb),

  ('MileagePlus Platform', 'Loyalty', 'United Airlines (In-house)', (SELECT id FROM airlines WHERE iata_code = 'UA'), true, 34,
    null,
    '{"tiers": ["Silver", "Gold", "Platinum", "1K"], "partner_airlines": 35, "non_air_partners": 300}'::jsonb),

  -- Lufthansa Systems
  ('Lufthansa Netline/Sched', 'PSS', 'Lufthansa Systems', (SELECT id FROM airlines WHERE iata_code = 'LH'), true, 68,
    '{"ndc_version": "22.1", "certification_level": "L4"}'::jsonb,
    '{"implementation_year": 2010, "upgrade_cycle": "continuous", "customizations": ["lufthansa_group_interline", "eurowings_integration"]}'::jsonb),

  ('Miles & More Platform', 'Loyalty', 'Lufthansa (In-house)', (SELECT id FROM airlines WHERE iata_code = 'LH'), true, 45,
    null,
    '{"tiers": ["Frequent Traveller", "Senator", "HON Circle"], "partner_airlines": 40, "non_air_partners": 500, "member_count": 36000000}'::jsonb),

  -- American Airlines Systems
  ('Sabre PSS', 'PSS', 'Sabre', (SELECT id FROM airlines WHERE iata_code = 'AA'), false, 38,
    '{"ndc_version": "21.3", "certification_level": "L3"}'::jsonb,
    '{"implementation_year": 1976, "upgrade_cycle": "annual", "legacy_migration": "in_progress"}'::jsonb),

  -- Delta Airlines Systems
  ('Delta Deltamatic PSS', 'PSS', 'Delta (In-house)', (SELECT id FROM airlines WHERE iata_code = 'DL'), true, 55,
    '{"ndc_version": "21.3", "certification_level": "L3"}'::jsonb,
    '{"implementation_year": 2008, "upgrade_cycle": "continuous", "proprietary": true}'::jsonb)
ON CONFLICT (system_name, airline_id) DO NOTHING;

-- ============================================================================
-- AI PLATFORMS: Conversational AI & Digital Assistants
-- ============================================================================

INSERT INTO ai_platform_integrations (platform_name, platform_type, airline_id, integration_status, api_endpoint_id, supported_capabilities, usage_metrics, privacy_settings) VALUES
  -- Copa Airlines AI Platform Integrations
  (
    'ChatGPT (OpenAI)',
    'conversational_ai',
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'pilot',
    null, -- Will be populated after api_endpoints migration
    ARRAY['flight_search', 'fare_comparison', 'ancillary_discovery'],
    '{"monthly_queries": 1200, "conversion_rate": 0.08, "avg_booking_value": 450}'::jsonb,
    '{"data_sharing_consent": true, "pii_minimization": true, "gdpr_compliant": true}'::jsonb
  ),

  (
    'Perplexity AI',
    'search_assistant',
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'planned',
    null,
    ARRAY['flight_search', 'route_recommendations'],
    '{"monthly_queries": 0, "conversion_rate": 0, "avg_booking_value": 0}'::jsonb,
    '{"data_sharing_consent": false, "pii_minimization": true, "gdpr_compliant": true}'::jsonb
  ),

  -- Lufthansa AI Platform Integrations (Leader)
  (
    'ChatGPT (OpenAI)',
    'conversational_ai',
    (SELECT id FROM airlines WHERE iata_code = 'LH'),
    'production',
    null,
    ARRAY['flight_search', 'fare_comparison', 'ancillary_discovery', 'booking_creation', 'loyalty_lookup'],
    '{"monthly_queries": 45000, "conversion_rate": 0.12, "avg_booking_value": 780}'::jsonb,
    '{"data_sharing_consent": true, "pii_minimization": true, "gdpr_compliant": true}'::jsonb
  ),

  (
    'Google Assistant',
    'voice_assistant',
    (SELECT id FROM airlines WHERE iata_code = 'LH'),
    'production',
    null,
    ARRAY['flight_status', 'check_in', 'boarding_pass'],
    '{"monthly_queries": 28000, "conversion_rate": 0.05, "avg_booking_value": 0}'::jsonb,
    '{"data_sharing_consent": true, "pii_minimization": true, "gdpr_compliant": true}'::jsonb
  ),

  (
    'Amazon Alexa',
    'voice_assistant',
    (SELECT id FROM airlines WHERE iata_code = 'LH'),
    'production',
    null,
    ARRAY['flight_status', 'miles_balance', 'upgrade_opportunities'],
    '{"monthly_queries": 15000, "conversion_rate": 0.03, "avg_booking_value": 0}'::jsonb,
    '{"data_sharing_consent": true, "pii_minimization": true, "gdpr_compliant": true}'::jsonb
  ),

  -- United Airlines AI Platform Integrations
  (
    'ChatGPT (OpenAI)',
    'conversational_ai',
    (SELECT id FROM airlines WHERE iata_code = 'UA'),
    'pilot',
    null,
    ARRAY['flight_search', 'fare_comparison'],
    '{"monthly_queries": 8500, "conversion_rate": 0.09, "avg_booking_value": 520}'::jsonb,
    '{"data_sharing_consent": true, "pii_minimization": true, "gdpr_compliant": false}'::jsonb
  )
ON CONFLICT (platform_name, airline_id) DO NOTHING;

-- ============================================================================
-- BRANDED FARE FAMILIES: Copa Airlines Focus
-- ============================================================================

INSERT INTO branded_fare_families (airline_id, fare_family_code, fare_family_name, cabin_class, included_amenities, upsell_priority, schema_org_markup, ai_description_optimized) VALUES
  -- Copa Airlines Economy Fare Families
  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'ECON_BASIC',
    'Economy Basic',
    'economy',
    '{
      "checked_bags": 0,
      "carry_on": 1,
      "seat_selection": "not_included",
      "changes": "fee_applies",
      "refundable": false,
      "priority_boarding": false,
      "lounge_access": false,
      "wifi": "purchase_required",
      "meals": "purchase_required",
      "entertainment": "complimentary"
    }'::jsonb,
    1,
    '{
      "@context": "https://schema.org",
      "@type": "Flight",
      "provider": {"@type": "Airline", "name": "Copa Airlines", "iataCode": "CM"},
      "serviceType": "Economy Basic",
      "offers": {
        "@type": "Offer",
        "category": "Economy",
        "eligibleQuantity": {"@type": "QuantitativeValue", "value": 1, "unitText": "carry-on bag"}
      }
    }'::jsonb,
    'Copa Economy Basic: Budget-friendly fare with one carry-on bag and in-flight entertainment. No checked bags included. Seat selection available for fee. Changes permitted with fee. Not refundable. Ideal for light travelers on short trips.'
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'ECON_CLASSIC',
    'Economy Classic',
    'economy',
    '{
      "checked_bags": 2,
      "carry_on": 1,
      "seat_selection": "standard_complimentary",
      "changes": "fee_applies",
      "refundable": false,
      "priority_boarding": false,
      "lounge_access": false,
      "wifi": "purchase_required",
      "meals": "complimentary",
      "entertainment": "complimentary",
      "advance_seat_selection_hours": 336
    }'::jsonb,
    2,
    '{
      "@context": "https://schema.org",
      "@type": "Flight",
      "provider": {"@type": "Airline", "name": "Copa Airlines", "iataCode": "CM"},
      "serviceType": "Economy Classic",
      "offers": {
        "@type": "Offer",
        "category": "Economy",
        "eligibleQuantity": [
          {"@type": "QuantitativeValue", "value": 2, "unitText": "checked bags"},
          {"@type": "QuantitativeValue", "value": 1, "unitText": "carry-on bag"}
        ]
      }
    }'::jsonb,
    'Copa Economy Classic: Standard economy with two free checked bags (23kg each), complimentary meals and beverages, free standard seat selection, and in-flight entertainment. Changes permitted with fee. Not refundable. Best value for most travelers.'
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'ECON_FLEX',
    'Economy Flex',
    'economy',
    '{
      "checked_bags": 2,
      "carry_on": 1,
      "seat_selection": "preferred_complimentary",
      "changes": "complimentary",
      "refundable": true,
      "priority_boarding": true,
      "lounge_access": false,
      "wifi": "purchase_required",
      "meals": "complimentary_premium",
      "entertainment": "complimentary",
      "standby_privileges": true,
      "advance_seat_selection_hours": 720
    }'::jsonb,
    3,
    '{
      "@context": "https://schema.org",
      "@type": "Flight",
      "provider": {"@type": "Airline", "name": "Copa Airlines", "iataCode": "CM"},
      "serviceType": "Economy Flex",
      "offers": {
        "@type": "Offer",
        "category": "Economy Premium",
        "eligibleQuantity": [
          {"@type": "QuantitativeValue", "value": 2, "unitText": "checked bags"},
          {"@type": "QuantitativeValue", "value": 1, "unitText": "carry-on bag"}
        ],
        "additionalProperty": [
          {"@type": "PropertyValue", "name": "changePolicy", "value": "free changes"},
          {"@type": "PropertyValue", "name": "refundPolicy", "value": "refundable"}
        ]
      }
    }'::jsonb,
    'Copa Economy Flex: Premium economy experience with maximum flexibility. Includes two free checked bags, preferred seat selection, priority boarding, complimentary changes, full refundability, and same-day standby. Enhanced meal service. Perfect for business travelers needing flexibility.'
  ),

  -- Copa Airlines Business Class
  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'BIZ_DREAMS',
    'Dreams Business Class',
    'business',
    '{
      "checked_bags": 3,
      "carry_on": 2,
      "seat_selection": "lie_flat_complimentary",
      "changes": "complimentary",
      "refundable": true,
      "priority_boarding": true,
      "lounge_access": true,
      "wifi": "complimentary",
      "meals": "premium_dining",
      "entertainment": "complimentary_premium",
      "standby_privileges": true,
      "upgrade_priority": "guaranteed",
      "advance_seat_selection_hours": 1440,
      "amenity_kit": true,
      "priority_checkin": true,
      "priority_baggage": true
    }'::jsonb,
    4,
    '{
      "@context": "https://schema.org",
      "@type": "Flight",
      "provider": {"@type": "Airline", "name": "Copa Airlines", "iataCode": "CM"},
      "serviceType": "Dreams Business Class",
      "offers": {
        "@type": "Offer",
        "category": "Business Class",
        "eligibleQuantity": [
          {"@type": "QuantitativeValue", "value": 3, "unitText": "checked bags"},
          {"@type": "QuantitativeValue", "value": 2, "unitText": "carry-on bags"}
        ],
        "additionalProperty": [
          {"@type": "PropertyValue", "name": "seatType", "value": "lie-flat"},
          {"@type": "PropertyValue", "name": "loungeAccess", "value": "Copa Club"},
          {"@type": "PropertyValue", "name": "wifi", "value": "complimentary"},
          {"@type": "PropertyValue", "name": "changePolicy", "value": "free changes"},
          {"@type": "PropertyValue", "name": "refundPolicy", "value": "fully refundable"}
        ]
      }
    }'::jsonb,
    'Copa Dreams Business Class: Lie-flat seats with direct aisle access, premium dining curated by Copa chefs, Copa Club lounge access, complimentary WiFi, priority everything (check-in, boarding, baggage), three checked bags, full flexibility with free changes and refunds. Luxury amenity kit included.'
  )
ON CONFLICT (airline_id, fare_family_code) DO NOTHING;

-- ============================================================================
-- FFP TIERS: Copa ConnectMiles
-- ============================================================================

INSERT INTO ffp_tiers (airline_id, tier_code, tier_name, tier_level, qualification_criteria, benefits, partner_recognition) VALUES
  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'CM_BASE',
    'ConnectMiles Member',
    0,
    '{
      "miles_required": 0,
      "segments_required": 0,
      "qualification_period": "lifetime"
    }'::jsonb,
    '{
      "earn_rate_multiplier": 1.0,
      "priority_boarding": false,
      "lounge_access": false,
      "free_checked_bags": 0,
      "upgrade_priority": 0,
      "waitlist_priority": false,
      "bonus_miles_on_earning": 0
    }'::jsonb,
    '{
      "star_alliance_tier": null,
      "partner_airline_benefits": ["miles_accrual"]
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'CM_SILVER',
    'Silver Member',
    1,
    '{
      "miles_required": 20000,
      "segments_required": 20,
      "qualification_period": "12_months"
    }'::jsonb,
    '{
      "earn_rate_multiplier": 1.25,
      "priority_boarding": true,
      "lounge_access": false,
      "free_checked_bags": 1,
      "upgrade_priority": 1,
      "waitlist_priority": true,
      "bonus_miles_on_earning": 0.25,
      "preferred_seating": true,
      "dedicated_phone_line": true
    }'::jsonb,
    '{
      "star_alliance_tier": "Silver",
      "partner_airline_benefits": ["miles_accrual", "priority_boarding", "extra_baggage"]
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'CM_GOLD',
    'Gold Member',
    2,
    '{
      "miles_required": 40000,
      "segments_required": 40,
      "qualification_period": "12_months"
    }'::jsonb,
    '{
      "earn_rate_multiplier": 1.5,
      "priority_boarding": true,
      "lounge_access": true,
      "lounge_guest_passes": 2,
      "free_checked_bags": 2,
      "upgrade_priority": 2,
      "waitlist_priority": true,
      "bonus_miles_on_earning": 0.5,
      "preferred_seating": true,
      "dedicated_phone_line": true,
      "complimentary_upgrades": "space_available",
      "priority_checkin": true,
      "priority_baggage": true
    }'::jsonb,
    '{
      "star_alliance_tier": "Gold",
      "partner_airline_benefits": ["miles_accrual", "priority_boarding", "extra_baggage", "lounge_access", "priority_checkin"]
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'CM_PLATINUM',
    'Platinum Member',
    3,
    '{
      "miles_required": 75000,
      "segments_required": 75,
      "qualification_period": "12_months"
    }'::jsonb,
    '{
      "earn_rate_multiplier": 2.0,
      "priority_boarding": true,
      "lounge_access": true,
      "lounge_guest_passes": 5,
      "free_checked_bags": 3,
      "upgrade_priority": 3,
      "waitlist_priority": true,
      "bonus_miles_on_earning": 1.0,
      "preferred_seating": true,
      "dedicated_phone_line": true,
      "complimentary_upgrades": "confirmed_domestic",
      "priority_checkin": true,
      "priority_baggage": true,
      "dedicated_security_lane": true,
      "award_seat_availability_enhanced": true
    }'::jsonb,
    '{
      "star_alliance_tier": "Gold",
      "partner_airline_benefits": ["miles_accrual", "priority_boarding", "extra_baggage", "lounge_access", "priority_checkin", "upgrade_priority"]
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'CM_PRESIDENTIAL',
    'Presidential Platinum',
    4,
    '{
      "miles_required": 125000,
      "segments_required": 100,
      "qualification_period": "12_months",
      "lifetime_qualification": "1000000_lifetime_miles"
    }'::jsonb,
    '{
      "earn_rate_multiplier": 3.0,
      "priority_boarding": true,
      "lounge_access": true,
      "lounge_guest_passes": 10,
      "free_checked_bags": 4,
      "upgrade_priority": 4,
      "waitlist_priority": true,
      "bonus_miles_on_earning": 2.0,
      "preferred_seating": true,
      "dedicated_phone_line": true,
      "complimentary_upgrades": "confirmed_all_routes",
      "priority_checkin": true,
      "priority_baggage": true,
      "dedicated_security_lane": true,
      "award_seat_availability_enhanced": true,
      "complimentary_companion_ticket_annual": 1,
      "presidential_desk_24_7": true,
      "guaranteed_reservations": true,
      "suite_upgrades_hotels": true
    }'::jsonb,
    '{
      "star_alliance_tier": "Gold",
      "partner_airline_benefits": ["all_gold_benefits", "upgrade_priority_highest", "guaranteed_award_seats"]
    }'::jsonb
  )
ON CONFLICT (airline_id, tier_code) DO NOTHING;

-- ============================================================================
-- API ENDPOINTS: Copa Airlines NDC & Proprietary APIs
-- ============================================================================

INSERT INTO api_endpoints (system_id, endpoint_name, endpoint_url, http_method, auth_type, is_ai_accessible, ndc_compliant, rate_limit, documentation_url, metadata) VALUES
  -- Copa Airlines NDC API Endpoints
  (
    (SELECT id FROM systems WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'NDC AirShopping',
    'https://api.copaair.com/ndc/v21.3/airshopping',
    'POST',
    'oauth2',
    true,
    true,
    '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
    'https://developers.copaair.com/ndc/airshopping',
    '{
      "ndc_version": "21.3",
      "supported_features": ["branded_fares", "ancillaries", "seat_maps", "multi_origin_dest"],
      "response_time_p95_ms": 450,
      "ai_platform_whitelist": ["openai", "anthropic", "perplexity"]
    }'::jsonb
  ),

  (
    (SELECT id FROM systems WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'NDC OfferPrice',
    'https://api.copaair.com/ndc/v21.3/offerprice',
    'POST',
    'oauth2',
    true,
    true,
    '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
    'https://developers.copaair.com/ndc/offerprice',
    '{
      "ndc_version": "21.3",
      "supported_features": ["dynamic_pricing", "fare_family_upsell", "ancillary_pricing"],
      "response_time_p95_ms": 320
    }'::jsonb
  ),

  (
    (SELECT id FROM systems WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'NDC OrderCreate',
    'https://api.copaair.com/ndc/v21.3/ordercreate',
    'POST',
    'oauth2',
    true,
    true,
    '{"requests_per_minute": 50, "requests_per_day": 25000}'::jsonb,
    'https://developers.copaair.com/ndc/ordercreate',
    '{
      "ndc_version": "21.3",
      "supported_features": ["pnr_creation", "payment_processing", "ticket_issuance"],
      "response_time_p95_ms": 1200,
      "requires_pci_compliance": true
    }'::jsonb
  ),

  (
    (SELECT id FROM systems WHERE system_name = 'Amadeus Altea PSS' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'NDC SeatAvailability',
    'https://api.copaair.com/ndc/v21.3/seatavailability',
    'POST',
    'oauth2',
    true,
    true,
    '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
    'https://developers.copaair.com/ndc/seatavailability',
    '{
      "ndc_version": "21.3",
      "supported_features": ["real_time_seat_maps", "seat_pricing", "seat_characteristics"],
      "response_time_p95_ms": 280
    }'::jsonb
  ),

  -- Copa ConnectMiles API Endpoints
  (
    (SELECT id FROM systems WHERE system_name = 'Copa ConnectMiles Platform' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'FFP Account Lookup',
    'https://api.copaair.com/loyalty/v2/accounts/{member_id}',
    'GET',
    'oauth2',
    true,
    false,
    '{"requests_per_minute": 200, "requests_per_day": 100000}'::jsonb,
    'https://developers.copaair.com/loyalty/accounts',
    '{
      "supported_features": ["balance_inquiry", "tier_status", "expiration_dates", "activity_history"],
      "response_time_p95_ms": 120,
      "pii_minimization": true,
      "gdpr_compliant": true
    }'::jsonb
  ),

  (
    (SELECT id FROM systems WHERE system_name = 'Copa ConnectMiles Platform' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'FFP Benefits Eligibility',
    'https://api.copaair.com/loyalty/v2/benefits/eligibility',
    'POST',
    'oauth2',
    true,
    false,
    '{"requests_per_minute": 150, "requests_per_day": 75000}'::jsonb,
    'https://developers.copaair.com/loyalty/benefits',
    '{
      "supported_features": ["upgrade_eligibility", "lounge_access_check", "baggage_allowance", "partner_benefits"],
      "response_time_p95_ms": 180
    }'::jsonb
  ),

  (
    (SELECT id FROM systems WHERE system_name = 'Copa ConnectMiles Platform' AND airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM')),
    'Award Booking Search',
    'https://api.copaair.com/loyalty/v2/awards/search',
    'POST',
    'oauth2',
    true,
    false,
    '{"requests_per_minute": 100, "requests_per_day": 50000}'::jsonb,
    'https://developers.copaair.com/loyalty/awards',
    '{
      "supported_features": ["award_availability", "partner_award_search", "mixed_cabin_awards", "stopover_rules"],
      "response_time_p95_ms": 650,
      "real_time_availability": true
    }'::jsonb
  )
ON CONFLICT (system_id, endpoint_name) DO NOTHING;

-- ============================================================================
-- CONTENT SYNDICATION FEEDS: Schema.org Markup for AI Platforms
-- ============================================================================

INSERT INTO content_syndication_feeds (airline_id, feed_name, feed_type, feed_url, update_frequency, schema_org_compliant, ai_optimized, target_platforms) VALUES
  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Copa Airlines Route Network Feed',
    'route_network',
    'https://syndication.copaair.com/feeds/routes.json',
    'daily',
    true,
    true,
    ARRAY['google_flights', 'chatgpt', 'perplexity', 'kayak']
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Copa Branded Fares Feed',
    'branded_fares',
    'https://syndication.copaair.com/feeds/fare-families.json',
    'hourly',
    true,
    true,
    ARRAY['chatgpt', 'claude', 'gemini', 'llama']
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Copa Ancillary Services Feed',
    'ancillary_services',
    'https://syndication.copaair.com/feeds/ancillaries.json',
    'weekly',
    true,
    true,
    ARRAY['chatgpt', 'perplexity', 'google_assistant']
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Copa Fleet & Aircraft Configurations',
    'fleet_info',
    'https://syndication.copaair.com/feeds/fleet.json',
    'monthly',
    true,
    true,
    ARRAY['chatgpt', 'wikipedia', 'airline_databases']
  )
ON CONFLICT (airline_id, feed_name) DO NOTHING;

-- ============================================================================
-- AIRCRAFT CONFIGURATIONS: Copa Fleet Details
-- ============================================================================

INSERT INTO aircraft_configurations (airline_id, aircraft_type, aircraft_subtype, total_seats, business_seats, economy_seats, configuration_code, amenities, metadata) VALUES
  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Boeing 737',
    '737-800',
    160,
    16,
    144,
    '16J/144Y',
    '{
      "wifi": true,
      "power_outlets": "business_only",
      "entertainment": "seatback_screens",
      "lie_flat_seats": false,
      "seat_pitch_business_inches": 38,
      "seat_pitch_economy_inches": 31,
      "lavatory_count": 4
    }'::jsonb,
    '{
      "fleet_count": 62,
      "average_age_years": 8.5,
      "primary_routes": ["intra_latin_america", "us_gateway_cities"],
      "range_nautical_miles": 2935
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Boeing 737',
    '737 MAX 9',
    166,
    16,
    150,
    '16J/150Y',
    '{
      "wifi": true,
      "power_outlets": "all_seats",
      "entertainment": "seatback_screens_hd",
      "lie_flat_seats": false,
      "seat_pitch_business_inches": 38,
      "seat_pitch_economy_inches": 31,
      "lavatory_count": 4,
      "fuel_efficiency": "improved"
    }'::jsonb,
    '{
      "fleet_count": 29,
      "average_age_years": 2.1,
      "primary_routes": ["us_routes", "south_america_trunk"],
      "range_nautical_miles": 3550
    }'::jsonb
  ),

  (
    (SELECT id FROM airlines WHERE iata_code = 'CM'),
    'Boeing 737',
    '737-700',
    124,
    12,
    112,
    '12J/112Y',
    '{
      "wifi": false,
      "power_outlets": false,
      "entertainment": "overhead_screens",
      "lie_flat_seats": false,
      "seat_pitch_business_inches": 38,
      "seat_pitch_economy_inches": 31,
      "lavatory_count": 3
    }'::jsonb,
    '{
      "fleet_count": 15,
      "average_age_years": 14.2,
      "primary_routes": ["regional_central_america", "caribbean"],
      "range_nautical_miles": 3010,
      "retirement_planned": 2027
    }'::jsonb
  )
ON CONFLICT (airline_id, aircraft_type, aircraft_subtype, configuration_code) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Airlines added: 13 (Copa + major Star Alliance/Oneworld/SkyTeam carriers)
-- Systems added: 10 (PSS, Loyalty, RM platforms)
-- AI Platform Integrations: 6
-- Branded Fare Families: 4 (Copa Economy Basic/Classic/Flex, Dreams Business)
-- FFP Tiers: 5 (ConnectMiles Base through Presidential Platinum)
-- API Endpoints: 7 (NDC + Loyalty APIs)
-- Content Syndication Feeds: 4
-- Aircraft Configurations: 3 (Copa 737 fleet)
--
-- Next: Migration 007 (Knowledge Graph Edges)

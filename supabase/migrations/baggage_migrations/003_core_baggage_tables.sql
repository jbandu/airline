/*
  Migration 003: Core Baggage Tables

  Purpose: Create comprehensive data model for baggage operations

  Tables Created (12 tables):
  1. baggage_items - Individual bag records with lifecycle tracking
  2. baggage_scan_events - All scan events across journey
  3. baggage_exceptions - Delayed/lost/damaged incidents
  4. baggage_connections - Transfer connection tracking
  5. baggage_compensation_rules - Jurisdiction-specific rules
  6. baggage_claims - Compensation claims processing
  7. interline_bag_messages - SITA Type B message log
  8. baggage_performance_metrics - Daily operational KPIs
  9. lost_found_inventory - Unclaimed items catalog
  10. baggage_special_handling - Special service requests
  11. baggage_routing_tags - Multi-leg routing information
  12. baggage_delivery_attempts - Last-mile delivery tracking

  Dependencies: Migration 001 (domains), Migration 002 (agent categories)
*/

-- ============================================================================
-- TABLE 1: baggage_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Bag identification
  bag_tag_number TEXT NOT NULL UNIQUE,
  license_plate_number TEXT, -- IATA Resolution 740 format (airline code + 10 digits)

  -- Passenger information
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_ffp_number TEXT,
  passenger_tier TEXT,
  passenger_contact JSONB, -- {email, phone, preferred_language}

  -- Flight information
  airline_code TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  final_destination_airport TEXT, -- For multi-leg journeys
  booking_class TEXT,

  -- Bag characteristics
  weight_kg NUMERIC(5,2),
  dimensions_cm JSONB, -- {length, width, height}
  bag_type TEXT CHECK (bag_type IN (
    'checked', 'gate_checked', 'planeside', 'transfer', 'rush', 'cabin_bag_checked'
  )),
  bag_description TEXT, -- Color, brand, distinctive features
  bag_value_declared_usd NUMERIC(10,2),

  -- Special handling
  special_handling_codes TEXT[], -- IATA codes: HEA (Heavy), LHE (Live Animals), FRA (Fragile), etc.
  priority_level INTEGER DEFAULT 0, -- 0=normal, 1=elite, 2=urgent, 3=rush
  is_interline BOOLEAN DEFAULT FALSE,
  operating_carrier TEXT, -- If different from marketing carrier

  -- Current status
  current_status TEXT CHECK (current_status IN (
    'checked_in', 'tsa_screened', 'in_makeup', 'loaded', 'in_flight',
    'arrived', 'at_claim', 'claimed', 'short_checked', 'delayed',
    'lost', 'found', 'damaged', 'offloaded', 'rerouted'
  )) NOT NULL DEFAULT 'checked_in',
  current_location TEXT, -- Airport/facility code
  last_scan_time TIMESTAMPTZ,
  last_scan_location TEXT,
  last_scan_type TEXT,

  -- Risk assessment
  connection_risk_score NUMERIC(3,2) CHECK (connection_risk_score >= 0 AND connection_risk_score <= 1),
  mishandling_probability NUMERIC(3,2) CHECK (mishandling_probability >= 0 AND mishandling_probability <= 1),
  risk_factors JSONB, -- {tight_connection, terminal_change, weather, etc.}
  predicted_claim_time TIMESTAMPTZ,

  -- AI agent tracking
  created_by_agent TEXT,
  last_updated_by_agent TEXT,
  agent_interventions JSONB, -- [{timestamp, agent, action, reason}]

  -- Timestamps
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  loaded_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_bag_tag_format CHECK (
    bag_tag_number ~ '^[0-9]{10}$' OR
    bag_tag_number ~ '^[A-Z]{2}[0-9]{10}$' -- Allow airline prefix
  ),
  CONSTRAINT valid_weight CHECK (weight_kg IS NULL OR (weight_kg >= 0 AND weight_kg <= 50)),
  CONSTRAINT logical_timestamps CHECK (
    (arrived_at IS NULL OR arrived_at >= loaded_at) AND
    (claimed_at IS NULL OR claimed_at >= arrived_at)
  )
);

-- Indexes for baggage_items
CREATE INDEX IF NOT EXISTS idx_baggage_items_bag_tag ON baggage_items(bag_tag_number);
CREATE INDEX IF NOT EXISTS idx_baggage_items_pnr ON baggage_items(passenger_pnr);
CREATE INDEX IF NOT EXISTS idx_baggage_items_flight ON baggage_items(airline_code, flight_number, flight_date);
CREATE INDEX IF NOT EXISTS idx_baggage_items_status ON baggage_items(current_status) WHERE current_status NOT IN ('claimed');
CREATE INDEX IF NOT EXISTS idx_baggage_items_risk ON baggage_items(connection_risk_score) WHERE connection_risk_score > 0.70;
CREATE INDEX IF NOT EXISTS idx_baggage_items_ffp ON baggage_items(passenger_ffp_number) WHERE passenger_ffp_number IS NOT NULL;

-- Full-text search on bag description
CREATE INDEX IF NOT EXISTS idx_baggage_items_description_search ON baggage_items USING gin(to_tsvector('english', COALESCE(bag_description, '')));

COMMENT ON TABLE baggage_items IS 'Individual checked bag records with full lifecycle tracking from check-in to claim';
COMMENT ON COLUMN baggage_items.bag_tag_number IS '10-digit IATA standard bag tag number (may include airline prefix)';
COMMENT ON COLUMN baggage_items.connection_risk_score IS 'ML-predicted connection risk (0-1 scale, >0.7 = high risk)';
COMMENT ON COLUMN baggage_items.special_handling_codes IS 'IATA Resolution 780 special service codes';

-- ============================================================================
-- TABLE 2: baggage_scan_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_scan_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Bag reference
  bag_tag_number TEXT NOT NULL,
  baggage_item_id BIGINT REFERENCES baggage_items(id) ON DELETE CASCADE,

  -- Scan details
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scan_type TEXT NOT NULL CHECK (scan_type IN (
    'CHECK_IN', 'TSA_SCREENING', 'MAKEUP', 'LOADED_AIRCRAFT',
    'OFFLOADED_AIRCRAFT', 'TRANSFER_OUT', 'TRANSFER_IN',
    'ARRIVAL', 'CLAIM', 'EXCEPTION', 'FORWARDED', 'DELIVERED',
    'SECURITY_CLEARED', 'SORTATION', 'CONTAINER_LOADED'
  )),
  scan_quality TEXT CHECK (scan_quality IN ('good', 'partial', 'manual', 'error')) DEFAULT 'good',

  -- Location information
  location_code TEXT NOT NULL, -- Airport/facility IATA code
  location_name TEXT,
  location_type TEXT CHECK (location_type IN (
    'check_in_desk', 'tsa_checkpoint', 'makeup_area', 'aircraft',
    'sortation', 'claim_belt', 'transfer_area', 'storage', 'delivery_truck'
  )),
  terminal TEXT,
  gate TEXT,

  -- Operational details
  handler_code TEXT, -- Ground handler or airline code
  handler_name TEXT,
  flight_number TEXT,
  device_id TEXT, -- Scanner/RFID reader ID
  device_type TEXT, -- handheld, belt_scanner, rfid_gate, manual
  operator_id TEXT,

  -- Coordinates (for mobile scans)
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),

  -- Integration
  processed_by_agent TEXT,
  sita_message_ref TEXT, -- Reference to SITA message if applicable
  worldtracer_ref TEXT,

  -- Additional data
  notes TEXT,
  exception_flag BOOLEAN DEFAULT FALSE,
  exception_reason TEXT,

  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for baggage_scan_events
CREATE INDEX IF NOT EXISTS idx_scan_events_bag_tag ON baggage_scan_events(bag_tag_number, scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_item ON baggage_scan_events(baggage_item_id, scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_location ON baggage_scan_events(location_code, scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_type ON baggage_scan_events(scan_type, scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_exception ON baggage_scan_events(exception_flag) WHERE exception_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_scan_events_timestamp ON baggage_scan_events(scan_timestamp DESC);

COMMENT ON TABLE baggage_scan_events IS 'All bag scan events across the journey providing complete tracking history';
COMMENT ON COLUMN baggage_scan_events.scan_type IS 'Standardized scan point types per IATA Resolution 753';
COMMENT ON COLUMN baggage_scan_events.exception_flag IS 'TRUE if scan indicates an exception condition';

-- ============================================================================
-- TABLE 3: baggage_exceptions
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_exceptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Exception identification
  exception_number TEXT NOT NULL UNIQUE, -- Internal ref or WorldTracer PIR number
  bag_tag_number TEXT,
  baggage_item_id BIGINT REFERENCES baggage_items(id) ON DELETE SET NULL,

  -- Exception classification
  exception_type TEXT NOT NULL CHECK (exception_type IN (
    'DELAYED', 'LOST', 'DAMAGED', 'PILFERED', 'MISDIRECTED',
    'OFFLOADED', 'RUSH_TAG_MISSED', 'INTERLINE_MISCONNECTION',
    'SHORT_CHECKED', 'OVERSIZED_REFUSED', 'HAZMAT_VIOLATION'
  )),
  exception_subtype TEXT, -- More specific categorization
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',

  -- Flight & passenger info
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_tier TEXT,
  passenger_contact JSONB NOT NULL, -- {email, phone, address, preferred_language}
  delivery_address JSONB, -- {street, city, state, postal_code, country, special_instructions}

  -- Exception details
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reported_by TEXT, -- agent, passenger, partner airline, system
  detection_method TEXT, -- scan_gap, passenger_report, system_alert, partner_notification
  last_known_location TEXT,
  last_scan_time TIMESTAMPTZ,
  incident_location TEXT,
  incident_description TEXT,

  -- Bag description & identification
  bag_description TEXT,
  bag_contents_declared TEXT,
  distinctive_features TEXT[],
  bag_images TEXT[], -- URLs to cloud storage
  bag_weight_kg NUMERIC(5,2),
  bag_color TEXT,
  bag_brand TEXT,
  claim_value_usd NUMERIC(10,2),

  -- Status & resolution
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN', 'INVESTIGATING', 'LOCATED', 'IN_TRANSIT_TO_PASSENGER',
    'DELIVERED', 'CLOSED', 'CLAIM_FILED', 'SETTLED', 'ABANDONED'
  )),
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  assigned_to TEXT, -- Agent or team responsible
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_time_hours NUMERIC(10,2),
  resolution_method TEXT, -- found_at_airport, delivered_to_passenger, compensated, etc.

  -- Root cause analysis
  root_cause TEXT,
  contributing_factors JSONB, -- {tight_connection, weather, equipment_failure, etc.}
  preventable BOOLEAN,

  -- Compensation
  compensation_status TEXT CHECK (compensation_status IN (
    'NOT_APPLICABLE', 'PENDING', 'INTERIM_APPROVED', 'FULLY_SETTLED', 'DENIED'
  )),
  interim_expenses_approved_usd NUMERIC(10,2),
  final_settlement_usd NUMERIC(10,2),
  compensation_notes TEXT,

  -- Integration
  worldtracer_pir TEXT,
  worldtracer_status TEXT,
  partner_airline_ref TEXT,
  partner_airline_code TEXT,
  sita_message_refs TEXT[], -- Related SITA messages

  -- AI agent involvement
  detected_by_agent TEXT,
  managed_by_agents JSONB, -- [{agent, actions, timestamp}]
  ai_recommended_actions JSONB,

  -- Communication log
  passenger_notifications JSONB, -- [{timestamp, channel, content, status}]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT resolution_time_calc CHECK (
    resolution_time_hours IS NULL OR
    (resolved_at IS NOT NULL AND resolution_time_hours = EXTRACT(EPOCH FROM (resolved_at - reported_at))/3600)
  )
);

-- Indexes for baggage_exceptions
CREATE INDEX IF NOT EXISTS idx_exceptions_bag_tag ON baggage_exceptions(bag_tag_number);
CREATE INDEX IF NOT EXISTS idx_exceptions_number ON baggage_exceptions(exception_number);
CREATE INDEX IF NOT EXISTS idx_exceptions_type ON baggage_exceptions(exception_type, status);
CREATE INDEX IF NOT EXISTS idx_exceptions_status ON baggage_exceptions(status) WHERE status NOT IN ('CLOSED', 'SETTLED');
CREATE INDEX IF NOT EXISTS idx_exceptions_priority ON baggage_exceptions(priority, reported_at DESC) WHERE status NOT IN ('CLOSED', 'SETTLED');
CREATE INDEX IF NOT EXISTS idx_exceptions_pnr ON baggage_exceptions(passenger_pnr);
CREATE INDEX IF NOT EXISTS idx_exceptions_worldtracer ON baggage_exceptions(worldtracer_pir) WHERE worldtracer_pir IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exceptions_reported ON baggage_exceptions(reported_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_exceptions_description_search ON baggage_exceptions USING gin(
  to_tsvector('english', COALESCE(bag_description, '') || ' ' || COALESCE(distinctive_features::text, '') || ' ' || COALESCE(incident_description, ''))
);

COMMENT ON TABLE baggage_exceptions IS 'Baggage exceptions including delayed, lost, damaged, and pilfered incidents with complete lifecycle tracking';
COMMENT ON COLUMN baggage_exceptions.exception_number IS 'Unique exception identifier, may be WorldTracer PIR number';
COMMENT ON COLUMN baggage_exceptions.resolution_time_hours IS 'Time from reported_at to resolved_at in hours';

-- ============================================================================
-- TABLE 4: baggage_connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_connections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Bag reference
  bag_tag_number TEXT NOT NULL,
  baggage_item_id BIGINT REFERENCES baggage_items(id) ON DELETE CASCADE,
  connection_sequence INTEGER NOT NULL, -- 1, 2, 3 for multi-leg journeys

  -- Connecting airport
  connection_airport TEXT NOT NULL,

  -- Inbound flight
  inbound_flight_number TEXT NOT NULL,
  inbound_arrival_scheduled TIMESTAMPTZ NOT NULL,
  inbound_arrival_actual TIMESTAMPTZ,
  inbound_gate TEXT,
  inbound_terminal TEXT,
  inbound_status TEXT, -- on_time, delayed, cancelled

  -- Outbound flight
  outbound_flight_number TEXT NOT NULL,
  outbound_departure_scheduled TIMESTAMPTZ NOT NULL,
  outbound_departure_actual TIMESTAMPTZ,
  outbound_gate TEXT,
  outbound_terminal TEXT,
  outbound_status TEXT,

  -- Connection details
  mct_minutes INTEGER, -- Minimum Connection Time per airline/airport rules
  scheduled_connection_minutes INTEGER, -- Planned connection time
  actual_connection_minutes INTEGER, -- Actual time available
  is_same_terminal BOOLEAN,
  is_interline BOOLEAN DEFAULT FALSE,
  partner_airline_code TEXT,

  -- Risk assessment
  connection_risk_score NUMERIC(3,2) CHECK (connection_risk_score >= 0 AND connection_risk_score <= 1),
  risk_factors JSONB, -- {tight_connection, terminal_change, interline, weather, customs, etc.}
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  risk_assessed_at TIMESTAMPTZ,
  risk_assessed_by_agent TEXT,

  -- Intervention
  intervention_triggered BOOLEAN DEFAULT FALSE,
  intervention_type TEXT, -- expedite, reroute, offload, hold_flight, passenger_notify
  intervention_timestamp TIMESTAMPTZ,
  intervention_by_agent TEXT,
  intervention_result TEXT,
  intervention_notes TEXT,

  -- Transfer tracking
  transfer_status TEXT CHECK (transfer_status IN (
    'PENDING', 'IN_TRANSIT', 'COMPLETED', 'MISSED', 'REROUTED',
    'OFFLOADED', 'PROTECTED', 'EXPEDITED'
  )) DEFAULT 'PENDING',
  bag_offloaded_at TIMESTAMPTZ,
  bag_loaded_at TIMESTAMPTZ,
  actual_transfer_time TIMESTAMPTZ,

  -- Ground handling
  ground_handler TEXT,
  priority_tag_issued BOOLEAN DEFAULT FALSE,
  rush_tag_issued BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(bag_tag_number, connection_sequence)
);

-- Indexes for baggage_connections
CREATE INDEX IF NOT EXISTS idx_connections_bag_tag ON baggage_connections(bag_tag_number, connection_sequence);
CREATE INDEX IF NOT EXISTS idx_connections_item ON baggage_connections(baggage_item_id);
CREATE INDEX IF NOT EXISTS idx_connections_airport ON baggage_connections(connection_airport, outbound_departure_scheduled);
CREATE INDEX IF NOT EXISTS idx_connections_risk ON baggage_connections(connection_risk_score DESC, transfer_status) WHERE connection_risk_score > 0.70;
CREATE INDEX IF NOT EXISTS idx_connections_status ON baggage_connections(transfer_status) WHERE transfer_status IN ('PENDING', 'IN_TRANSIT');
CREATE INDEX IF NOT EXISTS idx_connections_intervention ON baggage_connections(intervention_triggered) WHERE intervention_triggered = TRUE;

COMMENT ON TABLE baggage_connections IS 'Transfer connection tracking for multi-leg journeys with risk assessment and intervention management';
COMMENT ON COLUMN baggage_connections.mct_minutes IS 'Minimum connection time per airline/airport policy';
COMMENT ON COLUMN baggage_connections.connection_risk_score IS 'ML-predicted connection success probability';

-- ============================================================================
-- TABLE 5: baggage_compensation_rules
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_compensation_rules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Rule identification
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL, -- 'MONTREAL_CONVENTION', 'EU261', 'DOT_USA', 'AIRLINE_POLICY'
  applicable_countries TEXT[], -- ISO country codes
  applicable_route_types TEXT[], -- domestic, international, transatlantic, etc.

  -- Eligibility criteria
  exception_types TEXT[], -- Which exception types qualify
  min_delay_hours INTEGER,
  requires_documentation BOOLEAN DEFAULT TRUE,

  -- Compensation limits (in USD, convert for other currencies)
  interim_expenses_max_usd NUMERIC(10,2),
  interim_daily_max_usd NUMERIC(10,2),
  max_liability_usd NUMERIC(10,2), -- Montreal Convention SDR converted to USD

  -- Item categories & depreciation
  depreciation_rules JSONB, -- {electronics: 0.20/year, clothing: 0.50/year, luggage: 0.30/year}
  excluded_items TEXT[], -- jewelry, cash, documents, perishables
  special_items JSONB, -- {wheelchairs: {depreciation: 0, max_value: null}, medical_equipment: {...}}

  -- Documentation requirements
  required_documents TEXT[], -- receipts, photos, police_report, customs_declaration
  claim_deadline_days INTEGER,
  documentation_deadline_days INTEGER,

  -- Approval thresholds
  auto_approve_under_usd NUMERIC(10,2), -- Claims under this amount auto-approved
  manager_approval_required_above_usd NUMERIC(10,2),
  executive_approval_required_above_usd NUMERIC(10,2),

  -- Payment terms
  payment_methods TEXT[], -- bank_transfer, check, voucher, miles, credit_card_refund
  payment_timeline_days INTEGER,
  currency_conversion_policy TEXT,

  -- Validity period
  effective_from DATE NOT NULL,
  effective_to DATE,
  supersedes_rule_id BIGINT REFERENCES baggage_compensation_rules(id),

  -- Metadata
  created_by TEXT,
  approved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for compensation rules
CREATE INDEX IF NOT EXISTS idx_comp_rules_jurisdiction ON baggage_compensation_rules(jurisdiction, effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_comp_rules_effective ON baggage_compensation_rules(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_comp_rules_code ON baggage_compensation_rules(rule_code);

COMMENT ON TABLE baggage_compensation_rules IS 'Jurisdiction-specific compensation rules implementing Montreal Convention, EU261, DOT, and airline policies';
COMMENT ON COLUMN baggage_compensation_rules.max_liability_usd IS 'Maximum liability per Montreal Convention (currently ~1,700 USD)';

-- Create default Montreal Convention rule
INSERT INTO baggage_compensation_rules (
  rule_code, rule_name, jurisdiction, applicable_countries, applicable_route_types,
  exception_types, min_delay_hours, interim_expenses_max_usd, interim_daily_max_usd, max_liability_usd,
  depreciation_rules, excluded_items, required_documents, claim_deadline_days,
  auto_approve_under_usd, payment_timeline_days, payment_methods,
  effective_from
) VALUES (
  'MONTREAL_CONV_2024',
  'Montreal Convention 1999 (2024 SDR rates)',
  'MONTREAL_CONVENTION',
  ARRAY['*'], -- Applies to all international flights
  ARRAY['international'],
  ARRAY['DELAYED', 'LOST', 'DAMAGED', 'PILFERED'],
  0,
  500.00, -- Reasonable interim expenses
  50.00, -- Daily essentials
  1700.00, -- Approximately 1288 SDR
  '{"electronics": 0.20, "clothing": 0.50, "luggage": 0.30, "cosmetics": 1.0}'::jsonb,
  ARRAY['jewelry', 'cash', 'securities', 'negotiable_papers', 'business_documents', 'samples', 'works_of_art'],
  ARRAY['receipts', 'photos', 'baggage_claim_tag'],
  21, -- 21 days from baggage arrival (or should have arrived)
  100.00, -- Auto-approve small claims
  30, -- Pay within 30 days
  ARRAY['bank_transfer', 'check'],
  '2024-01-01'
) ON CONFLICT (rule_code) DO NOTHING;

-- ============================================================================
-- SUMMARY for Migration 003 Part 1
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 003 PART 1 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Core tables created (5 of 12):';
  RAISE NOTICE '  1. ✓ baggage_items - Individual bag tracking';
  RAISE NOTICE '  2. ✓ baggage_scan_events - All scan points';
  RAISE NOTICE '  3. ✓ baggage_exceptions - Exception management';
  RAISE NOTICE '  4. ✓ baggage_connections - Transfer tracking';
  RAISE NOTICE '  5. ✓ baggage_compensation_rules - Compensation policy';
  RAISE NOTICE '';
  RAISE NOTICE 'Remaining tables in Part 2:';
  RAISE NOTICE '  6. baggage_claims';
  RAISE NOTICE '  7. interline_bag_messages';
  RAISE NOTICE '  8. baggage_performance_metrics';
  RAISE NOTICE '  9. lost_found_inventory';
  RAISE NOTICE '  10-12. Special handling, routing, delivery tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Continue with Part 2 of migration 003...';
  RAISE NOTICE '========================================';
END $$;

-- Continue with remaining tables in next section...

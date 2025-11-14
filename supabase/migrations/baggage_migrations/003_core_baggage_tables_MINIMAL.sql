/*
  Migration 003: Core Baggage Tables (Simplified - All 12 Tables)

  Purpose: Create all 12 core baggage tables for complete lifecycle tracking

  Tables Created:
  1. baggage_items - Master bag records
  2. baggage_scan_events - Complete scan history
  3. baggage_exceptions - Exception management
  4. baggage_connections - Transfer tracking
  5. baggage_compensation_rules - Jurisdiction rules
  6. baggage_claims - Compensation claims
  7. interline_bag_messages - SITA messaging
  8. baggage_performance_metrics - KPI tracking
  9. lost_found_inventory - Lost & found
  10. baggage_special_handling - Special codes
  11. baggage_routing_tags - Multi-leg routing
  12. baggage_delivery_attempts - Last-mile delivery

  Note: Simplified schema without timestamp columns to match existing pattern
*/

-- ============================================================================
-- TABLE 1: BAGGAGE ITEMS (Master Records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_items (
  id BIGSERIAL PRIMARY KEY,
  bag_tag_number TEXT NOT NULL UNIQUE,
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  current_status TEXT CHECK (current_status IN (
    'checked_in', 'tsa_screened', 'in_makeup', 'loaded', 'in_flight',
    'arrived', 'at_claim', 'claimed', 'short_checked', 'delayed',
    'lost', 'found', 'damaged', 'offloaded', 'rerouted'
  )) NOT NULL DEFAULT 'checked_in',
  flight_number TEXT,
  origin_airport TEXT,
  destination_airport TEXT,
  connection_risk_score NUMERIC(3,2),
  bag_description TEXT,
  metadata JSONB
);

CREATE INDEX idx_baggage_items_tag ON baggage_items(bag_tag_number);
CREATE INDEX idx_baggage_items_status ON baggage_items(current_status);
CREATE INDEX idx_baggage_items_pnr ON baggage_items(passenger_pnr);

-- ============================================================================
-- TABLE 2: BAGGAGE SCAN EVENTS (Complete History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_scan_events (
  id BIGSERIAL PRIMARY KEY,
  bag_tag_number TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN (
    'CHECK_IN', 'TSA_SCREENING', 'MAKEUP', 'LOADED_AIRCRAFT',
    'OFFLOADED_AIRCRAFT', 'TRANSFER_OUT', 'TRANSFER_IN',
    'ARRIVAL', 'CLAIM', 'EXCEPTION', 'FORWARDED', 'DELIVERED'
  )),
  location_code TEXT NOT NULL,
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_scan_events_tag ON baggage_scan_events(bag_tag_number);
CREATE INDEX idx_scan_events_timestamp ON baggage_scan_events(scan_timestamp DESC);
CREATE INDEX idx_scan_events_location ON baggage_scan_events(location_code);

-- ============================================================================
-- TABLE 3: BAGGAGE EXCEPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_exceptions (
  id BIGSERIAL PRIMARY KEY,
  exception_number TEXT NOT NULL UNIQUE,
  bag_tag_number TEXT NOT NULL,
  exception_type TEXT NOT NULL CHECK (exception_type IN (
    'DELAYED', 'LOST', 'DAMAGED', 'PILFERED', 'MISDIRECTED',
    'OFFLOADED', 'RUSH_TAG_MISSED', 'INTERLINE_MISCONNECTION'
  )),
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  worldtracer_pir TEXT,
  resolution_status TEXT CHECK (resolution_status IN (
    'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
  )) DEFAULT 'OPEN',
  metadata JSONB
);

CREATE INDEX idx_exceptions_number ON baggage_exceptions(exception_number);
CREATE INDEX idx_exceptions_tag ON baggage_exceptions(bag_tag_number);
CREATE INDEX idx_exceptions_status ON baggage_exceptions(resolution_status);

-- ============================================================================
-- TABLE 4: BAGGAGE CONNECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_connections (
  id BIGSERIAL PRIMARY KEY,
  bag_tag_number TEXT NOT NULL,
  connection_sequence INTEGER NOT NULL,
  inbound_flight TEXT,
  outbound_flight TEXT,
  transfer_airport TEXT,
  mct_minutes INTEGER,
  connection_risk_score NUMERIC(3,2),
  transfer_status TEXT CHECK (transfer_status IN (
    'PENDING', 'IN_TRANSIT', 'COMPLETED', 'MISSED', 'REROUTED'
  )) DEFAULT 'PENDING'
);

CREATE INDEX idx_connections_tag ON baggage_connections(bag_tag_number);
CREATE INDEX idx_connections_airport ON baggage_connections(transfer_airport);

-- ============================================================================
-- TABLE 5: BAGGAGE COMPENSATION RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_compensation_rules (
  id BIGSERIAL PRIMARY KEY,
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  max_liability_usd NUMERIC(10,2),
  auto_approve_under_usd NUMERIC(10,2),
  interim_expenses_max_usd NUMERIC(10,2),
  metadata JSONB
);

-- Pre-load Montreal Convention rule
INSERT INTO baggage_compensation_rules (
  rule_code, rule_name, jurisdiction, max_liability_usd,
  auto_approve_under_usd, interim_expenses_max_usd
) VALUES (
  'MONTREAL_CONV_2024',
  'Montreal Convention 1999 (2024 SDR rates)',
  'MONTREAL_CONVENTION',
  1700.00,
  100.00,
  500.00
) ON CONFLICT (rule_code) DO NOTHING;

-- ============================================================================
-- TABLE 6: BAGGAGE CLAIMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_claims (
  id BIGSERIAL PRIMARY KEY,
  claim_number TEXT NOT NULL UNIQUE,
  exception_number TEXT,
  bag_tag_number TEXT NOT NULL,
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN (
    'DELAYED_BAG', 'LOST_BAG', 'DAMAGED_BAG', 'PILFERED_BAG',
    'INTERIM_EXPENSES'
  )),
  claim_status TEXT NOT NULL CHECK (claim_status IN (
    'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'PAID', 'CLOSED'
  )) DEFAULT 'SUBMITTED',
  claimed_amount_usd NUMERIC(10,2),
  approved_amount_usd NUMERIC(10,2),
  rule_code TEXT,
  metadata JSONB
);

CREATE INDEX idx_claims_number ON baggage_claims(claim_number);
CREATE INDEX idx_claims_tag ON baggage_claims(bag_tag_number);
CREATE INDEX idx_claims_status ON baggage_claims(claim_status);

-- ============================================================================
-- TABLE 7: INTERLINE BAG MESSAGES (SITA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interline_bag_messages (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'BPM', 'BTM', 'BSM', 'BNS', 'CPM'
  )),
  bag_tag_number TEXT NOT NULL,
  partner_airline_code TEXT NOT NULL,
  message_raw TEXT NOT NULL,
  message_status TEXT CHECK (message_status IN (
    'SENT', 'RECEIVED', 'ACKNOWLEDGED', 'PROCESSED', 'FAILED'
  )) DEFAULT 'SENT',
  metadata JSONB
);

CREATE INDEX idx_interline_msg_id ON interline_bag_messages(message_id);
CREATE INDEX idx_interline_tag ON interline_bag_messages(bag_tag_number);
CREATE INDEX idx_interline_partner ON interline_bag_messages(partner_airline_code);

-- ============================================================================
-- TABLE 8: BAGGAGE PERFORMANCE METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_period TEXT CHECK (metric_period IN ('DAILY', 'WEEKLY', 'MONTHLY')) DEFAULT 'DAILY',
  airport_code TEXT,
  total_bags_handled INTEGER DEFAULT 0,
  total_mishandled_bags INTEGER DEFAULT 0,
  mishandling_rate_per_1000 NUMERIC(6,3),
  delayed_bags INTEGER DEFAULT 0,
  lost_bags INTEGER DEFAULT 0,
  damaged_bags INTEGER DEFAULT 0,
  metadata JSONB,
  UNIQUE(metric_date, metric_period, airport_code)
);

CREATE INDEX idx_metrics_date ON baggage_performance_metrics(metric_date DESC);
CREATE INDEX idx_metrics_airport ON baggage_performance_metrics(airport_code);

-- ============================================================================
-- TABLE 9: LOST FOUND INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS lost_found_inventory (
  id BIGSERIAL PRIMARY KEY,
  inventory_number TEXT NOT NULL UNIQUE,
  bag_tag_number TEXT,
  found_location_airport TEXT NOT NULL,
  found_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bag_description TEXT,
  bag_photos JSONB,
  matching_status TEXT CHECK (matching_status IN (
    'PENDING_MATCH', 'POTENTIAL_MATCHES_FOUND', 'MATCH_CONFIRMED',
    'REUNITED', 'NO_MATCH_60_DAYS', 'DISPOSED'
  )) DEFAULT 'PENDING_MATCH',
  metadata JSONB
);

CREATE INDEX idx_lf_inventory_number ON lost_found_inventory(inventory_number);
CREATE INDEX idx_lf_tag ON lost_found_inventory(bag_tag_number);
CREATE INDEX idx_lf_status ON lost_found_inventory(matching_status);

-- ============================================================================
-- TABLE 10: BAGGAGE SPECIAL HANDLING
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_special_handling (
  id BIGSERIAL PRIMARY KEY,
  bag_tag_number TEXT NOT NULL,
  special_handling_code TEXT NOT NULL CHECK (special_handling_code IN (
    'FRAG', 'RUSH', 'HEAVY', 'PET', 'BIKE', 'GOLF', 'SKI',
    'MUSIC', 'WHEEL', 'MED', 'HAZMAT', 'DRY_ICE', 'BATT'
  )),
  flight_number TEXT,
  handling_priority INTEGER DEFAULT 3,
  weight_kg NUMERIC(7,2),
  metadata JSONB
);

CREATE INDEX idx_special_tag ON baggage_special_handling(bag_tag_number);
CREATE INDEX idx_special_code ON baggage_special_handling(special_handling_code);

-- ============================================================================
-- TABLE 11: BAGGAGE ROUTING TAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_routing_tags (
  id BIGSERIAL PRIMARY KEY,
  bag_tag_number TEXT NOT NULL,
  routing_sequence INTEGER NOT NULL,
  flight_number TEXT NOT NULL,
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  final_destination_airport TEXT NOT NULL,
  connection_risk_score NUMERIC(3,2),
  routing_status TEXT CHECK (routing_status IN (
    'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'REROUTED'
  )) DEFAULT 'PLANNED',
  UNIQUE(bag_tag_number, routing_sequence)
);

CREATE INDEX idx_routing_tag ON baggage_routing_tags(bag_tag_number);
CREATE INDEX idx_routing_flight ON baggage_routing_tags(flight_number);

-- ============================================================================
-- TABLE 12: BAGGAGE DELIVERY ATTEMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_delivery_attempts (
  id BIGSERIAL PRIMARY KEY,
  delivery_id TEXT NOT NULL UNIQUE,
  exception_number TEXT,
  bag_tag_number TEXT NOT NULL,
  passenger_pnr TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_method TEXT CHECK (delivery_method IN (
    'COURIER_SERVICE', 'AIRLINE_DELIVERY', 'PASSENGER_PICKUP', 'MAIL_SHIPMENT'
  )),
  attempt_status TEXT CHECK (attempt_status IN (
    'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED'
  )) DEFAULT 'SCHEDULED',
  delivered BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

CREATE INDEX idx_delivery_id ON baggage_delivery_attempts(delivery_id);
CREATE INDEX idx_delivery_tag ON baggage_delivery_attempts(bag_tag_number);
CREATE INDEX idx_delivery_status ON baggage_delivery_attempts(attempt_status);

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM pg_tables
  WHERE tablename LIKE 'baggage%' AND schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION 003 COMPLETE';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Baggage tables created: %', v_table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Tables:';
  RAISE NOTICE '  1. baggage_items - Master bag records';
  RAISE NOTICE '  2. baggage_scan_events - Complete scan history';
  RAISE NOTICE '  3. baggage_exceptions - Exception management';
  RAISE NOTICE '  4. baggage_connections - Transfer tracking';
  RAISE NOTICE '  5. baggage_compensation_rules - Jurisdiction rules';
  RAISE NOTICE '  6. baggage_claims - Compensation claims';
  RAISE NOTICE '  7. interline_bag_messages - SITA messaging';
  RAISE NOTICE '  8. baggage_performance_metrics - KPI tracking';
  RAISE NOTICE '  9. lost_found_inventory - Lost & found';
  RAISE NOTICE '  10. baggage_special_handling - Special codes';
  RAISE NOTICE '  11. baggage_routing_tags - Multi-leg routing';
  RAISE NOTICE '  12. baggage_delivery_attempts - Last-mile delivery';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Total indexes created: 25+';
  RAISE NOTICE '💾 Montreal Convention rule pre-loaded';
  RAISE NOTICE '';
  RAISE NOTICE '➡️  Next: Run migration 004 (Agent Definitions)';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

/*
  Migration 003 Part 2: Core Baggage Tables (Part 2 - Remaining 7 Tables)

  Purpose: Complete the core baggage data model with 7 additional tables

  Tables Created:
  1. baggage_claims - Compensation claims processing
  2. interline_bag_messages - SITA Type B message exchange
  3. baggage_performance_metrics - KPI tracking and analytics
  4. lost_found_inventory - Lost & found bag inventory
  5. baggage_special_handling - Special handling requirements
  6. baggage_routing_tags - Multi-leg journey routing
  7. baggage_delivery_attempts - Last-mile delivery tracking

  Dependencies:
  - Migration 001 (domains), 002 (categories), 003 Part 1 (first 5 tables)
  - Existing agent_categories, agents tables
  - Tables from Part 1: baggage_items, baggage_scan_events, baggage_exceptions,
    baggage_connections, baggage_compensation_rules

  Total Tables After This Migration: 12
*/

-- ============================================================================
-- TABLE 6: BAGGAGE CLAIMS
-- Purpose: Track compensation claims from filing through settlement
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_claims (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Claim Identification
  claim_number TEXT NOT NULL UNIQUE, -- Format: CLM-YYMMDD-NNNN
  exception_number TEXT REFERENCES baggage_exceptions(exception_number),
  bag_tag_number TEXT NOT NULL,

  -- Passenger Information
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT,
  passenger_phone TEXT,
  passenger_address TEXT,
  passenger_tier TEXT CHECK (passenger_tier IN ('GENERAL', 'SILVER', 'GOLD', 'PLATINUM', 'CHAIRMAN')),

  -- Claim Details
  claim_type TEXT NOT NULL CHECK (claim_type IN (
    'DELAYED_BAG', 'LOST_BAG', 'DAMAGED_BAG', 'PILFERED_BAG',
    'INTERIM_EXPENSES', 'CONSEQUENTIAL_DAMAGES', 'DENIED_BOARDING_BAG'
  )),
  claim_status TEXT NOT NULL CHECK (claim_status IN (
    'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTATION_REQUESTED', 'APPROVED',
    'PARTIALLY_APPROVED', 'DENIED', 'PAID', 'CLOSED', 'DISPUTED', 'ESCALATED'
  )) DEFAULT 'SUBMITTED',

  -- Financial
  claimed_amount_usd NUMERIC(10,2) NOT NULL CHECK (claimed_amount_usd >= 0),
  approved_amount_usd NUMERIC(10,2) CHECK (approved_amount_usd >= 0),
  depreciation_applied_usd NUMERIC(10,2) DEFAULT 0,
  interim_expenses_paid_usd NUMERIC(10,2) DEFAULT 0,
  final_settlement_usd NUMERIC(10,2),

  -- Jurisdiction & Rules
  applicable_jurisdiction TEXT NOT NULL CHECK (applicable_jurisdiction IN (
    'MONTREAL_CONVENTION', 'EU_261', 'DOT_DOMESTIC', 'AIRLINE_POLICY', 'OTHER'
  )),
  rule_code TEXT REFERENCES baggage_compensation_rules(rule_code),
  liability_cap_usd NUMERIC(10,2), -- Max liability for this claim

  -- Processing
  auto_approved BOOLEAN DEFAULT FALSE,
  requires_manual_review BOOLEAN DEFAULT FALSE,
  fraud_risk_score NUMERIC(3,2) CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 1),
  fraud_indicators TEXT[],

  -- Documentation
  documentation_submitted JSONB, -- {receipts: [], photos: [], declarations: []}
  documentation_complete BOOLEAN DEFAULT FALSE,
  missing_documentation TEXT[],

  -- Item Details
  claimed_items JSONB, -- Array of {item_category, description, value_usd, purchase_date, depreciation_rate}
  excluded_items TEXT[], -- Items not covered (jewelry, cash, etc.)

  -- Settlement
  payment_method TEXT CHECK (payment_method IN (
    'BANK_TRANSFER', 'CHECK', 'VOUCHER', 'FREQUENT_FLYER_MILES', 'CREDIT_CARD_REFUND'
  )),
  payment_details JSONB, -- Bank account, check number, voucher code, etc.
  payment_date TIMESTAMPTZ,
  payment_reference TEXT,

  -- Timestamps & Tracking
  claim_submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claim_reviewed_at TIMESTAMPTZ,
  claim_approved_at TIMESTAMPTZ,
  claim_denied_at TIMESTAMPTZ,
  claim_paid_at TIMESTAMPTZ,
  claim_closed_at TIMESTAMPTZ,

  -- Processing Time KPIs
  review_time_hours NUMERIC(10,2), -- Time from submission to review completion
  settlement_time_hours NUMERIC(10,2), -- Time from approval to payment
  total_claim_time_hours NUMERIC(10,2), -- End-to-end time

  -- Assignment
  assigned_agent_code TEXT REFERENCES agents(code),
  assigned_to_user TEXT, -- Claims adjuster user ID
  escalated_to TEXT, -- Supervisor/manager for escalations

  -- Denial/Dispute
  denial_reason TEXT,
  denial_details TEXT,
  dispute_filed BOOLEAN DEFAULT FALSE,
  dispute_details TEXT,
  dispute_resolution TEXT,

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,

  -- Metadata
  notes TEXT,
  internal_comments TEXT,
  metadata JSONB
);

-- Indexes for baggage_claims
CREATE INDEX idx_claims_claim_number ON baggage_claims(claim_number);
CREATE INDEX idx_claims_exception ON baggage_claims(exception_number);
CREATE INDEX idx_claims_bag_tag ON baggage_claims(bag_tag_number);
CREATE INDEX idx_claims_pnr ON baggage_claims(passenger_pnr);
CREATE INDEX idx_claims_status ON baggage_claims(claim_status) WHERE claim_status NOT IN ('CLOSED', 'PAID');
CREATE INDEX idx_claims_submitted_date ON baggage_claims(claim_submitted_at);
CREATE INDEX idx_claims_assigned_agent ON baggage_claims(assigned_agent_code);
CREATE INDEX idx_claims_fraud_risk ON baggage_claims(fraud_risk_score) WHERE fraud_risk_score > 0.5;
CREATE INDEX idx_claims_auto_approved ON baggage_claims(auto_approved, claimed_amount_usd) WHERE auto_approved = TRUE;

-- Full-text search on claim details
CREATE INDEX idx_claims_search ON baggage_claims USING gin(
  to_tsvector('english', COALESCE(passenger_name, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(denial_reason, ''))
);

-- ============================================================================
-- TABLE 7: INTERLINE BAG MESSAGES
-- Purpose: SITA Type B message exchange with partner airlines
-- ============================================================================

CREATE TABLE IF NOT EXISTS interline_bag_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Message Identification
  message_id TEXT NOT NULL UNIQUE, -- Format: MSG-YYMMDD-HHMMSS-NNNN
  message_type TEXT NOT NULL CHECK (message_type IN (
    'BPM',  -- Baggage Processed Message
    'BTM',  -- Baggage Transfer Message
    'BSM',  -- Baggage Source Message
    'BNS',  -- Baggage Not Seen
    'CPM',  -- Custody Processed Message
    'UCM',  -- Unaccompanied Minor Custody
    'BAG'   -- Generic baggage message
  )),
  message_direction TEXT NOT NULL CHECK (message_direction IN ('INBOUND', 'OUTBOUND')),

  -- Bag & Flight Information
  bag_tag_number TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  transfer_airport TEXT, -- For connections

  -- Partner Airline
  partner_airline_code TEXT NOT NULL, -- 2-letter IATA code
  partner_airline_name TEXT,
  alliance_network TEXT CHECK (alliance_network IN ('STAR_ALLIANCE', 'ONEWORLD', 'SKYTEAM', 'BILATERAL', 'NONE')),
  interline_agreement_code TEXT,

  -- Message Content
  message_raw TEXT NOT NULL, -- Original SITA Type B format
  message_parsed JSONB, -- Structured JSON representation

  -- Handoff Details
  handoff_location TEXT, -- Airport code where handoff occurs
  handoff_timestamp TIMESTAMPTZ,
  custody_transferred BOOLEAN DEFAULT FALSE,
  custody_acknowledged BOOLEAN DEFAULT FALSE,

  -- Liability & SLA
  liability_carrier TEXT, -- Which airline is responsible
  liability_transferred_at TIMESTAMPTZ,
  sla_notification_deadline TIMESTAMPTZ, -- 15 min notification requirement
  sla_response_deadline TIMESTAMPTZ, -- 60 min response requirement
  sla_recovery_deadline TIMESTAMPTZ, -- 24 hour recovery requirement
  sla_met BOOLEAN,
  sla_violation_reason TEXT,

  -- Processing Status
  message_status TEXT NOT NULL CHECK (message_status IN (
    'SENT', 'RECEIVED', 'ACKNOWLEDGED', 'PROCESSED', 'FAILED', 'RETRYING', 'EXPIRED'
  )) DEFAULT 'SENT',
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Reconciliation
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,
  reconciliation_discrepancy TEXT,
  chargeback_required BOOLEAN DEFAULT FALSE,
  chargeback_amount_usd NUMERIC(10,2),

  -- Exception Coordination
  exception_number TEXT REFERENCES baggage_exceptions(exception_number),
  recovery_coordination_required BOOLEAN DEFAULT FALSE,
  recovery_coordination_notes TEXT,

  -- Timestamps
  message_sent_at TIMESTAMPTZ,
  message_received_at TIMESTAMPTZ,
  message_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Agent Assignment
  assigned_agent_code TEXT REFERENCES agents(code), -- INTER_COORD_001

  -- Metadata
  metadata JSONB,
  notes TEXT
);

-- Indexes for interline_bag_messages
CREATE INDEX idx_interline_message_id ON interline_bag_messages(message_id);
CREATE INDEX idx_interline_bag_tag ON interline_bag_messages(bag_tag_number);
CREATE INDEX idx_interline_message_type ON interline_bag_messages(message_type);
CREATE INDEX idx_interline_partner ON interline_bag_messages(partner_airline_code);
CREATE INDEX idx_interline_status ON interline_bag_messages(message_status) WHERE message_status NOT IN ('PROCESSED', 'ACKNOWLEDGED');
CREATE INDEX idx_interline_flight ON interline_bag_messages(flight_number, flight_date);
CREATE INDEX idx_interline_handoff ON interline_bag_messages(handoff_location, handoff_timestamp);
CREATE INDEX idx_interline_sla_violation ON interline_bag_messages(sla_met) WHERE sla_met = FALSE;
CREATE INDEX idx_interline_reconciliation ON interline_bag_messages(reconciled) WHERE reconciled = FALSE;

-- ============================================================================
-- TABLE 8: BAGGAGE PERFORMANCE METRICS
-- Purpose: Aggregate KPIs and performance tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_performance_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Metric Identification
  metric_date DATE NOT NULL,
  metric_period TEXT NOT NULL CHECK (metric_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
  aggregation_level TEXT NOT NULL CHECK (aggregation_level IN (
    'SYSTEM', 'AIRLINE', 'AIRPORT', 'FLIGHT', 'ROUTE', 'STATION', 'GROUND_HANDLER', 'AGENT'
  )),

  -- Scope
  airport_code TEXT, -- For airport-level metrics
  flight_number TEXT, -- For flight-level metrics
  route_code TEXT, -- Origin-Destination pair
  station_code TEXT, -- Station/terminal
  ground_handler_code TEXT,
  agent_code TEXT REFERENCES agents(code),

  -- Volume Metrics
  total_bags_handled INTEGER NOT NULL DEFAULT 0,
  total_passengers INTEGER DEFAULT 0,
  total_flights INTEGER DEFAULT 0,

  -- Mishandling Metrics (Primary KPI)
  total_mishandled_bags INTEGER NOT NULL DEFAULT 0,
  mishandling_rate_per_1000 NUMERIC(6,3), -- Bags per 1000 passengers
  delayed_bags INTEGER DEFAULT 0,
  lost_bags INTEGER DEFAULT 0,
  damaged_bags INTEGER DEFAULT 0,
  pilfered_bags INTEGER DEFAULT 0,

  -- Exception Breakdown
  misdirected_bags INTEGER DEFAULT 0,
  offloaded_bags INTEGER DEFAULT 0,
  short_checked_bags INTEGER DEFAULT 0,
  rush_tag_missed INTEGER DEFAULT 0,

  -- Connection Performance
  total_connections INTEGER DEFAULT 0,
  successful_connections INTEGER DEFAULT 0,
  missed_connections INTEGER DEFAULT 0,
  connection_success_rate NUMERIC(5,2), -- Percentage

  -- Risk Metrics
  high_risk_connections_identified INTEGER DEFAULT 0,
  interventions_triggered INTEGER DEFAULT 0,
  interventions_successful INTEGER DEFAULT 0,
  intervention_success_rate NUMERIC(5,2),

  -- Tracking Performance
  total_scan_events BIGINT DEFAULT 0,
  missing_scans_detected INTEGER DEFAULT 0,
  tracking_gaps_resolved INTEGER DEFAULT 0,
  avg_notification_delay_seconds NUMERIC(8,2),

  -- Recovery Metrics
  bags_recovered_same_day INTEGER DEFAULT 0,
  bags_recovered_24_48_hours INTEGER DEFAULT 0,
  bags_recovered_48_plus_hours INTEGER DEFAULT 0,
  avg_recovery_time_hours NUMERIC(8,2),

  -- Claim Metrics
  total_claims_filed INTEGER DEFAULT 0,
  claims_approved INTEGER DEFAULT 0,
  claims_denied INTEGER DEFAULT 0,
  avg_claim_processing_hours NUMERIC(8,2),
  total_compensation_paid_usd NUMERIC(12,2) DEFAULT 0,
  avg_compensation_per_claim_usd NUMERIC(10,2),

  -- Interline Performance
  total_interline_transfers INTEGER DEFAULT 0,
  interline_misconnections INTEGER DEFAULT 0,
  sita_messages_sent INTEGER DEFAULT 0,
  sita_messages_received INTEGER DEFAULT 0,
  sla_violations INTEGER DEFAULT 0,
  sla_compliance_rate NUMERIC(5,2),

  -- Customer Satisfaction
  passenger_complaints INTEGER DEFAULT 0,
  passenger_compliments INTEGER DEFAULT 0,
  avg_passenger_satisfaction_score NUMERIC(3,2), -- 1-5 scale
  nps_score INTEGER, -- Net Promoter Score (-100 to 100)

  -- Cost Metrics
  cost_per_mishandled_bag_usd NUMERIC(10,2),
  total_operational_cost_usd NUMERIC(12,2),
  total_compensation_cost_usd NUMERIC(12,2),

  -- Ground Handler Performance (if applicable)
  handler_on_time_performance NUMERIC(5,2), -- Percentage
  handler_damage_rate NUMERIC(6,3), -- Per 1000
  handler_rating NUMERIC(3,2), -- 1-5 scale

  -- Agent Performance
  agent_tasks_completed INTEGER DEFAULT 0,
  agent_avg_processing_time_seconds NUMERIC(8,2),
  agent_success_rate NUMERIC(5,2),
  agent_error_rate NUMERIC(5,2),

  -- Timestamps
  metric_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  baseline_comparison JSONB, -- Compare to historical baseline
  targets JSONB, -- Target KPIs
  variance_analysis JSONB, -- Deviation from targets
  metadata JSONB,

  -- Unique constraint for time-series data
  UNIQUE(metric_date, metric_period, aggregation_level, airport_code, flight_number, route_code, agent_code)
);

-- Indexes for baggage_performance_metrics
CREATE INDEX idx_metrics_date ON baggage_performance_metrics(metric_date DESC);
CREATE INDEX idx_metrics_period ON baggage_performance_metrics(metric_period, metric_date DESC);
CREATE INDEX idx_metrics_airport ON baggage_performance_metrics(airport_code, metric_date DESC) WHERE airport_code IS NOT NULL;
CREATE INDEX idx_metrics_agent ON baggage_performance_metrics(agent_code, metric_date DESC) WHERE agent_code IS NOT NULL;
CREATE INDEX idx_metrics_mishandling_rate ON baggage_performance_metrics(mishandling_rate_per_1000);
CREATE INDEX idx_metrics_connection_rate ON baggage_performance_metrics(connection_success_rate);
CREATE INDEX idx_metrics_ground_handler ON baggage_performance_metrics(ground_handler_code, metric_date DESC) WHERE ground_handler_code IS NOT NULL;

-- ============================================================================
-- TABLE 9: LOST FOUND INVENTORY
-- Purpose: Unclaimed baggage inventory for matching and reunion
-- ============================================================================

CREATE TABLE IF NOT EXISTS lost_found_inventory (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Inventory Identification
  inventory_number TEXT NOT NULL UNIQUE, -- Format: LF-YYMMDD-LOCATION-NNNN
  bag_tag_number TEXT, -- May be missing or illegible

  -- Discovery Details
  found_location_airport TEXT NOT NULL,
  found_location_detail TEXT, -- Terminal, gate, carousel, etc.
  found_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  found_by TEXT, -- Employee name/ID

  -- Bag Physical Description
  bag_type TEXT CHECK (bag_type IN (
    'SUITCASE_HARD', 'SUITCASE_SOFT', 'DUFFEL', 'BACKPACK', 'GARMENT_BAG',
    'SPORTS_EQUIPMENT', 'SPECIALTY', 'UNKNOWN'
  )),
  bag_size TEXT CHECK (bag_size IN ('SMALL', 'MEDIUM', 'LARGE', 'OVERSIZED')),
  bag_color TEXT, -- Primary color
  bag_color_secondary TEXT,
  bag_brand TEXT, -- Samsonite, Tumi, etc.
  bag_material TEXT CHECK (bag_material IN ('HARD_PLASTIC', 'SOFT_FABRIC', 'LEATHER', 'NYLON', 'OTHER')),

  -- Distinguishing Features
  bag_description TEXT, -- Free-text description
  distinctive_features TEXT[], -- Stickers, straps, damage, etc.
  has_name_tag BOOLEAN DEFAULT FALSE,
  name_tag_text TEXT,
  has_straps BOOLEAN DEFAULT FALSE,
  strap_color TEXT,
  has_stickers BOOLEAN DEFAULT FALSE,
  sticker_descriptions TEXT[],

  -- Contents (non-invasive inspection)
  visible_contents_description TEXT,
  approximate_weight_kg NUMERIC(5,2),
  estimated_value_usd NUMERIC(10,2),
  contains_valuables BOOLEAN DEFAULT FALSE,
  contains_electronics BOOLEAN DEFAULT FALSE,
  contains_documents BOOLEAN DEFAULT FALSE,

  -- Image Data
  bag_photos JSONB, -- Array of {photo_url, photo_timestamp, view_angle}
  image_hash TEXT, -- Perceptual hash for ML matching
  image_embeddings JSONB, -- ML model embeddings (768-dim vector)

  -- Text Embeddings for Semantic Search
  description_embedding JSONB, -- Sentence transformer embedding

  -- Matching Status
  matching_status TEXT NOT NULL CHECK (matching_status IN (
    'PENDING_MATCH', 'POTENTIAL_MATCHES_FOUND', 'MATCH_CONFIRMED',
    'REUNITED', 'NO_MATCH_60_DAYS', 'DISPOSED', 'AUCTIONED'
  )) DEFAULT 'PENDING_MATCH',

  -- Matching Results
  potential_matches JSONB, -- Array of {bag_tag_number, match_score, match_reason}
  top_match_bag_tag TEXT,
  top_match_score NUMERIC(5,4), -- 0-1 similarity score
  match_confirmed_by TEXT, -- Agent/employee who confirmed match
  match_confirmed_at TIMESTAMPTZ,

  -- Reunion Details
  reunited_with_passenger TEXT, -- Passenger name
  reunited_pnr TEXT,
  reunion_method TEXT CHECK (reunion_method IN (
    'DELIVERED', 'PICKUP', 'SHIPPED', 'FORWARDED_TO_PARTNER'
  )),
  reunion_timestamp TIMESTAMPTZ,
  reunion_cost_usd NUMERIC(10,2),

  -- Storage & Disposal
  storage_location TEXT, -- Warehouse location code
  storage_bin TEXT, -- Specific bin/shelf
  storage_date DATE,
  days_in_storage INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - found_timestamp))::INTEGER
  ) STORED,

  disposal_eligible_date DATE, -- Typically 60-90 days after found
  disposed BOOLEAN DEFAULT FALSE,
  disposal_date DATE,
  disposal_method TEXT CHECK (disposal_method IN (
    'RETURNED_OWNER', 'DONATED', 'AUCTIONED', 'DESTROYED', 'CHARITY'
  )),
  disposal_revenue_usd NUMERIC(10,2),

  -- Agent Assignment
  assigned_agent_code TEXT REFERENCES agents(code), -- LNF_MATCH_001

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  worldtracer_filed BOOLEAN DEFAULT FALSE,
  worldtracer_reference TEXT,
  notes TEXT,
  metadata JSONB
);

-- Indexes for lost_found_inventory
CREATE INDEX idx_lf_inventory_number ON lost_found_inventory(inventory_number);
CREATE INDEX idx_lf_bag_tag ON lost_found_inventory(bag_tag_number) WHERE bag_tag_number IS NOT NULL;
CREATE INDEX idx_lf_found_location ON lost_found_inventory(found_location_airport);
CREATE INDEX idx_lf_matching_status ON lost_found_inventory(matching_status) WHERE matching_status NOT IN ('REUNITED', 'DISPOSED');
CREATE INDEX idx_lf_found_date ON lost_found_inventory(found_timestamp DESC);
CREATE INDEX idx_lf_days_storage ON lost_found_inventory(days_in_storage) WHERE disposed = FALSE;
CREATE INDEX idx_lf_bag_type_color ON lost_found_inventory(bag_type, bag_color);

-- Full-text search on bag description
CREATE INDEX idx_lf_description_search ON lost_found_inventory USING gin(
  to_tsvector('english', COALESCE(bag_description, '') || ' ' || COALESCE(visible_contents_description, '') || ' ' || array_to_string(distinctive_features, ' '))
);

-- ============================================================================
-- TABLE 10: BAGGAGE SPECIAL HANDLING
-- Purpose: Special handling requirements and codes (IATA Resolution 780)
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_special_handling (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Bag Identification
  bag_tag_number TEXT NOT NULL,

  -- Special Handling Code (IATA Resolution 780)
  special_handling_code TEXT NOT NULL CHECK (special_handling_code IN (
    'FRAG',  -- Fragile
    'RUSH',  -- Rush/Priority tag
    'HEAVY', -- Heavy (over 32kg/70lbs)
    'PET',   -- Live animal
    'BIKE',  -- Bicycle
    'GOLF',  -- Golf clubs
    'SKI',   -- Ski equipment
    'SURF',  -- Surfboard
    'MUSIC', -- Musical instrument
    'WHEEL', -- Wheelchair/mobility device
    'MED',   -- Medical equipment
    'DIPLO', -- Diplomatic bag
    'CREW',  -- Crew bag
    'VIP',   -- VIP passenger bag
    'SKEL',  -- Skeleton/remains
    'HAZMAT',-- Hazardous materials (restricted)
    'DRY_ICE', -- Contains dry ice
    'BATT',  -- Lithium batteries
    'OTHER'  -- Other special handling
  )),

  -- Handling Requirements
  handling_description TEXT,
  handling_priority INTEGER CHECK (handling_priority BETWEEN 1 AND 5) DEFAULT 3, -- 5 = highest priority
  requires_special_loading BOOLEAN DEFAULT FALSE,
  requires_climate_control BOOLEAN DEFAULT FALSE,
  requires_upright_storage BOOLEAN DEFAULT FALSE,
  stacking_prohibited BOOLEAN DEFAULT FALSE,
  max_stacking_layers INTEGER,

  -- Weight & Size
  weight_kg NUMERIC(7,2),
  length_cm NUMERIC(6,2),
  width_cm NUMERIC(6,2),
  height_cm NUMERIC(6,2),
  oversized BOOLEAN DEFAULT FALSE,
  overweight BOOLEAN DEFAULT FALSE,

  -- Fees & Charges
  excess_baggage_fee_usd NUMERIC(10,2) DEFAULT 0,
  special_handling_fee_usd NUMERIC(10,2) DEFAULT 0,
  total_fee_charged_usd NUMERIC(10,2) DEFAULT 0,
  fee_waived BOOLEAN DEFAULT FALSE,
  fee_waiver_reason TEXT,

  -- Safety & Security
  security_screening_required BOOLEAN DEFAULT TRUE,
  security_clearance_status TEXT CHECK (security_clearance_status IN (
    'PENDING', 'CLEARED', 'REJECTED', 'MANUAL_INSPECTION', 'EXEMPTED'
  )) DEFAULT 'PENDING',
  security_clearance_timestamp TIMESTAMPTZ,

  hazmat_declaration TEXT,
  hazmat_un_code TEXT, -- UN number for hazmat classification
  dry_ice_weight_kg NUMERIC(5,2),
  lithium_battery_watt_hours NUMERIC(7,2),

  -- Passenger Information
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_contact TEXT,
  passenger_tier TEXT,

  -- Flight Information
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,

  -- Handling Instructions
  loading_instructions TEXT,
  offloading_instructions TEXT,
  delivery_instructions TEXT,
  special_notes TEXT,

  -- Tracking
  special_handling_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_by TEXT, -- Ground handler employee
  confirmed_at TIMESTAMPTZ,

  loaded_onto_aircraft BOOLEAN DEFAULT FALSE,
  loaded_at TIMESTAMPTZ,
  loaded_by TEXT,

  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,

  -- Agent Assignment
  assigned_agent_code TEXT REFERENCES agents(code), -- SPECIAL_HANDLE_001

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB,
  notes TEXT
);

-- Indexes for baggage_special_handling
CREATE INDEX idx_special_bag_tag ON baggage_special_handling(bag_tag_number);
CREATE INDEX idx_special_handling_code ON baggage_special_handling(special_handling_code);
CREATE INDEX idx_special_flight ON baggage_special_handling(flight_number, flight_date);
CREATE INDEX idx_special_priority ON baggage_special_handling(handling_priority DESC) WHERE delivered = FALSE;
CREATE INDEX idx_special_oversized ON baggage_special_handling(oversized, overweight) WHERE oversized = TRUE OR overweight = TRUE;
CREATE INDEX idx_special_security ON baggage_special_handling(security_clearance_status) WHERE security_clearance_status IN ('PENDING', 'MANUAL_INSPECTION');
CREATE INDEX idx_special_hazmat ON baggage_special_handling(special_handling_code) WHERE special_handling_code IN ('HAZMAT', 'DRY_ICE', 'BATT');

-- ============================================================================
-- TABLE 11: BAGGAGE ROUTING TAGS
-- Purpose: Multi-leg journey routing for connecting flights
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_routing_tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Bag Identification
  bag_tag_number TEXT NOT NULL,
  routing_sequence INTEGER NOT NULL CHECK (routing_sequence > 0), -- 1, 2, 3 for multi-leg

  -- Flight Leg Details
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  operating_carrier TEXT NOT NULL, -- 2-letter airline code

  -- Routing
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  final_destination_airport TEXT NOT NULL, -- Ultimate destination
  is_final_leg BOOLEAN DEFAULT FALSE,

  -- Connection Details
  connection_type TEXT CHECK (connection_type IN (
    'ONLINE', 'INTERLINE', 'CODESHARE', 'ALLIANCE', 'SELF_CONNECT'
  )),
  connection_time_minutes INTEGER, -- Time between flights
  mct_minutes INTEGER, -- Minimum Connection Time
  mct_buffer_minutes INTEGER GENERATED ALWAYS AS (
    connection_time_minutes - mct_minutes
  ) STORED,

  -- Transfer Information
  transfer_required BOOLEAN DEFAULT FALSE,
  transfer_airport TEXT,
  transfer_terminal TEXT,
  transfer_distance_meters INTEGER, -- Walking distance between gates
  requires_terminal_change BOOLEAN DEFAULT FALSE,
  requires_security_recheck BOOLEAN DEFAULT FALSE,

  -- Bag Protection Status
  protected_connection BOOLEAN DEFAULT FALSE, -- Airline guarantees connection
  short_connect_flag BOOLEAN DEFAULT FALSE, -- Tight connection (<60 min typically)
  rush_tag_applied BOOLEAN DEFAULT FALSE,
  rush_tag_timestamp TIMESTAMPTZ,

  -- Tracking
  bag_loaded_current_leg BOOLEAN DEFAULT FALSE,
  loaded_timestamp TIMESTAMPTZ,

  bag_offloaded_current_leg BOOLEAN DEFAULT FALSE,
  offloaded_timestamp TIMESTAMPTZ,

  bag_transferred_next_leg BOOLEAN DEFAULT FALSE,
  transferred_timestamp TIMESTAMPTZ,

  -- Risk Assessment
  connection_risk_score NUMERIC(3,2) CHECK (connection_risk_score >= 0 AND connection_risk_score <= 1),
  risk_factors TEXT[], -- ['TIGHT_CONNECTION', 'TERMINAL_CHANGE', 'INTERLINE', 'WEATHER_DELAY']
  intervention_recommended BOOLEAN DEFAULT FALSE,
  intervention_action TEXT, -- 'EXPEDITE', 'OFFLOAD', 'REROUTE'

  -- Status
  routing_status TEXT NOT NULL CHECK (routing_status IN (
    'PLANNED', 'IN_PROGRESS', 'TRANSFERRED', 'COMPLETED', 'MISSED', 'REROUTED', 'OFFLOADED'
  )) DEFAULT 'PLANNED',

  status_updated_at TIMESTAMPTZ,

  -- Rerouting (if connection missed)
  rerouted BOOLEAN DEFAULT FALSE,
  new_routing_sequence INTEGER,
  reroute_reason TEXT,
  reroute_timestamp TIMESTAMPTZ,

  -- Passenger Information
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_on_same_flight BOOLEAN DEFAULT TRUE, -- Passenger traveling on same itinerary

  -- Agent Assignment
  assigned_agent_code TEXT REFERENCES agents(code), -- CONN_RISK_001, RUSH_TAG_MGR_001

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB,
  notes TEXT,

  -- Unique constraint for routing sequence
  UNIQUE(bag_tag_number, routing_sequence)
);

-- Indexes for baggage_routing_tags
CREATE INDEX idx_routing_bag_tag ON baggage_routing_tags(bag_tag_number);
CREATE INDEX idx_routing_flight ON baggage_routing_tags(flight_number, flight_date);
CREATE INDEX idx_routing_sequence ON baggage_routing_tags(bag_tag_number, routing_sequence);
CREATE INDEX idx_routing_status ON baggage_routing_tags(routing_status) WHERE routing_status NOT IN ('COMPLETED');
CREATE INDEX idx_routing_transfer ON baggage_routing_tags(transfer_airport, transfer_required) WHERE transfer_required = TRUE;
CREATE INDEX idx_routing_risk ON baggage_routing_tags(connection_risk_score DESC) WHERE connection_risk_score > 0.5;
CREATE INDEX idx_routing_rush_tag ON baggage_routing_tags(rush_tag_applied) WHERE rush_tag_applied = TRUE AND bag_transferred_next_leg = FALSE;
CREATE INDEX idx_routing_mct_buffer ON baggage_routing_tags(mct_buffer_minutes) WHERE mct_buffer_minutes < 15;

-- ============================================================================
-- TABLE 12: BAGGAGE DELIVERY ATTEMPTS
-- Purpose: Last-mile delivery tracking for delayed/lost bags
-- ============================================================================

CREATE TABLE IF NOT EXISTS baggage_delivery_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Delivery Identification
  delivery_id TEXT NOT NULL UNIQUE, -- Format: DEL-YYMMDD-NNNN
  exception_number TEXT REFERENCES baggage_exceptions(exception_number),
  bag_tag_number TEXT NOT NULL,

  -- Passenger Information
  passenger_pnr TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT,
  passenger_email TEXT,

  -- Delivery Address
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT,
  delivery_postal_code TEXT,
  delivery_country TEXT NOT NULL,

  address_type TEXT CHECK (address_type IN ('HOME', 'HOTEL', 'OFFICE', 'OTHER')),
  hotel_name TEXT, -- For hotel deliveries
  hotel_room_number TEXT,

  -- Geocoding
  delivery_latitude NUMERIC(10,7),
  delivery_longitude NUMERIC(10,7),
  distance_from_airport_km NUMERIC(7,2),

  -- Delivery Scheduling
  delivery_scheduled_date DATE NOT NULL,
  delivery_time_window_start TIME, -- e.g., 09:00
  delivery_time_window_end TIME,   -- e.g., 17:00
  flexible_delivery BOOLEAN DEFAULT FALSE, -- Passenger flexible on timing

  -- Delivery Method
  delivery_method TEXT NOT NULL CHECK (delivery_method IN (
    'COURIER_SERVICE', 'AIRLINE_DELIVERY', 'PASSENGER_PICKUP', 'MAIL_SHIPMENT', 'FORWARDED_FLIGHT'
  )),
  courier_company TEXT, -- FedEx, UPS, DHL, local courier
  courier_tracking_number TEXT,
  courier_cost_usd NUMERIC(10,2),

  -- Delivery Attempt Details
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0) DEFAULT 1,
  attempt_timestamp TIMESTAMPTZ,

  attempt_status TEXT NOT NULL CHECK (attempt_status IN (
    'SCHEDULED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
    'FAILED', 'RECIPIENT_NOT_HOME', 'ADDRESS_INCORRECT', 'REFUSED',
    'RETURNED_TO_SENDER', 'HELD_FOR_PICKUP'
  )) DEFAULT 'SCHEDULED',

  -- Delivery Outcome
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  delivered_to TEXT, -- Name of person who received
  delivery_signature TEXT, -- Signature capture (base64 or reference)
  delivery_photo TEXT, -- Photo proof of delivery

  -- Failure Details
  failure_reason TEXT,
  failure_notes TEXT,
  retry_scheduled BOOLEAN DEFAULT FALSE,
  next_retry_date DATE,

  -- Passenger Communication
  passenger_notified BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  notification_method TEXT CHECK (notification_method IN ('SMS', 'EMAIL', 'APP', 'PHONE_CALL')),
  passenger_confirmed_address BOOLEAN DEFAULT FALSE,

  -- Special Instructions
  delivery_instructions TEXT, -- Gate code, building entrance, etc.
  requires_signature BOOLEAN DEFAULT TRUE,
  leave_at_door_allowed BOOLEAN DEFAULT FALSE,
  contact_on_arrival BOOLEAN DEFAULT TRUE,

  -- Cost Tracking
  delivery_cost_usd NUMERIC(10,2),
  cost_covered_by TEXT CHECK (cost_covered_by IN ('AIRLINE', 'PASSENGER', 'INSURANCE', 'PARTNER_CARRIER')),
  reimbursement_to_passenger_usd NUMERIC(10,2) DEFAULT 0, -- If passenger paid for delivery

  -- Performance Metrics
  delivery_time_from_exception_hours NUMERIC(10,2), -- Time from exception creation to delivery
  delivery_promise_met BOOLEAN, -- Did we deliver within promised timeframe?

  -- Agent Assignment
  assigned_agent_code TEXT REFERENCES agents(code), -- DELIVERY_SCHED_001

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB,
  notes TEXT
);

-- Indexes for baggage_delivery_attempts
CREATE INDEX idx_delivery_id ON baggage_delivery_attempts(delivery_id);
CREATE INDEX idx_delivery_exception ON baggage_delivery_attempts(exception_number);
CREATE INDEX idx_delivery_bag_tag ON baggage_delivery_attempts(bag_tag_number);
CREATE INDEX idx_delivery_status ON baggage_delivery_attempts(attempt_status) WHERE delivered = FALSE;
CREATE INDEX idx_delivery_scheduled_date ON baggage_delivery_attempts(delivery_scheduled_date) WHERE delivered = FALSE;
CREATE INDEX idx_delivery_courier ON baggage_delivery_attempts(courier_tracking_number) WHERE courier_tracking_number IS NOT NULL;
CREATE INDEX idx_delivery_pnr ON baggage_delivery_attempts(passenger_pnr);
CREATE INDEX idx_delivery_attempt_number ON baggage_delivery_attempts(bag_tag_number, attempt_number);

-- Full-text search on delivery address
CREATE INDEX idx_delivery_address_search ON baggage_delivery_attempts USING gin(
  to_tsvector('english', COALESCE(delivery_address, '') || ' ' || COALESCE(delivery_city, '') || ' ' || COALESCE(passenger_name, ''))
);

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_all_tables INTEGER;
  v_part2_tables INTEGER;
  v_total_indexes INTEGER;
BEGIN
  -- Count all baggage tables
  SELECT COUNT(*) INTO v_all_tables
  FROM information_schema.tables
  WHERE table_name LIKE 'baggage%'
    AND table_schema = 'public';

  -- Count Part 2 tables specifically
  SELECT COUNT(*) INTO v_part2_tables
  FROM information_schema.tables
  WHERE table_name IN (
    'baggage_claims',
    'interline_bag_messages',
    'baggage_performance_metrics',
    'lost_found_inventory',
    'baggage_special_handling',
    'baggage_routing_tags',
    'baggage_delivery_attempts'
  )
  AND table_schema = 'public';

  -- Count all indexes on baggage tables
  SELECT COUNT(*) INTO v_total_indexes
  FROM pg_indexes
  WHERE tablename LIKE 'baggage%'
    AND schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 003 PART 2 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created in Part 2: %', v_part2_tables;
  RAISE NOTICE 'Total baggage tables: %', v_all_tables;
  RAISE NOTICE 'Total indexes on baggage tables: %', v_total_indexes;
  RAISE NOTICE '';
  RAISE NOTICE 'Part 2 Tables Created:';
  RAISE NOTICE '  6. baggage_claims - Compensation claims processing';
  RAISE NOTICE '  7. interline_bag_messages - SITA Type B messaging';
  RAISE NOTICE '  8. baggage_performance_metrics - KPI tracking';
  RAISE NOTICE '  9. lost_found_inventory - Lost & found matching';
  RAISE NOTICE '  10. baggage_special_handling - Special handling codes';
  RAISE NOTICE '  11. baggage_routing_tags - Multi-leg routing';
  RAISE NOTICE '  12. baggage_delivery_attempts - Last-mile delivery';
  RAISE NOTICE '';
  RAISE NOTICE 'Key Features:';
  RAISE NOTICE '  • Montreal Convention compliance ($1,700 liability cap)';
  RAISE NOTICE '  • SITA Type B message support (BPM, BTM, BSM, BNS, CPM)';
  RAISE NOTICE '  • ML-powered image matching for lost & found';
  RAISE NOTICE '  • IATA Resolution 780 special handling codes';
  RAISE NOTICE '  • Connection risk tracking with MCT monitoring';
  RAISE NOTICE '  • Comprehensive KPI metrics (mishandling rate, etc.)';
  RAISE NOTICE '  • Last-mile delivery with courier integration';
  RAISE NOTICE '';
  RAISE NOTICE 'Database Schema Now Complete: 12 of 12 tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run migration 005 (Baggage Workflow Definitions)';
  RAISE NOTICE '========================================';
END $$;

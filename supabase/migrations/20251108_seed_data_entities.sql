-- Seed Data: Core Airline Operational Data Entities
-- Description: Insert sample data for PNR, E-TKT, FLIFO, INVENTORY, BAGGAGE, SSM, LOYALTY

-- =====================================================
-- 1. SEED DATA ARCHITECTURE LAYERS
-- =====================================================
INSERT INTO data_layers (name, layer_order, description, technologies, icon, color) VALUES
('Source Systems', 1, 'Systems of Record - Where operational data originates',
 '["Amadeus Altea PSS", "Sabre", "DCS", "BRS", "Revenue Management System", "Loyalty Platform"]'::jsonb,
 '🏢', '#ef4444'),

('Operational Data Store', 2, 'Real-time operational data for immediate processing',
 '["AWS DynamoDB", "AWS Kinesis", "AWS Lambda", "AWS EventBridge"]'::jsonb,
 '⚡', '#f59e0b'),

('Data Lake', 3, 'Unified storage for all enterprise data - batch and streaming',
 '["AWS S3 Raw", "AWS S3 Stage", "AWS S3 Parquet", "AWS Glue", "AWS EMR"]'::jsonb,
 '🏞️', '#3b82f6'),

('Analytics & ML', 4, 'Analytics, reporting, and AI/ML model execution',
 '["AWS Redshift", "AWS Sagemaker", "AWS Athena", "AWS Quicksight"]'::jsonb,
 '📊', '#8b5cf6')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. SEED CORE DATA ENTITIES
-- =====================================================

-- PNR (Passenger Name Record)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'PNR',
  'Passenger Name Record',
  '📋',
  'Complete passenger reservation record containing traveler information, itinerary, contact details, and special service requests. Core system of record for all bookings.',
  '{
    "fields": [
      {"name": "recordLocator", "type": "string", "required": true, "description": "6-character unique booking reference"},
      {"name": "paxName", "type": "object", "required": true, "description": "Passenger name (first, last, title)"},
      {"name": "flights", "type": "array", "required": true, "description": "Flight segments in the itinerary"},
      {"name": "contactInfo", "type": "object", "required": true, "description": "Email, phone, address"},
      {"name": "specialServiceRequests", "type": "array", "required": false, "description": "SSRs (meal, wheelchair, etc.)"},
      {"name": "loyaltyNumber", "type": "string", "required": false, "description": "Frequent flyer number"},
      {"name": "bookingDate", "type": "timestamp", "required": true},
      {"name": "pnrStatus", "type": "enum", "required": true, "values": ["Active", "Cancelled", "Ticketed", "Flown"]}
    ]
  }'::jsonb,
  500000,
  7,
  'PII',
  'S3 Batch Raw → DynamoDB → Redshift',
  ARRAY['Amadeus Altea PSS', 'Sabre GDS'],
  92
);

-- E-TKT (Electronic Ticket)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'E_TKT',
  'Electronic Ticket',
  '🎫',
  'Electronic ticket document containing fare calculation, payment information, and ticket validation. Used for revenue accounting and refund processing.',
  '{
    "fields": [
      {"name": "ticketNumber", "type": "string", "required": true, "description": "13-digit ticket number"},
      {"name": "pnrLocator", "type": "string", "required": true, "description": "Associated PNR"},
      {"name": "passengerName", "type": "string", "required": true},
      {"name": "fareCalculation", "type": "object", "required": true, "description": "Fare breakdown and taxes"},
      {"name": "paymentMethod", "type": "object", "required": true},
      {"name": "issueDate", "type": "timestamp", "required": true},
      {"name": "validatingCarrier", "type": "string", "required": true},
      {"name": "ticketStatus", "type": "enum", "values": ["Active", "Used", "Refunded", "Exchanged"]}
    ]
  }'::jsonb,
  450000,
  10,
  'Confidential',
  'S3 Batch Raw → Redshift',
  ARRAY['Ticketing System', 'Amadeus Altea PSS'],
  95
);

-- FLIFO (Flight Information)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'FLIFO',
  'Flight Information',
  '✈️',
  'Real-time and historical flight operational data including schedules, delays, gate assignments, and flight status. Updated continuously throughout flight lifecycle.',
  '{
    "fields": [
      {"name": "flightNumber", "type": "string", "required": true},
      {"name": "flightDate", "type": "date", "required": true},
      {"name": "origin", "type": "string", "required": true, "description": "3-letter airport code"},
      {"name": "destination", "type": "string", "required": true},
      {"name": "scheduledDeparture", "type": "timestamp", "required": true},
      {"name": "actualDeparture", "type": "timestamp"},
      {"name": "scheduledArrival", "type": "timestamp", "required": true},
      {"name": "actualArrival", "type": "timestamp"},
      {"name": "aircraft", "type": "object", "required": true, "description": "Aircraft type and tail number"},
      {"name": "gate", "type": "string"},
      {"name": "flightStatus", "type": "enum", "values": ["Scheduled", "Boarding", "Departed", "In Flight", "Landed", "Cancelled"]},
      {"name": "delayCode", "type": "string"},
      {"name": "paxCount", "type": "integer"},
      {"name": "loadFactor", "type": "number"}
    ]
  }'::jsonb,
  2000,
  2,
  'Internal',
  'Kinesis Stream → DynamoDB → S3',
  ARRAY['Flight Operations System', 'ARINC', 'SITA'],
  88
);

-- INVENTORY (Seat/Class Availability)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'INVENTORY',
  'Seat & Class Availability',
  '💺',
  'Real-time seat inventory and class availability by flight and booking class. Updated continuously with each booking, cancellation, and revenue management optimization.',
  '{
    "fields": [
      {"name": "flightNumber", "type": "string", "required": true},
      {"name": "flightDate", "type": "date", "required": true},
      {"name": "origin", "type": "string", "required": true},
      {"name": "destination", "type": "string", "required": true},
      {"name": "bookingClasses", "type": "array", "required": true, "description": "Y, C, J, F with seat counts"},
      {"name": "totalSeats", "type": "integer", "required": true},
      {"name": "availableSeats", "type": "integer", "required": true},
      {"name": "bookedSeats", "type": "integer", "required": true},
      {"name": "overbookingLimit", "type": "integer"},
      {"name": "lastUpdated", "type": "timestamp", "required": true}
    ]
  }'::jsonb,
  100000000,
  1,
  'Confidential',
  'DynamoDB → Kinesis → S3',
  ARRAY['Revenue Management System', 'Amadeus Altea RM'],
  90
);

-- BAGGAGE (Bag Tracking)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'BAGGAGE',
  'Baggage Tracking Data',
  '🧳',
  'Bag tracking events from check-in through delivery, including scans, transfers, and misconnect events. Critical for operational recovery and customer service.',
  '{
    "fields": [
      {"name": "bagTagNumber", "type": "string", "required": true, "description": "10-digit bag tag"},
      {"name": "pnrLocator", "type": "string", "required": true},
      {"name": "passengerName", "type": "string", "required": true},
      {"name": "origin", "type": "string", "required": true},
      {"name": "destination", "type": "string", "required": true},
      {"name": "flightNumber", "type": "string", "required": true},
      {"name": "bagStatus", "type": "enum", "values": ["Checked", "Loaded", "In Transit", "Arrived", "Claimed", "Misconnected"]},
      {"name": "lastScanLocation", "type": "string"},
      {"name": "lastScanTime", "type": "timestamp"},
      {"name": "weight", "type": "number"},
      {"name": "isMisconnected", "type": "boolean"}
    ]
  }'::jsonb,
  400000,
  1,
  'PII',
  'BRS → Kinesis → DynamoDB → S3',
  ARRAY['Baggage Reconciliation System (BRS)', 'WorldTracer'],
  85
);

-- SSM (Schedule Messages)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'SSM',
  'Schedule Messages (SSM/SSIM)',
  '🗓️',
  'Flight schedule changes and updates distributed to internal systems and external partners. IATA standard messaging for schedule data distribution.',
  '{
    "fields": [
      {"name": "messageType", "type": "enum", "required": true, "values": ["NEW", "CNL", "TIM", "EQT"]},
      {"name": "flightNumber", "type": "string", "required": true},
      {"name": "effectiveDate", "type": "date", "required": true},
      {"name": "discontinueDate", "type": "date"},
      {"name": "daysOfOperation", "type": "string", "required": true, "description": "1234567 for MTWTFSS"},
      {"name": "origin", "type": "string", "required": true},
      {"name": "destination", "type": "string", "required": true},
      {"name": "departureTime", "type": "string", "required": true},
      {"name": "arrivalTime", "type": "string", "required": true},
      {"name": "aircraftType", "type": "string", "required": true},
      {"name": "serviceType", "type": "string"}
    ]
  }'::jsonb,
  500,
  5,
  'Public',
  'Schedule Planning System → S3 → Redshift',
  ARRAY['Schedule Planning System', 'Network Planning'],
  98
);

-- LOYALTY (Frequent Flyer)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'LOYALTY',
  'Loyalty Program Data',
  '👥',
  'Frequent flyer member profiles, tier status, miles/points balances, and transaction history. Used for personalization, upgrades, and customer recognition.',
  '{
    "fields": [
      {"name": "memberNumber", "type": "string", "required": true, "description": "Unique FF number"},
      {"name": "memberName", "type": "object", "required": true},
      {"name": "tierStatus", "type": "enum", "required": true, "values": ["Silver", "Gold", "Platinum", "Diamond"]},
      {"name": "milesBalance", "type": "integer", "required": true},
      {"name": "lifetimeMiles", "type": "integer"},
      {"name": "enrollmentDate", "type": "date", "required": true},
      {"name": "expirationDate", "type": "date"},
      {"name": "contactInfo", "type": "object"},
      {"name": "preferences", "type": "object", "description": "Seat, meal, communication preferences"},
      {"name": "clvScore", "type": "number", "description": "Customer Lifetime Value"}
    ]
  }'::jsonb,
  50000,
  10,
  'PII',
  'Loyalty Platform → DynamoDB → Redshift',
  ARRAY['Loyalty Platform', 'CRM System'],
  93
);

-- MCT (Minimum Connect Time)
INSERT INTO data_entities (
  code, name, icon, description,
  schema_definition,
  volume_per_day, retention_years, sensitivity, storage_location,
  source_systems, data_quality_score
) VALUES (
  'MCT',
  'Minimum Connect Time',
  '⏱️',
  'Minimum connection time rules by airport, terminal, and connection type (domestic-domestic, international-domestic, etc.). Critical for valid connection validation.',
  '{
    "fields": [
      {"name": "airportCode", "type": "string", "required": true},
      {"name": "connectionType", "type": "enum", "required": true, "values": ["D-D", "D-I", "I-D", "I-I"]},
      {"name": "fromTerminal", "type": "string"},
      {"name": "toTerminal", "type": "string"},
      {"name": "minimumMinutes", "type": "integer", "required": true},
      {"name": "effectiveDate", "type": "date", "required": true},
      {"name": "notes", "type": "text"}
    ]
  }'::jsonb,
  10,
  2,
  'Public',
  'S3',
  ARRAY['Network Planning', 'Airport Operations'],
  100
);

-- =====================================================
-- 3. ASSIGN DATA ENTITIES TO LAYERS
-- =====================================================
-- Map each data entity to its primary storage layer(s)

-- PNR: Lives in Source Systems, ODS, and Data Lake
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id,
  CASE WHEN dl.layer_order = 1 THEN true ELSE false END,
  CASE
    WHEN dl.layer_order = 1 THEN 'Binary'
    WHEN dl.layer_order = 2 THEN 'JSON'
    WHEN dl.layer_order = 3 THEN 'Parquet'
  END
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'PNR' AND dl.layer_order IN (1, 2, 3);

-- E-TKT: Source Systems, Data Lake, Analytics
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id,
  CASE WHEN dl.layer_order = 1 THEN true ELSE false END,
  CASE
    WHEN dl.layer_order = 1 THEN 'Binary'
    WHEN dl.layer_order = 3 THEN 'Parquet'
    WHEN dl.layer_order = 4 THEN 'Columnar'
  END
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'E_TKT' AND dl.layer_order IN (1, 3, 4);

-- FLIFO: ODS, Data Lake (real-time streaming)
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id,
  CASE WHEN dl.layer_order = 2 THEN true ELSE false END,
  CASE
    WHEN dl.layer_order = 2 THEN 'JSON'
    WHEN dl.layer_order = 3 THEN 'Parquet'
  END
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'FLIFO' AND dl.layer_order IN (2, 3);

-- INVENTORY: ODS (real-time)
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id, true, 'JSON'
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'INVENTORY' AND dl.layer_order = 2;

-- BAGGAGE: ODS, Data Lake
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id,
  CASE WHEN dl.layer_order = 2 THEN true ELSE false END,
  'JSON'
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'BAGGAGE' AND dl.layer_order IN (2, 3);

-- SSM: Data Lake
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id, true, 'Parquet'
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'SSM' AND dl.layer_order = 3;

-- LOYALTY: Source Systems, Data Lake, Analytics
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id,
  CASE WHEN dl.layer_order = 1 THEN true ELSE false END,
  CASE
    WHEN dl.layer_order = 1 THEN 'Binary'
    WHEN dl.layer_order = 3 THEN 'Parquet'
    WHEN dl.layer_order = 4 THEN 'Columnar'
  END
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'LOYALTY' AND dl.layer_order IN (1, 3, 4);

-- MCT: Data Lake (static reference data)
INSERT INTO data_entity_layers (data_entity_id, data_layer_id, is_primary_layer, storage_format)
SELECT de.id, dl.id, true, 'CSV'
FROM data_entities de
CROSS JOIN data_layers dl
WHERE de.code = 'MCT' AND dl.layer_order = 3;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify seed data

-- SELECT * FROM data_layers ORDER BY layer_order;
-- SELECT * FROM data_entities ORDER BY name;
-- SELECT * FROM v_data_entities_with_usage;

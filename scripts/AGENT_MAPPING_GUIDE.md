# Agent-to-Data Entity Mapping Guide

## Overview

Map your AI agents to data entities to show which agents consume which data in real-time.

## Why Map Agents to Data?

After mapping, your Data Entities page will show:
- **Agent counts** for each data entity (e.g., "5 agents consuming FLIFO")
- **Which specific agents** consume each entity
- **Access patterns** (stream, batch, on-demand)
- **Criticality** (mission-critical vs supporting)
- **Latency requirements** (real-time, near-real-time, batch)

## Quick Start

### Method 1: Python Script ⭐ Recommended

```bash
python scripts/map_agents_to_data.py
```

**What it does:**
- Auto-analyzes all active agents
- Matches them to data entities based on keywords
- Creates mappings with appropriate patterns
- Shows detailed summary

### Method 2: SQL Script

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/map-agents-to-data.sql`
3. Paste and click "Run"

### Method 3: Manual SQL

See examples below for specific mappings.

## Agent Mapping Intelligence

### Delay Detection Agent → FLIFO
**Keywords:** delay, detection, disruption, schedule monitoring
**Pattern:** stream, real-time, continuous
**Critical:** Yes

### Rebooking Agent → PNR + FLIFO + INVENTORY
**Keywords:** rebooking, reaccommodation, disruption recovery
**Pattern:** stream, real-time, per_minute
**Critical:** Yes (all 3 data sources)

### Customer Context Agent → PNR + LOYALTY
**Keywords:** customer, context, profile, history
**Pattern:** on_demand, near-real-time, per_minute
**Critical:** No

### Bag Tracking Agent → BAGGAGE
**Keywords:** bag, baggage, luggage, tracking, misconnect
**Pattern:** stream, real-time, continuous
**Critical:** Yes

### Pricing Agent → INVENTORY
**Keywords:** pricing, revenue, yield, optimization, demand
**Pattern:** batch or stream (depends on type)
**Latency:** near-real-time or batch
**Critical:** No

### Connection Protection Agent → FLIFO + PNR + MCT
**Keywords:** connection, protect, transfer, misconnect
**Pattern:** stream, real-time, continuous
**Critical:** Yes (all 3 data sources)

### Loyalty Tier Agent → LOYALTY
**Keywords:** loyalty, tier, status, member, recognition
**Pattern:** batch, batch, per_day
**Critical:** No

### CLV Scoring Agent → PNR + LOYALTY + E-TKT
**Keywords:** clv, lifetime value, customer value, scoring
**Pattern:** batch, batch, per_day
**Critical:** No

### Refund Processing Agent → E-TKT
**Keywords:** refund, exchange, ticket, processing
**Pattern:** on_demand, near-real-time, per_minute
**Critical:** No

### Weather Rerouting Agent → FLIFO
**Keywords:** weather, reroute, route optimization
**Pattern:** stream, real-time, continuous
**Critical:** Yes

### Crew Scheduling Agent → FLIFO
**Keywords:** crew, scheduling, roster, assignment
**Pattern:** scheduled, near-real-time, per_hour
**Critical:** Yes

### Demand Forecasting Agent → INVENTORY + PNR
**Keywords:** demand, forecast, prediction, trend
**Pattern:** batch, batch, per_day
**Critical:** No

### Schedule Optimization Agent → SSM
**Keywords:** schedule, optimization, planning, network
**Pattern:** batch, batch, per_day
**Critical:** No

## Mapping Parameters

### access_pattern
- `'stream'` - Continuous data stream (Kinesis, real-time)
- `'batch'` - Periodic bulk processing
- `'on_demand'` - Query when needed
- `'scheduled'` - Fixed schedule (hourly, daily)

### latency_requirement
- `'real-time'` - < 100ms response time
- `'near-real-time'` - < 1 second
- `'batch'` - Minutes to hours acceptable

### query_frequency
- `'continuous'` - Always reading stream
- `'per_minute'` - Queries every minute
- `'per_hour'` - Queries every hour
- `'per_day'` - Daily batch processing

### is_critical
- `true` - Mission-critical, failure impacts operations
- `false` - Supporting, optimization, or analytical

## Expected Results

After mapping, typical agent counts per entity:

| Data Entity | Agent Count | Critical Agents |
|-------------|-------------|-----------------|
| FLIFO | 6-10 | Delay Detection, Weather Rerouting, Crew Scheduling |
| PNR | 4-8 | Rebooking, Connection Protection, Customer Context |
| INVENTORY | 3-6 | Pricing, Overbooking, Demand Forecasting |
| LOYALTY | 2-4 | Tier Management, CLV Scoring |
| BAGGAGE | 1-2 | Bag Tracking, Misconnect Recovery |
| E-TKT | 1-2 | Refund Processing, Revenue Recognition |
| SSM | 1-2 | Schedule Optimization |
| MCT | 1-2 | Connection Validation |

## Verification Queries

### Check agent mappings
```sql
SELECT
  de.code,
  de.name,
  COUNT(adm.id) as agent_count,
  COUNT(CASE WHEN adm.is_critical = true THEN 1 END) as critical_count
FROM data_entities de
LEFT JOIN agent_data_mappings adm ON de.id = adm.data_entity_id
GROUP BY de.id, de.code, de.name
ORDER BY agent_count DESC;
```

### Show agents by entity
```sql
SELECT
  de.name as entity,
  a.name as agent,
  adm.access_pattern,
  adm.latency_requirement,
  adm.is_critical
FROM agent_data_mappings adm
JOIN data_entities de ON adm.data_entity_id = de.id
JOIN agents a ON adm.agent_id = a.id
ORDER BY de.name, adm.is_critical DESC;
```

### Find critical real-time agents
```sql
SELECT
  de.code,
  a.name,
  adm.latency_requirement
FROM agent_data_mappings adm
JOIN data_entities de ON adm.data_entity_id = de.id
JOIN agents a ON adm.agent_id = a.id
WHERE adm.is_critical = true
  AND adm.latency_requirement = 'real-time';
```

### Find unmapped agents
```sql
SELECT a.name
FROM agents a
WHERE a.active = true
  AND a.id NOT IN (
    SELECT agent_id FROM agent_data_mappings
  )
ORDER BY a.name;
```

## Manual Mapping Examples

### Map specific agent to data entity
```sql
INSERT INTO agent_data_mappings (
  agent_id,
  data_entity_id,
  access_pattern,
  latency_requirement,
  query_frequency,
  is_critical
)
SELECT
  (SELECT id FROM agents WHERE name = 'Delay Detection Agent'),
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'stream',
  'real-time',
  'continuous',
  true;
```

### Map agent to multiple data sources
```sql
-- Rebooking Agent needs PNR, FLIFO, and INVENTORY
INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement, is_critical)
VALUES
  (
    (SELECT id FROM agents WHERE name = 'Rebooking Agent'),
    (SELECT id FROM data_entities WHERE code = 'PNR'),
    'stream', 'real-time', true
  ),
  (
    (SELECT id FROM agents WHERE name = 'Rebooking Agent'),
    (SELECT id FROM data_entities WHERE code = 'FLIFO'),
    'stream', 'real-time', true
  ),
  (
    (SELECT id FROM agents WHERE name = 'Rebooking Agent'),
    (SELECT id FROM data_entities WHERE code = 'INVENTORY'),
    'stream', 'real-time', true
  );
```

### Update existing mapping
```sql
UPDATE agent_data_mappings
SET
  access_pattern = 'stream',
  latency_requirement = 'real-time',
  is_critical = true
WHERE agent_id = (SELECT id FROM agents WHERE name = 'Your Agent Name')
  AND data_entity_id = (SELECT id FROM data_entities WHERE code = 'FLIFO');
```

## Troubleshooting

### Agents still showing 0 after mapping
1. Verify mappings created: `SELECT COUNT(*) FROM agent_data_mappings;`
2. Check the view: `SELECT * FROM v_data_entities_with_usage;`
3. Hard refresh browser (Ctrl+Shift+R)

### Python script not finding agents
- Check agents table is populated
- Verify agents have `active = true`
- Check agent names match expected patterns

### Duplicate mappings
```sql
DELETE FROM agent_data_mappings
WHERE id NOT IN (
  SELECT MIN(id)
  FROM agent_data_mappings
  GROUP BY agent_id, data_entity_id
);
```

### Reset all agent mappings
```sql
TRUNCATE TABLE agent_data_mappings;
```

## After Mapping

Once mappings are created:

1. **Refresh Data Entities page** (`/data/entities`)
2. **See agent counts** on each entity card
3. **Click entity cards** to see:
   - Which agents consume this data
   - Their access patterns
   - Criticality indicators
   - Latency requirements

## Performance Considerations

### Real-time Agents (Critical)
- **FLIFO streams**: Delay Detection, Weather Rerouting, Connection Protection
- **BAGGAGE streams**: Bag Tracking, Misconnect Recovery
- **Must be < 100ms** latency

### Near Real-time Agents
- **PNR lookups**: Customer Context, Rebooking
- **INVENTORY queries**: Dynamic Pricing
- **Target < 1 second** latency

### Batch Agents (Non-critical)
- **Daily processing**: CLV Scoring, Demand Forecasting, Schedule Optimization
- **Latency not critical**, run during off-peak

---

**Ready to map your agents? Run `python scripts/map_agents_to_data.py` now!**

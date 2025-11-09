# Workflow-to-Data Entity Mapping Guide

## Overview

This guide shows you how to map your workflows to data entities, making your Data Entities page show which workflows consume which data.

## Why Map Workflows to Data?

After mapping, your Data Entities page will show:
- **Workflow counts** for each data entity (e.g., "23 workflows using PNR")
- **Which specific workflows** consume each entity
- **Access patterns** (read/write/read_write)
- **Usage statistics** and relationships

## Three Ways to Map Workflows

### Method 1: Automatic Python Script ⭐ Recommended

The Python script analyzes your workflow names and automatically creates intelligent mappings.

**Prerequisites:**
```bash
pip install supabase python-dotenv
```

**Run the script:**
```bash
cd /home/jbandu/airline
python scripts/map_workflows_to_data.py
```

**What it does:**
- Analyzes all active workflows
- Matches workflows to data entities based on keywords
- Creates mappings with appropriate access types
- Shows summary of what was mapped

**Example output:**
```
📌 Proactive Rebooking
   ✅ → PNR (read_write, near-real-time)
   ✅ → FLIFO (read, real-time)
   ✅ → INVENTORY (read, real-time)

📈 SUMMARY
Total Workflows:           163
Workflows Mapped:          145
Total Mappings Created:    287
```

### Method 2: SQL Script (Batch)

Run the pre-written SQL script in Supabase SQL Editor.

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/map-workflows-to-data.sql`
3. Paste and click "Run"
4. Review verification queries at the end

**What it does:**
- Maps workflows based on name patterns
- Uses subdomain context
- Creates intelligent defaults
- Includes verification queries

### Method 3: Manual SQL (Precise Control)

Create specific mappings for individual workflows.

**Example - Map "Proactive Rebooking" to PNR:**
```sql
INSERT INTO workflow_data_mappings (
  workflow_id,
  data_entity_id,
  access_type,
  is_primary_data,
  volume_estimate,
  latency_requirement
)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'read_write',
  true,
  'high',
  'near-real-time'
FROM workflows w
WHERE w.name = 'Proactive Rebooking';
```

## Mapping Rules

The automatic script uses these intelligent rules:

### Flight Operations → FLIFO
**Keywords:** flight, delay, departure, arrival, dispatch, operations, crew scheduling
**Access:** read_write, real-time, high volume

### Customer Service → PNR
**Keywords:** customer, passenger, service, check-in, boarding, rebooking, disruption
**Access:** read_write, near-real-time, high volume

### Loyalty Programs → LOYALTY
**Keywords:** loyalty, member, upgrade, recognition, tier, miles, points
**Access:** read, near-real-time, medium volume

### Revenue Management → INVENTORY
**Keywords:** revenue, pricing, yield, inventory, seat, availability, capacity, demand
**Access:** read_write, real-time, very high volume

### Ticketing → E-TKT
**Keywords:** ticket, fare, refund, exchange, payment, revenue accounting
**Access:** read_write, near-real-time, high volume

### Ground Operations → BAGGAGE
**Keywords:** bag, luggage, misconnect, ground, ramp, loading
**Access:** read_write, real-time, high volume

### Schedule Planning → SSM
**Keywords:** schedule, planning, network, route, frequency
**Access:** read_write, batch, low volume

### Connections → MCT
**Keywords:** connect, transfer, minimum connect, mct
**Access:** read, on-demand, low volume

## Mapping Parameters

When creating mappings, you specify:

### access_type
- `'read'` - Workflow only reads data
- `'write'` - Workflow only writes data
- `'read_write'` - Workflow reads and writes

### is_primary_data
- `true` - This is the main data source for this workflow
- `false` - Secondary/supporting data

### volume_estimate
- `'low'` - < 1K operations/day
- `'medium'` - 1K-100K operations/day
- `'high'` - 100K-1M operations/day
- `'very_high'` - > 1M operations/day

### latency_requirement
- `'real-time'` - < 100ms
- `'near-real-time'` - < 1 second
- `'batch'` - Minutes to hours
- `'on-demand'` - As needed

## Verification

After mapping, verify with these queries:

### Count mappings per entity
```sql
SELECT
  de.code,
  de.name,
  COUNT(wdm.id) as workflow_count
FROM data_entities de
LEFT JOIN workflow_data_mappings wdm ON de.id = wdm.data_entity_id
GROUP BY de.id, de.code, de.name
ORDER BY workflow_count DESC;
```

### Show all mappings
```sql
SELECT
  de.name as entity,
  w.name as workflow,
  wdm.access_type,
  wdm.volume_estimate
FROM workflow_data_mappings wdm
JOIN data_entities de ON wdm.data_entity_id = de.id
JOIN workflows w ON wdm.workflow_id = w.id
ORDER BY de.name, w.name;
```

### Find unmapped workflows
```sql
SELECT w.name
FROM workflows w
WHERE w.archived_at IS NULL
  AND w.id NOT IN (
    SELECT workflow_id FROM workflow_data_mappings
  )
ORDER BY w.name;
```

## Expected Results

After mapping, you should see:

### Data Entities Page
- **PNR**: 30-50 workflows (most customer-facing processes)
- **FLIFO**: 20-35 workflows (operations and crew)
- **INVENTORY**: 15-25 workflows (revenue and booking)
- **E-TKT**: 10-20 workflows (ticketing and accounting)
- **BAGGAGE**: 8-15 workflows (ground operations)
- **LOYALTY**: 5-10 workflows (customer programs)
- **SSM**: 3-8 workflows (planning)
- **MCT**: 2-5 workflows (connections)

### Entity Detail Modal
When you click on a data entity card, you'll see:
- List of workflows consuming it
- Access type for each
- Primary vs secondary usage

## Troubleshooting

### No workflows showing after mapping
1. Check mappings were created: `SELECT COUNT(*) FROM workflow_data_mappings;`
2. Verify the view: `SELECT * FROM v_data_entities_with_usage;`
3. Hard refresh browser (Ctrl+Shift+R)

### Python script errors
- **Module not found**: Run `pip install supabase python-dotenv`
- **Connection error**: Check `.env` has correct Supabase credentials
- **No workflows found**: Verify workflows table is populated

### Duplicate mappings
```sql
-- Remove duplicates
DELETE FROM workflow_data_mappings
WHERE id NOT IN (
  SELECT MIN(id)
  FROM workflow_data_mappings
  GROUP BY workflow_id, data_entity_id
);
```

### Reset all mappings
```sql
-- Delete all mappings
TRUNCATE TABLE workflow_data_mappings;
-- Then re-run mapping script
```

## Next Steps

After mapping workflows:

1. **View Results**
   - Go to `/data/entities`
   - See workflow counts on each card
   - Click cards to see which workflows

2. **Map Agents to Data** (Option 2)
   - Similar process for AI agents
   - Shows which agents consume which data

3. **Build Visualizations** (Phase 2)
   - Data flow diagrams
   - Workflow-data matrix
   - Impact analysis

## Manual Mapping Examples

### Map specific workflow by name
```sql
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data)
SELECT
  (SELECT id FROM workflows WHERE name = 'Baggage Misconnect Recovery'),
  (SELECT id FROM data_entities WHERE code = 'BAGGAGE'),
  'read_write',
  true;
```

### Map all workflows in a subdomain
```sql
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'read'
FROM workflows w
WHERE w.subdomain_id IN (
  SELECT id FROM subdomains WHERE name LIKE '%Flight Operations%'
);
```

### Add secondary data to workflow
```sql
-- A workflow might use PNR primarily, but also need LOYALTY data
INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type, is_primary_data)
SELECT
  (SELECT id FROM workflows WHERE name = 'Customer Recognition'),
  (SELECT id FROM data_entities WHERE code = 'LOYALTY'),
  'read',
  false  -- Secondary data source
);
```

---

**Ready to map your workflows? Start with Method 1 (Python script) for automatic mapping!**

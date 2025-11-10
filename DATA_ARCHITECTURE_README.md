# Data Architecture Layer - Implementation Guide

## Overview

This feature adds a **DATA ARCHITECTURE** layer to AeroGraph that shows how airline operational data (PNR, E-TKT, FLIFO, INVENTORY, BAGGAGE, SSM, LOYALTY, MCT) flows through your domains, workflows, and agents.

## What's Included

### 1. Database Schema
- **Data Entities**: Core airline operational data objects (PNR, E-TKT, etc.)
- **Workflow-Data Mappings**: Which workflows read/write which data
- **Agent-Data Mappings**: Which agents consume which data
- **Data Layers**: 4-tier architecture (Source → ODS → Lake → Analytics)
- **Data Flows**: How data moves through the system

### 2. Pages Implemented
✅ **Data Entities** (`/data/entities`)
- Card-based view of all data entities
- Shows volume, quality score, sensitivity
- Usage statistics (workflows, agents)
- Filterable by sensitivity level
- Detailed modal with schema fields

⏳ **Coming Soon:**
- Data Flows visualization
- Architecture Layers diagram
- Data Lineage graph

### 3. Navigation
New **DATA ARCHITECTURE** section added to sidebar with:
- Data Entities
- Data Flows (placeholder)
- Architecture Layers (placeholder)
- Data Lineage (placeholder)

## Installation & Setup

### Step 1: Run Database Migrations

You need to run the SQL migrations against your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual execution in Supabase Dashboard
# Go to SQL Editor in Supabase Dashboard and run these files in order:
```

1. **Schema Migration**: `supabase/migrations/20251108_data_entities.sql`
   - Creates tables: `data_entities`, `workflow_data_mappings`, `agent_data_mappings`, `data_layers`, etc.
   - Creates views: `v_data_entities_with_usage`, `v_workflows_with_data`, `v_agents_with_data`

2. **Seed Data**: `supabase/migrations/20251108_seed_data_entities.sql`
   - Seeds 8 core data entities (PNR, E-TKT, FLIFO, INVENTORY, BAGGAGE, SSM, LOYALTY, MCT)
   - Seeds 4 data architecture layers
   - Maps entities to layers

### Step 2: Verify Data

After running migrations, verify in Supabase Dashboard:

```sql
-- Check data entities
SELECT * FROM data_entities ORDER BY name;

-- Check layers
SELECT * FROM data_layers ORDER BY layer_order;

-- Check usage view
SELECT * FROM v_data_entities_with_usage;
```

You should see:
- 8 data entities (PNR, E-TKT, FLIFO, INVENTORY, BAGGAGE, SSM, LOYALTY, MCT)
- 4 data layers (Source Systems, ODS, Data Lake, Analytics)

### Step 3: Build and Run

```bash
# Install any new dependencies (if needed)
npm install

# Start dev server
npm run dev

# Navigate to /data/entities
```

## Data Entities Overview

### 📋 PNR (Passenger Name Record)
- **Volume**: 500K/day
- **Sensitivity**: PII
- **Source**: Amadeus Altea PSS, Sabre GDS
- **Storage**: S3 Batch Raw → DynamoDB → Redshift
- **Quality**: 92%

### 🎫 E-TKT (Electronic Ticket)
- **Volume**: 450K/day
- **Sensitivity**: Confidential
- **Source**: Ticketing System
- **Storage**: S3 Batch Raw → Redshift
- **Quality**: 95%

### ✈️ FLIFO (Flight Information)
- **Volume**: 2K flights/day (~1M events/day)
- **Sensitivity**: Internal
- **Source**: Flight Ops System, ARINC, SITA
- **Storage**: Kinesis Stream → DynamoDB → S3
- **Quality**: 88%

### 💺 INVENTORY (Seat Availability)
- **Volume**: 100M queries/day
- **Sensitivity**: Confidential
- **Source**: Revenue Management System
- **Storage**: DynamoDB (real-time)
- **Quality**: 90%

### 🧳 BAGGAGE (Bag Tracking)
- **Volume**: 400K bags/day
- **Sensitivity**: PII
- **Source**: BRS, WorldTracer
- **Storage**: BRS → Kinesis → DynamoDB → S3
- **Quality**: 85%

### 🗓️ SSM (Schedule Messages)
- **Volume**: 500/day
- **Sensitivity**: Public
- **Source**: Schedule Planning System
- **Storage**: S3 Parquet
- **Quality**: 98%

### 👥 LOYALTY (Frequent Flyer)
- **Volume**: 50K transactions/day
- **Sensitivity**: PII
- **Source**: Loyalty Platform, CRM
- **Storage**: DynamoDB → Redshift
- **Quality**: 93%

### ⏱️ MCT (Minimum Connect Time)
- **Volume**: Static reference data
- **Sensitivity**: Public
- **Source**: Network Planning
- **Storage**: S3 CSV
- **Quality**: 100%

## Mapping Data to Workflows & Agents

### Example: Map PNR to Workflows

```sql
-- Map PNR to "Proactive Rebooking" workflow
INSERT INTO workflow_data_mappings (
  workflow_id,
  data_entity_id,
  access_type,
  is_primary_data,
  volume_estimate
)
SELECT
  w.id,
  (SELECT id FROM data_entities WHERE code = 'PNR'),
  'read_write',
  true,
  'high'
FROM workflows w
WHERE w.name = 'Proactive Rebooking';
```

### Example: Map FLIFO to Agents

```sql
-- Map FLIFO to "Delay Detection Agent"
INSERT INTO agent_data_mappings (
  agent_id,
  data_entity_id,
  access_pattern,
  latency_requirement,
  is_critical
)
SELECT
  a.id,
  (SELECT id FROM data_entities WHERE code = 'FLIFO'),
  'stream',
  'real-time',
  true
FROM agents a
WHERE a.name = 'Delay Detection Agent';
```

## Architecture Layers

The data flows through 4 tiers:

```
┌─────────────────────────────────────────┐
│  4. ANALYTICS & ML                      │
│     Redshift, Sagemaker, Athena         │
│     → Your 21 AI Agents live here       │
└─────────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────────┐
│  3. DATA LAKE                           │
│     S3 (Raw, Stage, Parquet)            │
│     → Your 163 Workflows write here     │
└─────────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────────┐
│  2. OPERATIONAL DATA STORE              │
│     DynamoDB, Kinesis, Lambda           │
└─────────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────────┐
│  1. SOURCE SYSTEMS                      │
│     PSS, DCS, BRS, RM, Loyalty          │
│     → Your 22 Domains map here          │
└─────────────────────────────────────────┘
```

## Next Steps

### Phase 1: Map Your Existing Data ✅
1. Run migrations ✅
2. View data entities ✅
3. Map workflows to data entities (manual SQL)
4. Map agents to data entities (manual SQL)

### Phase 2: Build Additional Pages
1. **Data Flows** - Sankey diagram showing data movement
2. **Architecture Layers** - Interactive 4-tier diagram
3. **Data Lineage** - Network graph showing lineage

### Phase 3: Add Domain-Data Mapping
1. Map data entities to domains
2. Show which domains produce/consume which data
3. Data-to-Domain relationship view

## Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- Tables already created. Drop and recreate if needed:
```sql
DROP TABLE IF EXISTS data_flows CASCADE;
DROP TABLE IF EXISTS data_entity_layers CASCADE;
DROP TABLE IF EXISTS agent_data_mappings CASCADE;
DROP TABLE IF EXISTS workflow_data_mappings CASCADE;
DROP TABLE IF EXISTS data_layers CASCADE;
DROP TABLE IF EXISTS data_entities CASCADE;

-- Then re-run migrations
```

**Error: "foreign key constraint"**
- Make sure `workflows` and `agents` tables exist
- Check that referenced IDs are valid

### No Data Showing

**Empty data entities page**
- Verify seed data ran: `SELECT * FROM data_entities;`
- Check permissions: tables should be accessible to authenticated users

### TypeScript Errors

```bash
# Regenerate database types
npx supabase gen types typescript --local > src/types/database.types.ts
```

## Sample Queries

### Most Used Data Entities
```sql
SELECT * FROM v_data_entities_with_usage
ORDER BY total_usage_count DESC
LIMIT 10;
```

### Workflows by Data Entity
```sql
SELECT
  de.name as entity_name,
  w.name as workflow_name,
  wdm.access_type
FROM workflow_data_mappings wdm
JOIN data_entities de ON wdm.data_entity_id = de.id
JOIN workflows w ON wdm.workflow_id = w.id
ORDER BY de.name, w.name;
```

### Agents by Data Entity
```sql
SELECT
  de.name as entity_name,
  a.name as agent_name,
  adm.access_pattern,
  adm.latency_requirement
FROM agent_data_mappings adm
JOIN data_entities de ON adm.data_entity_id = de.id
JOIN agents a ON adm.agent_id = a.id
ORDER BY de.name, a.name;
```

## API Usage Examples

### Fetch All Data Entities
```typescript
const { data, error } = await supabase
  .from('v_data_entities_with_usage')
  .select('*')
  .order('name');
```

### Fetch Entity with Workflows
```typescript
const { data, error } = await supabase
  .from('data_entities')
  .select(`
    *,
    workflow_mappings:workflow_data_mappings(
      *,
      workflow:workflows(*)
    )
  `)
  .eq('code', 'PNR')
  .single();
```

---

**Questions or Issues?**
- Check `/supabase/migrations/` for SQL schema
- See `/src/types/data-entities.types.ts` for TypeScript interfaces
- Review `/src/pages/DataEntities.tsx` for implementation example

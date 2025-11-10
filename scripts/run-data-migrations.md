# How to Run Data Architecture Migrations

## Why Data Entities Shows Zeros

The Data Entities page is showing zeros because the database tables haven't been populated yet. You need to run the SQL migrations in your Supabase database.

## Step-by-Step Instructions

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run Schema Migration**
   - Copy the entire contents of: `supabase/migrations/20251108_data_entities.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message

4. **Run Seed Data Migration**
   - Create another new query
   - Copy the entire contents of: `supabase/migrations/20251108_seed_data_entities.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for "Success" message

5. **Verify Data**
   - Run this query to check:
   ```sql
   SELECT * FROM data_entities ORDER BY name;
   ```
   - You should see 8 rows (PNR, E-TKT, FLIFO, INVENTORY, BAGGAGE, SSM, LOYALTY, MCT)

6. **Check the View**
   ```sql
   SELECT * FROM v_data_entities_with_usage;
   ```
   - Should show same 8 rows with usage counts (will be 0 until you map workflows/agents)

### Option 2: Supabase CLI

```bash
# Navigate to project directory
cd /home/jbandu/airline

# Login to Supabase (if not already)
supabase login

# Link to your project (if not already linked)
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### Option 3: Direct Database Connection

If you have psql installed:

```bash
# Set environment variable
export DATABASE_URL="your_supabase_database_url"

# Run schema migration
psql $DATABASE_URL -f supabase/migrations/20251108_data_entities.sql

# Run seed data
psql $DATABASE_URL -f supabase/migrations/20251108_seed_data_entities.sql
```

## What Gets Created

### Tables (6 new tables):
- `data_entities` - 8 airline data objects
- `workflow_data_mappings` - Links workflows to data
- `agent_data_mappings` - Links agents to data
- `data_layers` - 4 architecture layers
- `data_entity_layers` - Maps entities to layers
- `data_flows` - Data flow definitions

### Views (3 new views):
- `v_data_entities_with_usage` - Entities with counts
- `v_workflows_with_data` - Workflows with data
- `v_agents_with_data` - Agents with data

### Seed Data:
- 8 Data Entities (PNR, E-TKT, FLIFO, etc.)
- 4 Data Layers (Source, ODS, Lake, Analytics)
- Mappings of entities to layers

## After Running Migrations

1. **Refresh your browser** on the Data Entities page (`/data/entities`)
2. You should now see:
   - Total Entities: 8
   - Daily Volume: 101M+
   - Avg Quality Score: ~92%
   - PII Entities: 3

3. **The cards should show**:
   - 📋 PNR
   - 🎫 E-TKT
   - ✈️ FLIFO
   - 💺 INVENTORY
   - 🧳 BAGGAGE
   - 🗓️ SSM
   - 👥 LOYALTY
   - ⏱️ MCT

## Troubleshooting

### Error: "relation already exists"
The tables were already created. To recreate:
```sql
DROP TABLE IF EXISTS data_flows CASCADE;
DROP TABLE IF EXISTS data_entity_layers CASCADE;
DROP TABLE IF EXISTS agent_data_mappings CASCADE;
DROP TABLE IF EXISTS workflow_data_mappings CASCADE;
DROP TABLE IF EXISTS data_layers CASCADE;
DROP TABLE IF EXISTS data_entities CASCADE;
-- Then re-run the migrations
```

### Still showing zeros after migration
1. Check the browser console for errors
2. Verify tables exist: `\dt` in psql or check "Table Editor" in Supabase
3. Check data: `SELECT COUNT(*) FROM data_entities;` should return 8
4. Check RLS policies (may need to disable or configure)

### Can't connect to Supabase
1. Verify your `.env` file has correct credentials
2. Check Supabase project is running
3. Verify network connectivity

## Next Steps

After migrations run successfully:

1. **Map Your Workflows to Data** (Optional)
   ```sql
   -- Example: Map a workflow to PNR
   INSERT INTO workflow_data_mappings (workflow_id, data_entity_id, access_type)
   SELECT
     w.id,
     (SELECT id FROM data_entities WHERE code = 'PNR'),
     'read_write'
   FROM workflows w
   WHERE w.name = 'Your Workflow Name';
   ```

2. **Map Your Agents to Data** (Optional)
   ```sql
   -- Example: Map an agent to FLIFO
   INSERT INTO agent_data_mappings (agent_id, data_entity_id, access_pattern, latency_requirement)
   SELECT
     a.id,
     (SELECT id FROM data_entities WHERE code = 'FLIFO'),
     'stream',
     'real-time'
   FROM agents a
   WHERE a.name = 'Your Agent Name';
   ```

3. The usage counts will update once you add mappings!

## Need Help?

- Check `DATA_ARCHITECTURE_README.md` for complete documentation
- Review migration files in `supabase/migrations/`
- Check Supabase logs for errors

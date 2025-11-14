# Complete Baggage Migration Sequence

## Quick Summary

Run these 6 migrations in order in Supabase SQL Editor:

1. ✅ **000** - Fix domains table schema (DONE)
2. ✅ **001** - Baggage domains & subdomains (DONE)
3. ✅ **002** - Agent categories (DONE)
4. ✅ **003** - Core baggage tables (DONE)
5. ✅ **004** - Agent definitions (DONE)
6. ⏳ **005** - Workflow definitions (ERROR - need to run FINAL version)
7. ⏳ **006** - Fix agent links (PENDING)

---

## Remaining Migrations to Run

### Migration 005 (FIXED VERSION)

**File**: `005_baggage_workflow_definitions_FINAL.sql`

**Status**: Previous version had schema error, run the FINAL version

**What it does**: Creates 30 operational workflows across 5 baggage domains

**Expected output**:
```
✅ MIGRATION 005 COMPLETE
Workflows created: 30
  - Wave 1 (Foundation): 8
  - Wave 2 (Optimization): 14
  - Wave 3 (Advanced): 8
```

**Guide**: See `RUN_005_FIXED.md` for detailed instructions

---

### Migration 006 (NEW - Fixes Agent Links)

**File**: `006_add_agent_workflow_counts.sql`

**Status**: NOT YET RUN

**What it does**: Adds `workflow_count` and `active_instances` to all 18 baggage agents

**Why needed**: The agents at https://valayam.app/agents don't show links because they're missing these fields

**Expected output**:
```
✅ MIGRATION 006 COMPLETE
Updated 18 baggage agents with workflow_count and active_instances
Agents should now appear properly in Agent Network view
```

**Guide**: See `FIX_AGENT_LINKS.md` for detailed instructions

---

## Complete System After All Migrations

### Database Objects Created

**Domains**: 5
- Baggage Operations & Tracking
- Baggage Exception Management
- Interline Baggage Coordination
- Baggage Compensation & Claims
- Baggage Analytics & Optimization

**Subdomains**: 18 (across 5 domains)

**Agent Categories**: 8
- BAG_IN, LOAD, TRACK, RISK, EXCEPT, LNF, COMP, INTER

**Agents**: 18
- 8 core agents
- 10 supporting agents

**Baggage Tables**: 12
- baggage_items
- baggage_scan_events
- baggage_exceptions
- baggage_connections
- baggage_compensation_rules
- baggage_claims
- interline_bag_messages
- baggage_performance_metrics
- lost_found_inventory
- baggage_special_handling
- baggage_routing_tags
- baggage_delivery_attempts

**Workflows**: 30 (across 5 domains)
- Wave 1: 8 workflows
- Wave 2: 14 workflows
- Wave 3: 8 workflows

---

## Running the Migrations

### Step 1: Run Migration 005 (FINAL version)

```sql
-- Open: 005_baggage_workflow_definitions_FINAL.sql
-- Copy all contents
-- Paste into Supabase SQL Editor
-- Click Run
```

### Step 2: Run Migration 006

```sql
-- Open: 006_add_agent_workflow_counts.sql
-- Copy all contents
-- Paste into Supabase SQL Editor
-- Click Run
```

### Step 3: Verify Everything

Run this verification query:

```sql
-- Check all baggage objects
SELECT
  'Domains' as type,
  COUNT(*) as count
FROM domains
WHERE name LIKE '%Baggage%'

UNION ALL

SELECT 'Subdomains', COUNT(*)
FROM subdomains sd
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'

UNION ALL

SELECT 'Agent Categories', COUNT(*)
FROM agent_categories
WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')

UNION ALL

SELECT 'Agents', COUNT(*)
FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')

UNION ALL

SELECT 'Agents with Links', COUNT(*)
FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
  AND workflow_count IS NOT NULL
  AND active_instances IS NOT NULL

UNION ALL

SELECT 'Baggage Tables', COUNT(*)::BIGINT
FROM pg_tables
WHERE tablename LIKE 'baggage%' AND schemaname = 'public'

UNION ALL

SELECT 'Workflows', COUNT(*)
FROM workflows w
JOIN subdomains sd ON w.subdomain_id::TEXT = sd.id::TEXT
JOIN domains d ON sd.domain_id::TEXT = d.id::TEXT
WHERE d.name LIKE '%Baggage%';
```

**Expected Results**:
```
type                | count
--------------------+-------
Domains             |     5
Subdomains          |    18
Agent Categories    |     8
Agents              |    18
Agents with Links   |    18  ← Should be 18 after migration 006
Baggage Tables      |    12
Workflows           |    30
```

---

## After Completion

### Test the System

1. **Domains Page** (`/domains`)
   - Should show 5 baggage domains
   - Each with proper subdomain counts
   - Each with workflow counts

2. **Agent Network** (`/agents`)
   - Should show all 18 baggage agents
   - Each with workflow_count displayed
   - Each with active_instances displayed
   - Collaboration links/edges visible between agents
   - Network metrics showing proper totals

3. **Workflows Page** (`/workflows`)
   - Filter by baggage domains
   - Should show 30 workflows
   - Wave distribution: Wave 1 (8), Wave 2 (14), Wave 3 (8)
   - Complexity distribution visible

---

## Target ROI

**Copa Airlines Baggage Intelligence System**
- **Annual Savings**: $6.3M
- **Calculation**: $150/bag × 42,000 bags saved
- **8-Agent LangGraph** orchestration system
- **30 automated workflows** across 5 operational domains

---

## Troubleshooting

### If 005 fails again
- Make sure you're using `005_baggage_workflow_definitions_FINAL.sql` (not MINIMAL or CORRECTED)
- Check that domains and subdomains from 001 exist
- Report the exact error message

### If 006 fails
- Check that agents from 004 exist: `SELECT COUNT(*) FROM agents WHERE code LIKE '%_001'`
- The migration uses UPDATE statements, so it's safe to run multiple times
- If agents don't exist, run migration 004 first

### If agents still don't show links
- Run the verification query above
- Check "Agents with Links" count - should be 18
- Refresh browser with Cmd/Ctrl + Shift + R (hard refresh)
- Check browser console for errors

---

**Ready to complete the baggage system! Run migrations 005 (FINAL) and 006.** 🚀

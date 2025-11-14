# UUID Type Mismatch - Issue & Solution

## Error You Saw

```
ERROR: 22P02: invalid input syntax for type uuid: "285"
CONTEXT: SQL statement at line 32
```

## What Happened

There's a **fundamental type mismatch** between two sets of tables:

### Original Schema (UUID-based)
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  subdomain_id UUID REFERENCES subdomains(id),  -- Expects UUID!
  ...
);
```

### Baggage Migrations Created (BIGINT-based)
```sql
-- Migration 001 created these with BIGINT IDs
INSERT INTO domains (id, name, ...) VALUES (1, 'Baggage Operations', ...);
INSERT INTO subdomains (id, domain_id, name) VALUES (285, 1, 'Check-In', ...);
```

### The Conflict
- Migration 005 tried to link workflows to subdomain ID `285` (a BIGINT)
- But workflows table expects a UUID like `'a1b2c3d4-e5f6-...'`
- **You can't convert the number 285 into UUID format!**

---

## Why This Happened

**Migration 000** fixed a schema issue where BIGINT columns had UUID defaults. This created BIGINT-based domains/subdomains.

**But** the original workflows table was already created with UUID expectations.

Result: **Two incompatible schemas coexisting**

---

## Solution

Use the new file: **`005_baggage_workflows_UUID_FIX.sql`**

### What It Does Differently

1. **Inserts into UUID-based domains table** (not BIGINT)
   ```sql
   INSERT INTO domains (name, description, icon_url)
   VALUES ('Baggage Operations & Tracking', ..., NULL)
   RETURNING id INTO v_domain_ops;  -- Returns a UUID
   ```

2. **Inserts into UUID-based subdomains table**
   ```sql
   INSERT INTO subdomains (domain_id, name, description)
   VALUES (v_domain_ops, 'Check-In & Tagging Operations', ...)
   RETURNING id INTO v_sd_checkin;  -- Returns a UUID
   ```

3. **Creates workflows with UUID references**
   ```sql
   INSERT INTO workflows (name, subdomain_id, ...)
   VALUES ('Bag Check-In & Tagging', v_sd_checkin, ...);  -- Works!
   ```

### Key Features
- Uses `ON CONFLICT (name) DO UPDATE` to avoid duplicates
- Won't create duplicate domains if they already exist
- Properly returns UUID values with `RETURNING id INTO`
- Creates all 30 workflows linked to UUID subdomains

---

## How to Run

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   ```

2. **Run the UUID Fix Version**
   - File: `005_baggage_workflows_UUID_FIX.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

3. **Expected Output**
   ```
   NOTICE: ✓ Created/updated 5 baggage domains and 17 subdomains (UUID-based)
   NOTICE: ✓ Created 30 baggage workflows

   ========================================
   ✅ MIGRATION 005 COMPLETE (UUID FIX)
   ========================================
   Baggage domains: 5
   Baggage subdomains: 17
   Baggage workflows: 30

   🎉 ALL BAGGAGE MIGRATIONS COMPLETE!
   ========================================
   ```

---

## What About the BIGINT Domains/Subdomains?

The BIGINT-based baggage domains/subdomains from migration 001 will remain in your database, but they won't be used by workflows. This is okay because:

1. They don't interfere with the UUID-based ones
2. The agent categories (migration 002) still work fine
3. The workflows will use the UUID-based domains/subdomains

If you want to clean them up later (optional):
```sql
-- Check if there are BIGINT-based baggage domains
SELECT id, name, pg_typeof(id) as id_type
FROM domains
WHERE name LIKE '%Baggage%' AND pg_typeof(id) = 'bigint'::regtype;

-- Delete them if found (optional cleanup)
DELETE FROM subdomains WHERE pg_typeof(id) = 'bigint'::regtype;
DELETE FROM domains WHERE pg_typeof(id) = 'bigint'::regtype;
```

---

## After Running UUID Fix

### Then Run Migration 006
Once migration 005 (UUID FIX) succeeds, run migration 006 to fix the agent links:

**File**: `006_add_agent_workflow_counts.sql`

This adds `workflow_count` and `active_instances` to the 18 baggage agents so they show proper links at https://valayam.app/agents

---

## Technical Summary

| Issue | Resolution |
|-------|------------|
| **Problem** | BIGINT subdomain IDs can't be used with UUID workflows table |
| **Root Cause** | Migration 000 created BIGINT domains, but workflows expects UUIDs |
| **Solution** | Insert baggage domains/subdomains with UUID generation |
| **File to Run** | `005_baggage_workflows_UUID_FIX.sql` |
| **Safe to Rerun** | Yes - uses `ON CONFLICT` clauses |
| **Next Step** | Run migration 006 to fix agent links |

---

**Run `005_baggage_workflows_UUID_FIX.sql` to complete the baggage workflow setup!** ✅

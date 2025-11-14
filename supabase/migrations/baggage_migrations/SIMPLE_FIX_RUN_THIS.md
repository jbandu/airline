# Simple Fix - Run This Migration

## What's Happening

You're getting UUID/BIGINT type mismatch errors because:
- Your domains table uses BIGINT IDs (like 59)
- But subdomains table expects UUID domain_id
- This creates an incompatible schema

**Error**: `invalid input syntax for type uuid: "59"`

---

## Quick Solution - Use Workaround Migration

Instead of creating new domains/subdomains (which causes type conflicts), this migration:
1. Uses an **existing** subdomain from your database
2. Creates all 30 baggage workflows linked to that subdomain
3. You can reassign workflows to proper subdomains later through the UI

---

## Run This File

**File**: `005_WORKAROUND_use_existing_domains.sql`

### Steps:

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   ```

2. **Copy and run** `005_WORKAROUND_use_existing_domains.sql`

3. **Expected Output**:
   ```
   NOTICE: Found existing domain: <uuid>, subdomain: <uuid>
   NOTICE: Will create workflows linked to this subdomain temporarily

   ========================================
   ✅ WORKAROUND MIGRATION COMPLETE
   ========================================
   Created 30 baggage workflows

   ⚠️  NOTE: All workflows linked to subdomain: <uuid>

   Next steps:
   1. Run migration 006 to fix agent links
   2. Optionally reassign workflows to proper subdomains via UI
   ========================================
   ```

---

## After This Succeeds

### Step 1: Fix Agent Links

Run **`006_add_agent_workflow_counts.sql`** to add missing fields to baggage agents.

This will make them show proper links at https://valayam.app/agents

### Step 2: Verify Workflows Were Created

Visit https://valayam.app/workflows and you should see:
- 30 new baggage workflows
- Wave distribution: Wave 1 (8), Wave 2 (14), Wave 3 (8)
- All workflows visible and filterable

---

## Why This Workaround Works

Instead of fighting the type mismatch, we:
- ✅ Skip creating new domains/subdomains
- ✅ Use existing UUID-based subdomains
- ✅ Create workflows that work with your existing schema
- ✅ Workflows are still fully functional

The only "downside" is all 30 workflows initially show under one subdomain. But you can:
- Edit each workflow in the UI to assign proper subdomain
- Or they still work fine for testing/demonstration purposes

---

## Optional: Understand The Type Mismatch

If you want to understand what's happening, run the diagnostic:

**File**: `000_DIAGNOSTIC_RUN_THIS_FIRST.sql`

This shows you the exact data types of:
- domains.id
- subdomains.id and subdomains.domain_id
- workflows.id and workflows.subdomain_id

See `UUID_TYPE_MISMATCH_EXPLAINED.md` for detailed explanation.

---

## Summary

| Step | File | Purpose |
|------|------|---------|
| 1 | `005_WORKAROUND_use_existing_domains.sql` | Create 30 workflows (linked to existing subdomain) |
| 2 | `006_add_agent_workflow_counts.sql` | Fix agent links |
| 3 | Visit `/workflows` | Verify 30 workflows exist |
| 4 | Visit `/agents` | Verify agents show links |

---

**Run `005_WORKAROUND_use_existing_domains.sql` now!** ✅

This will get your baggage workflows created without fighting the UUID/BIGINT mismatch.

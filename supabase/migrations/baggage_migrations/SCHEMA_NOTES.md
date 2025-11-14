# Actual Schema - Column Reference

Based on errors encountered, here are the **actual columns** that exist in your tables:

## ✅ Confirmed Schema

### `domains` table
- ✅ `id` (BIGINT, auto-increment)
- ✅ `name` (TEXT)
- ✅ `description` (TEXT)
- ✅ `color` (TEXT)
- ✅ `icon_url` (TEXT, nullable)
- ❌ `icon` - Does NOT exist
- ❌ `created_at` - Does NOT exist
- ❌ `updated_at` - Does NOT exist

### `subdomains` table
- ✅ `id` (BIGINT, auto-increment)
- ✅ `domain_id` (BIGINT, FK to domains)
- ✅ `name` (TEXT)
- ✅ `description` (TEXT)
- ❌ `created_at` - Does NOT exist
- ❌ `updated_at` - Does NOT exist
- ❌ `created_by` - Probably does NOT exist

### `agent_categories` table
- ✅ `code` (TEXT, PK)
- ✅ `name` (TEXT)
- ✅ `description` (TEXT)
- ✅ `icon` (TEXT)
- ✅ `color` (TEXT)
- ❌ `created_at` - Does NOT exist
- ❌ `updated_at` - Does NOT exist

### `agents` table (likely schema)
- ✅ `id` or `code` (PK)
- ✅ `name` (TEXT)
- ✅ `category_code` (TEXT, FK to agent_categories)
- ✅ `description` (TEXT)
- ✅ `autonomy_level` (INTEGER)
- ✅ `metadata` (JSONB)
- ✅ `active` (BOOLEAN)
- ⚠️ `workflow_count` - May or may not exist
- ⚠️ `active_instances` - May or may not exist
- ❌ `created_at` - Probably does NOT exist
- ❌ `updated_at` - Probably does NOT exist

### `workflows` table (CORRECTED - actual schema)
- ✅ `id` (UUID, auto-generated)
- ✅ `name` (TEXT)
- ✅ `subdomain_id` (UUID, FK to subdomains) - **NOTE: UUID, not BIGINT**
- ✅ `domain_id` (UUID, FK to domains, nullable)
- ✅ `description` (TEXT)
- ✅ `implementation_wave` (INTEGER 1-3) - **NOT** `wave`
- ✅ `complexity` (INTEGER 1-5) - **NOT** text values
  - **Mapping**: 1-2 = Low, 3 = Medium, 4-5 = High
- ✅ `status` (TEXT) - lowercase: 'draft', 'planned', 'in-progress', 'completed', 'archived'
- ✅ `agentic_potential` (INTEGER 1-5)
- ✅ `autonomy_level` (INTEGER 1-5)
- ✅ `airline_type` (TEXT[])
- ✅ `agentic_function_type` (TEXT)
- ✅ `ai_enablers` (TEXT[])
- ✅ `systems_involved` (TEXT[])
- ✅ `business_context` (TEXT)
- ✅ `expected_roi` (TEXT)
- ✅ `dependencies` (TEXT[])
- ✅ `success_metrics` (JSONB)
- ✅ `version` (INTEGER, default 1)
- ✅ `created_by` (UUID, nullable)
- ✅ `created_at` (TIMESTAMPTZ, default now())
- ✅ `updated_at` (TIMESTAMPTZ, default now())
- ✅ `archived_at` (TIMESTAMPTZ, nullable)
- ✅ `parent_workflow_id` (UUID, FK to workflows, nullable)
- ❌ `wave` - Does NOT exist (use `implementation_wave`)
- ❌ `business_value`, `technical_feasibility`, `effort_estimate`, `impact_score`, `priority_score` - Do NOT exist

## 🎯 Migration Strategy

For all remaining migrations (003, 004, 005):
1. ❌ **Do NOT include** `created_at`, `updated_at`, `created_by` columns
2. ❌ **Do NOT include** `icon` column (only `icon_url` exists)
3. ✅ **Only use** core columns listed above

## 📝 Files to Use

| Migration | Correct File |
|-----------|-------------|
| 000 | `000_fix_domains_table_schema_v2.sql` |
| 001 | `001_baggage_domains_subdomains_MINIMAL.sql` ✅ |
| 002 | `002_baggage_agent_categories_MINIMAL.sql` ✅ |
| 003 | Need to check/create MINIMAL version |
| 004 | Need to check/create MINIMAL version |
| 005 | Need to check/create MINIMAL version |

## 🔍 How to Check Your Schema

Run this in Supabase SQL Editor to see actual columns:

```sql
-- Check domains table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'domains'
ORDER BY ordinal_position;

-- Check subdomains table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subdomains'
ORDER BY ordinal_position;

-- Check agent_categories table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'agent_categories'
ORDER BY ordinal_position;

-- Check agents table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'agents'
ORDER BY ordinal_position;

-- Check workflows table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'workflows'
ORDER BY ordinal_position;
```

This will show you the **exact columns** that exist in each table.

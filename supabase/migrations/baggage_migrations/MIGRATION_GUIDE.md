# Baggage Migrations - Execution Guide

**Status:** Ready to Run
**Database:** `db.jhhihlkjnicktyvycmig.supabase.co`
**Method:** Supabase Dashboard SQL Editor

---

## ✅ Correct Files to Run (In Order)

Your schema uses `bigint` IDs and doesn't have an `icon` column. Use these versions:

### 1️⃣ Schema Fix (Run First)
**File:** `000_fix_domains_table_schema_v2.sql`
**What it does:** Fixes UUID default on bigint columns
**Time:** 10 seconds

### 2️⃣ Baggage Domains & Subdomains
**File:** `001_baggage_domains_subdomains_FINAL.sql` ⭐ **USE THIS ONE**
**What it creates:** 5 domains + 18 subdomains
**Time:** 20 seconds

### 3️⃣ Agent Categories
**File:** `002_baggage_agent_categories.sql`
**What it creates:** 8 agent categories
**Time:** 10 seconds

### 4️⃣ Core Tables (Part 1)
**File:** `003_core_baggage_tables.sql`
**What it creates:** First 5 baggage tables
**Time:** 30 seconds

### 5️⃣ Core Tables (Part 2)
**File:** `003_core_baggage_tables_part2.sql`
**What it creates:** Remaining 7 baggage tables (12 total)
**Time:** 40 seconds

### 6️⃣ Agent Definitions
**File:** `004_baggage_agent_definitions.sql`
**What it creates:** 18 AI agents with full metadata
**Time:** 30 seconds

### 7️⃣ Workflow Definitions
**File:** `005_baggage_workflow_definitions.sql`
**What it creates:** 30 operational workflows
**Time:** 60 seconds

---

## ❌ Files to IGNORE (Old/Broken Versions)

- ~~`000_fix_domains_table_schema.sql`~~ (syntax error - use v2)
- ~~`001_baggage_domains_subdomains.sql`~~ (has `icon` column - doesn't exist)
- ~~`001_baggage_domains_subdomains_FIXED.sql`~~ (still has `icon` column)

**Only use the FINAL version:** `001_baggage_domains_subdomains_FINAL.sql`

---

## 🚀 Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   ```

2. **Copy/Paste/Run Each File:**
   - Open file in Claude Code
   - Select All → Copy
   - Paste into SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)
   - Wait for "Success" message
   - Check NOTICE messages in output

3. **Run in This Order:**
   ```
   ✅ 000_fix_domains_table_schema_v2.sql
   ✅ 001_baggage_domains_subdomains_FINAL.sql
   ✅ 002_baggage_agent_categories.sql
   ✅ 003_core_baggage_tables.sql
   ✅ 003_core_baggage_tables_part2.sql
   ✅ 004_baggage_agent_definitions.sql
   ✅ 005_baggage_workflow_definitions.sql
   ```

**Total Time:** ~3-5 minutes

---

## 📊 Expected Results

After all migrations:

| Item | Count |
|------|-------|
| Baggage Domains | 5 |
| Baggage Subdomains | 18 |
| Agent Categories | 8 |
| Agents | 18 |
| Database Tables | 12 |
| Workflows | 30 |
| Database Indexes | 40+ |

---

## ✅ Verification Queries

Run after completing all migrations:

### Quick Check
```sql
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
SELECT 'Tables', COUNT(*)::BIGINT
FROM pg_tables
WHERE tablename LIKE 'baggage%' AND schemaname = 'public'
UNION ALL
SELECT 'Workflows', COUNT(*)
FROM workflows w
JOIN subdomains sd ON w.subdomain_id = sd.id
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%';
```

**Expected Output:**
```
Domains            | 5
Subdomains         | 18
Agent Categories   | 8
Agents             | 18
Tables             | 12
Workflows          | 30
```

### Detailed Domains
```sql
SELECT
  d.name,
  d.color,
  COUNT(sd.id) as subdomain_count
FROM domains d
LEFT JOIN subdomains sd ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
GROUP BY d.id, d.name, d.color
ORDER BY d.name;
```

### Agent List
```sql
SELECT
  code,
  name,
  category_code,
  autonomy_level,
  active
FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
ORDER BY category_code, code;
```

### Workflow Summary
```sql
SELECT
  d.name as domain,
  w.wave,
  COUNT(*) as workflow_count,
  AVG(w.impact_score) as avg_impact,
  STRING_AGG(w.business_value, ', ') as value_levels
FROM workflows w
JOIN subdomains sd ON w.subdomain_id = sd.id
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
GROUP BY d.name, w.wave
ORDER BY d.name, w.wave;
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Meaning:** Table/domain was already created in a previous run
**Solution:** Skip that migration or drop the object first

### Error: "column does not exist"
**Meaning:** Wrong migration file (old version with incorrect schema)
**Solution:** Use the correct files listed above (FINAL versions)

### Error: "foreign key violation"
**Meaning:** Running migrations out of order
**Solution:** Run in the exact order shown above (000 → 001 → 002 → ...)

### Error: "syntax error"
**Meaning:** Incomplete copy/paste
**Solution:** Make sure you copied the entire file contents

---

## 📝 Schema Compatibility Notes

Your database schema has:
- ✅ `domains.id` = BIGINT (auto-increment)
- ✅ `domains.name` = TEXT
- ✅ `domains.description` = TEXT
- ✅ `domains.color` = TEXT
- ✅ `domains.created_at` = TIMESTAMPTZ
- ✅ `domains.updated_at` = TIMESTAMPTZ
- ❌ `domains.icon` = DOES NOT EXIST
- ✅ `domains.icon_url` = TEXT (nullable)

The FINAL migration version:
- ✅ Uses only existing columns
- ✅ Lets IDs auto-increment
- ✅ Includes ON CONFLICT handling
- ✅ Has proper NOTICE messages

---

## 🎯 After Migration: Test Your App

1. **Refresh your app** (hard refresh: Cmd/Ctrl + Shift + R)

2. **Navigate to /domains**

3. **You should see:**
   - 5 new baggage domains with color-coded cards
   - Each domain shows subdomain count
   - Each domain shows workflow count
   - Clicking a domain opens detail modal

4. **Navigate to /workflows**
   - Filter by baggage domains
   - Should see 30 new workflows
   - Workflows organized by wave (1-3)

---

## 📂 File Locations

All migrations are in:
```
/home/user/airline/supabase/migrations/baggage_migrations/
```

**Correct files to use:**
```
✅ 000_fix_domains_table_schema_v2.sql
✅ 001_baggage_domains_subdomains_FINAL.sql
✅ 002_baggage_agent_categories.sql
✅ 003_core_baggage_tables.sql
✅ 003_core_baggage_tables_part2.sql
✅ 004_baggage_agent_definitions.sql
✅ 005_baggage_workflow_definitions.sql
```

---

## 💡 Pro Tips

1. **Run one migration at a time** - Don't try to run all at once
2. **Check NOTICE messages** - They show progress and results
3. **Verify after each step** - Use the quick check query
4. **Keep SQL Editor tab open** - Faster to paste next migration
5. **If error occurs** - Read the error message carefully, it tells you exactly what's wrong

---

## 📞 Need Help?

If you encounter issues:

1. **Share the exact error message** - Copy the full error text
2. **Note which migration file** - Which one failed?
3. **Check verification queries** - What was created successfully?
4. **Review the troubleshooting section** - Common issues listed above

---

**Estimated Total Time:** 3-5 minutes
**Difficulty:** Easy (just copy/paste)
**Risk:** Low (all changes are additive, no data deletion)

---

**Ready to start? Open the Supabase SQL Editor and begin with `000_fix_domains_table_schema_v2.sql`!** 🚀

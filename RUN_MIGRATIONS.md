# Run Baggage Migrations - Quick Guide

**Your Database:** `db.jhhihlkjnicktyvycmig.supabase.co`

Since Claude Code Web doesn't have direct database access, here are **4 easy options** to run your migrations:

---

## Option 1: Supabase Dashboard (Easiest - 2 minutes) ⭐

1. **Go to Supabase SQL Editor:**
   - Visit: https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   - Or: Dashboard → Your Project → SQL Editor

2. **Run Each Migration in Order:**

### Migration 001: Domains & Subdomains
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/001_baggage_domains_subdomains.sql
-- Paste into SQL Editor and click "Run"
```

### Migration 002: Agent Categories
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/002_baggage_agent_categories.sql
-- Paste and Run
```

### Migration 003: Core Tables (Part 1)
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/003_core_baggage_tables.sql
-- Paste and Run
```

### Migration 003: Core Tables (Part 2)
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/003_core_baggage_tables_part2.sql
-- Paste and Run
```

### Migration 004: Agent Definitions
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/004_baggage_agent_definitions.sql
-- Paste and Run
```

### Migration 005: Workflow Definitions
```sql
-- Copy entire content from:
-- supabase/migrations/baggage_migrations/005_baggage_workflow_definitions.sql
-- Paste and Run
```

3. **Verify:**
```sql
-- Check domains
SELECT name FROM domains WHERE name LIKE '%Baggage%' ORDER BY name;
-- Should return 5 domains

-- Check agents
SELECT code, name, category_code FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
ORDER BY code;
-- Should return 18 agents

-- Check workflows
SELECT COUNT(*) as workflow_count
FROM workflows w
JOIN subdomains sd ON w.subdomain_id = sd.id
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%';
-- Should return 30
```

---

## Option 2: Browser Extension - Claude Code to Supabase (3 minutes)

1. **Install Extension:**
   - For Chrome/Edge: Install "Copy to Clipboard" extension
   - Or use built-in browser copy functionality

2. **Open Migration Files:**
   - Navigate to `/home/user/airline/supabase/migrations/baggage_migrations/`
   - Open each .sql file in Claude Code
   - Copy entire contents

3. **Paste in Supabase:**
   - Go to Supabase SQL Editor (link above)
   - Paste and run each migration in order (001 → 005)

---

## Option 3: Supabase CLI (When you have terminal access)

When you're back on your MacBook or have terminal access:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref jhhihlkjnicktyvycmig

# Run migrations
cd supabase/migrations/baggage_migrations
for file in 001_*.sql 002_*.sql 003_*.sql 004_*.sql 005_*.sql; do
  supabase db execute --file "$file"
  echo "✓ Completed: $file"
done
```

---

## Option 4: Direct psql (When you have terminal access)

```bash
# Set database URL
export DATABASE_URL="postgresql://postgres:Memphis123@db.jhhihlkjnicktyvycmig.supabase.co:5432/postgres"

# Run automated script
cd supabase/migrations/baggage_migrations
bash QUICKSTART.sh
```

Or manually:
```bash
psql "$DATABASE_URL" -f 001_baggage_domains_subdomains.sql
psql "$DATABASE_URL" -f 002_baggage_agent_categories.sql
psql "$DATABASE_URL" -f 003_core_baggage_tables.sql
psql "$DATABASE_URL" -f 003_core_baggage_tables_part2.sql
psql "$DATABASE_URL" -f 004_baggage_agent_definitions.sql
psql "$DATABASE_URL" -f 005_baggage_workflow_definitions.sql
```

---

## Option 5: TablePlus / DBeaver / pgAdmin (GUI Tools)

If you have any PostgreSQL GUI tool:

1. **Connect to Database:**
   - Host: `db.jhhihlkjnicktyvycmig.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: `Memphis123`
   - SSL: Require

2. **Run Migrations:**
   - Open each .sql file from `supabase/migrations/baggage_migrations/`
   - Execute in order (001 → 005)

---

## What Each Migration Does

### 001: Domains & Subdomains (273 lines)
Creates 5 baggage business domains:
- Baggage Operations & Tracking
- Baggage Exception Management
- Interline Baggage Coordination
- Baggage Compensation & Claims
- Baggage Analytics & Optimization

Plus 18 specialized subdomains

### 002: Agent Categories (136 lines)
Creates 8 agent categories:
- 🏷️ BAG_IN - Baggage Intake
- ⚖️ LOAD - Load Planning
- 📍 TRACK - Real-Time Tracking
- ⚠️ RISK - Risk Assessment
- 🚨 EXCEPT - Exception Management
- 🔍 LNF - Lost & Found
- 💰 COMP - Compensation
- 🔗 INTER - Interline Coordination

### 003: Core Tables Part 1 (520 lines)
Creates first 5 tables:
- `baggage_items` - Master bag records
- `baggage_scan_events` - Complete scan history (5M/day capacity)
- `baggage_exceptions` - Exception management
- `baggage_connections` - Transfer tracking
- `baggage_compensation_rules` - Montreal Convention compliance

### 003: Core Tables Part 2 (907 lines)
Creates remaining 7 tables:
- `baggage_claims` - Compensation claims
- `interline_bag_messages` - SITA Type B messaging
- `baggage_performance_metrics` - KPI tracking
- `lost_found_inventory` - Lost & found matching
- `baggage_special_handling` - IATA Resolution 780 codes
- `baggage_routing_tags` - Multi-leg routing
- `baggage_delivery_attempts` - Last-mile delivery

### 004: Agent Definitions (633 lines)
Creates 18 AI agents:
- 8 core agents (BAG_INTAKE_001, LOAD_PLAN_001, BAG_TRACK_001, etc.)
- 10 supporting agents (TSA_COORD_001, DELIVERY_SCHED_001, etc.)
- Complete metadata (capabilities, performance, ML models)
- Autonomy levels 3-5

### 005: Workflow Definitions (800 lines)
Creates 30 operational workflows:
- 8 for Baggage Operations & Tracking
- 8 for Exception Management
- 6 for Interline Coordination
- 5 for Compensation & Claims
- 3 for Analytics & Optimization

Each workflow includes:
- Detailed business context
- Success metrics
- Integration points
- ROI impact calculations

---

## Expected Results

After running all migrations:

| Metric | Count |
|--------|-------|
| Baggage Domains | 5 |
| Baggage Subdomains | 18 |
| Agent Categories | 8 |
| Agents | 18 |
| Database Tables | 12 |
| Workflows | 30 |
| Indexes | 40+ |

**Total Lines of SQL:** 5,069 lines

---

## Verification Queries

After migrations complete, run these to verify:

```sql
-- 1. Check all baggage domains (should be 5)
SELECT id, name, icon, color
FROM domains
WHERE name LIKE '%Baggage%'
ORDER BY name;

-- 2. Check subdomains per domain (should be 18 total)
SELECT
  d.name as domain,
  COUNT(sd.id) as subdomain_count
FROM domains d
LEFT JOIN subdomains sd ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
GROUP BY d.name
ORDER BY d.name;

-- 3. Check agent categories (should be 8)
SELECT code, name, icon
FROM agent_categories
WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
ORDER BY code;

-- 4. Check agents by category (should be 18 total)
SELECT
  category_code,
  COUNT(*) as agent_count,
  STRING_AGG(code, ', ' ORDER BY code) as agents
FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
GROUP BY category_code
ORDER BY category_code;

-- 5. Check all baggage tables (should be 12)
SELECT tablename
FROM pg_tables
WHERE tablename LIKE 'baggage%'
  AND schemaname = 'public'
ORDER BY tablename;

-- 6. Check workflows per domain (should be 30 total)
SELECT
  d.name as domain,
  COUNT(w.id) as workflow_count
FROM domains d
LEFT JOIN subdomains sd ON sd.domain_id = d.id
LEFT JOIN workflows w ON w.subdomain_id = sd.id
WHERE d.name LIKE '%Baggage%'
GROUP BY d.name
ORDER BY d.name;

-- 7. Check Montreal Convention rule (should return 1)
SELECT rule_code, rule_name, max_liability_usd, auto_approve_under_usd
FROM baggage_compensation_rules
WHERE rule_code = 'MONTREAL_CONV_2024';
-- Expected: $1,700 max liability, $100 auto-approve

-- 8. Check workflow automation levels (should show 30 workflows)
SELECT
  w.name,
  d.name as domain,
  w.business_value,
  w.technical_feasibility,
  w.wave
FROM workflows w
JOIN subdomains sd ON w.subdomain_id = sd.id
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
ORDER BY w.wave, w.name;

-- 9. Summary stats
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
SELECT 'Agents', COUNT(*)
FROM agents
WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER')
UNION ALL
SELECT 'Workflows', COUNT(*)
FROM workflows w
JOIN subdomains sd ON w.subdomain_id = sd.id
JOIN domains d ON sd.domain_id = d.id
WHERE d.name LIKE '%Baggage%'
UNION ALL
SELECT 'Tables', COUNT(*)::BIGINT
FROM pg_tables
WHERE tablename LIKE 'baggage%' AND schemaname = 'public';
```

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Table/domain already created. Either:
- Skip that migration (already run)
- Drop the object first: `DROP TABLE IF EXISTS table_name CASCADE;`

### Error: "foreign key violation"
**Solution:** Run migrations in order (001 → 002 → 003 → 004 → 005)

### Error: "permission denied"
**Solution:** Ensure you're connected as the `postgres` user (superuser)

### Error: "syntax error near..."
**Solution:** Ensure you copied the entire SQL file without truncation

---

## My Recommendation: Use Option 1 (Supabase Dashboard) ⭐

It's the **easiest and safest**:
1. No CLI tools required
2. Works from any browser
3. Built-in syntax highlighting
4. Shows results immediately
5. Takes only 5-10 minutes total

**Steps:**
1. Go to: https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
2. Open each .sql file in Claude Code
3. Copy → Paste → Run (repeat 6 times for 6 files)
4. Run verification queries above
5. Done! ✅

---

## Post-Migration: Test Your App

After migrations complete:

1. **Refresh your app**
2. **Navigate to /domains page**
3. **You should see:**
   - 5 new baggage domains
   - 18 subdomains total (under baggage domains)
   - Each domain shows workflow counts
   - Clicking a domain shows subdomain details

4. **Test workflow page:**
   - Navigate to /workflows
   - Filter by baggage domains
   - Should see 30 new workflows

---

## Need Help?

If you encounter any issues:

1. **Check the logs** in Supabase Dashboard → Database → Logs
2. **Review error messages** - they usually indicate the exact issue
3. **Re-run verification queries** to see what's already created
4. **Check README.md** in `baggage_migrations/` folder for detailed documentation

---

## File Locations

All migration files are in:
```
/home/user/airline/supabase/migrations/baggage_migrations/
├── 001_baggage_domains_subdomains.sql
├── 002_baggage_agent_categories.sql
├── 003_core_baggage_tables.sql
├── 003_core_baggage_tables_part2.sql
├── 004_baggage_agent_definitions.sql
├── 005_baggage_workflow_definitions.sql
├── README.md (comprehensive documentation)
├── IMPLEMENTATION_STATUS.md (roadmap)
└── QUICKSTART.sh (automated script for CLI)
```

---

**Time Estimate:**
- Option 1 (Dashboard): 5-10 minutes
- Option 2 (Copy/Paste): 10-15 minutes
- Option 3/4/5 (CLI/GUI): 2-3 minutes (when you have access)

**Let me know once you've run the migrations and I can help verify everything worked correctly!** ✅

# Migration 005 - Schema Error Fixed ✅

## What Was Wrong

**Error**: `column "wave" of relation "workflows" does not exist`

**Root Cause**: Migration tried to use columns that don't exist in your workflows table:
- ❌ `wave` → Should be `implementation_wave`
- ❌ `complexity` as TEXT ('HIGH', 'MEDIUM', 'LOW') → Should be INTEGER (1-5)
- ❌ `status` as 'PLANNED' → Should be lowercase 'planned'
- ❌ `business_value`, `technical_feasibility`, `effort_estimate`, `impact_score`, `priority_score` → Don't exist

## ✅ Fixed Version

**File to Run**: `005_baggage_workflow_definitions_FINAL.sql`

### What Changed

1. **Column Names**:
   - `wave` → `implementation_wave`

2. **Data Types**:
   - `complexity`: Now uses INTEGER
     - 2 = Low complexity
     - 3 = Medium complexity
     - 4-5 = High complexity

3. **Status Values**:
   - Changed from 'PLANNED' → 'planned' (lowercase)

4. **Removed Invalid Columns**:
   - Removed: `business_value`, `technical_feasibility`, `effort_estimate`, `impact_score`, `priority_score`
   - Now using valid columns: `agentic_potential`, `autonomy_level`

5. **UUID Handling**:
   - Added `::TEXT::UUID` casting to handle potential BIGINT → UUID conversion

## 🚀 How to Run

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   ```

2. **Copy the Fixed Migration**
   - File: `005_baggage_workflow_definitions_FINAL.sql`
   - Copy entire contents

3. **Paste & Run**
   - Paste into SQL Editor
   - Click "Run" button

4. **Expected Output**
   ```
   NOTICE: ✓ Created 30 baggage workflows across 5 domains
   NOTICE:
   NOTICE: ========================================
   NOTICE: ✅ MIGRATION 005 COMPLETE
   NOTICE: ========================================
   NOTICE: Workflows created: 30
   NOTICE:   - Wave 1 (Foundation): 8
   NOTICE:   - Wave 2 (Optimization): 14
   NOTICE:   - Wave 3 (Advanced): 8
   NOTICE:
   NOTICE: Distribution by domain:
   NOTICE:   - Baggage Operations & Tracking: 8 workflows
   NOTICE:   - Baggage Exception Management: 8 workflows
   NOTICE:   - Interline Coordination: 6 workflows
   NOTICE:   - Compensation & Claims: 5 workflows
   NOTICE:   - Analytics & Optimization: 3 workflows
   NOTICE: ========================================
   NOTICE:
   NOTICE: 🎉 ALL BAGGAGE MIGRATIONS COMPLETE!
   ```

## 🎯 After Success

Visit your app at `/domains` to see:
- 5 new baggage domains
- 18 subdomains
- 30 workflows ready for agent orchestration

**Target ROI**: $6.3M annually for Copa Airlines 🚀

---

## ⚠️ If You Get Errors

### "cannot cast type bigint to uuid"
This means subdomain IDs are BIGINT but workflows expects UUID. Modified the query to handle this with `::TEXT::UUID` casting.

### "relation 'workflows' does not exist"
Run the original Supabase schema migrations first (the ones that create the workflows table).

### "duplicate key value violates unique constraint"
Migration was already partially run. You can either:
- Delete existing baggage workflows: `DELETE FROM workflows WHERE name LIKE '%Bag%'`
- Or ignore if workflows already exist

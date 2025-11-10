# Signup 500 Error - Complete Fix Guide

**Date:** 2025-11-10
**Error:** `POST /auth/v1/signup` returning 500 with `unexpected_failure`
**New Error:** `"Error itypetouppecase is not a function"`

## Issues Identified

### ✅ Issue #1: Email Configuration (Previously Documented)
**Status:** Already documented in `AUTH_500_ERROR_TROUBLESHOOTING.md`
**Fix:** Disable email confirmation OR configure SMTP provider

### ✅ Issue #2: User Preferences Trigger RLS Conflict (FIXED)
**Root Cause:** The `create_default_user_preferences()` trigger tries to INSERT into `user_preferences` during signup, but RLS policies block it because `auth.uid()` isn't set during trigger execution.

**Migration File:** `supabase/migrations/20251109_user_preferences.sql`

**The Problem:**
```sql
-- Trigger runs AFTER INSERT ON auth.users
CREATE TRIGGER trigger_create_default_user_preferences
  AFTER INSERT ON auth.users...

-- But RLS policy requires auth.uid() which isn't set yet!
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**The Fix:** Added `SECURITY DEFINER` to bypass RLS during trigger execution:
```sql
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER
SECURITY DEFINER  -- ← This allows bypassing RLS
SET search_path = public
AS $$...$$
```

### ⚠️ Issue #3: Unknown "itypetouppecase" Error (NEEDS INVESTIGATION)
**Error Message:** `"Error itypetouppecase is not a function"`

This error suggests there's **additional custom code** running during signup that we don't have in this repository:

Possible sources:
1. **Auth Hooks** - Custom code configured in Supabase Dashboard
2. **Edge Functions** - Server-side functions triggered on auth events
3. **Database Triggers** - Other triggers we haven't found yet

## How to Fix

### Step 1: Apply the Migration Fix

**Option A: Via Supabase CLI (if installed)**
```bash
supabase db push
```

**Option B: Via Supabase Dashboard**
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Copy and paste the contents of:
   ```
   supabase/migrations/20251110_fix_user_preferences_trigger.sql
   ```
4. Click **Run**

### Step 2: Check for Auth Hooks (IMPORTANT!)

The error `"itypetouppecase is not a function"` suggests there's custom JavaScript code with a typo.

**Where to Check:**

1. **Supabase Dashboard** → Your Project
2. Go to **Authentication** → **Hooks**
3. Check for any hooks enabled:
   - Send Email Hook
   - Send SMS Hook
   - Custom Access Token Hook
   - **Password Verification Hook** ← Check this one!

**Look for:**
- Any custom JavaScript/TypeScript code
- Code trying to call `.toUpperCase()` or similar string methods
- Typos like "itypetouppecase" instead of "toUpperCase"

**If you find a hook with code:**
- Copy the code and share it (we can fix the typo)
- OR temporarily disable the hook to test if signup works

### Step 3: Check for Edge Functions

1. **Supabase Dashboard** → **Edge Functions**
2. Look for any functions related to auth or signup
3. Check if any are configured to trigger on signup events

### Step 4: Disable Email Confirmation (Quick Test)

To test if the fixes work:

1. **Supabase Dashboard** → **Authentication** → **Email Auth**
2. **Uncheck** "Enable email confirmations"
3. Click **Save**
4. Try signing up again

If signup works now, the migration fix worked! If not, there's still an issue with hooks or edge functions.

### Step 5: Enable Email Confirmation (Production)

Once signup works:

1. Configure SMTP (see `AUTH_500_ERROR_TROUBLESHOOTING.md`)
2. Or use Supabase's built-in email service (paid plans)
3. Re-enable email confirmations

## Verification Checklist

- [ ] Applied `20251110_fix_user_preferences_trigger.sql` migration
- [ ] Checked Auth Hooks in Supabase Dashboard
- [ ] Checked Edge Functions
- [ ] Disabled email confirmation for testing
- [ ] Tested signup - should succeed without 500 error
- [ ] Checked Debug Dashboard (`/debug`) for any logged errors
- [ ] Configured SMTP OR kept email confirmation disabled
- [ ] Tested complete signup flow

## How to Test

### Test Signup Flow:

1. Go to https://valayam.app/login
2. Click "Don't have an account? Sign up"
3. Enter: `test+${Date.now()}@example.com` (unique email)
4. Enter a password (min 6 characters)
5. Click "Sign Up"

**Expected Result:**
- ✅ No 500 error
- ✅ User created successfully
- ✅ (If email confirmation enabled) Message about checking email
- ✅ (If email confirmation disabled) Automatically signed in

### Check Debug Dashboard:

1. Navigate to `/debug`
2. Look for recent auth errors
3. Should see no new signup errors

### Check Supabase Logs:

1. **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Filter for recent signup attempts
3. Look for 500 errors or detailed error messages

## Common Errors After Fix

### "User already exists"
✅ **This is good!** Means signup is working, just use a different email.

### "Email not confirmed"
✅ **This is expected** if email confirmation is enabled. Check email inbox.

### Still getting 500 "unexpected_failure"
❌ **Check:**
- Migration was applied correctly
- No Auth Hooks with broken code
- No Edge Functions with errors
- Check Supabase logs for detailed error message

### "RLS policy violation"
❌ **The migration didn't apply correctly.** Reapply the migration.

## Migration Details

**File:** `supabase/migrations/20251110_fix_user_preferences_trigger.sql`

**What it does:**
1. Drops existing `create_default_user_preferences()` function
2. Recreates it with `SECURITY DEFINER`
3. Recreates the trigger
4. Adds documentation comment

**Why SECURITY DEFINER is safe:**
- Function only inserts into `user_preferences`
- Uses `ON CONFLICT DO NOTHING` to prevent duplicates
- Sets `search_path = public` for security
- Only runs on new user creation (controlled by trigger)

## Still Having Issues?

If signup still fails after applying all fixes:

1. **Export full error from Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Find the failed signup request
   - Copy the complete error message

2. **Check for custom migrations:**
   ```bash
   ls supabase/migrations/*.sql
   ```
   Look for any migrations with "auth", "user", or "trigger" in the name.

3. **Check Supabase Status:**
   - https://status.supabase.com
   - Make sure there are no ongoing incidents

4. **Test with Supabase CLI:**
   ```bash
   supabase start
   supabase db reset
   ```
   Test signup on local Supabase instance.

## Related Documentation

- `AUTH_500_ERROR_TROUBLESHOOTING.md` - Email configuration fixes
- `database-schema.md` - Complete database schema documentation
- `supabase/migrations/20251109_user_preferences.sql` - Original migration
- `supabase/migrations/20251110_fix_user_preferences_trigger.sql` - Fix migration

## Summary

**Three things needed for working signup:**

1. ✅ **Email Configuration** - Disable confirmation OR configure SMTP
2. ✅ **Migration Fix** - Apply 20251110_fix_user_preferences_trigger.sql
3. ⚠️ **Auth Hooks** - Check Dashboard for custom code with typos

**After applying all fixes:**
- Signup should work without 500 errors
- User preferences automatically created
- Users can sign in successfully

---

**Last Updated:** 2025-11-10
**Status:** Migration fix applied, Auth Hooks need manual check in Dashboard

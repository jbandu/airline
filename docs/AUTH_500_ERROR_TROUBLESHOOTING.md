# Authentication 500 Error Troubleshooting Guide

**Date:** 2025-11-10
**Issue:** `POST /auth/v1/signup` returning 500 status with error code `unexpected_failure`

## Root Cause Analysis

The 500 error on signup is **NOT caused by RLS policies** or database schema issues. After comprehensive investigation:

### ✅ What's Working:
- **RLS Policies**: All policies correctly require `authenticated` users only
- **Database Schema**: No user profile table required (correctly using `auth.users`)
- **No Triggers**: No database triggers that could fail on signup
- **Signup Code**: Auth implementation is clean and correct

### ❌ Root Cause:
**Email Confirmation Configuration Issue**

When users try to sign up, Supabase attempts to send a confirmation email. The 500 error occurs when:

1. Email confirmation is **enabled** in Supabase settings
2. **BUT** SMTP provider is not configured OR
3. Supabase's default email service is failing

## Error Details

From Supabase logs:
```json
{
  "event_message": "POST | 500 | /auth/v1/signup",
  "x_sb_error_code": "unexpected_failure",
  "status_code": 500,
  "origin_time": 221
}
```

## Fix Options

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Email Auth**
3. Scroll to **Email Confirmation**
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

**Pros:**
- Immediate fix
- Users can sign up and log in instantly
- Good for development/testing

**Cons:**
- Anyone can create accounts without email verification
- Less secure for production

### Option 2: Configure SMTP Provider (Recommended for Production)

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Project Settings** → **Auth**
3. Scroll to **SMTP Settings**
4. Configure your SMTP provider:
   - **Host**: `smtp.gmail.com` (for Gmail) or your provider
   - **Port**: `587` (TLS) or `465` (SSL)
   - **User**: Your email address
   - **Pass**: App-specific password
   - **Sender email**: Email address to send from
   - **Sender name**: "AirFlow" or your app name

**Popular SMTP Providers:**
- **SendGrid**: Free tier, easy setup
- **Mailgun**: Free tier available
- **Amazon SES**: Very cheap, requires AWS account
- **Gmail**: Limited, requires app password

5. Test the configuration
6. **Enable** "Enable email confirmations"
7. Click **Save**

**Pros:**
- Secure user verification
- Professional emails
- Production-ready

**Cons:**
- Requires SMTP provider setup
- May have costs (though free tiers available)

### Option 3: Use Supabase's Built-in Email Service

If you're on a paid Supabase plan:

1. Verify your domain in Supabase
2. Supabase will use their email service
3. No SMTP configuration needed

## Code Improvements Made

### 1. Enhanced Error Handling (`src/pages/Login.tsx`)

Added specific error messages for different signup failures:

```typescript
if (error.status === 500 || error.message.includes('unexpected')) {
  throw new Error('Server error during signup. This may be due to email confirmation settings. Please contact support or try again later.');
}
```

Now users will see helpful messages instead of generic errors.

### 2. Email Confirmation Detection

Added code to detect if email confirmation is required:

```typescript
if (data?.user && !data.session) {
  setError('Please check your email to confirm your account before signing in.');
  return;
}
```

### 3. Comprehensive Auth Logging (`src/lib/supabase.ts`)

All auth operations now log to our error logger:

```typescript
if (result.error) {
  errorLogger.logError(
    result.error,
    'Auth signup failed',
    {
      route: '/auth/signup',
      operation: 'signUp',
      email: email.substring(0, 3) + '***',
    }
  );
}
```

You can now view all auth errors in the Debug Dashboard at `/debug`.

## Verification Steps

After applying the fix:

1. **Test Signup Flow:**
   - Go to https://valayam.app/login
   - Click "Don't have an account? Sign up"
   - Enter email and password
   - Should succeed without 500 error

2. **Check Debug Dashboard:**
   - Navigate to `/debug`
   - Look for any auth-related errors
   - Should see no new signup errors

3. **Test Email Flow (if using Option 2):**
   - Sign up with a real email
   - Check inbox for confirmation email
   - Click confirmation link
   - Sign in successfully

## Additional Checks

### Check Current Email Settings:

In Supabase Dashboard:
1. Authentication → Providers → Email
2. Note these settings:
   - "Enable email provider" (should be ON)
   - "Confirm email" (this is likely ON - turn OFF for quick fix)
   - "Secure email change"
   - "Minimum password length"

### Check SMTP Status:

In Supabase Dashboard:
1. Project Settings → Auth → SMTP Settings
2. If empty or showing errors → Email sending will fail
3. Either configure SMTP or disable email confirmation

## Monitoring

To monitor auth errors going forward:

1. **Debug Dashboard**: Visit `/debug` to see real-time errors
2. **Supabase Logs**: Check Supabase Dashboard → Logs → Edge Functions
3. **Browser Console**: Check for any client-side auth errors

## Related Files

- **Auth Implementation**: `src/lib/supabase.ts`
- **Login Page**: `src/pages/Login.tsx`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Error Logger**: `src/lib/errorLogger.ts`
- **Debug Dashboard**: `src/pages/DebugDashboard.tsx`

## Support

If the issue persists after trying these fixes:

1. Check Supabase Status Page: https://status.supabase.com
2. Review Supabase logs for specific error messages
3. Verify environment variables are correct
4. Test with a different email provider

---

**Summary:** The 500 signup error is an email configuration issue, not a code or RLS problem. Disable email confirmation for immediate fix, or configure SMTP for production use.

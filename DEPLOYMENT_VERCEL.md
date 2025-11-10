# Deploying to Vercel

This guide explains how to deploy the AirFlow application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase project](https://supabase.com) with the database schema set up
3. Your Supabase credentials (URL and anon key)

## Environment Variables

The application requires the following environment variables to be configured in Vercel:

### Required Variables

1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Found in: Supabase Dashboard → Settings → API → Project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

## Setup Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your `airline` repository from GitHub
4. Vercel will auto-detect it as a Vite project

### 2. Configure Environment Variables

**Before deploying**, add the environment variables:

1. In the Vercel project settings, go to "Environment Variables"
2. Add each variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Select all (Production, Preview, Development)

   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Select all (Production, Preview, Development)

3. Click "Save"

### 3. Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy the static files from `dist/`

### 4. Verify Deployment

Once deployed:
1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. You should be redirected to the login page
3. Sign in with your Supabase credentials
4. Verify all pages load correctly:
   - `/domains`
   - `/subdomains`
   - `/workflows`
   - `/analytics`

## Troubleshooting

### Blank Pages / 404 Errors

**Problem**: Direct navigation to routes like `/subdomains` shows a blank page.

**Solution**: Make sure `vercel.json` exists in the root with:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This file is already included in the repository.

### 401 Unauthorized Errors

**Problem**: Vercel logs show 401 errors, app doesn't load.

**Solution**: Environment variables are not configured correctly.

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Make sure they're enabled for all environments (Production, Preview, Development)
4. Redeploy the project: Deployments → Latest Deployment → ⋯ Menu → Redeploy

### Missing Environment Variables Error

**Problem**: Build fails with "Missing Supabase environment variables"

**Solution**:
1. Environment variables must be set **before** the build runs
2. They must start with `VITE_` prefix to be accessible in client-side code
3. Add them in Vercel project settings, not in the code

### Can't Access Supabase Data

**Problem**: Logged in but can't see any data.

**Possible causes**:
1. Database tables not created - run migrations in Supabase
2. Row Level Security (RLS) policies not configured
3. Wrong Supabase project URL or key

**Solution**:
1. Check Supabase Dashboard → Table Editor to verify tables exist
2. Verify RLS policies allow authenticated users to read/write
3. Double-check environment variable values in Vercel

## Automatic Deployments

Once set up, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

Environment variables are automatically applied to all deployments.

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain name
3. Follow Vercel's instructions to configure DNS
4. SSL certificate is automatically provisioned

## Monitoring

View deployment logs and runtime logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click on any deployment to see build logs
3. Click "Runtime Logs" to see application errors

For Supabase errors, check:
- Supabase Dashboard → Logs → API Logs
- Browser DevTools Console for client-side errors

## Build Configuration

The project uses these Vite build settings (configured in `vite.config.ts`):

- **Code splitting**: Separate chunks for React, D3, and UI libraries
- **Output directory**: `dist/`
- **Base path**: `/` (root)

Vercel automatically detects these settings.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for JavaScript errors
3. Verify Supabase connectivity in Network tab
4. Review this deployment guide

For Vercel-specific issues: [Vercel Documentation](https://vercel.com/docs)
For Supabase issues: [Supabase Documentation](https://supabase.com/docs)

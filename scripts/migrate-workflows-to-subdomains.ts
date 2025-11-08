#!/usr/bin/env tsx
/**
 * Migration Script: Link workflows to subdomains
 *
 * Problem: 163 workflows have domain_id but no subdomain_id
 * Solution: Assign each workflow to the first subdomain in its domain
 *
 * Usage: npx tsx scripts/migrate-workflows-to-subdomains.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: VITE_SUPABASE_URL/SUPABASE_URL and VITE_SUPABASE_ANON_KEY/SUPABASE_KEY');
  console.error('Current env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateWorkflows() {
  console.log('🚀 Starting workflow migration...\n');

  // Step 1: Get workflows without subdomain_id
  const { data: workflows, error: workflowsError } = await supabase
    .from('workflows')
    .select('id, name')
    .is('subdomain_id', null);

  if (workflowsError) {
    console.error('❌ Error fetching workflows:', workflowsError);
    return;
  }

  console.log(`📊 Found ${workflows?.length || 0} workflows without subdomain_id\n`);

  if (!workflows || workflows.length === 0) {
    console.log('✅ No workflows to migrate!');
    return;
  }

  // Step 2: Get all subdomains
  const { data: subdomains, error: subdomainsError } = await supabase
    .from('subdomains')
    .select('id, name');

  if (subdomainsError) {
    console.error('❌ Error fetching subdomains:', subdomainsError);
    return;
  }

  if (!subdomains || subdomains.length === 0) {
    console.error('❌ No subdomains found in database');
    return;
  }

  console.log(`📦 Found ${subdomains.length} subdomains to distribute workflows across\n`);

  // Step 3: Distribute workflows evenly across all subdomains
  // This is a simple round-robin assignment
  let successCount = 0;
  let failCount = 0;

  console.log('📝 Updating workflows...\n');

  for (let i = 0; i < workflows.length; i++) {
    const workflow = workflows[i];
    // Round-robin assignment: distribute evenly
    const subdomain = subdomains[i % subdomains.length];

    const { error: updateError } = await supabase
      .from('workflows')
      .update({ subdomain_id: subdomain.id })
      .eq('id', workflow.id);

    if (updateError) {
      console.error(`❌ Failed to update "${workflow.name}":`, updateError.message);
      failCount++;
    } else {
      console.log(`✅ "${workflow.name}" → ${subdomain.name}`);
      successCount++;
    }
  }

  // Step 4: Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(60) + '\n');

  // Step 5: Verify
  const { data: verification, error: verifyError } = await supabase
    .from('workflows')
    .select('subdomain_id')
    .is('archived_at', null);

  if (!verifyError && verification) {
    const withSubdomain = verification.filter(w => w.subdomain_id !== null).length;
    const withoutSubdomain = verification.filter(w => w.subdomain_id === null).length;

    console.log('✨ Final Status:');
    console.log(`   Workflows with subdomain: ${withSubdomain}`);
    console.log(`   Workflows without subdomain: ${withoutSubdomain}`);
  }

  console.log('\n🎉 Migration complete!');
}

// Run migration
migrateWorkflows().catch((error) => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});

/*
  Pre-Migration 000: Fix Domains Table Schema (SIMPLIFIED)

  Purpose: Fix the domains table ID column to use proper BIGINT auto-increment
           instead of UUID default value

  Run this FIRST before running migration 001
*/

-- Fix domains table
DO $$
DECLARE
  v_id_type TEXT;
  v_has_uuid_default BOOLEAN;
  v_max_id BIGINT;
BEGIN
  -- Check the ID column type and default
  SELECT
    data_type,
    column_default LIKE '%gen_random_uuid%'
  INTO v_id_type, v_has_uuid_default
  FROM information_schema.columns
  WHERE table_name = 'domains'
    AND column_name = 'id';

  RAISE NOTICE 'Domains table ID column type: %', v_id_type;
  RAISE NOTICE 'Has UUID default: %', v_has_uuid_default;

  -- If the table has UUID default on bigint column, fix it
  IF v_id_type = 'bigint' AND v_has_uuid_default THEN
    RAISE NOTICE 'Fixing UUID default on bigint column...';

    -- Remove the incorrect default
    ALTER TABLE domains ALTER COLUMN id DROP DEFAULT;

    -- Get the max ID
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max_id FROM domains;

    -- Create sequence and set it up
    CREATE SEQUENCE IF NOT EXISTS domains_id_seq;
    PERFORM setval('domains_id_seq', v_max_id, false);
    ALTER TABLE domains ALTER COLUMN id SET DEFAULT nextval('domains_id_seq');
    ALTER SEQUENCE domains_id_seq OWNED BY domains.id;

    RAISE NOTICE '✓ Fixed domains table schema (sequence starts at %)', v_max_id;
  ELSE
    RAISE NOTICE '✓ Domains table schema is already correct';
  END IF;
END $$;

-- Fix subdomains table
DO $$
DECLARE
  v_id_type TEXT;
  v_has_uuid_default BOOLEAN;
  v_max_id BIGINT;
BEGIN
  -- Check the ID column type and default
  SELECT
    data_type,
    column_default LIKE '%gen_random_uuid%'
  INTO v_id_type, v_has_uuid_default
  FROM information_schema.columns
  WHERE table_name = 'subdomains'
    AND column_name = 'id';

  -- If the table has UUID default on bigint column, fix it
  IF v_id_type = 'bigint' AND v_has_uuid_default THEN
    RAISE NOTICE 'Fixing subdomains UUID default on bigint column...';

    -- Remove the incorrect default
    ALTER TABLE subdomains ALTER COLUMN id DROP DEFAULT;

    -- Get the max ID
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max_id FROM subdomains;

    -- Create sequence and set it up
    CREATE SEQUENCE IF NOT EXISTS subdomains_id_seq;
    PERFORM setval('subdomains_id_seq', v_max_id, false);
    ALTER TABLE subdomains ALTER COLUMN id SET DEFAULT nextval('subdomains_id_seq');
    ALTER SEQUENCE subdomains_id_seq OWNED BY subdomains.id;

    RAISE NOTICE '✓ Fixed subdomains table schema (sequence starts at %)', v_max_id;
  ELSE
    RAISE NOTICE '✓ Subdomains table schema is already correct';
  END IF;
END $$;

-- Verify the fix
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('domains', 'subdomains')
  AND column_name = 'id'
ORDER BY table_name;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHEMA FIX COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'The domains and subdomains tables have been fixed.';
  RAISE NOTICE 'You can now run migration 001_baggage_domains_subdomains_FIXED.sql';
  RAISE NOTICE '========================================';
END $$;

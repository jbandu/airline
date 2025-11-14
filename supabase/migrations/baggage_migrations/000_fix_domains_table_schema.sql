/*
  Pre-Migration 000: Fix Domains Table Schema

  Purpose: Fix the domains table ID column to use proper BIGINT auto-increment
           instead of UUID default value

  Run this FIRST before running migration 001
*/

-- Check current schema and fix if needed
DO $$
DECLARE
  v_id_type TEXT;
  v_has_uuid_default BOOLEAN;
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

    -- Make it an auto-increment column
    -- First check if it's already an identity column
    IF NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      WHERE c.relname = 'domains'
        AND a.attname = 'id'
        AND a.attidentity != ''
    ) THEN
      -- Convert to identity column
      -- Note: This requires PostgreSQL 10+
      BEGIN
        -- Get the max ID first
        DECLARE
          v_max_id BIGINT;
        BEGIN
          SELECT COALESCE(MAX(id), 0) + 1 INTO v_max_id FROM domains;

          -- Set up sequence
          CREATE SEQUENCE IF NOT EXISTS domains_id_seq;
          ALTER SEQUENCE domains_id_seq RESTART WITH v_max_id;
          ALTER TABLE domains ALTER COLUMN id SET DEFAULT nextval('domains_id_seq');
          ALTER SEQUENCE domains_id_seq OWNED BY domains.id;

          RAISE NOTICE 'Created sequence starting at %', v_max_id;
        END;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Note: Could not create identity column, but removed UUID default';
      END;
    END IF;

    RAISE NOTICE '✓ Fixed domains table schema';
  ELSE
    RAISE NOTICE '✓ Domains table schema is correct';
  END IF;

  -- Do the same for subdomains table
  SELECT
    data_type,
    column_default LIKE '%gen_random_uuid%'
  INTO v_id_type, v_has_uuid_default
  FROM information_schema.columns
  WHERE table_name = 'subdomains'
    AND column_name = 'id';

  IF v_id_type = 'bigint' AND v_has_uuid_default THEN
    ALTER TABLE subdomains ALTER COLUMN id DROP DEFAULT;

    DECLARE
      v_max_id BIGINT;
    BEGIN
      SELECT COALESCE(MAX(id), 0) + 1 INTO v_max_id FROM subdomains;
      CREATE SEQUENCE IF NOT EXISTS subdomains_id_seq;
      ALTER SEQUENCE subdomains_id_seq RESTART WITH v_max_id;
      ALTER TABLE subdomains ALTER COLUMN id SET DEFAULT nextval('subdomains_id_seq');
      ALTER SEQUENCE subdomains_id_seq OWNED BY subdomains.id;
    END;

    RAISE NOTICE '✓ Fixed subdomains table schema';
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

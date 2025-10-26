/*
  # Add icon URL to domains table

  1. Changes
    - Add `icon_url` column to `domains` table to store custom domain icons/images
    - Column is nullable to allow domains without custom icons
    - Column type is text to store image URLs

  2. Notes
    - Existing domains will have null icon_url by default
    - Icons can be uploaded and stored via Supabase Storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'domains' 
      AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE domains ADD COLUMN icon_url text;
  END IF;
END $$;

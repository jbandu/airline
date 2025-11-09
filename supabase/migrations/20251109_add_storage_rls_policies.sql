-- Add RLS policies for storage buckets to allow profile photo uploads

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile photos" ON storage.objects;

-- Policy: Allow authenticated users to upload profile photos
CREATE POLICY "Allow authenticated users to upload profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Policy: Allow users to view their own profile photos
CREATE POLICY "Allow users to view their own profile photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Policy: Allow public read access to profile photos (so they display in app)
CREATE POLICY "Allow public read access to profile photos"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Policy: Allow users to update their own profile photos
CREATE POLICY "Allow users to update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
)
WITH CHECK (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Policy: Allow users to delete their own profile photos
CREATE POLICY "Allow users to delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Ensure the 'public' bucket exists and is publicly accessible
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO UPDATE SET public = true;

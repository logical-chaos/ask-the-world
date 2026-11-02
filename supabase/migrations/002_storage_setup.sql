-- ==============================================================================
-- BLU APPLICATION - STORAGE CONFIGURATION & SECURITY POLICIES
-- Migration: 002_storage_setup.sql
-- ==============================================================================
--
-- IMPORTANT PRIVILEGE NOTICE FOR SUPABASE HOSTED PROJECTS:
--
-- 1. storage.buckets:
--    The `postgres` role has INSERT and UPDATE privileges on `storage.buckets`.
--    Part 1 of this script will configure the 'avatars' and 'post-media' buckets.
--
-- 2. storage.objects:
--    In PostgreSQL, `CREATE POLICY` requires table ownership (pg_class_ownercheck).
--    In hosted Supabase, `storage.objects` is owned by `supabase_storage_admin`.
--    If executed in the Supabase Cloud SQL Editor under the standard `postgres` role,
--    Part 2 will return:
--      ERROR: 42501: must be owner of table objects
--
--    HOW TO APPLY PART 2:
--    - If using Supabase CLI (`supabase db push` / local docker): Runs as superuser, succeeds.
--    - If using Supabase Cloud SQL Editor: Run Part 1 below in SQL Editor, and apply
--      the 4 policies in Part 2 via the Supabase Dashboard UI:
--      Storage -> Configuration / Policies -> 'avatars' & 'post-media'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: BUCKET PROVISIONING (Supported in SQL Editor)
-- ------------------------------------------------------------------------------
-- 'avatars': Public bucket for user avatars (Max 5MB)
-- 'post-media': Public bucket for question/discussion images and video (Max 10MB)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    TRUE,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  ),
  (
    'post-media',
    'post-media',
    TRUE,
    10485760, -- 10 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4']
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ------------------------------------------------------------------------------
-- PART 2: ROW LEVEL SECURITY POLICIES FOR storage.objects
-- ------------------------------------------------------------------------------
-- If running via Supabase CLI (superuser), execute directly.
-- If running in Supabase Cloud SQL Editor and error 42501 occurs, use Dashboard UI.

-- 1. Public Read Access
DROP POLICY IF EXISTS "Public media read access" ON storage.objects;
CREATE POLICY "Public media read access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'post-media'));

-- 2. Authenticated Upload Access (Folder-Isolated: <auth.uid()>/...)
DROP POLICY IF EXISTS "User isolated uploads" ON storage.objects;
CREATE POLICY "User isolated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('avatars', 'post-media')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 3. Authenticated Update Access (Folder-Isolated: <auth.uid()>/...)
DROP POLICY IF EXISTS "User updates own media" ON storage.objects;
CREATE POLICY "User updates own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('avatars', 'post-media')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'post-media')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 4. Authenticated Delete Access (Folder-Isolated: <auth.uid()>/...)
DROP POLICY IF EXISTS "User deletes own media" ON storage.objects;
CREATE POLICY "User deletes own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('avatars', 'post-media')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ==============================================================================
-- End of Migration 002_storage_setup.sql
-- ==============================================================================


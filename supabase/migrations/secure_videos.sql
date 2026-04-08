-- 1. Secure the `videos` table
-- Drop the previous open insert policy
DROP POLICY IF EXISTS "Anyone can insert videos" ON public.videos;

-- Add new policies for authenticated users
CREATE POLICY "Authenticated users can insert videos"
ON public.videos FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos"
ON public.videos FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete videos"
ON public.videos FOR DELETE TO authenticated
USING (true);

-- Ensure authenticated users have necessary permissions
GRANT UPDATE, DELETE ON public.videos TO authenticated;

-- 2. Secure the `videos` storage bucket
-- Drop the previous open upload policy
DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;

-- Add new policies for authenticated users
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'videos' );

CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'videos' );

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'videos' );

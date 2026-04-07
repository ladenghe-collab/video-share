-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Grant basic read and write access to the anon and authenticated roles
GRANT SELECT, INSERT ON public.videos TO anon;
GRANT SELECT, INSERT ON public.videos TO authenticated;

-- Policies for videos table
CREATE POLICY "Public videos are viewable by everyone"
ON public.videos FOR SELECT
USING ( true );

CREATE POLICY "Anyone can insert videos"
ON public.videos FOR INSERT
WITH CHECK ( true );

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for storage bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'videos' );

CREATE POLICY "Anyone can upload videos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'videos' );

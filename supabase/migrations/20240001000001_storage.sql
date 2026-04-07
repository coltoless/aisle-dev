-- Create private contracts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'contracts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own contracts
CREATE POLICY "Users can read their own contracts"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'contracts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own contracts
CREATE POLICY "Users can delete their own contracts"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'contracts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

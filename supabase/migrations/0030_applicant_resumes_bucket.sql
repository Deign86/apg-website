-- Migration 0030: Dedicated applicant-resumes storage bucket with restricted admin-only RLS
-- Owner: apg-website

-- 1. Create applicant-resumes bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applicant-resumes',
  'applicant-resumes',
  false,
  15728640, -- 15MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 2. Staff & Admin read access policy
DROP POLICY IF EXISTS "applicant_resumes_staff_read" ON storage.objects;
CREATE POLICY "applicant_resumes_staff_read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'applicant-resumes'
  AND public.is_staff()
);

-- 3. Admin-only delete policy
DROP POLICY IF EXISTS "applicant_resumes_admin_delete" ON storage.objects;
CREATE POLICY "applicant_resumes_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'applicant-resumes'
  AND public.is_admin()
);

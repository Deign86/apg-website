-- ============================================================
-- APG ADMIN PANEL — SUPABASE MIGRATION
-- Creates: blogs, careers, chatbot_kb, activity_log, settings, profiles
-- Plus RLS policies for all tables
-- ============================================================

-- 1. BLOGS
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  author text,
  cover_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  tags text[],
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CAREERS
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  location text,
  type text CHECK (type IN ('Full-time','Part-time','Contract','Internship')),
  description text,
  requirements text,
  benefits text,
  status text DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CHATBOT KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS chatbot_kb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text CHECK (category IN ('Company Info','Properties','Pricing','Careers','General')),
  question text NOT NULL,
  answer text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  resource_title text,
  details text,
  created_at timestamptz DEFAULT now()
);

-- 5. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- 6. PROFILES (safe re-create if missing columns)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'editor' CHECK (role IN ('owner','admin','editor')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ensure columns exist on existing profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'editor' CHECK (role IN ('owner','admin','editor'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='active') THEN
    ALTER TABLE profiles ADD COLUMN active boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_deleted_at ON blogs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_careers_status ON careers(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_kb_category ON chatbot_kb(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_kb_active ON chatbot_kb(active);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read for blogs, careers, chatbot_kb, settings
CREATE POLICY "public_read_blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "public_read_careers" ON careers FOR SELECT USING (true);
CREATE POLICY "public_read_chatbot_kb" ON chatbot_kb FOR SELECT USING (active = true);
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);

-- Admin write policies (authenticated + role in editor/admin/owner)
CREATE POLICY "admin_write_blogs" ON blogs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_blogs" ON blogs FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_delete_blogs" ON blogs FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

CREATE POLICY "admin_write_careers" ON careers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_careers" ON careers FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_delete_careers" ON careers FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

CREATE POLICY "admin_write_chatbot_kb" ON chatbot_kb FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_chatbot_kb" ON chatbot_kb FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_delete_chatbot_kb" ON chatbot_kb FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

CREATE POLICY "admin_write_settings" ON settings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

-- activity_log: authenticated users can INSERT, admin/owner can SELECT
CREATE POLICY "auth_insert_activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "admin_read_activity" ON activity_log FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));

-- profiles: users read own row; owner can update roles
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner_update_profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- inquiries: no public read; authenticated admin only for all ops
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_inquiries" ON inquiries FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_write_inquiries" ON inquiries FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_inquiries" ON inquiries FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_delete_inquiries" ON inquiries FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

-- offerings: public read for published; admin write
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_offerings" ON offerings FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "admin_write_offerings" ON offerings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_update_offerings" ON offerings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));
CREATE POLICY "admin_delete_offerings" ON offerings FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','editor')));

-- 7. CHAT LOGS (public chatbot conversations for admin insight)
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_identifier text,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  model text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
-- Only admin/owner can read chat logs
CREATE POLICY "admin_read_chat_logs" ON chat_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
-- Server can insert via service role (bypasses RLS)

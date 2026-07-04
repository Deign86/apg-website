-- Migration 002: Indexes
-- Mirrors both firestore.indexes.json files

-- Offerings: composite indexes matching Firestore rules
CREATE INDEX idx_offerings_status_created ON public.offerings(status, created_at DESC);
CREATE INDEX idx_offerings_property_type_created ON public.offerings(property_type, created_at DESC);
CREATE INDEX idx_offerings_status_property_type_created ON public.offerings(status, property_type, created_at DESC);
CREATE INDEX idx_offerings_location_created ON public.offerings(location, created_at DESC);
CREATE INDEX idx_offerings_created_at ON public.offerings(created_at DESC);
-- Child tables: FK + timestamp
CREATE INDEX idx_offering_comments_offering_created ON public.offering_comments(offering_id, created_at DESC);
CREATE INDEX idx_offering_ratings_offering_created ON public.offering_ratings(offering_id, created_at DESC);
CREATE INDEX idx_offering_reactions_offering_created ON public.offering_reactions(offering_id, created_at DESC);
-- Blogs, Careers, Services: timestamp sort
CREATE INDEX idx_blogs_date_published ON public.blogs(date_published DESC);
CREATE INDEX idx_careers_created ON public.careers(created_at DESC);
CREATE INDEX idx_services_created ON public.services(created_at DESC);
-- Inquiries: admin reads by status
CREATE INDEX idx_inquiries_status_created ON public.inquiries(status, created_at DESC);
-- Chat messages: session + timestamp (mirrors Firestore collection_group index on messages)
CREATE INDEX idx_chat_messages_session_created ON public.chat_messages(session_id, created_at ASC);

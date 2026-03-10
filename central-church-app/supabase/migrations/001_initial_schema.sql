-- ============================================================
-- Central Church App — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('guest', 'member', 'staff', 'elder');
CREATE TYPE prayer_status AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE prayer_category AS ENUM ('Health', 'Church', 'Family', 'Community', 'Outreach');
CREATE TYPE event_type AS ENUM ('general', 'info_cta', 'signup');
CREATE TYPE cta_type AS ENUM ('none', 'signup_link', 'contact_person', 'register_form');
CREATE TYPE announcement_status AS ENUM ('live', 'draft', 'archived');
CREATE TYPE podcast_source AS ENUM ('rss', 'manual');
CREATE TYPE notification_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');
CREATE TYPE notification_link_type AS ENUM ('none', 'event', 'announcement', 'prayer', 'url');

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  phone           text,
  email           text NOT NULL,
  avatar_url      text,
  role            user_role NOT NULL DEFAULT 'guest',
  bio             text,
  ministry_tags   text[],
  member_since    date,
  onesignal_id    text,
  push_categories text[],
  is_verified     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- PRAYER REQUESTS
-- ============================================================

CREATE TABLE prayer_requests (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  body         text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_pinned    boolean NOT NULL DEFAULT false,
  status       prayer_status NOT NULL DEFAULT 'pending',
  category     prayer_category NOT NULL,
  week_of      date NOT NULL DEFAULT date_trunc('week', now())::date,
  prayed_count integer NOT NULL DEFAULT 0,
  approved_by  uuid REFERENCES profiles(id),
  approved_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prayer_interactions (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id  uuid NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prayer_request_id, user_id)
);

-- RPC to safely increment prayed_count
CREATE OR REPLACE FUNCTION increment_prayed_count(request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE prayer_requests
  SET prayed_count = prayed_count + 1
  WHERE id = request_id;
END;
$$;

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE events (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  description      text,
  location         text NOT NULL,
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz NOT NULL,
  category         text NOT NULL,
  event_type       event_type NOT NULL DEFAULT 'general',
  is_recurring     boolean NOT NULL DEFAULT false,
  recurrence_rule  text,
  cta_type         cta_type NOT NULL DEFAULT 'none',
  cta_value        text,
  contact_name     text,
  contact_phone    text,
  contact_email    text,
  is_featured      boolean NOT NULL DEFAULT false,
  created_by       uuid NOT NULL REFERENCES profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

CREATE TABLE announcements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text NOT NULL,
  body          text NOT NULL,
  audience_tag  text NOT NULL,
  contact_name  text,
  contact_phone text,
  signup_url    text,
  display_order integer NOT NULL DEFAULT 0,
  status        announcement_status NOT NULL DEFAULT 'draft',
  expires_at    timestamptz,
  created_by    uuid NOT NULL REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SERMONS
-- ============================================================

CREATE TABLE sermons (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               text NOT NULL,
  youtube_url         text NOT NULL,
  youtube_video_id    text NOT NULL,
  speaker             text NOT NULL,
  scripture_reference text,
  series_name         text,
  description         text,
  is_featured         boolean NOT NULL DEFAULT false,
  sermon_date         date NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PODCAST EPISODES
-- ============================================================

CREATE TABLE podcast_episodes (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_number      integer NOT NULL,
  title               text NOT NULL,
  audio_url           text NOT NULL,
  speaker             text NOT NULL,
  scripture_reference text,
  duration_seconds    integer NOT NULL DEFAULT 0,
  description         text,
  source              podcast_source NOT NULL DEFAULT 'manual',
  published_at        date NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PHOTO ALBUMS
-- ============================================================

CREATE TABLE photo_albums (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  category         text NOT NULL,
  google_photos_url text,
  header_photo_url text,
  photo_count      integer NOT NULL DEFAULT 0,
  display_order    integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- COMMUNITY GROUPS
-- ============================================================

CREATE TABLE community_groups (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  description   text NOT NULL,
  category      text NOT NULL,
  groupme_url   text,
  member_count  integer NOT NULL DEFAULT 0,
  emoji         text,
  is_featured   boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PUSH NOTIFICATIONS
-- ============================================================

CREATE TABLE push_notifications (
  id                        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                     text NOT NULL,
  body                      text NOT NULL,
  audience_segments         text[] NOT NULL,
  link_type                 notification_link_type NOT NULL DEFAULT 'none',
  link_value                text,
  scheduled_at              timestamptz,
  sent_at                   timestamptz,
  status                    notification_status NOT NULL DEFAULT 'draft',
  onesignal_notification_id text,
  created_by                uuid NOT NULL REFERENCES profiles(id),
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: is staff or elder
CREATE OR REPLACE FUNCTION is_staff_or_elder()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff', 'elder')
  );
$$;

-- PROFILES
CREATE POLICY "profiles_read_verified" ON profiles
  FOR SELECT USING (
    is_verified = true OR id = auth.uid()
  );
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- PRAYER REQUESTS
CREATE POLICY "prayer_read_approved_or_own" ON prayer_requests
  FOR SELECT USING (
    status = 'approved' OR user_id = auth.uid()
  );
CREATE POLICY "prayer_insert_auth" ON prayer_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "prayer_admin_all" ON prayer_requests
  FOR ALL USING (is_staff_or_elder());

-- PRAYER INTERACTIONS
CREATE POLICY "interactions_read_own" ON prayer_interactions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "interactions_insert_own" ON prayer_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- EVENTS (public read)
CREATE POLICY "events_read_public" ON events FOR SELECT USING (true);
CREATE POLICY "events_write_admin" ON events
  FOR ALL USING (is_staff_or_elder());

-- ANNOUNCEMENTS (auth read)
CREATE POLICY "announcements_read_auth" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'live');
CREATE POLICY "announcements_write_admin" ON announcements
  FOR ALL USING (is_staff_or_elder());

-- SERMONS (public read)
CREATE POLICY "sermons_read_public" ON sermons FOR SELECT USING (true);
CREATE POLICY "sermons_write_admin" ON sermons
  FOR ALL USING (is_staff_or_elder());

-- PODCAST EPISODES (public read)
CREATE POLICY "podcast_read_public" ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "podcast_write_admin" ON podcast_episodes
  FOR ALL USING (is_staff_or_elder());

-- PHOTO ALBUMS (public read)
CREATE POLICY "albums_read_public" ON photo_albums FOR SELECT USING (true);
CREATE POLICY "albums_write_admin" ON photo_albums
  FOR ALL USING (is_staff_or_elder());

-- COMMUNITY GROUPS (public read)
CREATE POLICY "groups_read_public" ON community_groups FOR SELECT USING (true);
CREATE POLICY "groups_write_admin" ON community_groups
  FOR ALL USING (is_staff_or_elder());

-- PUSH NOTIFICATIONS (staff/elder only)
CREATE POLICY "push_staff_only" ON push_notifications
  FOR ALL USING (is_staff_or_elder());

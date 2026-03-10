-- ============================================================
-- Migration 002 — Google Calendar Sync + Event Approval Flow
-- ============================================================

-- Add event_status enum (mirrors prayer_status pattern)
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'declined');

-- Add new columns to events
ALTER TABLE events
  ADD COLUMN status                  event_status NOT NULL DEFAULT 'pending',
  ADD COLUMN google_calendar_event_id text UNIQUE,
  ADD COLUMN google_calendar_id       text;

-- Make created_by nullable so the sync service can insert events
-- without needing a profile row (system-synced events have no human author)
ALTER TABLE events ALTER COLUMN created_by DROP NOT NULL;

-- Indexes
CREATE INDEX idx_events_status
  ON events(status);

CREATE INDEX idx_events_google_calendar_event_id
  ON events(google_calendar_event_id)
  WHERE google_calendar_event_id IS NOT NULL;

-- ============================================================
-- Update RLS for events
-- ============================================================

-- Drop the old "anyone can read everything" policy
DROP POLICY "events_read_public" ON events;

-- Public (including unauthenticated) can only see approved events
CREATE POLICY "events_read_approved" ON events
  FOR SELECT USING (status = 'approved');

-- Staff and elders can read all events regardless of status
CREATE POLICY "events_read_admin" ON events
  FOR SELECT USING (is_staff_or_elder());

-- The existing "events_write_admin" policy (ALL for staff/elder) already covers
-- INSERT/UPDATE/DELETE, including approving/declining synced events.
-- No changes needed there.

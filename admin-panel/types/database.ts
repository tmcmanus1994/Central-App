export type Role = 'guest' | 'member' | 'staff' | 'elder'
export type EventType = 'general' | 'info_cta' | 'signup'
export type CtaType = 'none' | 'signup_link' | 'contact_person' | 'register_form'
export type EventStatus = 'pending' | 'approved' | 'declined'
export type PrayerStatus = 'pending' | 'approved' | 'declined'
export type PushStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled'
export type LinkType = 'none' | 'event' | 'announcement' | 'prayer' | 'url'
export type AnnouncementStatus = 'live' | 'draft' | 'archived'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  role: Role
  bio: string | null
  ministry_tags: string[] | null
  member_since: string | null
  onesignal_id: string | null
  push_categories: string[] | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string
  starts_at: string
  ends_at: string
  category: string
  event_type: EventType
  is_recurring: boolean
  recurrence_rule: string | null
  cta_type: CtaType
  cta_value: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  is_featured: boolean
  status: EventStatus
  google_calendar_event_id: string | null
  google_calendar_id: string | null
  created_by: string | null
  created_at: string
}

export interface PrayerRequest {
  id: string
  user_id: string | null
  display_name: string
  body: string
  is_anonymous: boolean
  is_pinned: boolean
  status: PrayerStatus
  category: string
  week_of: string
  prayed_count: number
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export interface PushNotification {
  id: string
  title: string
  body: string
  audience_segments: string[]
  link_type: LinkType
  link_value: string | null
  scheduled_at: string | null
  sent_at: string | null
  status: PushStatus
  onesignal_notification_id: string | null
  created_by: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> }
      prayer_requests: { Row: PrayerRequest; Insert: Partial<PrayerRequest>; Update: Partial<PrayerRequest> }
      push_notifications: { Row: PushNotification; Insert: Partial<PushNotification>; Update: Partial<PushNotification> }
    }
  }
}

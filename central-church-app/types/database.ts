export type UserRole = 'guest' | 'member' | 'staff' | 'elder';
export type PrayerStatus = 'pending' | 'approved' | 'declined';
export type PrayerCategory = 'Health' | 'Church' | 'Family' | 'Community' | 'Outreach';
export type EventType = 'general' | 'info_cta' | 'signup';
export type CtaType = 'none' | 'signup_link' | 'contact_person' | 'register_form';
export type AnnouncementStatus = 'live' | 'draft' | 'archived';
export type PodcastSource = 'rss' | 'manual';
export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';
export type NotificationLinkType = 'none' | 'event' | 'announcement' | 'prayer' | 'url';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  ministry_tags: string[] | null;
  member_since: string | null;
  onesignal_id: string | null;
  push_categories: string[] | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string | null;
  display_name: string;
  body: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  status: PrayerStatus;
  category: PrayerCategory;
  week_of: string;
  prayed_count: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PrayerInteraction {
  id: string;
  prayer_request_id: string;
  user_id: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  ends_at: string;
  category: string;
  event_type: EventType;
  is_recurring: boolean;
  recurrence_rule: string | null;
  cta_type: CtaType;
  cta_value: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_featured: boolean;
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience_tag: string;
  contact_name: string | null;
  contact_phone: string | null;
  signup_url: string | null;
  display_order: number;
  status: AnnouncementStatus;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  speaker: string;
  scripture_reference: string | null;
  series_name: string | null;
  description: string | null;
  is_featured: boolean;
  sermon_date: string;
  created_at: string;
}

export interface PodcastEpisode {
  id: string;
  episode_number: number;
  title: string;
  audio_url: string;
  speaker: string;
  scripture_reference: string | null;
  duration_seconds: number;
  description: string | null;
  source: PodcastSource;
  published_at: string;
  created_at: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  category: string;
  google_photos_url: string | null;
  header_photo_url: string | null;
  photo_count: number;
  display_order: number;
  created_at: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  groupme_url: string | null;
  member_count: number;
  emoji: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  audience_segments: string[];
  link_type: NotificationLinkType;
  link_value: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: NotificationStatus;
  onesignal_notification_id: string | null;
  created_by: string;
  created_at: string;
}

import { createClient } from '@supabase/supabase-js';
import type { Profile, PrayerRequest, PrayerInteraction, Event, Announcement, Sermon, PodcastEpisode, PhotoAlbum, CommunityGroup, PushNotification } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Omit<Profile, 'id'>> };
      prayer_requests: { Row: PrayerRequest; Insert: Omit<PrayerRequest, 'id' | 'created_at' | 'prayed_count' | 'approved_by' | 'approved_at'>; Update: Partial<Omit<PrayerRequest, 'id'>> };
      prayer_interactions: { Row: PrayerInteraction; Insert: Omit<PrayerInteraction, 'id' | 'created_at'>; Update: never };
      events: { Row: Event; Insert: Omit<Event, 'id' | 'created_at'>; Update: Partial<Omit<Event, 'id'>> };
      announcements: { Row: Announcement; Insert: Omit<Announcement, 'id' | 'created_at'>; Update: Partial<Omit<Announcement, 'id'>> };
      sermons: { Row: Sermon; Insert: Omit<Sermon, 'id' | 'created_at'>; Update: Partial<Omit<Sermon, 'id'>> };
      podcast_episodes: { Row: PodcastEpisode; Insert: Omit<PodcastEpisode, 'id' | 'created_at'>; Update: Partial<Omit<PodcastEpisode, 'id'>> };
      photo_albums: { Row: PhotoAlbum; Insert: Omit<PhotoAlbum, 'id' | 'created_at'>; Update: Partial<Omit<PhotoAlbum, 'id'>> };
      community_groups: { Row: CommunityGroup; Insert: Omit<CommunityGroup, 'id' | 'created_at'>; Update: Partial<Omit<CommunityGroup, 'id'>> };
      push_notifications: { Row: PushNotification; Insert: Omit<PushNotification, 'id' | 'created_at'>; Update: Partial<Omit<PushNotification, 'id'>> };
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * OneSignal helpers — client side only.
 * The actual notification sending happens via the Supabase Edge Function.
 * NEVER import or use ONESIGNAL_REST_API_KEY here.
 */

import { Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { supabase } from './supabase';

// ── Segment constants ─────────────────────────────────────────────────────────

export const ONESIGNAL_SEGMENTS = {
  ALL_MEMBERS: 'all-members',
  PARENTS_TEENS: 'parents-teens',
  COMMUNITY_20S: 'community-20s',
  COMMUNITY_30S: 'community-30s',
  COMMUNITY_40S: 'community-40s',
  VOLUNTEERS: 'volunteers',
  OUTREACH: 'outreach',
  STAFF_ONLY: 'staff-only',
} as const;

export type OneSignalSegment = (typeof ONESIGNAL_SEGMENTS)[keyof typeof ONESIGNAL_SEGMENTS];

// ── Category display config (for opt-in screen) ───────────────────────────────

export interface PushCategory {
  segment: OneSignalSegment;
  label: string;
  description: string;
  defaultOn: boolean;
  staffOnly: boolean;
}

export const PUSH_CATEGORIES: PushCategory[] = [
  {
    segment: ONESIGNAL_SEGMENTS.ALL_MEMBERS,
    label: 'General Announcements',
    description: 'Service updates, church-wide news, and important alerts',
    defaultOn: true,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.PARENTS_TEENS,
    label: 'Youth & Parents',
    description: 'Teen ministry events, youth group updates',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.COMMUNITY_20S,
    label: "Community (20's)",
    description: 'Events and meetups for young adults in their 20s',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.COMMUNITY_30S,
    label: "Community (30's)",
    description: 'Events and meetups for adults in their 30s',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.COMMUNITY_40S,
    label: "Community (40's)",
    description: 'Events and meetups for adults in their 40s',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.VOLUNTEERS,
    label: 'Volunteers',
    description: 'Volunteer scheduling, serve team reminders',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.OUTREACH,
    label: 'Community Outreach',
    description: 'Outreach events, service opportunities',
    defaultOn: false,
    staffOnly: false,
  },
  {
    segment: ONESIGNAL_SEGMENTS.STAFF_ONLY,
    label: 'Staff Communications',
    description: 'Internal staff updates and scheduling',
    defaultOn: false,
    staffOnly: true,
  },
];

// ── SDK init ─────────────────────────────────────────────────────────────────

export function initOneSignal(): void {
  if (Platform.OS === 'web') return;
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('EXPO_PUBLIC_ONESIGNAL_APP_ID is not set — push notifications disabled');
    return;
  }
  OneSignal.initialize(appId);
}

// ── Link OneSignal user to Supabase profile ───────────────────────────────────

export function loginOneSignalUser(supabaseUserId: string): void {
  if (Platform.OS === 'web') return;
  OneSignal.login(supabaseUserId);
}

export function logoutOneSignalUser(): void {
  if (Platform.OS === 'web') return;
  OneSignal.logout();
}

// ── Segment tagging ───────────────────────────────────────────────────────────

export function applySegmentTags(segments: OneSignalSegment[]): void {
  if (Platform.OS === 'web') return;
  const allSegments = Object.values(ONESIGNAL_SEGMENTS) as OneSignalSegment[];
  const tagUpdates: Record<string, string> = {};
  for (const seg of allSegments) {
    tagUpdates[seg] = segments.includes(seg) ? '1' : '0';
  }
  OneSignal.User.addTags(tagUpdates);
}

// ── Save preferences (request permission + tag + persist to DB) ───────────────

export async function savePushPreferences(
  userId: string,
  selectedSegments: OneSignalSegment[],
): Promise<void> {
  if (Platform.OS !== 'web') {
    await OneSignal.Notifications.requestPermission(true);
    applySegmentTags(selectedSegments);

    // Give OneSignal a moment to register the push subscription ID
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    const pushId = OneSignal.User.pushSubscription.id ?? null;

    await supabase
      .from('profiles')
      .update({
        push_categories: selectedSegments,
        ...(pushId ? { onesignal_id: pushId } : {}),
      })
      .eq('id', userId);
  } else {
    await supabase
      .from('profiles')
      .update({ push_categories: selectedSegments })
      .eq('id', userId);
  }
}

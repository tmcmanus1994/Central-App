/**
 * OneSignal helpers — client side only.
 * The actual notification sending happens via the Supabase Edge Function.
 * NEVER import or use ONESIGNAL_REST_API_KEY here.
 */

/** OneSignal segment names used across the app */
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

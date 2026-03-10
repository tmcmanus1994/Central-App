import type { Event } from './database';

/** An event instance with a resolved occurrence date (used for recurring events) */
export interface EventOccurrence extends Event {
  occurrence_date: Date;
}

/** Push notification opt-in categories shown during onboarding */
export type PushCategory =
  | 'all-members'
  | 'parents-teens'
  | 'community-20s'
  | 'community-30s'
  | 'community-40s'
  | 'volunteers'
  | 'outreach'
  | 'staff-only';

export type ColorScheme = 'light' | 'dark';

/** Result wrapper for async data states */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

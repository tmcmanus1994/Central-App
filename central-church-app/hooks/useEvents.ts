import { useState, useEffect } from 'react';
import { RRule } from 'rrule';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';
import type { EventOccurrence, AsyncState } from '../types/app';

function expandRecurringEvent(event: Event, limit = 12): EventOccurrence[] {
  if (!event.recurrence_rule) return [];

  try {
    const rule = RRule.fromString(event.recurrence_rule);
    const occurrences = rule.all((_, i) => i < limit);

    return occurrences.map((date) => ({
      ...event,
      occurrence_date: date,
    }));
  } catch {
    return [];
  }
}

export function useEvents() {
  const [state, setState] = useState<AsyncState<EventOccurrence[]>>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });

    const now = new Date().toISOString();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('starts_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setState({ status: 'error', message: error.message });
          return;
        }

        const events = data ?? [];
        const occurrences: EventOccurrence[] = [];

        for (const event of events) {
          if (event.is_recurring && event.recurrence_rule) {
            const recurring = expandRecurringEvent(event).filter(
              (e) => e.occurrence_date.toISOString() >= now && e.occurrence_date.toISOString() <= in30Days
            );
            occurrences.push(...recurring);
          } else if (event.starts_at >= now && event.starts_at <= in30Days) {
            occurrences.push({ ...event, occurrence_date: new Date(event.starts_at) });
          }
        }

        occurrences.sort((a, b) =>
          a.occurrence_date.getTime() - b.occurrence_date.getTime()
        );

        setState({ status: 'success', data: occurrences });
      });
  }, []);

  return state;
}

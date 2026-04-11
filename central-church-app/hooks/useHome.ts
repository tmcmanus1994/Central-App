import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Event, Sermon, Announcement } from '../types/database';

interface HomeData {
  featuredEvent: Event | null;
  latestSermon: Sermon | null;
  announcements: Announcement[];
}

type HomeState =
  | { status: 'loading' }
  | { status: 'success'; data: HomeData }
  | { status: 'error'; message: string };

export function useHome() {
  const [state, setState] = useState<HomeState>({ status: 'loading' });

  const fetch = async () => {
    setState({ status: 'loading' });

    const [eventRes, sermonRes, announcementsRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('is_featured', true)
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('sermons')
        .select('*')
        .eq('is_featured', true)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('announcements')
        .select('*')
        .eq('status', 'live')
        .order('display_order', { ascending: true })
        .limit(2),
    ]);

    setState({
      status: 'success',
      data: {
        featuredEvent: eventRes.error ? null : (eventRes.data ?? null),
        latestSermon: sermonRes.error ? null : (sermonRes.data ?? null),
        announcements: announcementsRes.error ? [] : (announcementsRes.data ?? []),
      },
    });
  };

  useEffect(() => { fetch(); }, []);

  return { state, refresh: fetch };
}

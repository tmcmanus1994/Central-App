import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Announcement } from '../types/database';

type AnnouncementsState =
  | { status: 'loading' }
  | { status: 'success'; data: Announcement[] }
  | { status: 'error'; message: string };

export function useAnnouncements() {
  const [state, setState] = useState<AnnouncementsState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'live')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('display_order', { ascending: true });

    if (error) {
      setState({ status: 'error', message: error.message });
    } else {
      setState({ status: 'success', data: data ?? [] });
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { state, refresh: fetch };
}

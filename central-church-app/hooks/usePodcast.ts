import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PodcastEpisode } from '../types/database';

type PodcastState =
  | { status: 'loading' }
  | { status: 'success'; data: PodcastEpisode[] }
  | { status: 'error'; message: string };

export function usePodcast() {
  const [state, setState] = useState<PodcastState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .order('episode_number', { ascending: false });

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

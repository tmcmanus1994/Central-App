import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Sermon } from '../types/database';

type SermonsState =
  | { status: 'loading' }
  | { status: 'success'; data: Sermon[] }
  | { status: 'error'; message: string };

export function useSermons() {
  const [state, setState] = useState<SermonsState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('sermon_date', { ascending: false });

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

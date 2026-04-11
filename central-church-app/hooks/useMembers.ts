import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

type MembersState =
  | { status: 'loading' }
  | { status: 'success'; data: Profile[] }
  | { status: 'error'; message: string };

export function useMembers() {
  const [state, setState] = useState<MembersState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_verified', true)
      .neq('role', 'guest')
      .order('full_name', { ascending: true });

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

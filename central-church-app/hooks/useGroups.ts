import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CommunityGroup } from '../types/database';

type GroupsState =
  | { status: 'loading' }
  | { status: 'success'; data: CommunityGroup[] }
  | { status: 'error'; message: string };

export function useGroups() {
  const [state, setState] = useState<GroupsState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('community_groups')
      .select('*')
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

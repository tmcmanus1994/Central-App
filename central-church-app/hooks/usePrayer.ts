import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PrayerRequest } from '../types/database';
import type { AsyncState } from '../types/app';

export function usePrayer() {
  const [state, setState] = useState<AsyncState<PrayerRequest[]>>({ status: 'idle' });
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const fetchPrayers = async () => {
    setState({ status: 'loading' });

    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('status', 'approved')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      setState({ status: 'error', message: error.message });
      return;
    }

    setState({ status: 'success', data: data ?? [] });
  };

  const fetchPrayedIds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('prayer_interactions')
      .select('prayer_request_id')
      .eq('user_id', user.id);

    if (data) {
      setPrayedIds(new Set(data.map((r) => r.prayer_request_id)));
    }
  };

  const markPrayed = async (prayerRequestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || prayedIds.has(prayerRequestId)) return;

    const { error } = await supabase
      .from('prayer_interactions')
      .insert({ prayer_request_id: prayerRequestId, user_id: user.id });

    if (!error) {
      setPrayedIds((prev) => new Set([...prev, prayerRequestId]));

      await supabase.rpc('increment_prayed_count', {
        request_id: prayerRequestId,
      });
    }
  };

  useEffect(() => {
    fetchPrayers();
    fetchPrayedIds();
  }, []);

  return { state, prayedIds, markPrayed, refresh: fetchPrayers };
}

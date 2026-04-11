import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PhotoAlbum } from '../types/database';

type PhotoAlbumsState =
  | { status: 'loading' }
  | { status: 'success'; data: PhotoAlbum[] }
  | { status: 'error'; message: string };

export function usePhotoAlbums() {
  const [state, setState] = useState<PhotoAlbumsState>({ status: 'loading' });

  const fetch = useCallback(async () => {
    setState({ status: 'loading' });
    const { data, error } = await supabase
      .from('photo_albums')
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

import { useColorScheme as useRNColorScheme } from 'react-native';
import type { ColorScheme } from '../types/app';

export function useColorScheme(): ColorScheme {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

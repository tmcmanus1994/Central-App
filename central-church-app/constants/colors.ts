export const Colors = {
  light: {
    text: {
      primary: '#1A1611',
      secondary: '#5A5248',
      accent: '#C8973A',
    },
    bg: {
      page: '#FDFAF4',
      card: '#FFFFFF',
      elevated: '#F5F0E8',
    },
    border: 'rgba(200, 151, 58, 0.2)',
    gold: '#C8973A',
  },
  dark: {
    text: {
      primary: '#F5F0E8',
      secondary: '#B0A898',
      accent: '#E8C06A',
    },
    bg: {
      page: '#0D0B08',
      card: '#1A1611',
      elevated: '#2A2015',
    },
    border: 'rgba(200, 151, 58, 0.18)',
    gold: '#E8C06A',
  },
} as const;

export type ColorScheme = keyof typeof Colors;

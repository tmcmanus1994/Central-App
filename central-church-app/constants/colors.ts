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

/** Semantic color for destructive/danger actions. Not theme-dependent. */
export const DANGER_COLOR = '#E05555';

/** White — for text/icons placed on colored (e.g. gold) backgrounds. */
export const WHITE = '#FFFFFF';

/** Per-category accent colors used on event cards and detail screens. */
export const CATEGORY_COLORS: Record<string, string> = {
  Worship: '#C8973A',
  Ministry: '#7C6F5E',
  Teen: '#5A8FA8',
  Womens: '#A87C8F',
  Mens: '#5A7CA8',
  Recreation: '#5A9E6F',
  Outreach: '#9E7A5A',
  General: '#7C6F5E',
};

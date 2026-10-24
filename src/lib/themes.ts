export const THEME_PRESETS: Record<string, {
  label: string;
  bg_primary: string;
  bg_secondary: string;
  text_primary: string;
  accent_color: string;
}> = {
  'dreamy-rose': {
    label: 'Dreamy Rose & Cream',
    bg_primary: '#F9E4E8',
    bg_secondary: '#FFF5F7',
    text_primary: '#4A2E35',
    accent_color: '#D48C96',
  },
  'midnight-rose': {
    label: 'Midnight Starlight & Rose Gold',
    bg_primary: '#0F1016',
    bg_secondary: '#1B1D29',
    text_primary: '#F5E6E8',
    accent_color: '#E29578',
  },
  'lavender-dusk': {
    label: 'Lavender Dusk',
    bg_primary: '#EDE7F6',
    bg_secondary: '#D1C4E9',
    text_primary: '#311B92',
    accent_color: '#9575CD',
  },
  'matcha-ivory': {
    label: 'Matcha & Warm Ivory',
    bg_primary: '#F4F6F0',
    bg_secondary: '#DDE5D0',
    text_primary: '#2C3E2D',
    accent_color: '#7A9A7E',
  },
};

export const FONT_OPTIONS = {
  heading: ['Playfair Display', 'Cormorant Garamond', 'Cairo'],
  body: ['Inter', 'Plus Jakarta Sans', 'Cairo'],
};

export const PARTICLE_OPTIONS = [
  { value: 'sparkles', label: '✨ Sparkles' },
  { value: 'sakura', label: '🌸 Sakura Petals' },
  { value: 'hearts', label: '💕 Floating Hearts' },
  { value: 'stars', label: '⭐ Starry Night' },
  { value: 'none', label: '🚫 Off' },
] as const;

import type { SiteSettings, EventVault, OpenWhenEnvelope, PlaylistTrack, Memory, PortalState, UploadedAsset } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  portal_title: 'Our Space ✨ Bibo & Jojo',
  his_name: 'Abanoub',
  his_nickname: 'Bibo',
  her_name: 'Jostena',
  her_nickname: 'Jojo',
  relationship_start: '2025-09-15T00:00:00+03:00',
  her_birthday: '2011-06-30',
  master_password: 'Aj1592025=1',
  theme_preset: 'dreamy-rose',
  bg_primary: '#F8DCDA',
  bg_secondary: '#F2C4C1',
  text_primary: '#44292E',
  accent_color: '#D48C96',
  card_glass_opacity: 0.55,
  heading_font: 'Playfair Display',
  body_font: 'Inter',
  particle_effect: 'sakura',
  daily_note_title: 'Daily Note from Bibo 💌 :',
  daily_note_content: 'Good luck today my Jojo! Always remember how much Bibo loves you ❤️',
  daily_note_updated_at: '2025-09-15T12:00:00.000Z',
  updated_at: '2025-09-15T12:00:00.000Z',
};

export const DEFAULT_EVENTS: EventVault[] = [
  {
    id: 'evt-valentine-2027',
    title: "Valentine's Day Surprise ❤️",
    subtitle: 'Special Surprise from Bibo to Jojo',
    target_date: '2027-02-14T00:00:00+02:00',
    is_featured: true,
    unlock_method: 'scratch',
    event_password: 'Aj1592025=1',
    force_unlocked: false,
    teaser_clue: 'A special Valentine surprise prepared by Bibo just for Jojo 💕',
    vault_letter: "Happy Valentine's Day, my love!\nEvery moment with you is a dream.\nHere's to us, forever... ❤️",
    vault_media: [
      { id: '1', type: 'image', url: '/images/couple_portrait.jpg', caption: 'Surprise_Pic.jpg' },
      { id: '2', type: 'image', url: '/images/couple_garden.jpg', caption: '15/09/2025' },
      { id: '3', type: 'image', url: '/images/couple_winter.jpg', caption: '24/12/2025' },
    ],
    created_at: '2025-09-15T12:00:00.000Z',
  },
  {
    id: 'evt-birthday-jojo',
    title: "Jojo's Birthday 🎂",
    subtitle: "Counting down to Queen Jojo's Day (30/6)",
    target_date: '2027-06-30T00:00:00+03:00',
    is_featured: false,
    unlock_method: 'scratch',
    event_password: 'Aj1592025=1',
    force_unlocked: false,
    teaser_clue: 'Counting down to June 30 for the sweetest girl in the world 🎉',
    vault_letter: "Happy Birthday my Jojo! Wishing you the happiest year ahead filled with love and joy. — Yours always, Bibo ❤️",
    vault_media: [
      { id: '4', type: 'image', url: '/images/couple_garden.jpg', caption: 'Queen Jojo' },
    ],
    created_at: '2025-09-15T12:00:00.000Z',
  },
];

export const DEFAULT_ENVELOPES: OpenWhenEnvelope[] = [
  {
    id: 'env-miss-bibo',
    title: 'Open when you miss Bibo 💌',
    emoji: '💌',
    letter_content: 'Whenever you miss me, Jojo, close your eyes and remember that Bibo is thinking about you right now too. Call me or tap the Signal button below so I know! ❤️',
    media_url: '/images/wax_envelope.jpg',
    audio_url: null,
    requires_password: false,
    sort_order: 1,
    created_at: '2025-09-15T12:00:00.000Z',
  },
  {
    id: 'env-need-smile',
    title: 'Open when you need a smile 😊',
    emoji: '😊',
    letter_content: "Your smile is Bibo's favorite thing in the entire world, Jojo. Whatever is stressing you out today will pass—I am always right here by your side.",
    media_url: '/images/couple_portrait.jpg',
    audio_url: null,
    requires_password: false,
    sort_order: 2,
    created_at: '2025-09-15T12:00:00.000Z',
  },
  {
    id: 'env-cant-sleep',
    title: "Open when you can't sleep 🌙",
    emoji: '🌙',
    letter_content: 'Take a deep breath, put on our favorite music from the player above, and rest easy my Jojo. Tomorrow is a brand new day for us. Sweet dreams ❤️',
    media_url: '/images/couple_winter.jpg',
    audio_url: null,
    requires_password: false,
    sort_order: 3,
    created_at: '2025-09-15T12:00:00.000Z',
  },
];

export const DEFAULT_TRACKS: PlaylistTrack[] = [
  {
    id: 'track-our-song',
    title: 'Our Song — Bibo & Jojo',
    artist: 'Bibo & Jojo',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/gentle_acoustic_guitar.ogg',
    cover_url: '/images/couple_portrait.jpg',
    sort_order: 1,
    created_at: '2025-09-15T12:00:00.000Z',
  },
];

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    title: '15 Sep 2025 — Where It All Began 💕',
    memory_date: '2025-09-15',
    caption: 'Our very first day together. The start of forever.',
    image_url: '/images/couple_garden.jpg',
    sort_order: 1,
    created_at: '2025-09-15T12:00:00.000Z',
  },
  {
    id: 'mem-2',
    title: '24 Dec 2025 — Cozy Winter 🎄',
    memory_date: '2025-12-24',
    caption: 'Warm cocoa, twinkling lights, and you by my side.',
    image_url: '/images/couple_winter.jpg',
    sort_order: 2,
    created_at: '2025-09-15T12:00:00.000Z',
  },
];

export const DEFAULT_ASSETS: UploadedAsset[] = [
  { id: 'ast-1', name: 'couple_portrait.jpg', url: '/images/couple_portrait.jpg', created_at: '2025-09-15T12:00:00.000Z' },
  { id: 'ast-2', name: 'couple_garden.jpg', url: '/images/couple_garden.jpg', created_at: '2025-09-15T12:00:00.000Z' },
  { id: 'ast-3', name: 'couple_winter.jpg', url: '/images/couple_winter.jpg', created_at: '2025-09-15T12:00:00.000Z' },
  { id: 'ast-4', name: 'wax_envelope.jpg', url: '/images/wax_envelope.jpg', created_at: '2025-09-15T12:00:00.000Z' },
];

export const DEFAULT_STATE: PortalState = {
  settings: DEFAULT_SETTINGS,
  events: DEFAULT_EVENTS,
  envelopes: DEFAULT_ENVELOPES,
  tracks: DEFAULT_TRACKS,
  memories: DEFAULT_MEMORIES,
  signals: [
    {
      id: 'sig-1',
      signal_type: 'heart',
      message: 'Jojo is thinking of Bibo ❤️',
      is_read: false,
      created_at: '2025-09-15T12:00:00.000Z',
    },
  ],
  assets: DEFAULT_ASSETS,
};

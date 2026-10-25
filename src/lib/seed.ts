import type { SiteSettings, EventVault, OpenWhenEnvelope, PlaylistTrack, Memory, PortalState, UploadedAsset } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  portal_title: 'Our Space ✨',
  his_name: '',
  his_nickname: '',
  her_name: '',
  her_nickname: '',
  relationship_start: new Date().toISOString().slice(0, 10) + 'T00:00:00+03:00',
  her_birthday: '',
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
  daily_note_title: 'Daily Note 💌 :',
  daily_note_content: '',
  daily_note_updated_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_EVENTS: EventVault[] = [];
export const DEFAULT_ENVELOPES: OpenWhenEnvelope[] = [];
export const DEFAULT_TRACKS: PlaylistTrack[] = [];
export const DEFAULT_MEMORIES: Memory[] = [];
export const DEFAULT_ASSETS: UploadedAsset[] = [];

export const DEFAULT_STATE: PortalState = {
  settings: DEFAULT_SETTINGS,
  events: [],
  envelopes: [],
  tracks: [],
  memories: [],
  signals: [],
  assets: [],
};

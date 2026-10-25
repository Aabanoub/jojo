// Type definitions for the Bibo & Jojo Portal

export interface SiteSettings {
  id: number;
  portal_title: string;
  his_name: string;
  his_nickname: string;
  her_name: string;
  her_nickname: string;
  relationship_start: string;
  her_birthday: string;
  master_password: string;
  theme_preset: string;
  bg_primary: string;
  bg_secondary: string;
  text_primary: string;
  accent_color: string;
  card_glass_opacity: number;
  heading_font: string;
  body_font: string;
  particle_effect: 'sparkles' | 'sakura' | 'hearts' | 'stars' | 'none';
  daily_note_title: string;
  daily_note_content: string;
  daily_note_updated_at: string;
  is_locked?: boolean;
  lock_message?: string;
  updated_at: string;
}

export interface EventVault {
  id: string;
  title: string;
  subtitle: string;
  target_date: string;
  is_featured: boolean;
  unlock_method: 'scratch' | 'password' | 'instant';
  event_password: string;
  force_unlocked?: boolean;
  teaser_clue: string;
  vault_letter: string;
  vault_media: VaultMedia[];
  created_at: string;
}

export interface VaultMedia {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  caption: string;
}

export interface OpenWhenEnvelope {
  id: string;
  title: string;
  emoji: string;
  letter_content: string;
  media_url: string | null;
  audio_url: string | null;
  requires_password: boolean;
  sort_order: number;
  created_at: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Memory {
  id: string;
  title: string;
  memory_date: string;
  caption: string | null;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface JojoSignal {
  id: string;
  signal_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface PortalState {
  settings: SiteSettings;
  events: EventVault[];
  envelopes: OpenWhenEnvelope[];
  tracks: PlaylistTrack[];
  memories: Memory[];
  signals: JojoSignal[];
  assets: UploadedAsset[];
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Smart Multi-Source Credential Resolution ───────────────────────────────
// Resolves in this priority order:
// 1. URL search params (?sb_url=...&sb_key=...) -> automatically saved to localStorage
// 2. localStorage ('bibo_sb_url' / 'bibo_sb_key') -> set via Host Studio UI
// 3. process.env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) -> Vercel env

function getActiveUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('sb_url');
      if (urlParam) {
        localStorage.setItem('bibo_sb_url', urlParam);
        return urlParam;
      }
      const stored = localStorage.getItem('bibo_sb_url');
      if (stored) return stored;
    } catch { /* ignore */ }
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getActiveKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const keyParam = params.get('sb_key');
      if (keyParam) {
        localStorage.setItem('bibo_sb_key', keyParam);
        return keyParam;
      }
      const stored = localStorage.getItem('bibo_sb_key');
      if (stored) return stored;
    } catch { /* ignore */ }
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

let currentUrl = getActiveUrl();
let currentKey = getActiveKey();

export let isSupabaseConfigured = !!(currentUrl && currentKey);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(currentUrl, currentKey)
  : null;

// Reconfigure at runtime (e.g. from Host Studio Settings)
export function updateSupabaseConfig(url: string, key: string): SupabaseClient | null {
  currentUrl = url.trim();
  currentKey = key.trim();

  if (typeof window !== 'undefined') {
    try {
      if (currentUrl && currentKey) {
        localStorage.setItem('bibo_sb_url', currentUrl);
        localStorage.setItem('bibo_sb_key', currentKey);
      } else {
        localStorage.removeItem('bibo_sb_url');
        localStorage.removeItem('bibo_sb_key');
      }
    } catch { /* ignore */ }
  }

  isSupabaseConfigured = !!(currentUrl && currentKey);
  supabase = isSupabaseConfigured ? createClient(currentUrl, currentKey) : null;
  return supabase;
}

export function getSupabaseCredentials() {
  return {
    url: currentUrl,
    key: currentKey,
    isConfigured: isSupabaseConfigured,
    hasEnv: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

// ── Storage bucket helpers ──────────────────────────────────────────────────
export const BUCKETS = {
  VAULT_MEDIA: 'vault-media',
  MUSIC: 'music',
  MEMORIES: 'memories',
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getPublicUrl(
  bucket: string,
  path: string
): Promise<string> {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

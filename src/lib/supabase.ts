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

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = getActiveUrl();
  const key = getActiveKey();
  if (url && key) {
    currentUrl = url;
    currentKey = key;
    isSupabaseConfigured = true;
    supabase = createClient(url, key);
  }
  return supabase;
}

// Asynchronously resolve credentials from server API if not yet present locally
export async function resolveSupabaseCloud(): Promise<SupabaseClient | null> {
  const existing = getSupabase();
  if (existing) return existing;
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/portal-credentials');
      if (res.ok) {
        const data = await res.json();
        if (data.url && data.key) {
          return updateSupabaseConfig(data.url, data.key);
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}

// Reconfigure at runtime (e.g. from Host Studio Settings)
export function updateSupabaseConfig(url: string, key: string): SupabaseClient | null {
  currentUrl = url.trim();
  currentKey = key.trim();

  if (typeof window !== 'undefined') {
    try {
      if (currentUrl && currentKey) {
        localStorage.setItem('bibo_sb_url', currentUrl);
        localStorage.setItem('bibo_sb_key', currentKey);
        // Also persist to server endpoint so other devices can discover it automatically
        fetch('/api/portal-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl, key: currentKey }),
        }).catch(() => {});
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

export interface UploadResult {
  url: string | null;
  error?: string;
}

export async function uploadFileDetailed(
  bucket: string,
  path: string,
  file: File
): Promise<UploadResult> {
  const client = getSupabase();
  if (!client) return { url: null, error: 'Database is not connected on this device' };
  const { error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) {
    console.error(`Upload error in bucket "${bucket}":`, error.message);
    return { url: null, error: error.message };
  }
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const res = await uploadFileDetailed(bucket, path, file);
  return res.url;
}

export async function getPublicUrl(
  bucket: string,
  path: string
): Promise<string> {
  const client = getSupabase();
  if (!client) return '';
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size < 250 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

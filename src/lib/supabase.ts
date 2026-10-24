import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage bucket helpers
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

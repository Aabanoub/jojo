import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '.supabase-credentials.json');

export async function GET() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If not in env, check local server config file
  if (!url || !key) {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.url && parsed.key) {
          url = parsed.url;
          key = parsed.key;
        }
      }
    } catch (e) {
      console.warn('Could not read server credentials file:', e);
    }
  }

  return NextResponse.json({ url, key, isConfigured: !!(url && key) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, key } = body;
    if (typeof url === 'string' && typeof key === 'string') {
      try {
        fs.writeFileSync(
          CONFIG_FILE,
          JSON.stringify({ url: url.trim(), key: key.trim() }, null, 2),
          'utf-8'
        );
      } catch (e) {
        console.warn('Could not write server credentials file:', e);
      }
      return NextResponse.json({ success: true, url: url.trim() });
    }
    return NextResponse.json({ success: false, error: 'Invalid url or key format' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to parse request' }, { status: 400 });
  }
}

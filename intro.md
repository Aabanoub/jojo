# Master Prompt: Bibo & Jojo's Interactive Couple Portal ("Our Space")
**Target Platform:** Antigravity / AI Full-Stack Code Builder (Next.js App Router + Supabase + Tailwind CSS, Ready for Vercel Deployment)

> **Instructions:** Copy and paste everything below the line directly into Antigravity.

---

Build a production-ready, mobile-first, real-time synchronized full-stack web application hosted on **Vercel** using **Next.js 14+ (App Router, TypeScript)**, **Tailwind CSS**, **Framer Motion**, **Lucide React icons**, **Canvas-Confetti**, and **Supabase (PostgreSQL + Realtime + Storage)**.

This website is a personalized, romantic digital space for a couple:
- **His Name:** Abanoub (Nickname: **Bibo**) — The Host / Admin
- **Her Name:** Jostena (Nickname: **Jojo**) — The Guest of Honor / Recipient
- **Relationship Start Date:** September 15, 2025 (`2025-09-15T00:00:00`)
- **Jojo's Birthday:** June 30, 2011 (`2011-06-30` — Next birthday countdown auto-calculates to June 30 of the upcoming year)
- **First Active Main Event Countdown:** Valentine's Day (`2027-02-14T00:00:00`)
- **Master Password / Secret Vault Key:** `Aj1592025=1`
- **Language & Bilingual Support:** Primary UI is in **English**, but all text inputs, notes, letters, titles, and database columns must support full **UTF-8 & Right-to-Left (RTL) / Bidirectional (`dir="auto"`) Arabic text** alongside English so Bibo can write messages in either English or Arabic seamlessly with proper Arabic font fallback (`'Cairo', 'Noto Sans Arabic', sans-serif`).

---

## 1. APPLICATION ARCHITECTURE & ROUTES

Create two primary routes that stay 100% synchronized in real time via **Supabase Realtime (`postgres_changes`)** and **Supabase Storage**:

1. **`/` (or `/jojo`) — "Her Page" (Jojo's Experience View):**
   - Designed mobile-first (optimized for iPhone/Android vertical touchscreens) while scaling gracefully to desktop.
   - Dynamically styled from the database's active theme configuration (CSS custom properties injected at root level for colors, gradients, fonts, glassmorphism blur, and background particle effects).
2. **`/host` (or `/bibo`) — "Bibo's Host Studio" (Admin Control Dashboard):**
   - Protected by a sleek login gate requiring the password `Aj1592025=1` (persisted in `sessionStorage` with a logout button).
   - Gives Bibo complete live control over every color, font, animation, sticky note, music playlist, countdown event, time-locked vault upload, "Open When..." envelope, and memory card on Jojo's page—plus a live interactive mobile phone preview frame on the right side of the screen.

Also include a **Local Demo / Fallback Mode**: if Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are not yet connected, automatically fall back to a rich pre-seeded state stored in `localStorage` + `BroadcastChannel` so the app works immediately out of the box without crashing, and displays a helpful one-click "Supabase Setup Guide" banner inside Bibo's Host Studio.

---

## 2. DETAILED UI & FEATURE SPECIFICATIONS

### A. HER PAGE (`/` — Jojo's View)

#### 1. Dynamic Atmosphere & Theme Engine
- Render an HTML5 Canvas / Framer Motion background layer behind the UI that displays whichever particle effect Bibo activates from the Host Studio:
  - `sparkles` (Warm glowing gold & rose floating dust particles — Default)
  - `sakura` (Gently falling cherry blossom petals)
  - `hearts` (Soft floating translucent hearts)
  - `stars` (Twinkling starry night sky)
  - `none` (Clean gradient only)
- Apply dynamic CSS variables (`--bg-primary`, `--bg-secondary`, `--card-bg`, `--text-primary`, `--accent-color`, `--font-heading`, `--font-body`) controlled live by Bibo's Host Studio.
- Set `dir="auto"` on all user-generated text blocks (notes, vault letters, envelopes, memories) so Arabic paragraphs automatically align right-to-left with clean typography while English aligns left-to-right.

#### 2. Top Header & Floating Music Player Pill
- **Left Header:** Displays the customizable portal title (Default: `"Our Space ✨ Bibo & Jojo"`) and a live **"Together Since 15·09·2025"** badge that expands on tap to show exact `Years : Months : Days : Hours : Minutes : Seconds` together, plus upcoming automatic milestones (e.g., Jojo's Birthday on June 30).
- **Top-Right Floating Music Widget:** A compact glassmorphic pill player showing album art/icon, scrolling song title, animated audio waveform bars, Play/Pause, Next Track, and Repeat buttons. Loads tracks uploaded by Bibo to Supabase Storage (`music` bucket).

#### 3. Pinned "Daily Note from Bibo" Card
- Full-width frosted glass card (`backdrop-blur-md bg-white/30 border border-white/40 rounded-3xl shadow-lg`) right below the header.
- Shows a cute header (`"Daily Note from Bibo 💌"`), the timestamp of when Bibo last updated it, and the message content (supports both English and Arabic with `dir="auto"`).
- Default pre-seeded note: `"Good luck today my Jojo! Remember how much Bibo loves you ❤️"`

#### 4. Main Hero Section: Multi-Event Live Countdown Timer
- Displays the currently featured event set by Bibo (Default: **"Valentine's Day Surprise ❤️"** counting down to `2027-02-14T00:00:00`, with a secondary switcher pill allowing Jojo to also view the countdown to **"Jojo's Birthday 🎂 — June 30"** or any other event Bibo creates).
- Large, glowing typographic countdown digits (`DAYS : HOURS : MINS : SECS`) in `Playfair Display` serif font with smooth flip/fade transitions every second.
- Progress bar underneath showing the percentage of time elapsed toward the unlock moment.

#### 5. The Time-Locked Digital Vault (Interactive Reveal System)
- Directly beneath the countdown timer sits the **Locked Digital Vault Card** associated with the active event.
- **State 1: BEFORE Countdown Reaches `00:00:00` (Locked State):**
  - Displays blurred, frosted preview thumbnails of the uploaded materials inside the vault.
  - Shows a glowing golden padlock icon and status text: `"Locked by Bibo 🔒 Opens automatically when the timer reaches 00:00:00"`.
  - If Bibo has added "Teaser Clues", Jojo can tap `"View Teaser Clue"` to read a small hint without exposing the locked media.
- **State 2: WHEN Countdown Reaches `00:00:00` (Unlock Trigger State):**
  - The padlock turns into a sparkling unlocked icon and triggers one of Bibo's chosen unlock mechanics (configurable per event):
    1. **Interactive Touch Scratch-Off Card:** Renders an HTML5 `<canvas>` metallic gold/rose-gold foil layer over the card. Jojo uses her finger (touchscreen) or mouse cursor to physically scratch off at least 50% of the foil, triggering a burst of confetti (`canvas-confetti`) and revealing the secret vault!
    2. **Secret Passcode Gate:** Prompts Jojo to enter their special password (`Aj1592025=1` or an event-specific passcode) to open the vault.
    3. **Instant Confetti Unlock:** Opens immediately when the timer hits zero.
- **State 3: UNLOCKED VAULT MODAL / VIEW:**
  - Once unlocked, reveals all media uploaded by Bibo for that event:
    - **Secret Letter:** Rich text / Arabic-or-English letter with an optional typewriter animation effect.
    - **Photo Gallery:** Swipeable carousel & lightbox of uploaded photos with captions.
    - **Voice Note / Audio Message:** Custom audio player to listen to Bibo's recorded message.
    - **Video / External Surprise Link:** Embedded video player or special gift card / coupon.

#### 6. Horizontal Swipeable "Open When..." Digital Envelopes
- Interactive 3D-styled envelope cards that animate open when tapped.
- Pre-seed with **"Open when you miss Bibo 💌"** (plus starter envelopes like *"Open when you need a smile 😊"* and *"Open when you can't sleep 🌙"*).
- Each envelope can contain a personal text letter (English/Arabic), an uploaded photo, and an optional voice note from Bibo, and can either be "Always Open" or require the password `Aj1592025=1`.

#### 7. "Memory Lane" Polaroid Timeline
- Vertical or horizontal scrollable timeline of Polaroid-style photo cards showing special moments since `15-09-2025`, complete with date badge, title, photo, and Bibo's caption.

#### 8. Sticky Mobile Bottom Navigation Bar & "Send a Signal to Bibo" Button
- Floating frosted-glass bottom bar with 5 tabs:
  1. `Home` ( scrolls to top / overview)
  2. `Vault` (opens all active & past event vaults)
  3. `Envelopes` (opens the "Open When..." collection)
  4. `Memories` (opens Memory Lane & Relationship Milestones since `15-09-2025`)
  5. `Ping Bibo ❤️` (Interactive button where Jojo can tap quick signals like *"Jojo misses you right now 💕"*, *"Thinking of you Bibo ✨"*, or write a quick short reply note that appears immediately on Bibo's Host Dashboard with a notification badge!).

---

### B. BIBO'S HOST PAGE (`/host` — Full Admin Control Studio)

#### 1. Password Authentication Gate
- Clean dark-mode & rose-gold login screen titled **"Bibo's Control Studio 🔐"**.
- Requires password: `Aj1592025=1` (also configurable from Settings once logged in).

#### 2. Studio Layout (Desktop & Mobile Responsive)
- **Left Sidebar Navigation:**
  - `🎨 Theme & Appearance Studio`
  - `⏳ Events & Time-Locked Vaults`
  - `💌 Daily Note & "Open When" Envelopes`
  - `🎵 Music & Playlist Uploader`
  - `📸 Memory Lane Manager`
  - `🔔 Signals from Jojo & Settings`
- **Center Workspace:** Full form controls with instant "Save & Publish Live to Jojo's Page" buttons.
- **Right Panel (Live Mobile Preview):** Interactive iPhone 16 Pro frame rendering Jojo's Page in real time as Bibo tweaks colors, fonts, animations, and content, plus a **"Simulate Unlock (Test 00:00)"** toggle so Bibo can test how an event vault unlocks before Jojo sees it.

#### 3. Module 1: Full Theme & Appearance Control
- **Preset Theme Palettes (One-Click):**
  1. *Dreamy Rose & Cream* (Default — `#F9E4E8`, `#EAC7C7`, `#4A2E35`, `#D48C96`)
  2. *Midnight Starlight & Rose Gold* (`#0F1016`, `#1B1D29`, `#F5E6E8`, `#E29578`)
  3. *Lavender Dusk* (`#EDE7F6`, `#D1C4E9`, `#311B92`, `#9575CD`)
  4. *Matcha & Warm Ivory* (`#F4F6F0`, `#DDE5D0`, `#2C3E2D`, `#7A9A7E`)
  5. *Custom Color Pickers:* Full HEX/RGB color pickers for Primary Background, Secondary Gradient, Card Glass Opacity, Accent Color, and Text Color.
- **Typography Selector:** Choose Heading Font (`Playfair Display`, `Cormorant Garamond`, `Cairo`) and Body Font (`Inter`, `Plus Jakarta Sans`, `Cairo`).
- **Background Animation Toggle:** Switch between `Sparkles`, `Sakura Petals`, `Floating Hearts`, `Starry Night`, or `Off`.
- **Custom Header & Relationship Metadata:** Edit site title, nicknames (`Bibo` & `Jojo`), relationship start date (`2025-09-15`), and Jojo's birthday (`2011-06-30`).

#### 4. Module 2: Event Countdown & Time-Locked Vault Creator
- **Create / Edit / Delete Events:**
  - Event Title (e.g., `"Valentine's Day Surprise ❤️"`, `"Jojo's Birthday 🎂"`, `"Our Anniversary 💕"`)
  - Target Unlock Date & Exact Time Picker (Timezone-aware)
  - Toggle: `"Set as Main Featured Countdown on Jojo's Hero Banner"`
  - Unlock Mechanic Selector: `Scratch-Off Foil Card`, `Password Required (Aj1592025=1)`, or `Auto-Open at 00:00`
  - Teaser Clue Text (shown while locked)
- **Vault Material Uploader (Unlocks ONLY when target timestamp is reached):**
  - **Secret Letter Editor:** Rich multiline text area supporting English and Arabic (`dir="auto"`).
  - **Multi-File Drag-and-Drop Uploader:** Upload photos (`.jpg`, `.png`, `.webp`), audio voice notes (`.mp3`, `.wav`, `.m4a`), or short videos (`.mp4`) directly to Supabase Storage (`vault-media` bucket) and attach them to the event.
  - **Manual Override Toggle:** `"Force Lock"` / `"Force Unlock Now"` button for Bibo in case he wants to open a vault early.

#### 5. Module 3: Daily Sticky Note & "Open When..." Envelopes Manager
- **Daily Note Quick Editor:** Edit the pinned note on Jojo's page and click `"Update Note Live"`.
- **"Open When..." CRUD Manager:**
  - Create, edit, reorder, or delete envelopes (Pre-loaded with `"Open when you miss Bibo 💌"`).
  - For each envelope: Title, Emoji icon, Letter content (English/Arabic), optional Photo upload, optional Voice Note upload, and optional Password Lock toggle.

#### 6. Module 4: Music & Voice Note DJ Manager
- Drag-and-drop audio uploader (`.mp3`, `.m4a`, `.wav`) that uploads songs to Supabase Storage (`music` bucket).
- Edit song title, artist label (e.g., `"Our Song — Bibo & Jojo"`), cover image, track order, and toggle `"Auto-play softly when Jojo opens the page"`.

#### 7. Module 5: Memory Lane & Signals from Jojo
- **Memory Lane CRUD:** Upload photo, date, title, and caption to add new Polaroids to Jojo's timeline.
- **Jojo's Signal Log:** View real-time timestamps and messages whenever Jojo taps `"Ping Bibo ❤️"` on her page, with a counter showing how many times she visited or sent a love signal.

---

## 3. COMPLETE DATABASE SCHEMA & STORAGE SPECIFICATION (SUPABASE POSTGRESQL)

Create a `/supabase/schema.sql` file in the repository containing the complete SQL setup below, and wire all frontend queries and realtime subscriptions to these exact tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SITE SETTINGS & THEME CONFIGURATION (Single-row configuration table, id = 1)
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  portal_title text not null default 'Our Space ✨ Bibo & Jojo',
  his_name text not null default 'Abanoub',
  his_nickname text not null default 'Bibo',
  her_name text not null default 'Jostena',
  her_nickname text not null default 'Jojo',
  relationship_start timestamptz not null default '2025-09-15T00:00:00+03:00',
  her_birthday date not null default '2011-06-30',
  master_password text not null default 'Aj1592025=1',
  -- Theme & Appearance Controls
  theme_preset text not null default 'dreamy-rose',
  bg_primary text not null default '#F9E4E8',
  bg_secondary text not null default '#FFF5F7',
  text_primary text not null default '#4A2E35',
  accent_color text not null default '#D48C96',
  card_glass_opacity numeric not null default 0.45,
  heading_font text not null default 'Playfair Display',
  body_font text not null default 'Inter',
  particle_effect text not null default 'sparkles', -- 'sparkles' | 'sakura' | 'hearts' | 'stars' | 'none'
  -- Daily Sticky Note
  daily_note_title text not null default 'Daily Note from Bibo 💌',
  daily_note_content text not null default 'Good luck today my Jojo! Always remember how much Bibo loves you ❤️',
  daily_note_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. EVENTS & TIME-LOCKED VAULTS TABLE
create table public.events_vault (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text default 'Live Countdown Timer',
  target_date timestamptz not null,
  is_featured boolean not null default false,
  unlock_method text not null default 'scratch', -- 'scratch' | 'password' | 'instant'
  event_password text default 'Aj1592025=1',
  force_unlocked boolean not null default false,
  teaser_clue text default 'Something special from Bibo is waiting for you inside...',
  -- Vault Payload (Revealed when current_time >= target_date OR force_unlocked = true)
  vault_letter text default '',
  vault_media jsonb not null default '[]'::jsonb, -- Array of { id, type: 'image'|'audio'|'video', url, caption }
  created_at timestamptz not null default now()
);

-- 3. "OPEN WHEN..." ENVELOPES TABLE
create table public.open_when_envelopes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  emoji text not null default '💌',
  letter_content text not null,
  media_url text,
  audio_url text,
  requires_password boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. MUSIC PLAYLIST TABLE
create table public.playlist_tracks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text not null default 'Bibo & Jojo',
  audio_url text not null,
  cover_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. MEMORY LANE TIMELINE TABLE
create table public.memories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  memory_date date not null,
  caption text,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. SIGNALS / REACTIONS FROM JOJO TO BIBO
create table public.jojo_signals (
  id uuid primary key default uuid_generate_v4(),
  signal_type text not null default 'heart',
  message text not null default 'Jojo is thinking of Bibo ❤️',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- INITIAL SEED DATA FOR BIBO & JOJO
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.events_vault (title, subtitle, target_date, is_featured, unlock_method, teaser_clue, vault_letter)
values 
(
  'Valentine''s Day Surprise ❤️',
  'Special Surprise from Bibo to Jojo',
  '2027-02-14T00:00:00+02:00',
  true,
  'scratch',
  'A special Valentine surprise prepared by Bibo just for Jojo 💕',
  'Happy Valentine''s Day my dearest Jojo! Every single day with you since 15-9-2025 has been my favorite memory. Love always, Bibo ❤️'
),
(
  'Jojo''s Birthday 🎂',
  'Counting down to Queen Jojo''s Day (30/6)',
  '2027-06-30T00:00:00+03:00',
  false,
  'scratch',
  'Counting down to June 30 for the sweetest girl in the world 🎉',
  'Happy Birthday my Jojo! Wishing you the happiest year ahead filled with love and joy. — Yours always, Bibo ❤️'
);

insert into public.open_when_envelopes (title, emoji, letter_content, sort_order)
values
(
  'Open when you miss Bibo',
  '💌',
  'Whenever you miss me, Jojo, close your eyes and remember that Bibo is thinking about you right now too. Call me or tap the Signal button below so I know! ❤️',
  1
),
(
  'Open when you need a smile',
  '😊',
  'Your smile is Bibo''s favorite thing in the entire world, Jojo. Whatever is stressing you out today will pass—I am always right here by your side.',
  2
),
(
  'Open when you can''t sleep',
  '🌙',
  'Take a deep breath, put on our favorite music from the player above, and rest easy my Jojo. Tomorrow is a brand new day for us.',
  3
);

-- Enable Realtime on all tables
alter publication supabase_realtime add table public.site_settings;
alter publication supabase_realtime add table public.events_vault;
alter publication supabase_realtime add table public.open_when_envelopes;
alter publication supabase_realtime add table public.playlist_tracks;
alter publication supabase_realtime add table public.memories;
alter publication supabase_realtime add table public.jojo_signals;
```

### Supabase Storage Buckets
Configure utility helpers in `/lib/supabase.ts` for uploading and fetching public URLs from 3 storage buckets:
1. `vault-media` (for time-locked event photos, voice notes, and videos)
2. `music` (for MP3/audio tracks uploaded by Bibo)
3. `memories` (for Memory Lane polaroid photos and envelope attachments)

---

## 4. KEY TECHNICAL & UX IMPLEMENTATION DETAILS

1. **Strict Time-Lock Verification:**
   - On Jojo's Page (`/`), calculate `const isTimeReached = new Date().getTime() >= new Date(event.target_date).getTime() || event.force_unlocked`.
   - Do **not** render the unblurred vault media URLs or secret letter text in the DOM until `isTimeReached === true` AND Jojo completes the unlock interaction (scratching the HTML5 foil canvas or entering `Aj1592025=1`).
2. **Interactive Scratch-Off Foil Component (`<ScratchVaultCard />`):**
   - Implement a real HTML5 `<canvas>` overlay supporting both mouse (`onMouseMove`) and mobile touch (`onTouchMove`) events with `globalCompositeOperation = 'destination-out'`.
   - Once 45%+ of the pixels are scratched away, smoothly fade out the canvas, trigger `confetti()`, and reveal the unlocked Vault content modal.
3. **Bilingual English + Arabic Typography Support:**
   - Import Google Fonts: `Playfair Display`, `Inter`, and `Cairo` (for Arabic script).
   - Add `dir="auto"` on every note, letter, title, and input field so Bibo can type Arabic (`بحبك يا جوجو`) or English effortlessly with automatic RTL/LTR alignment.
4. **Zero-Config Instant Preview + Full Cloud Sync:**
   - Build a unified data provider (`<PortalProvider>`) that connects to Supabase if `NEXT_PUBLIC_SUPABASE_URL` is present, and seamlessly falls back to `localStorage` + `BroadcastChannel('bibo_jojo_sync')` when running locally before Supabase keys are added—so Bibo can test `/host` in one tab and see `/` update live in another tab immediately.
5. **Vercel Deployment Ready:**
   - Ensure strict TypeScript compliance, clean `package.json`, `.env.example`, and responsive Tailwind styling with zero build errors on `vercel deploy`.

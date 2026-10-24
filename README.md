# Our Space ✨ Bibo & Jojo

A romantic, interactive couple portal crafted specially for **Bibo (Abanoub)** & **Jojo (Jostena)**.

Built with **Next.js 16+ (App Router)**, **Tailwind CSS**, **Framer Motion**, **HTML5 Canvas**, **Lucide Icons**, and **Supabase (PostgreSQL + Realtime + Storage)**. Ready for instant deployment on **Vercel**.

---

## 🌟 Key Features

### 1. Jojo's Mobile-First Experience (`/` or `/jojo`)
- **Atmosphere & Particle Engine**: Dynamic background with floating sparkles ✨, falling sakura petals 🌸, soft hearts 💕, or twinkling stars ⭐.
- **Top Header & Together Badge**: Live counter calculating exact years, months, days, hours, minutes, and seconds since September 15, 2025 (`15·09·2025`).
- **Floating Music Player**: Ambient audio pill widget with animated equalizer waveform, playlist track selector, and repeat toggle.
- **Pinned Daily Note**: Frosted glass card with live timestamp and full bilingual support (`dir="auto"` for Arabic & English with Cairo font).
- **Multi-Event Live Countdown**: Glowing serif countdown clock for Valentine's Day (`2027-02-14`), Queen Jojo's Birthday (`June 30`), and custom countdown events.
- **Interactive Time-Locked Vault**:
  - *Locked state*: Blurred frosted previews, glowing lock, and teaser clues.
  - *Unlock mechanic*: Realistic HTML5 Canvas metallic gold scratch-off foil with confetti burst (`canvas-confetti`) or secret passcode gate.
  - *Unlocked modal*: Secret love letter, photos, audio messages, and video players.
- **"Open When..." 3D Envelopes**: Animated digital envelopes with letter contents, optional photo/audio attachments, and password locks.
- **Polaroid Memory Lane**: Chronological photo timeline since September 15, 2025.
- **"Ping Bibo ❤️"**: Instant love signals and notes sent directly to Bibo's studio.

### 2. Bibo's Host Studio (`/host` or `/bibo`)
- **Password Authentication Gate**: Secured with Master Password `Aj1592025=1`.
- **Theme & Appearance Studio**: One-click palette presets + custom color pickers, font selectors, and particle toggles.
- **Events & Vaults Manager**: Set target dates, upload vault media, write secret letters, and toggle "Force Unlock".
- **Daily Note & Envelopes Editor**: Instant live updates for daily messages and "Open When" envelopes.
- **DJ Music Manager**: Add MP3/audio tracks with artist labels and track ordering.
- **Memory Lane Manager**: Upload new Polaroid moments with titles, dates, and captions.
- **Real-time Signal Feed**: Live notifications whenever Jojo pings Bibo.
- **Live Mobile Preview Frame**: Interactive iPhone 16 Pro mockup rendering changes live with a "Simulate Unlock" toggle.
- **Clean Slate Reset Button**: In Settings -> Danger Zone, reset all portal data back to factory defaults at any time.

---

## 📦 Step-by-Step Deployment Guide

### STEP 1: Setup Supabase Database & Storage (5 Minutes)
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the left navigation, click on **SQL Editor**.
3. Click **New query** and paste the entire content of [`supabase/schema.sql`](./supabase/schema.sql).
4. Click **Run** (or press Ctrl+Enter).
   > **What this does automatically:**
   > - Creates all 6 database tables (`site_settings`, `events_vault`, `open_when_envelopes`, `playlist_tracks`, `memories`, `jojo_signals`).
   > - Configures Row Level Security (RLS) policies allowing public read/write with the anon key.
   > - Creates the 3 public storage buckets (`vault-media`, `music`, `memories`) and storage upload policies.
   > - Seeds the initial romantic data for Bibo & Jojo.
   > - Configures Realtime synchronization on all tables.
5. In the left navigation, click on **Project Settings** (gear icon) -> **API**:
   - Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy the **anon public API key**.

---

### STEP 2: Upload Project to GitHub
1. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `love-app` or `our-space`).
2. Run the following terminal commands in the project root:
```bash
git add .
git commit -m "Initial commit: Bibo & Jojo interactive couple portal"
git branch -M main
git remote add origin https://github.com/Aabanoub/<your-repo-name>.git
git push -u origin main
```

---

### STEP 3: Deploy to Vercel (Hosting)
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Under "Import Git Repository", find your repository and click **Import**.
4. In the configuration page:
   - **Framework Preset**: Next.js (detected automatically).
   - Expand the **Environment Variables** section and add:
     - `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase Project URL from Step 1)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon API key from Step 1)
5. Click **Deploy**.
6. Within 1-2 minutes, Vercel will build and deploy your app with a free global HTTPS URL (e.g., `https://our-space-bibo-jojo.vercel.app`)!

---

## 🔑 Access Credentials & Administration

| Access | URL | Password / Key |
|---|---|---|
| **Jojo's Experience** | `/` or `/jojo` | Public (Mobile-first view) |
| **Bibo's Host Studio** | `/host` or `/bibo` | `Aj1592025=1` |
| **Secret Vault Key** | On locked cards | `Aj1592025=1` (or scratch-off) |

### Resetting Data:
- **From Host Studio**: Open `/host` -> log in -> go to **Settings** tab -> scroll down to **Danger Zone** -> click **Reset All Portal Data to Clean Defaults**.
- **Quick URL Reset**: Visit `http://localhost:3000/?reset=true` (or your live Vercel URL with `?reset=true`) to clear local cache and reload initial defaults.

---

## 💻 Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for Jojo's view or [http://localhost:3000/host](http://localhost:3000/host) for Bibo's Studio.

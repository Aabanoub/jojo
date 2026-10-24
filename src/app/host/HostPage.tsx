'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Palette, Lock, Image as ImageIcon, Music, Settings,
  Bell, Edit2, Play, Pause, ChevronDown, RotateCw, Plus, Trash2,
  Save, Check, X, Heart, Menu, ExternalLink, SkipForward, SkipBack,
  AlertCircle, Globe, Key, Calendar, User, FileText, Volume2,
} from 'lucide-react';
import { usePortal } from '@/lib/PortalProvider';
import type { EventVault, OpenWhenEnvelope, PlaylistTrack, Memory } from '@/lib/types';
import ClientDate from '@/components/ClientDate';

type NavTab = 'dashboard' | 'theme' | 'events' | 'media' | 'music' | 'settings';

// ── Reusable Toggle Switch ─────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-10 h-5 rounded-full transition-all relative p-0.5 shrink-0"
      style={{ background: value ? '#D48C96' : 'rgba(255,255,255,0.15)' }}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-white/50 font-medium">{label}</label>
      {children}
    </div>
  );
}

// ── Dark Input ────────────────────────────────────────────────────────────────
function DarkInput({ value, onChange, placeholder, type = 'text', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-[#282632] border border-white/10 text-xs text-white outline-none focus:border-rose-400/50 transition-colors"
      {...rest}
    />
  );
}

// ── Dark Textarea ─────────────────────────────────────────────────────────────
function DarkTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-3 rounded-xl bg-[#282632] border border-white/10 text-xs text-white outline-none resize-none focus:border-rose-400/50 transition-colors"
    />
  );
}

// ── Save Button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saved, label = 'Save Changes' }: { onClick: () => void; saved: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all active:scale-95"
      style={{ background: saved ? '#22c55e' : 'linear-gradient(135deg, #D48C96, #C47D88)' }}
    >
      {saved ? <Check size={13} /> : <Save size={13} />}
      {saved ? 'Saved!' : label}
    </button>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 border flex flex-col gap-4" style={{ background: '#201E27', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div>
        {sub && <span className="text-[11px] text-white/40 font-medium">{sub}</span>}
        <h2 className="text-base font-bold text-white mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function HostPage() {
  const {
    state,
    updateSettings,
    upsertEvent,
    deleteEvent,
    upsertEnvelope,
    deleteEnvelope,
    upsertTrack,
    deleteTrack,
    upsertMemory,
    deleteMemory,
    markSignalRead,
    resetAllData,
  } = usePortal();

  const { settings, events, envelopes, tracks, memories, signals } = state;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [activeNav, setActiveNav] = useState<NavTab>('dashboard');
  const [saving, setSaving] = useState<string | null>(null); // which section is saving
  const [saved, setSaved] = useState<string | null>(null);
  const [simulateUnlock, setSimulateUnlock] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('bibo_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === settings.master_password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('bibo_auth', 'true');
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bibo_auth');
    setIsAuthenticated(false);
  };

  const doSave = useCallback(async (key: string, fn: () => Promise<void>) => {
    setSaving(key);
    await fn();
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }, []);

  // ── COLOR SWATCHES ─────────────────────────────────────────────────────────
  const colorSwatches = [
    { bg: 'linear-gradient(135deg,#E6B8A2,#D48C96)', name: 'Rose Gold Glow', p: '#F8DCDA', s: '#F2C4C1', a: '#D48C96', t: '#44292E' },
    { bg: 'linear-gradient(135deg,#DDA15E,#BC6C25)', name: 'Warm Bronze', p: '#FAF0E6', s: '#F5DEB3', a: '#C67D5A', t: '#3D251E' },
    { bg: '#1E1D24', name: 'Midnight Charcoal', p: '#16151B', s: '#211F2A', a: '#E29578', t: '#F5E6E8' },
    { bg: '#FFFFFF', name: 'Pure Pearl', p: '#FFFFFF', s: '#F8F9FA', a: '#D48C96', t: '#2D3142' },
    { bg: '#FDE2E4', name: 'Peach Cream', p: '#FFF1F2', s: '#FFE4E6', a: '#E28292', t: '#4C2430' },
    { bg: '#F8B4D9', name: 'Baby Pink', p: '#FFF0F7', s: '#FDE2F0', a: '#E06D9B', t: '#481E32' },
    { bg: '#DDD6FE', name: 'Soft Lavender', p: '#F5F3FF', s: '#EDE9FE', a: '#9370DB', t: '#2E1A47' },
  ];

  // ── LOCAL EDITABLE COPIES ─────────────────────────────────────────────────
  const [dailyNote, setDailyNote] = useState(settings.daily_note_content);
  const [settingsForm, setSettingsForm] = useState({
    his_name: settings.his_name,
    his_nickname: settings.his_nickname,
    her_name: settings.her_name,
    her_nickname: settings.her_nickname,
    relationship_start: settings.relationship_start.slice(0, 10),
    her_birthday: settings.her_birthday,
    master_password: settings.master_password,
    portal_title: settings.portal_title,
  });

  // Sync whenever settings change from external sources
  useEffect(() => { setDailyNote(settings.daily_note_content); }, [settings.daily_note_content]);
  useEffect(() => {
    setSettingsForm({
      his_name: settings.his_name,
      his_nickname: settings.his_nickname,
      her_name: settings.her_name,
      her_nickname: settings.her_nickname,
      relationship_start: settings.relationship_start.slice(0, 10),
      her_birthday: settings.her_birthday,
      master_password: settings.master_password,
      portal_title: settings.portal_title,
    });
  }, [settings]);

  // ── NEW ENVELOPE FORM ────────────────────────────────────────────────────────
  const [envForm, setEnvForm] = useState({ title: '', emoji: '💌', letter_content: '', requires_password: false });
  const [editEnvId, setEditEnvId] = useState<string | null>(null);

  const openEditEnv = (env: OpenWhenEnvelope) => {
    setEditEnvId(env.id);
    setEnvForm({ title: env.title, emoji: env.emoji, letter_content: env.letter_content, requires_password: env.requires_password });
  };

  const saveEnvelope = async () => {
    if (!envForm.title.trim()) return;
    const envelope: OpenWhenEnvelope = editEnvId
      ? { ...(envelopes.find(e => e.id === editEnvId)!), ...envForm }
      : {
          id: `env-${Date.now()}`,
          ...envForm,
          media_url: '/images/wax_envelope.jpg',
          audio_url: null,
          sort_order: envelopes.length + 1,
          created_at: new Date().toISOString(),
        };
    await doSave('envelope', () => upsertEnvelope(envelope));
    setEnvForm({ title: '', emoji: '💌', letter_content: '', requires_password: false });
    setEditEnvId(null);
  };

  // ── NEW TRACK FORM ────────────────────────────────────────────────────────────
  const [trackForm, setTrackForm] = useState({ title: '', artist: '', audio_url: '' });
  const [editTrackId, setEditTrackId] = useState<string | null>(null);

  const openEditTrack = (track: PlaylistTrack) => {
    setEditTrackId(track.id);
    setTrackForm({ title: track.title, artist: track.artist, audio_url: track.audio_url });
  };

  const saveTrack = async () => {
    if (!trackForm.title.trim() || !trackForm.audio_url.trim()) return;
    const track: PlaylistTrack = editTrackId
      ? { ...(tracks.find(t => t.id === editTrackId)!), ...trackForm }
      : {
          id: `track-${Date.now()}`,
          ...trackForm,
          cover_url: '/images/couple_portrait.jpg',
          sort_order: tracks.length + 1,
          created_at: new Date().toISOString(),
        };
    await doSave('track', () => upsertTrack(track));
    setTrackForm({ title: '', artist: '', audio_url: '' });
    setEditTrackId(null);
  };

  // ── NEW MEMORY FORM ───────────────────────────────────────────────────────────
  const [memForm, setMemForm] = useState({ title: '', memory_date: '', caption: '', image_url: '' });
  const [editMemId, setEditMemId] = useState<string | null>(null);

  const openEditMem = (mem: Memory) => {
    setEditMemId(mem.id);
    setMemForm({ title: mem.title, memory_date: mem.memory_date, caption: mem.caption || '', image_url: mem.image_url });
  };

  const saveMem = async () => {
    if (!memForm.title.trim()) return;
    const mem: Memory = editMemId
      ? { ...(memories.find(m => m.id === editMemId)!), ...memForm }
      : {
          id: `mem-${Date.now()}`,
          ...memForm,
          sort_order: memories.length + 1,
          created_at: new Date().toISOString(),
        };
    await doSave('memory', () => upsertMemory(mem));
    setMemForm({ title: '', memory_date: '', caption: '', image_url: '' });
    setEditMemId(null);
  };

  // ── NEW EVENT FORM ────────────────────────────────────────────────────────────
  const [evtForm, setEvtForm] = useState({ title: '', target_date: '', teaser_clue: '', vault_letter: '' });
  const [editEvtId, setEditEvtId] = useState<string | null>(null);

  const openEditEvt = (evt: EventVault) => {
    setEditEvtId(evt.id);
    setEvtForm({
      title: evt.title,
      target_date: evt.target_date.slice(0, 10),
      teaser_clue: evt.teaser_clue,
      vault_letter: evt.vault_letter,
    });
  };

  const saveEvt = async () => {
    if (!evtForm.title.trim() || !evtForm.target_date) return;
    const evt: EventVault = editEvtId
      ? { ...(events.find(e => e.id === editEvtId)!), ...evtForm, target_date: evtForm.target_date + 'T00:00:00+03:00' }
      : {
          id: `evt-${Date.now()}`,
          ...evtForm,
          target_date: evtForm.target_date + 'T00:00:00+03:00',
          subtitle: '',
          is_featured: false,
          unlock_method: 'scratch' as const,
          event_password: settings.master_password,
          force_unlocked: false,
          vault_media: [],
          created_at: new Date().toISOString(),
        };
    await doSave('event', () => upsertEvent(evt));
    setEvtForm({ title: '', target_date: '', teaser_clue: '', vault_letter: '' });
    setEditEvtId(null);
  };

  const latestSignal = signals[0];
  const unreadCount = signals.filter(s => !s.is_read).length;

  // ── PASSWORD GATE ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111015] p-4 text-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 mx-auto flex items-center justify-center text-xl shadow-lg mb-3">🔐</div>
            <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bibo&apos;s Host Studio
            </h1>
            <p className="text-xs text-white/40 mt-1">Control &amp; Customize Jojo&apos;s Experience</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter studio key..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-sm outline-none focus:border-rose-400/60"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #D48C96, #C47D88)' }}
            >
              Enter Studio
            </button>
            {passwordError && (
              <p className="text-xs text-rose-400 text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> Wrong password. Try: Aj1592025=1
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── NAV ITEMS ────────────────────────────────────────────────────────────────
  const navItems: { id: NavTab; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'theme',     icon: Palette,         label: 'Theme Studio' },
    { id: 'events',    icon: Lock,            label: 'Event Vault' },
    { id: 'media',     icon: ImageIcon,       label: 'Media & Memory' },
    { id: 'music',     icon: Music,           label: 'Music & Notes' },
    { id: 'settings',  icon: Settings,        label: 'Settings' },
  ];

  // ── MAIN STUDIO LAYOUT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111015] p-2 md:p-4 text-white flex flex-col justify-center">
      <div
        className="max-w-7xl mx-auto w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#19181F', border: '1px solid rgba(255,255,255,0.12)', minHeight: '90vh' }}
      >
        {/* macOS Window Chrome */}
        <div className="h-10 px-4 bg-[#141318] border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] cursor-pointer hover:opacity-80" onClick={handleLogout} title="Logout" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-6 rounded-md bg-[#23212A] border border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-white/40 font-mono">
              <span className="text-emerald-400">●</span> localhost:3000/host
            </div>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
          >
            <ExternalLink size={11} /> Preview Jojo&apos;s Page
          </a>
        </div>

        {/* Studio Sub-Header */}
        <div className="px-5 py-3 bg-[#1C1A22] border-b border-white/8 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-bold tracking-wide"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: 'linear-gradient(135deg, #F3D9C9, #D48C96)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Bibo&apos;s Host Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>

          {/* Signal alert */}
          {latestSignal && (
            <div
              className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(235,145,130,0.25), rgba(220,120,110,0.2))',
                border: '1px solid rgba(240,160,150,0.35)',
                color: '#F9D0C8',
              }}
            >
              <span>🔔</span>
              <span>Jojo: &ldquo;{latestSignal.message}&rdquo;</span>
              <ClientDate date={latestSignal.created_at} className="text-[10px] opacity-60" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/40 font-mono border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Key size={10} className="text-amber-400" /> {settings.master_password}
            </span>
            <button
              onClick={() => { signals.forEach(s => !s.is_read && markSignalRead(s.id)); }}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 relative"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-300/40 shrink-0">
              <img src="/images/couple_portrait.jpg" alt="Bibo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Body: Sidebar + Content + Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: 0 }}>

          {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
          <aside className="w-48 shrink-0 bg-[#16151B] border-r border-white/8 p-3 flex flex-col justify-between">
            <nav className="space-y-1">
              {navItems.map((tab) => {
                const isActive = activeNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveNav(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive ? 'text-white border' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(212,140,150,0.35), rgba(180,110,120,0.25))',
                      borderColor: 'rgba(212,140,150,0.45)',
                    } : {}}
                  >
                    <tab.icon size={15} className={isActive ? 'text-[#F3D9C9]' : 'text-white/40'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-2.5 rounded-xl bg-white/4 border border-white/6 text-[10px] text-white/40 text-center">
              Bibo &amp; Jojo Portal<br />
              <span className="text-white/20">Version 2.0</span>
            </div>
          </aside>

          {/* ── Center Workspace ─────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto bg-[#1A1820]" style={{ minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
              >

                {/* ════════════════════════════════════════════════════════════
                    TAB: DASHBOARD
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'dashboard' && (
                  <>
                    {/* Stats */}
                    <Panel title="Quick Overview" sub="Portal Status">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Events', value: events.length, emoji: '📅' },
                          { label: 'Envelopes', value: envelopes.length, emoji: '💌' },
                          { label: 'Memories', value: memories.length, emoji: '📷' },
                          { label: 'Tracks', value: tracks.length, emoji: '🎵' },
                        ].map((s) => (
                          <div key={s.label} className="rounded-xl bg-[#282632] border border-white/6 p-3 flex items-center gap-3">
                            <span className="text-xl">{s.emoji}</span>
                            <div>
                              <p className="text-lg font-bold text-white">{s.value}</p>
                              <p className="text-[10px] text-white/40">{s.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 p-3 rounded-xl bg-[#282632] border border-white/6">
                        <p className="text-[11px] text-white/50 mb-1">Daily Note Preview</p>
                        <p className="text-xs text-white/80 leading-relaxed" dir="auto">{settings.daily_note_content}</p>
                      </div>
                    </Panel>

                    {/* Signal Feed */}
                    <Panel title="Jojo&apos;s Signals" sub="Live Feed">
                      {signals.length === 0 ? (
                        <p className="text-xs text-white/30 text-center py-4">No signals yet from Jojo 💕</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {signals.map((sig) => (
                            <div
                              key={sig.id}
                              className={`p-3 rounded-xl flex items-start justify-between gap-3 ${
                                sig.is_read ? 'bg-[#282632] border border-white/6' : 'bg-rose-500/10 border border-rose-500/30'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-base">{sig.signal_type === 'heart' ? '❤️' : '💌'}</span>
                                <div>
                                  <p className="text-xs text-white/90" dir="auto">{sig.message}</p>
                                  <ClientDate date={sig.created_at} className="text-[10px] text-white/40 mt-0.5 block" />
                                </div>
                              </div>
                              {!sig.is_read && (
                                <button
                                  onClick={() => markSignalRead(sig.id)}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 hover:bg-emerald-500/30"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Panel>

                    {/* Quick Actions */}
                    <div className="md:col-span-2">
                      <Panel title="Quick Actions" sub="Shortcuts">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Theme Studio', tab: 'theme' as NavTab, emoji: '🎨' },
                            { label: 'Edit Events', tab: 'events' as NavTab, emoji: '📅' },
                            { label: 'Edit Memories', tab: 'media' as NavTab, emoji: '📷' },
                            { label: 'Music & Daily Note', tab: 'music' as NavTab, emoji: '🎵' },
                          ].map((a) => (
                            <button
                              key={a.tab}
                              onClick={() => setActiveNav(a.tab)}
                              className="p-3 rounded-xl bg-[#282632] border border-white/6 hover:border-rose-400/30 hover:bg-[#302D3C] transition-all text-left"
                            >
                              <span className="text-xl block mb-1">{a.emoji}</span>
                              <span className="text-xs text-white/70">{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB: THEME STUDIO
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'theme' && (
                  <>
                    <Panel title="Color & Typography" sub="Theme Studio">
                      {/* Color Swatches */}
                      <FieldRow label="Color Palette">
                        <div className="flex flex-wrap gap-2">
                          {colorSwatches.map((sw, i) => (
                            <button
                              key={i}
                              onClick={() => doSave('theme-color', () => updateSettings({
                                bg_primary: sw.p, bg_secondary: sw.s, accent_color: sw.a, text_primary: sw.t,
                              }))}
                              className="w-8 h-8 rounded-xl border-2 shadow-sm transition-all hover:scale-110 active:scale-95"
                              style={{
                                background: sw.bg,
                                borderColor: settings.accent_color === sw.a ? 'white' : 'rgba(255,255,255,0.15)',
                              }}
                              title={sw.name}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-white/30">Current accent: {settings.accent_color}</p>
                      </FieldRow>

                      {/* Custom Accent Color */}
                      <FieldRow label="Custom Accent Color">
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={settings.accent_color}
                            onChange={(e) => doSave('theme-accent', () => updateSettings({ accent_color: e.target.value }))}
                            className="w-10 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                          />
                          <DarkInput
                            value={settings.accent_color}
                            onChange={(e) => updateSettings({ accent_color: e.target.value })}
                            placeholder="#D48C96"
                          />
                        </div>
                      </FieldRow>

                      {/* Font Selectors */}
                      <FieldRow label="Heading Font">
                        <div className="relative">
                          <select
                            value={settings.heading_font}
                            onChange={(e) => doSave('theme-font', () => updateSettings({ heading_font: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-[#282632] border border-white/10 text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
                          >
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Cormorant Garamond">Cormorant Garamond</option>
                            <option value="Dancing Script">Dancing Script</option>
                            <option value="Cairo">Cairo (Arabic)</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                      </FieldRow>

                      <FieldRow label="Body Font">
                        <div className="relative">
                          <select
                            value={settings.body_font}
                            onChange={(e) => doSave('theme-font', () => updateSettings({ body_font: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-[#282632] border border-white/10 text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            <option value="Cairo">Cairo (Arabic)</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                      </FieldRow>

                      <div className="pt-2 border-t border-white/6 text-[11px] text-white/40 flex justify-between">
                        <span>Theme: {settings.theme_preset}</span>
                        <span className={saving === 'theme-color' ? 'text-emerald-400' : saved === 'theme-color' ? 'text-emerald-400' : ''}>
                          {saving?.startsWith('theme') ? 'Saving…' : saved?.startsWith('theme') ? '✓ Saved' : 'Live with Jojo'}
                        </span>
                      </div>
                    </Panel>

                    <Panel title="Background Effects" sub="Particle Engine">
                      <FieldRow label="Particle Effect">
                        <div className="grid grid-cols-2 gap-2">
                          {(['sakura', 'sparkles', 'hearts', 'stars', 'none'] as const).map((ef) => (
                            <button
                              key={ef}
                              onClick={() => doSave('theme-particle', () => updateSettings({ particle_effect: ef }))}
                              className="px-3 py-2 rounded-xl text-xs transition-all border"
                              style={{
                                background: settings.particle_effect === ef ? 'rgba(212,140,150,0.25)' : '#282632',
                                borderColor: settings.particle_effect === ef ? 'rgba(212,140,150,0.5)' : 'rgba(255,255,255,0.08)',
                                color: settings.particle_effect === ef ? '#F3D9C9' : 'rgba(255,255,255,0.6)',
                              }}
                            >
                              {{sakura: '🌸 Sakura', sparkles: '✨ Sparkles', hearts: '❤️ Hearts', stars: '⭐ Stars', none: '○ None'}[ef]}
                            </button>
                          ))}
                        </div>
                      </FieldRow>

                      <div className="space-y-3 border-t border-white/6 pt-3">
                        {[
                          { label: 'Arabic/RTL Support', key: 'rtl' as const },
                        ].map(({ label }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-xs text-white/70">{label}</span>
                            <Toggle value={true} onChange={() => {}} />
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/6">
                        <p className="text-[11px] text-white/40 mb-2">Theme Presets</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'dreamy-rose', label: 'Dreamy Rose 🌹' },
                            { name: 'midnight-love', label: 'Midnight Love 🌙' },
                            { name: 'golden-hour', label: 'Golden Hour ☀️' },
                            { name: 'lavender-dream', label: 'Lavender Dream 💜' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => doSave('theme-preset', () => updateSettings({ theme_preset: preset.name }))}
                              className="px-2 py-1.5 rounded-lg text-[11px] border transition-all"
                              style={{
                                background: settings.theme_preset === preset.name ? 'rgba(212,140,150,0.2)' : 'transparent',
                                borderColor: settings.theme_preset === preset.name ? 'rgba(212,140,150,0.4)' : 'rgba(255,255,255,0.1)',
                                color: settings.theme_preset === preset.name ? '#F3D9C9' : 'rgba(255,255,255,0.5)',
                              }}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Panel>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB: EVENT VAULT
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'events' && (
                  <>
                    {/* Event List */}
                    <Panel title="Countdown Events" sub="Event Vault">
                      <div className="space-y-2">
                        {events.map((evt) => (
                          <div key={evt.id} className="p-3 rounded-xl bg-[#282632] border border-white/6 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{evt.title}</p>
                              <p className="text-[10px] text-white/40">{new Date(evt.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              {evt.teaser_clue && <p className="text-[10px] text-rose-300/70 mt-0.5 truncate">&ldquo;{evt.teaser_clue}&rdquo;</p>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => { openEditEvt(evt); }}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Edit2 size={11} className="text-white/50" />
                              </button>
                              <button
                                onClick={() => deleteEvent(evt.id)}
                                className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {events.length === 0 && (
                          <p className="text-xs text-white/30 text-center py-4">No events yet. Add one below!</p>
                        )}
                      </div>
                    </Panel>

                    {/* Add / Edit Event Form */}
                    <Panel title={editEvtId ? 'Edit Event' : 'Add New Event'} sub="Event Vault">
                      <div className="space-y-3">
                        <FieldRow label="Event Title">
                          <DarkInput value={evtForm.title} onChange={(e) => setEvtForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Valentine's Day ❤️" />
                        </FieldRow>
                        <FieldRow label="Target Date (unlocks at midnight)">
                          <DarkInput type="date" value={evtForm.target_date} onChange={(e) => setEvtForm(f => ({ ...f, target_date: e.target.value }))} />
                        </FieldRow>
                        <FieldRow label="Teaser Clue (shown while locked)">
                          <DarkTextarea value={evtForm.teaser_clue} onChange={(v) => setEvtForm(f => ({ ...f, teaser_clue: v }))} placeholder="A hint for Jojo..." rows={2} />
                        </FieldRow>
                        <FieldRow label="Secret Letter (revealed on unlock)">
                          <DarkTextarea value={evtForm.vault_letter} onChange={(v) => setEvtForm(f => ({ ...f, vault_letter: v }))} placeholder="Write a love letter to Jojo..." rows={4} />
                        </FieldRow>
                        <div className="flex gap-2">
                          <SaveBtn onClick={saveEvt} saved={saved === 'event'} label={editEvtId ? 'Update Event' : 'Add Event'} />
                          {editEvtId && (
                            <button
                              onClick={() => { setEditEvtId(null); setEvtForm({ title: '', target_date: '', teaser_clue: '', vault_letter: '' }); }}
                              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </Panel>

                    {/* Envelope List */}
                    <Panel title="Open When Envelopes" sub="Envelope Manager">
                      <div className="space-y-2">
                        {envelopes.map((env) => (
                          <div key={env.id} className="p-3 rounded-xl bg-[#282632] border border-white/6 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="text-base shrink-0">{env.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{env.title}</p>
                                <p className="text-[10px] text-white/40 truncate">{env.letter_content.slice(0, 60)}…</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openEditEnv(env)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                                <Edit2 size={11} className="text-white/50" />
                              </button>
                              <button onClick={() => deleteEnvelope(env.id)} className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center">
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    {/* Add / Edit Envelope */}
                    <Panel title={editEnvId ? 'Edit Envelope' : 'Add Envelope'} sub="Envelope Manager">
                      <div className="space-y-3">
                        <FieldRow label="Envelope Title">
                          <DarkInput value={envForm.title} onChange={(e) => setEnvForm(f => ({ ...f, title: e.target.value }))} placeholder="Open when you miss Bibo 💌" />
                        </FieldRow>
                        <FieldRow label="Emoji">
                          <DarkInput value={envForm.emoji} onChange={(e) => setEnvForm(f => ({ ...f, emoji: e.target.value }))} placeholder="💌" />
                        </FieldRow>
                        <FieldRow label="Letter Content">
                          <DarkTextarea value={envForm.letter_content} onChange={(v) => setEnvForm(f => ({ ...f, letter_content: v }))} placeholder="Write your letter to Jojo..." rows={5} />
                        </FieldRow>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Password Required</span>
                          <Toggle value={envForm.requires_password} onChange={(v) => setEnvForm(f => ({ ...f, requires_password: v }))} />
                        </div>
                        <div className="flex gap-2">
                          <SaveBtn onClick={saveEnvelope} saved={saved === 'envelope'} label={editEnvId ? 'Update Envelope' : 'Add Envelope'} />
                          {editEnvId && (
                            <button
                              onClick={() => { setEditEnvId(null); setEnvForm({ title: '', emoji: '💌', letter_content: '', requires_password: false }); }}
                              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB: MEDIA & MEMORY
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'media' && (
                  <>
                    {/* Memory Lane Manager */}
                    <Panel title="Memory Lane" sub="Memory Manager">
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {memories.map((mem) => (
                          <div key={mem.id} className="p-3 rounded-xl bg-[#282632] border border-white/6 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                              <img src={mem.image_url || '/images/couple_garden.jpg'} alt={mem.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{mem.title}</p>
                              <p className="text-[10px] text-white/40">{mem.memory_date}</p>
                              {mem.caption && <p className="text-[10px] text-white/30 truncate">{mem.caption}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEditMem(mem)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                                <Edit2 size={11} className="text-white/50" />
                              </button>
                              <button onClick={() => deleteMemory(mem.id)} className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center">
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {memories.length === 0 && (
                          <p className="text-xs text-white/30 text-center py-4">No memories yet. Add your first! 📷</p>
                        )}
                      </div>
                    </Panel>

                    {/* Add / Edit Memory */}
                    <Panel title={editMemId ? 'Edit Memory' : 'Add Memory'} sub="Memory Manager">
                      <div className="space-y-3">
                        <FieldRow label="Memory Title">
                          <DarkInput value={memForm.title} onChange={(e) => setMemForm(f => ({ ...f, title: e.target.value }))} placeholder="15 Sep 2025 — Where It All Began 💕" />
                        </FieldRow>
                        <FieldRow label="Date">
                          <DarkInput type="date" value={memForm.memory_date} onChange={(e) => setMemForm(f => ({ ...f, memory_date: e.target.value }))} />
                        </FieldRow>
                        <FieldRow label="Caption">
                          <DarkInput value={memForm.caption} onChange={(e) => setMemForm(f => ({ ...f, caption: e.target.value }))} placeholder="A short description..." />
                        </FieldRow>
                        <FieldRow label="Image URL or /images/ path">
                          <DarkInput value={memForm.image_url} onChange={(e) => setMemForm(f => ({ ...f, image_url: e.target.value }))} placeholder="/images/couple_garden.jpg" />
                        </FieldRow>
                        {memForm.image_url && (
                          <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10">
                            <img src={memForm.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/couple_garden.jpg'; }} />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <SaveBtn onClick={saveMem} saved={saved === 'memory'} label={editMemId ? 'Update Memory' : 'Add Memory'} />
                          {editMemId && (
                            <button
                              onClick={() => { setEditMemId(null); setMemForm({ title: '', memory_date: '', caption: '', image_url: '' }); }}
                              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </Panel>

                    {/* Available Images */}
                    <div className="md:col-span-2">
                      <Panel title="Available Images in /public/images" sub="Asset Library">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { src: '/images/couple_portrait.jpg', label: 'couple_portrait.jpg' },
                            { src: '/images/couple_garden.jpg', label: 'couple_garden.jpg' },
                            { src: '/images/couple_winter.jpg', label: 'couple_winter.jpg' },
                            { src: '/images/wax_envelope.jpg', label: 'wax_envelope.jpg' },
                          ].map((img) => (
                            <div key={img.src} className="flex flex-col gap-1">
                              <div className="rounded-xl overflow-hidden h-24 border border-white/10">
                                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[9px] text-white/30 font-mono text-center">{img.label}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-white/30 mt-2">
                          To add more images, place files in <code className="bg-white/10 px-1 rounded">public/images/</code> and reference them by path.
                        </p>
                      </Panel>
                    </div>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB: MUSIC & NOTES
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'music' && (
                  <>
                    {/* Daily Note Editor */}
                    <Panel title="Daily Note to Jojo" sub="Music & Notes">
                      <FieldRow label="Note Content (supports Arabic & English)">
                        <DarkTextarea
                          value={dailyNote}
                          onChange={setDailyNote}
                          placeholder="Write a daily message for Jojo..."
                          rows={5}
                        />
                      </FieldRow>
                      <p className="text-[10px] text-white/30">This note appears at the top of Jojo&apos;s home page every day.</p>
                      <SaveBtn
                        onClick={() => doSave('daily-note', () => updateSettings({
                          daily_note_content: dailyNote,
                          daily_note_updated_at: new Date().toISOString(),
                        }))}
                        saved={saved === 'daily-note'}
                        label="Publish Note to Jojo"
                      />
                    </Panel>

                    {/* Playlist Tracks */}
                    <Panel title="Music Playlist" sub="Music & Notes">
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {tracks.map((track) => (
                          <div key={track.id} className="p-3 rounded-xl bg-[#282632] border border-white/6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-pink-100/10">
                              <img src={track.cover_url || '/images/couple_portrait.jpg'} alt={track.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{track.title}</p>
                              <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEditTrack(track)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                                <Edit2 size={11} className="text-white/50" />
                              </button>
                              <button onClick={() => deleteTrack(track.id)} className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center">
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {tracks.length === 0 && (
                          <p className="text-xs text-white/30 text-center py-3">No tracks yet. Add a song!</p>
                        )}
                      </div>
                    </Panel>

                    {/* Add / Edit Track */}
                    <Panel title={editTrackId ? 'Edit Track' : 'Add Track'} sub="Music & Notes">
                      <div className="space-y-3">
                        <FieldRow label="Song Title">
                          <DarkInput value={trackForm.title} onChange={(e) => setTrackForm(f => ({ ...f, title: e.target.value }))} placeholder="Our Song — Bibo & Jojo" />
                        </FieldRow>
                        <FieldRow label="Artist">
                          <DarkInput value={trackForm.artist} onChange={(e) => setTrackForm(f => ({ ...f, artist: e.target.value }))} placeholder="Bibo & Jojo" />
                        </FieldRow>
                        <FieldRow label="Audio URL (public link or /audio/ path)">
                          <DarkInput value={trackForm.audio_url} onChange={(e) => setTrackForm(f => ({ ...f, audio_url: e.target.value }))} placeholder="https://... or /audio/song.mp3" />
                        </FieldRow>
                        <p className="text-[10px] text-white/30">
                          Use any public .mp3 / .ogg URL. For local files, place them in <code className="bg-white/10 px-1 rounded">public/audio/</code>.
                        </p>
                        <div className="flex gap-2">
                          <SaveBtn onClick={saveTrack} saved={saved === 'track'} label={editTrackId ? 'Update Track' : 'Add Track'} />
                          {editTrackId && (
                            <button
                              onClick={() => { setEditTrackId(null); setTrackForm({ title: '', artist: '', audio_url: '' }); }}
                              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB: SETTINGS
                    ════════════════════════════════════════════════════════════ */}
                {activeNav === 'settings' && (
                  <>
                    {/* Names & Nicknames */}
                    <Panel title="Names & Nicknames" sub="Settings">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <FieldRow label="His Full Name">
                            <DarkInput
                              value={settingsForm.his_name}
                              onChange={(e) => setSettingsForm(f => ({ ...f, his_name: e.target.value }))}
                              placeholder="Abanoub"
                            />
                          </FieldRow>
                          <FieldRow label="His Nickname">
                            <DarkInput
                              value={settingsForm.his_nickname}
                              onChange={(e) => setSettingsForm(f => ({ ...f, his_nickname: e.target.value }))}
                              placeholder="Bibo"
                            />
                          </FieldRow>
                          <FieldRow label="Her Full Name">
                            <DarkInput
                              value={settingsForm.her_name}
                              onChange={(e) => setSettingsForm(f => ({ ...f, her_name: e.target.value }))}
                              placeholder="Jostena"
                            />
                          </FieldRow>
                          <FieldRow label="Her Nickname">
                            <DarkInput
                              value={settingsForm.her_nickname}
                              onChange={(e) => setSettingsForm(f => ({ ...f, her_nickname: e.target.value }))}
                              placeholder="Jojo"
                            />
                          </FieldRow>
                        </div>
                        <FieldRow label="Portal Title">
                          <DarkInput
                            value={settingsForm.portal_title}
                            onChange={(e) => setSettingsForm(f => ({ ...f, portal_title: e.target.value }))}
                            placeholder="Bibo & Jojo ✨"
                          />
                        </FieldRow>
                        <SaveBtn
                          onClick={() => doSave('settings-names', () => updateSettings({
                            his_name: settingsForm.his_name,
                            his_nickname: settingsForm.his_nickname,
                            her_name: settingsForm.her_name,
                            her_nickname: settingsForm.her_nickname,
                            portal_title: settingsForm.portal_title,
                          }))}
                          saved={saved === 'settings-names'}
                          label="Save Names"
                        />
                      </div>
                    </Panel>

                    {/* Dates */}
                    <Panel title="Important Dates" sub="Settings">
                      <div className="space-y-3">
                        <FieldRow label="Relationship Start Date">
                          <DarkInput
                            type="date"
                            value={settingsForm.relationship_start}
                            onChange={(e) => setSettingsForm(f => ({ ...f, relationship_start: e.target.value }))}
                          />
                        </FieldRow>
                        <FieldRow label="Her Birthday (MM-DD or YYYY-MM-DD)">
                          <DarkInput
                            type="date"
                            value={settingsForm.her_birthday}
                            onChange={(e) => setSettingsForm(f => ({ ...f, her_birthday: e.target.value }))}
                          />
                        </FieldRow>
                        <SaveBtn
                          onClick={() => doSave('settings-dates', () => updateSettings({
                            relationship_start: settingsForm.relationship_start + 'T00:00:00+03:00',
                            her_birthday: settingsForm.her_birthday,
                          }))}
                          saved={saved === 'settings-dates'}
                          label="Save Dates"
                        />
                      </div>
                    </Panel>

                    {/* Security */}
                    <Panel title="Security" sub="Settings">
                      <FieldRow label="Master Password (used for Host Studio login)">
                        <DarkInput
                          type="password"
                          value={settingsForm.master_password}
                          onChange={(e) => setSettingsForm(f => ({ ...f, master_password: e.target.value }))}
                          placeholder="New password"
                        />
                      </FieldRow>
                      <p className="text-[10px] text-amber-400/80 flex items-center gap-1">
                        <AlertCircle size={11} /> After saving, you&apos;ll need to log in again with the new password.
                      </p>
                      <SaveBtn
                        onClick={() => doSave('settings-security', async () => {
                          await updateSettings({ master_password: settingsForm.master_password });
                          handleLogout();
                        })}
                        saved={saved === 'settings-security'}
                        label="Update Password & Re-login"
                      />
                    </Panel>

                    {/* Danger Zone */}
                    <Panel title="Danger Zone" sub="Settings">
                      <p className="text-xs text-white/50">These actions affect Jojo&apos;s view immediately.</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            if (confirm('Reset ALL theme settings to Rose Gold defaults?')) {
                              doSave('settings-reset', () => updateSettings({
                                bg_primary: '#F8DCDA', bg_secondary: '#F2C4C1',
                                accent_color: '#D48C96', text_primary: '#44292E',
                                heading_font: 'Playfair Display', body_font: 'Inter',
                                particle_effect: 'sakura', theme_preset: 'dreamy-rose',
                              }));
                            }
                          }}
                          className="w-full py-2 rounded-xl text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                          Reset Theme to Rose Gold Default
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('⚠️ WARNING: This will RESET ALL DATA to clean initial defaults (events, daily note, envelopes, tracks, memories, signals, and settings). Continue?')) {
                              await doSave('settings-reset-all', async () => {
                                await resetAllData();
                              });
                              alert('✨ All data has been successfully reset to pristine factory defaults!');
                            }
                          }}
                          className="w-full py-2 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCw size={12} className={saving === 'settings-reset-all' ? 'animate-spin' : ''} />
                          {saving === 'settings-reset-all' ? 'Resetting All Data...' : 'Reset All Portal Data to Clean Defaults'}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full py-2 rounded-xl text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Log Out of Studio
                        </button>
                      </div>
                    </Panel>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right Panel: iPhone Preview ───────────────────────────────── */}
          <aside className="w-[300px] shrink-0 bg-[#16151B] border-l border-white/8 p-4 flex flex-col items-center gap-4">
            <div className="w-full text-center">
              <h3 className="text-xs font-semibold text-white">Live Preview</h3>
              <p className="text-[10px] text-white/40">(Jojo&apos;s Page)</p>
              <div className="mt-2 flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setSimulateUnlock(!simulateUnlock)}
                  className="text-[10px] px-3 py-1 rounded-full border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 transition-colors"
                >
                  {simulateUnlock ? '🔓 Simulating Unlock' : '🔒 Simulate Unlock'}
                </button>
                <a
                  href={simulateUnlock ? '/?simulate=unlock' : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-3 py-1 rounded-full border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={9} /> Open
                </a>
              </div>
            </div>

            {/* iPhone 16 Pro Frame */}
            <div
              className="w-[240px] rounded-[36px] relative shadow-2xl overflow-hidden flex flex-col"
              style={{ border: '5px solid #2A2832', background: `linear-gradient(175deg, ${settings.bg_primary} 0%, ${settings.bg_secondary} 100%)`, height: '480px' }}
            >
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-50" />

              {/* Screen Content */}
              <div className="flex-1 overflow-hidden pt-7 px-3 text-[#44292E] flex flex-col">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-[10px] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{settings.portal_title}</span>
                  <span className="text-[9px] opacity-50">✨</span>
                </div>

                {/* Daily Note preview */}
                <div className="rounded-xl p-2 bg-white/50 mb-2 border border-white/60">
                  <p className="text-[9px] font-medium opacity-60 mb-0.5">Daily Note from {settings.his_nickname} 💌 :</p>
                  <p className="text-[9px] leading-snug opacity-80 line-clamp-2" dir="auto">{settings.daily_note_content}</p>
                </div>

                {/* Countdown preview */}
                <div className="rounded-xl p-2 bg-white/50 mb-2 border border-white/60 text-center">
                  <p className="text-[9px] font-bold text-[#3E2328]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {events[0]?.title || "Valentine's Day ❤️"}
                  </p>
                  <div className="flex justify-center gap-2 mt-1">
                    {['DD', 'HH', 'MM', 'SS'].map((u) => (
                      <div key={u} className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-[#3E2328]">--</span>
                        <span className="text-[7px] text-[#7A5B61]">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Couple photo */}
                <div className="flex justify-center">
                  <div
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-md"
                    style={{ borderColor: settings.accent_color + '80' }}
                  >
                    <img src="/images/couple_portrait.jpg" alt="Bibo & Jojo" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Bottom Nav preview */}
              <div className="h-10 bg-white/50 border-t border-white/70 flex justify-around items-center px-2 shrink-0">
                {['🏠', '🔒', '💌', '📷', '❤️'].map((icon) => (
                  <span key={icon} className="text-sm">{icon}</span>
                ))}
              </div>
            </div>

            {/* Live sync indicator */}
            <div className="text-[9px] text-white/30 flex items-center gap-1">
              <RotateCw size={8} className="animate-spin" /> Live Syncing Changes
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

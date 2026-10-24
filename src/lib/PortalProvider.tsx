'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { PortalState, SiteSettings, EventVault, OpenWhenEnvelope, PlaylistTrack, Memory, JojoSignal } from './types';
import { DEFAULT_STATE } from './seed';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'bibo_jojo_portal';
const CHANNEL_NAME = 'bibo_jojo_sync';

interface PortalContextType {
  state: PortalState;
  isSupabaseMode: boolean;
  updateSettings: (updates: Partial<SiteSettings>) => Promise<void>;
  upsertEvent: (event: EventVault) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  upsertEnvelope: (envelope: OpenWhenEnvelope) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  upsertTrack: (track: PlaylistTrack) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  upsertMemory: (memory: Memory) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  sendSignal: (signal: Omit<JojoSignal, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
  markSignalRead: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | null>(null);

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be inside <PortalProvider>');
  return ctx;
}

// ── localStorage + BroadcastChannel fallback engine ─────────────────────
function loadLocal(): PortalState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        events: parsed.events && parsed.events.length > 0 ? parsed.events : DEFAULT_STATE.events,
        envelopes: parsed.envelopes && parsed.envelopes.length > 0 ? parsed.envelopes : DEFAULT_STATE.envelopes,
        tracks: parsed.tracks && parsed.tracks.length > 0 ? parsed.tracks : DEFAULT_STATE.tracks,
        memories: parsed.memories && parsed.memories.length > 0 ? parsed.memories : DEFAULT_STATE.memories,
        signals: parsed.signals || DEFAULT_STATE.signals,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_STATE;
}

function saveLocal(state: PortalState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ── Provider component ──────────────────────────────────────────────────
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PortalState>(DEFAULT_STATE);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isSupabaseMode = isSupabaseConfigured;

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isSupabaseMode && supabase) {
      const client = supabase;
      // Load from Supabase
      (async () => {
        const [settingsRes, eventsRes, envelopesRes, tracksRes, memoriesRes, signalsRes] =
          await Promise.all([
            client.from('site_settings').select('*').eq('id', 1).single(),
            client.from('events_vault').select('*').order('created_at', { ascending: true }),
            client.from('open_when_envelopes').select('*').order('sort_order', { ascending: true }),
            client.from('playlist_tracks').select('*').order('sort_order', { ascending: true }),
            client.from('memories').select('*').order('sort_order', { ascending: true }),
            client.from('jojo_signals').select('*').order('created_at', { ascending: false }),
          ]);

        setState({
          settings: settingsRes.data || DEFAULT_STATE.settings,
          events: eventsRes.data || DEFAULT_STATE.events,
          envelopes: envelopesRes.data || DEFAULT_STATE.envelopes,
          tracks: tracksRes.data || DEFAULT_STATE.tracks,
          memories: memoriesRes.data || DEFAULT_STATE.memories,
          signals: signalsRes.data || DEFAULT_STATE.signals,
        });
      })();

      // Supabase Realtime subscriptions
      const channel = client
        .channel('portal-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
          if (payload.new) setState(s => ({ ...s, settings: payload.new as SiteSettings }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events_vault' }, () => {
          client.from('events_vault').select('*').order('created_at').then(({ data }) => {
            if (data) setState(s => ({ ...s, events: data }));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'open_when_envelopes' }, () => {
          client.from('open_when_envelopes').select('*').order('sort_order').then(({ data }) => {
            if (data) setState(s => ({ ...s, envelopes: data }));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist_tracks' }, () => {
          client.from('playlist_tracks').select('*').order('sort_order').then(({ data }) => {
            if (data) setState(s => ({ ...s, tracks: data }));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
          client.from('memories').select('*').order('sort_order').then(({ data }) => {
            if (data) setState(s => ({ ...s, memories: data }));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jojo_signals' }, () => {
          client.from('jojo_signals').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (data) setState(s => ({ ...s, signals: data }));
          });
        })
        .subscribe();

      return () => { client.removeChannel(channel); };
    } else {
      // localStorage fallback mode
      if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const loaded = loadLocal();
      setState(loaded);

      const bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'SYNC') {
          setState(ev.data.state as PortalState);
        }
      };
      return () => { bc.close(); };
    }
  }, [isSupabaseMode]);

  // ── Broadcast helper for local mode ───────────────────────────────────
  const broadcast = useCallback((newState: PortalState) => {
    saveLocal(newState);
    channelRef.current?.postMessage({ type: 'SYNC', state: newState });
  }, []);

  // ── Mutation helpers ──────────────────────────────────────────────────
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('site_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1);
    } else {
      setState(prev => {
        const next = { ...prev, settings: { ...prev.settings, ...updates, updated_at: new Date().toISOString() } };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const upsertEvent = useCallback(async (event: EventVault) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('events_vault').upsert(event);
    } else {
      setState(prev => {
        const idx = prev.events.findIndex(e => e.id === event.id);
        const events = [...prev.events];
        if (idx >= 0) events[idx] = event; else events.push(event);
        const next = { ...prev, events };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const deleteEvent = useCallback(async (id: string) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('events_vault').delete().eq('id', id);
    } else {
      setState(prev => {
        const next = { ...prev, events: prev.events.filter(e => e.id !== id) };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const upsertEnvelope = useCallback(async (envelope: OpenWhenEnvelope) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('open_when_envelopes').upsert(envelope);
    } else {
      setState(prev => {
        const idx = prev.envelopes.findIndex(e => e.id === envelope.id);
        const envelopes = [...prev.envelopes];
        if (idx >= 0) envelopes[idx] = envelope; else envelopes.push(envelope);
        const next = { ...prev, envelopes };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const deleteEnvelope = useCallback(async (id: string) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('open_when_envelopes').delete().eq('id', id);
    } else {
      setState(prev => {
        const next = { ...prev, envelopes: prev.envelopes.filter(e => e.id !== id) };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const upsertTrack = useCallback(async (track: PlaylistTrack) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('playlist_tracks').upsert(track);
    } else {
      setState(prev => {
        const idx = prev.tracks.findIndex(t => t.id === track.id);
        const tracks = [...prev.tracks];
        if (idx >= 0) tracks[idx] = track; else tracks.push(track);
        const next = { ...prev, tracks };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const deleteTrack = useCallback(async (id: string) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('playlist_tracks').delete().eq('id', id);
    } else {
      setState(prev => {
        const next = { ...prev, tracks: prev.tracks.filter(t => t.id !== id) };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const upsertMemory = useCallback(async (memory: Memory) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('memories').upsert(memory);
    } else {
      setState(prev => {
        const idx = prev.memories.findIndex(m => m.id === memory.id);
        const memories = [...prev.memories];
        if (idx >= 0) memories[idx] = memory; else memories.push(memory);
        const next = { ...prev, memories };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const deleteMemory = useCallback(async (id: string) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('memories').delete().eq('id', id);
    } else {
      setState(prev => {
        const next = { ...prev, memories: prev.memories.filter(m => m.id !== id) };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const sendSignal = useCallback(async (signal: Omit<JojoSignal, 'id' | 'created_at' | 'is_read'>) => {
    const newSignal: JojoSignal = {
      ...signal,
      id: crypto.randomUUID(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseMode && supabase) {
      await supabase.from('jojo_signals').insert(newSignal);
    } else {
      setState(prev => {
        const next = { ...prev, signals: [newSignal, ...prev.signals] };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const markSignalRead = useCallback(async (id: string) => {
    if (isSupabaseMode && supabase) {
      await supabase.from('jojo_signals').update({ is_read: true }).eq('id', id);
    } else {
      setState(prev => {
        const next = { ...prev, signals: prev.signals.map(s => s.id === id ? { ...s, is_read: true } : s) };
        broadcast(next);
        return next;
      });
    }
  }, [isSupabaseMode, broadcast]);

  const resetAllData = useCallback(async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch { /* ignore */ }
    }
    setState(DEFAULT_STATE);
    broadcast(DEFAULT_STATE);

    if (isSupabaseMode && supabase) {
      try {
        await supabase.from('site_settings').upsert(DEFAULT_STATE.settings);
        await supabase.from('events_vault').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('open_when_envelopes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('playlist_tracks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('memories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('jojo_signals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Failed to reset Supabase data:', err);
      }
    }
  }, [isSupabaseMode, broadcast]);

  return (
    <PortalContext.Provider value={{
      state,
      isSupabaseMode,
      updateSettings,
      upsertEvent,
      deleteEvent,
      upsertEnvelope,
      deleteEnvelope,
      upsertTrack,
      deleteTrack,
      upsertMemory,
      deleteMemory,
      sendSignal,
      markSignalRead,
      resetAllData,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

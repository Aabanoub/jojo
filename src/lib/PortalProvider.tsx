'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { PortalState, SiteSettings, EventVault, OpenWhenEnvelope, PlaylistTrack, Memory, JojoSignal, UploadedAsset } from './types';
import { DEFAULT_STATE } from './seed';
import { supabase as initialSupabase, isSupabaseConfigured as initialConfigured, updateSupabaseConfig, getSupabaseCredentials } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'bibo_jojo_portal';
const CHANNEL_NAME = 'bibo_jojo_sync';

export interface CloudStatus {
  isConnected: boolean;
  isConfigured: boolean;
  error: string | null;
  lastSynced: Date | null;
}

interface PortalContextType {
  state: PortalState;
  isSupabaseMode: boolean;
  cloudStatus: CloudStatus;
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
  upsertAsset: (asset: UploadedAsset) => Promise<void>;
  deleteAsset: (idOrUrl: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  refreshFromCloud: () => Promise<void>;
  configureSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  testSupabaseConnection: () => Promise<{ success: boolean; message: string }>;
}

const PortalContext = createContext<PortalContextType | null>(null);

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be inside <PortalProvider>');
  return ctx;
}

// ── LocalStorage Helpers ────────────────────────────────────────────────────
function loadLocal(): PortalState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        events: Array.isArray(parsed.events) ? parsed.events : DEFAULT_STATE.events,
        envelopes: Array.isArray(parsed.envelopes) ? parsed.envelopes : DEFAULT_STATE.envelopes,
        tracks: Array.isArray(parsed.tracks) ? parsed.tracks : DEFAULT_STATE.tracks,
        memories: Array.isArray(parsed.memories) ? parsed.memories : DEFAULT_STATE.memories,
        signals: Array.isArray(parsed.signals) ? parsed.signals : DEFAULT_STATE.signals,
        assets: Array.isArray(parsed.assets) ? parsed.assets : DEFAULT_STATE.assets,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_STATE;
}

function saveLocal(state: PortalState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ── Provider Component ──────────────────────────────────────────────────────
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PortalState>(DEFAULT_STATE);
  const [client, setClient] = useState<SupabaseClient | null>(initialSupabase);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({
    isConnected: false,
    isConfigured: initialConfigured,
    error: null,
    lastSynced: null,
  });

  const channelRef = useRef<BroadcastChannel | null>(null);
  const isSupabaseMode = cloudStatus.isConfigured && !!client;

  // ── Broadcast to other tabs on same machine ──────────────────────────────
  const broadcast = useCallback((newState: PortalState) => {
    saveLocal(newState);
    try {
      channelRef.current?.postMessage({ type: 'SYNC', state: newState });
    } catch { /* ignore */ }
  }, []);

  // ── Cloud fetch function ──────────────────────────────────────────────────
  const refreshFromCloud = useCallback(async () => {
    if (!client) return;
    try {
      const [settingsRes, eventsRes, envelopesRes, tracksRes, memoriesRes, signalsRes, assetsRes] =
        await Promise.all([
          client.from('site_settings').select('*').eq('id', 1).single(),
          client.from('events_vault').select('*').order('created_at', { ascending: true }),
          client.from('open_when_envelopes').select('*').order('sort_order', { ascending: true }),
          client.from('playlist_tracks').select('*').order('sort_order', { ascending: true }),
          client.from('memories').select('*').order('sort_order', { ascending: true }),
          client.from('jojo_signals').select('*').order('created_at', { ascending: false }),
          client.from('uploaded_assets').select('*').order('created_at', { ascending: false }),
        ]);

      if (settingsRes.error) {
        setCloudStatus(prev => ({ ...prev, isConnected: false, error: settingsRes.error.message }));
        console.warn('Supabase site_settings error:', settingsRes.error.message);
        return;
      }

      setCloudStatus({
        isConnected: true,
        isConfigured: true,
        error: null,
        lastSynced: new Date(),
      });

      setState(prev => {
        const next: PortalState = {
          settings: settingsRes.data ? { ...prev.settings, ...settingsRes.data } : prev.settings,
          events: Array.isArray(eventsRes.data) ? eventsRes.data : prev.events,
          envelopes: Array.isArray(envelopesRes.data) ? envelopesRes.data : prev.envelopes,
          tracks: Array.isArray(tracksRes.data) ? tracksRes.data : prev.tracks,
          memories: Array.isArray(memoriesRes.data) ? memoriesRes.data : prev.memories,
          signals: Array.isArray(signalsRes.data) ? signalsRes.data : prev.signals,
          assets: Array.isArray(assetsRes.data) ? assetsRes.data : prev.assets,
        };
        saveLocal(next);
        return next;
      });
    } catch (err: any) {
      setCloudStatus(prev => ({ ...prev, isConnected: false, error: err?.message || 'Connection error' }));
      console.warn('Failed to fetch from Supabase cloud:', err);
    }
  }, [client]);

  // ── Test Supabase Connection ──────────────────────────────────────────────
  const testSupabaseConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!client) {
      return { success: false, message: 'Supabase credentials are not configured yet.' };
    }
    try {
      const { data, error } = await client.from('site_settings').select('*').eq('id', 1).single();
      if (error) {
        return { success: false, message: `Database error: ${error.message} (Code: ${error.code})` };
      }
      return { success: true, message: `Connected successfully! Portal Title: "${data?.portal_title || 'Bibo & Jojo'}"` };
    } catch (err: any) {
      return { success: false, message: `Network/Request failed: ${err?.message || err}` };
    }
  }, [client]);

  // ── Configure Supabase Dynamically from UI ────────────────────────────────
  const configureSupabase = useCallback(async (url: string, key: string) => {
    const newClient = updateSupabaseConfig(url, key);
    setClient(newClient);
    const configured = !!(url.trim() && key.trim());
    setCloudStatus({
      isConnected: false,
      isConfigured: configured,
      error: null,
      lastSynced: null,
    });

    if (newClient) {
      try {
        const { error } = await newClient.from('site_settings').select('id').eq('id', 1).single();
        if (error) {
          setCloudStatus(prev => ({ ...prev, isConnected: false, error: error.message }));
          return { success: false, message: `Supabase keys saved, but test failed: ${error.message}` };
        }
        setCloudStatus({
          isConnected: true,
          isConfigured: true,
          error: null,
          lastSynced: new Date(),
        });
        await refreshFromCloud();
        return { success: true, message: 'Supabase connected successfully! Multi-device sync is active.' };
      } catch (err: any) {
        return { success: false, message: `Connection failed: ${err?.message || err}` };
      }
    }
    return { success: true, message: 'Cloud credentials cleared. Operating in local mode.' };
  }, [refreshFromCloud]);

  // ── Initial Load & Realtime Subscriptions ─────────────────────────────────
  useEffect(() => {
    // Check for quick URL reset
    if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load local cache first for instant render
    const initial = loadLocal();
    setState(initial);

    // Setup BroadcastChannel for multi-tab sync on same machine
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'SYNC') {
          setState(ev.data.state as PortalState);
        }
      };
    } catch { /* ignore */ }

    // Multi-window storage event listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // If Supabase client exists: setup Realtime + 4s polling
    if (client) {
      refreshFromCloud();

      // Background cloud poll every 4 seconds (guarantees cross-device sync)
      const pollInterval = setInterval(() => {
        refreshFromCloud();
      }, 4000);

      // Refresh on window focus and visibility change
      const handleFocus = () => { refreshFromCloud(); };
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') refreshFromCloud();
      };
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);

      // Supabase Realtime channel subscription
      const rtChannel = client
        .channel('portal-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
          if (payload.new) {
            setState(s => {
              const next = { ...s, settings: { ...s.settings, ...(payload.new as SiteSettings) } };
              saveLocal(next);
              return next;
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events_vault' }, () => {
          client.from('events_vault').select('*').order('created_at').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, events: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'open_when_envelopes' }, () => {
          client.from('open_when_envelopes').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, envelopes: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist_tracks' }, () => {
          client.from('playlist_tracks').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, tracks: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
          client.from('memories').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, memories: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jojo_signals' }, () => {
          client.from('jojo_signals').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, signals: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'uploaded_assets' }, () => {
          client.from('uploaded_assets').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, assets: data }; saveLocal(next); return next; });
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setCloudStatus(prev => ({ ...prev, isConnected: true }));
          }
        });

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('storage', handleStorageEvent);
        client.removeChannel(rtChannel);
        bc?.close();
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      bc?.close();
    };
  }, [client, refreshFromCloud]);

  // ── Unified Optimistic + Cloud Mutations ──────────────────────────────────
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    setState(prev => {
      const next = { ...prev, settings: { ...prev.settings, ...updates, updated_at: new Date().toISOString() } };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('site_settings').upsert({ id: 1, ...updates, updated_at: new Date().toISOString() });
        if (error) {
          console.error('Supabase updateSettings error:', error.message);
          setCloudStatus(prev => ({ ...prev, error: error.message }));
        }
      } catch (err: any) {
        console.error('Supabase updateSettings error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertEvent = useCallback(async (event: EventVault) => {
    setState(prev => {
      const idx = prev.events.findIndex(e => e.id === event.id);
      const events = [...prev.events];
      if (idx >= 0) events[idx] = event; else events.push(event);
      const next = { ...prev, events };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('events_vault').upsert(event);
        if (error) console.error('Supabase upsertEvent error:', error.message);
      } catch (err: any) {
        console.error('Supabase upsertEvent error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteEvent = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, events: prev.events.filter(e => e.id !== id) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('events_vault').delete().eq('id', id);
        if (error) console.error('Supabase deleteEvent error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteEvent error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertEnvelope = useCallback(async (envelope: OpenWhenEnvelope) => {
    setState(prev => {
      const idx = prev.envelopes.findIndex(e => e.id === envelope.id);
      const envelopes = [...prev.envelopes];
      if (idx >= 0) envelopes[idx] = envelope; else envelopes.push(envelope);
      const next = { ...prev, envelopes };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('open_when_envelopes').upsert(envelope);
        if (error) console.error('Supabase upsertEnvelope error:', error.message);
      } catch (err: any) {
        console.error('Supabase upsertEnvelope error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteEnvelope = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, envelopes: prev.envelopes.filter(e => e.id !== id) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('open_when_envelopes').delete().eq('id', id);
        if (error) console.error('Supabase deleteEnvelope error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteEnvelope error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertTrack = useCallback(async (track: PlaylistTrack) => {
    setState(prev => {
      const idx = prev.tracks.findIndex(t => t.id === track.id);
      const tracks = [...prev.tracks];
      if (idx >= 0) tracks[idx] = track; else tracks.push(track);
      const next = { ...prev, tracks };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('playlist_tracks').upsert(track);
        if (error) console.error('Supabase upsertTrack error:', error.message);
      } catch (err: any) {
        console.error('Supabase upsertTrack error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteTrack = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, tracks: prev.tracks.filter(t => t.id !== id) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('playlist_tracks').delete().eq('id', id);
        if (error) console.error('Supabase deleteTrack error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteTrack error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertMemory = useCallback(async (memory: Memory) => {
    setState(prev => {
      const idx = prev.memories.findIndex(m => m.id === memory.id);
      const memories = [...prev.memories];
      if (idx >= 0) memories[idx] = memory; else memories.push(memory);
      const next = { ...prev, memories };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('memories').upsert(memory);
        if (error) console.error('Supabase upsertMemory error:', error.message);
      } catch (err: any) {
        console.error('Supabase upsertMemory error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteMemory = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, memories: prev.memories.filter(m => m.id !== id) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('memories').delete().eq('id', id);
        if (error) console.error('Supabase deleteMemory error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteMemory error:', err);
      }
    }
  }, [client, broadcast]);

  const sendSignal = useCallback(async (signal: Omit<JojoSignal, 'id' | 'created_at' | 'is_read'>) => {
    const newSignal: JojoSignal = {
      ...signal,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sig-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setState(prev => {
      const next = { ...prev, signals: [newSignal, ...prev.signals] };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('jojo_signals').insert(newSignal);
        if (error) console.error('Supabase sendSignal error:', error.message);
      } catch (err: any) {
        console.error('Supabase sendSignal error:', err);
      }
    }
  }, [client, broadcast]);

  const markSignalRead = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, signals: prev.signals.map(s => s.id === id ? { ...s, is_read: true } : s) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('jojo_signals').update({ is_read: true }).eq('id', id);
        if (error) console.error('Supabase markSignalRead error:', error.message);
      } catch (err: any) {
        console.error('Supabase markSignalRead error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertAsset = useCallback(async (asset: UploadedAsset) => {
    setState(prev => {
      const idx = prev.assets.findIndex(a => a.id === asset.id || a.url === asset.url);
      const assets = [...prev.assets];
      if (idx >= 0) assets[idx] = asset; else assets.unshift(asset);
      const next = { ...prev, assets };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('uploaded_assets').upsert(asset);
        if (error) console.error('Supabase upsertAsset error:', error.message);
      } catch (err: any) {
        console.error('Supabase upsertAsset error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteAsset = useCallback(async (idOrUrl: string) => {
    setState(prev => {
      const next = { ...prev, assets: prev.assets.filter(a => a.id !== idOrUrl && a.url !== idOrUrl) };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        const { error } = await client.from('uploaded_assets').delete().or(`id.eq.${idOrUrl},url.eq.${idOrUrl}`);
        if (error) console.error('Supabase deleteAsset error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteAsset error:', err);
      }
    }
  }, [client, broadcast]);

  const resetAllData = useCallback(async () => {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
    setState(DEFAULT_STATE);
    broadcast(DEFAULT_STATE);

    if (client) {
      try {
        await client.from('site_settings').upsert(DEFAULT_STATE.settings);
        await client.from('events_vault').delete().neq('id', 'placeholder');
        for (const ev of DEFAULT_STATE.events) {
          await client.from('events_vault').upsert(ev);
        }
        await client.from('open_when_envelopes').delete().neq('id', 'placeholder');
        for (const env of DEFAULT_STATE.envelopes) {
          await client.from('open_when_envelopes').upsert(env);
        }
        await client.from('playlist_tracks').delete().neq('id', 'placeholder');
        for (const tr of DEFAULT_STATE.tracks) {
          await client.from('playlist_tracks').upsert(tr);
        }
        await client.from('memories').delete().neq('id', 'placeholder');
        for (const mem of DEFAULT_STATE.memories) {
          await client.from('memories').upsert(mem);
        }
        await client.from('jojo_signals').delete().neq('id', 'placeholder');
        await client.from('uploaded_assets').delete().neq('id', 'placeholder');
        for (const a of DEFAULT_STATE.assets) {
          await client.from('uploaded_assets').upsert(a);
        }
      } catch (err) {
        console.error('Failed to reset Supabase data:', err);
      }
    }
  }, [client, broadcast]);

  return (
    <PortalContext.Provider value={{
      state,
      isSupabaseMode,
      cloudStatus,
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
      upsertAsset,
      deleteAsset,
      resetAllData,
      refreshFromCloud,
      configureSupabase,
      testSupabaseConnection,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

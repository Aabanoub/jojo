'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { PortalState, SiteSettings, EventVault, OpenWhenEnvelope, PlaylistTrack, Memory, JojoSignal, UploadedAsset } from './types';
import { DEFAULT_STATE } from './seed';
import { supabase as initialSupabase, isSupabaseConfigured as initialConfigured, updateSupabaseConfig, getSupabaseCredentials, getSupabase, resolveSupabaseCloud } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendLoveNotification } from './notifications';

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
  updateSettings: (updates: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
  upsertEvent: (event: EventVault) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  upsertEnvelope: (envelope: OpenWhenEnvelope) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  upsertTrack: (track: PlaylistTrack) => Promise<{ success: boolean; error?: string }>;
  deleteTrack: (id: string) => Promise<void>;
  upsertMemory: (memory: Memory) => Promise<{ success: boolean; error?: string }>;
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
const LEGACY_SEED_IDS = new Set([
  'evt-valentine-2027',
  'evt-birthday-jojo',
  'env-miss-bibo',
  'env-need-smile',
  'env-cant-sleep',
  'track-our-song',
  'mem-1',
  'mem-2',
  'ast-1',
  'ast-2',
  'ast-3',
  'ast-4',
  'sig-1',
  'evt-default',
]);

function filterLegacy<T extends { id?: string }>(items: any): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(i => !i?.id || !LEGACY_SEED_IDS.has(i.id));
}

function loadLocal(): PortalState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };
      if (settings.daily_note_content === 'Good luck today my Jojo! Always remember how much Bibo loves you ❤️') {
        settings.daily_note_content = '';
      }
      return {
        settings,
        events: filterLegacy<EventVault>(parsed.events),
        envelopes: filterLegacy<OpenWhenEnvelope>(parsed.envelopes),
        tracks: filterLegacy<PlaylistTrack>(parsed.tracks),
        memories: filterLegacy<Memory>(parsed.memories),
        signals: filterLegacy<JojoSignal>(parsed.signals),
        assets: filterLegacy<UploadedAsset>(parsed.assets),
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
  const [client, setClient] = useState<SupabaseClient | null>(() => getSupabase() || initialSupabase);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({
    isConnected: false,
    isConfigured: initialConfigured || !!getSupabase(),
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
    const activeClient = client || getSupabase();
    if (!activeClient) return;
    try {
      const [settingsRes, eventsRes, envelopesRes, tracksRes, memoriesRes, signalsRes, assetsRes] =
        await Promise.all([
          activeClient.from('site_settings').select('*').eq('id', 1).single(),
          activeClient.from('events_vault').select('*').order('created_at', { ascending: true }),
          activeClient.from('open_when_envelopes').select('*').order('sort_order', { ascending: true }),
          activeClient.from('playlist_tracks').select('*').order('sort_order', { ascending: true }),
          activeClient.from('memories').select('*').order('sort_order', { ascending: true }),
          activeClient.from('jojo_signals').select('*').order('created_at', { ascending: false }),
          activeClient.from('uploaded_assets').select('*').order('created_at', { ascending: false }),
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
        const rawSettings = settingsRes.data ? { ...prev.settings, ...settingsRes.data } : prev.settings;
        if (rawSettings.daily_note_content === 'Good luck today my Jojo! Always remember how much Bibo loves you ❤️') {
          rawSettings.daily_note_content = '';
        }
        const next: PortalState = {
          settings: rawSettings,
          events: Array.isArray(eventsRes.data) ? filterLegacy<EventVault>(eventsRes.data) : prev.events,
          envelopes: Array.isArray(envelopesRes.data) ? filterLegacy<OpenWhenEnvelope>(envelopesRes.data) : prev.envelopes,
          tracks: Array.isArray(tracksRes.data) ? filterLegacy<PlaylistTrack>(tracksRes.data) : prev.tracks,
          memories: Array.isArray(memoriesRes.data) ? filterLegacy<Memory>(memoriesRes.data) : prev.memories,
          signals: Array.isArray(signalsRes.data) ? filterLegacy<JojoSignal>(signalsRes.data) : prev.signals,
          assets: Array.isArray(assetsRes.data) ? filterLegacy<UploadedAsset>(assetsRes.data) : prev.assets,
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

    // Auto-discover credentials if not already configured
    const activeClient = client || getSupabase();
    if (!activeClient) {
      resolveSupabaseCloud().then(resolved => {
        if (resolved) {
          setClient(resolved);
          setCloudStatus(prev => ({ ...prev, isConfigured: true }));
        }
      });
    }

    // If Supabase client exists: setup Realtime + 4s polling
    if (activeClient) {
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
      const rtChannel = activeClient
        .channel('portal-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
          if (payload.new) {
            const newSettings = payload.new as SiteSettings;
            setState(s => {
              // Trigger notification if daily note updated
              if (
                newSettings.daily_note_content &&
                newSettings.daily_note_content !== s.settings.daily_note_content
              ) {
                const isSafety = typeof window !== 'undefined' && localStorage.getItem('jojo_safety_mode') === 'true';
                const title = isSafety ? 'Daily Note 💌' : `Daily Note from ${newSettings.his_nickname || 'Bibo'} 💌`;
                sendLoveNotification(title, {
                  body: isSafety ? 'A new sweet note was posted 💕' : newSettings.daily_note_content.slice(0, 80),
                  tag: 'daily-note',
                });
              }
              const next = { ...s, settings: { ...s.settings, ...newSettings } };
              saveLocal(next);
              return next;
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events_vault' }, (payload) => {
          activeClient.from('events_vault').select('*').order('created_at').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, events: data }; saveLocal(next); return next; });
          });
          if (payload.new) {
            const evt = payload.new as EventVault;
            if (evt.force_unlocked) {
              const isSafety = typeof window !== 'undefined' && localStorage.getItem('jojo_safety_mode') === 'true';
              sendLoveNotification('Digital Vault Unlocked! 🎉', {
                body: isSafety ? 'A surprise is ready to be opened! ✨' : `Surprise "${evt.title}" is ready! ✨`,
                tag: 'vault-' + evt.id,
              });
            }
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'open_when_envelopes' }, (payload) => {
          activeClient.from('open_when_envelopes').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, envelopes: data }; saveLocal(next); return next; });
          });
          if (payload.eventType === 'INSERT' && payload.new) {
            const env = payload.new as OpenWhenEnvelope;
            const isSafety = typeof window !== 'undefined' && localStorage.getItem('jojo_safety_mode') === 'true';
            sendLoveNotification('Open When Envelope 💌', {
              body: isSafety ? 'A new letter was added to your envelopes 💕' : `New letter: "${env.title}"`,
              tag: 'envelope-' + env.id,
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist_tracks' }, () => {
          activeClient.from('playlist_tracks').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, tracks: data }; saveLocal(next); return next; });
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, (payload) => {
          activeClient.from('memories').select('*').order('sort_order').then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, memories: data }; saveLocal(next); return next; });
          });
          if (payload.eventType === 'INSERT' && payload.new) {
            const mem = payload.new as Memory;
            const isSafety = typeof window !== 'undefined' && localStorage.getItem('jojo_safety_mode') === 'true';
            sendLoveNotification('New Memory Added 📷💕', {
              body: isSafety ? 'A new memory was added to our timeline!' : `New moment: "${mem.title}"`,
              tag: 'memory-' + mem.id,
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jojo_signals' }, (payload) => {
          activeClient.from('jojo_signals').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            if (Array.isArray(data)) setState(s => { const next = { ...s, signals: data }; saveLocal(next); return next; });
          });
          if (payload.eventType === 'INSERT' && payload.new) {
            const sig = payload.new as JojoSignal;
            const isSafety = typeof window !== 'undefined' && localStorage.getItem('jojo_safety_mode') === 'true';
            const title = isSafety ? 'Love Alert 💕' : 'Love Signal from Our Space 💕';
            sendLoveNotification(title, {
              body: sig.message || 'You received a sweet love signal! ❤️',
              tag: 'signal-' + sig.id,
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'uploaded_assets' }, () => {
          activeClient.from('uploaded_assets').select('*').order('created_at', { ascending: false }).then(({ data }) => {
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
        activeClient.removeChannel(rtChannel);
        bc?.close();
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      bc?.close();
    };
  }, [client, refreshFromCloud]);

  // ── Unified Optimistic + Cloud Mutations ──────────────────────────────────
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    setState(prev => {
      const next = { ...prev, settings: { ...prev.settings, ...updates, updated_at: new Date().toISOString() } };
      broadcast(next);
      return next;
    });

    const activeClient = client || getSupabase();
    if (activeClient) {
      try {
        // Try update first (row id = 1 always exists)
        const { error: updateErr } = await activeClient
          .from('site_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', 1);

        if (updateErr) {
          console.warn('Update site_settings failed, falling back to upsert:', updateErr.message);
          const { error: upsertErr } = await activeClient
            .from('site_settings')
            .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() });
          if (upsertErr) {
            console.error('Supabase updateSettings error:', upsertErr.message);
            setCloudStatus(prev => ({ ...prev, error: upsertErr.message }));
            return { success: false, error: upsertErr.message };
          }
        }
        return { success: true };
      } catch (err: any) {
        console.error('Supabase updateSettings error:', err);
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: false, error: 'Database is not connected on this device' };
  }, [client, broadcast]);

  const upsertEvent = useCallback(async (event: EventVault) => {
    setState(prev => {
      let events = [...prev.events];
      if (event.is_featured) {
        events = events.map(e => (e.id === event.id ? event : { ...e, is_featured: false }));
      }
      const idx = events.findIndex(e => e.id === event.id);
      if (idx >= 0) {
        events[idx] = event;
      } else {
        events.unshift(event);
      }
      const next = { ...prev, events };
      broadcast(next);
      return next;
    });

    if (client) {
      try {
        if (event.is_featured) {
          try {
            await client.from('events_vault').update({ is_featured: false }).neq('id', event.id);
          } catch { /* ignore */ }
        }
        const { error } = await client.from('events_vault').upsert(event);
        if (error) {
          console.error('Supabase upsertEvent error:', error.message);
          setCloudStatus(prev => ({ ...prev, error: error.message }));
        }
      } catch (err: any) {
        console.error('Supabase upsertEvent error:', err);
      }
    }
  }, [client, broadcast]);

  const deleteEvent = useCallback(async (id: string) => {
    setState(prev => {
      const filtered = prev.events.filter(e => e.id !== id);
      const hasFeatured = filtered.some(e => e.is_featured);
      const events = (!hasFeatured && filtered.length > 0)
        ? [{ ...filtered[0], is_featured: true }, ...filtered.slice(1)]
        : filtered;
      const next = { ...prev, events };
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

  const upsertTrack = useCallback(async (track: PlaylistTrack): Promise<{ success: boolean; error?: string }> => {
    setState(prev => {
      const idx = prev.tracks.findIndex(t => t.id === track.id);
      const tracks = [...prev.tracks];
      if (idx >= 0) tracks[idx] = track; else tracks.push(track);
      const next = { ...prev, tracks };
      broadcast(next);
      return next;
    });

    const activeClient = client || getSupabase();
    if (activeClient) {
      try {
        const { error } = await activeClient.from('playlist_tracks').upsert(track);
        if (error) {
          console.error('Supabase upsertTrack error:', error.message);
          setCloudStatus(prev => ({ ...prev, error: error.message }));
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.error('Supabase upsertTrack error:', err);
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: false, error: 'Database is not connected on this device' };
  }, [client, broadcast]);

  const deleteTrack = useCallback(async (id: string) => {
    setState(prev => {
      const next = { ...prev, tracks: prev.tracks.filter(t => t.id !== id) };
      broadcast(next);
      return next;
    });

    const activeClient = client || getSupabase();
    if (activeClient) {
      try {
        const { error } = await activeClient.from('playlist_tracks').delete().eq('id', id);
        if (error) console.error('Supabase deleteTrack error:', error.message);
      } catch (err: any) {
        console.error('Supabase deleteTrack error:', err);
      }
    }
  }, [client, broadcast]);

  const upsertMemory = useCallback(async (memory: Memory): Promise<{ success: boolean; error?: string }> => {
    setState(prev => {
      const idx = prev.memories.findIndex(m => m.id === memory.id);
      const memories = [...prev.memories];
      if (idx >= 0) memories[idx] = memory; else memories.push(memory);
      const next = { ...prev, memories };
      broadcast(next);
      return next;
    });

    const activeClient = client || getSupabase();
    if (activeClient) {
      try {
        const { error } = await activeClient.from('memories').upsert(memory);
        if (error) {
          console.error('Supabase upsertMemory error:', error.message);
          setCloudStatus(prev => ({ ...prev, error: error.message }));
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.error('Supabase upsertMemory error:', err);
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
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

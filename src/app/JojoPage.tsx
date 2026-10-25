'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Lock, Mail, Camera, Heart, ChevronDown, Send, Clock, Sparkles } from 'lucide-react';
import { usePortal } from '@/lib/PortalProvider';
import ParticleBackground from '@/components/ParticleBackground';
import MusicPlayer from '@/components/MusicPlayer';
import CountdownDisplay from '@/components/CountdownDisplay';
import VaultCard from '@/components/VaultCard';
import EnvelopeCard from '@/components/EnvelopeCard';
import MemoryLane from '@/components/MemoryLane';
import ClientDate from '@/components/ClientDate';

type TabId = 'home' | 'vault' | 'envelopes' | 'memories' | 'ping';

export default function JojoPage() {
  const { state, sendSignal } = usePortal();
  const { settings, events, envelopes, tracks, memories } = state;
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [envelopeViewMode, setEnvelopeViewMode] = useState<'grid' | 'expanded'>('grid');
  const [showTogetherDetail, setShowTogetherDetail] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pingMessage, setPingMessage] = useState('');
  const [showPingSuccess, setShowPingSuccess] = useState(false);
  const [togetherStr, setTogetherStr] = useState('');

  // Find featured event or fallback to first
  const featuredEvent = events.find(e => e.is_featured) || events[0] || null;
  const selectedEvent = (selectedEventId ? events.find(e => e.id === selectedEventId) : null) || featuredEvent || null;

  // Format relationship start date dynamically
  const startDate = new Date(settings.relationship_start);
  const formattedTogetherDate = settings.relationship_start && !isNaN(startDate.getTime())
    ? `${String(startDate.getDate()).padStart(2, '0')}·${String(startDate.getMonth() + 1).padStart(2, '0')}·${startDate.getFullYear()}`
    : '';

  // Live together-since counter
  useEffect(() => {
    const update = () => {
      const start = new Date(settings.relationship_start).getTime();
      const now = Date.now();
      const diff = now - start;
      if (diff < 0) { setTogetherStr('Starting soon...'); return; }
      const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      const days = Math.floor((diff % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const secs = Math.floor((diff % (60 * 1000)) / 1000);
      setTogetherStr(`${years}y : ${months}m : ${days}d : ${hours}h : ${mins}m : ${secs}s`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [settings.relationship_start]);

  const quickSignals = [
    `Missing ${settings.his_nickname || 'Bibo'} ❤️`,
    `Thinking of you ${settings.his_nickname || 'Bibo'} ✨`,
    'Wish you were here 🥺',
    `I love you ${settings.his_nickname || 'Bibo'} 💕`,
  ];

  const handleSendPing = async (message: string) => {
    await sendSignal({ signal_type: 'heart', message });
    setShowPingSuccess(true);
    setPingMessage('');
    setTimeout(() => setShowPingSuccess(false), 2500);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden transition-colors duration-500"
      style={{
        background: `linear-gradient(175deg, ${settings.bg_primary || '#F8DCDA'} 0%, ${settings.bg_secondary || '#EFC0BD'} 100%)`,
        color: settings.text_primary || '#44292E',
        fontFamily: `'${settings.body_font || 'Inter'}', 'Cairo', sans-serif`,
      }}
    >
      {/* Dynamic Particle atmosphere layer */}
      <ParticleBackground effect={settings.particle_effect || 'sakura'} accentColor={settings.accent_color} />

      {/* Floating Music Player pill in top right */}
      <MusicPlayer tracks={tracks} accentColor={settings.accent_color} />

      {/* ─────────────────────────────────────────────────────────────
          PORTAL LOCK OVERLAY (When Bibo locks her page)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {settings.is_locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{
              background: 'rgba(255, 240, 243, 0.88)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 20px 50px rgba(212, 140, 150, 0.35)',
              }}
            >
              {/* Cute glowing lock badge with chick & sparkles */}
              <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                  }}
                >
                  <Lock size={30} className="text-white drop-shadow-sm" />
                </motion.div>
                <motion.span
                  animate={{ y: [-2, 3, -2], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 text-2xl"
                >
                  ✨
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute -bottom-1 -left-1 text-2xl"
                >
                  🐣
                </motion.span>
              </div>

              {/* Romantic Lock Message Requested by User */}
              <h2
                className="text-xl md:text-2xl font-bold leading-relaxed mb-2.5 text-[#44292E]"
                style={{ fontFamily: "'Cairo', 'Playfair Display', sans-serif" }}
                dir="auto"
              >
                {settings.lock_message || 'بعمل update علي السريع يا كتكوتي '}
              </h2>

              <p className="text-xs text-[#7A5B61] leading-relaxed mb-5 font-medium" dir="auto">
                ثواني وهتلاقي كل حاجة جاهزة ومفاجآت جديدة ليكي 💕
              </p>

              {/* Sweet animated pulsing bar */}
              <div className="w-36 h-1.5 mx-auto rounded-full bg-rose-200/50 overflow-hidden relative mb-4">
                <motion.div
                  animate={{ x: [-150, 150] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="w-20 h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-[11px] text-rose-500 font-medium border border-rose-100">
                <Sparkles size={11} className="animate-spin" />
                <span>{settings.his_nickname || 'Bibo'} شغال عليها دلوقتي حالا ✨</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="relative z-10 max-w-md mx-auto px-4 pb-28 pt-4">

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: HOME VIEW
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header: Portal Title + Together Badge */}
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: `'${settings.heading_font || 'Playfair Display'}', serif`,
                  color: settings.text_primary || '#44292E',
                }}
              >
                {settings.portal_title || `${settings.his_nickname || 'Bibo'} & ${settings.her_nickname || 'Jojo'}`} <span className="text-amber-400 text-lg">✨</span>
              </h1>
              {formattedTogetherDate && (
                <button
                  onClick={() => setShowTogetherDetail(!showTogetherDetail)}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full shadow-xs transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    color: settings.text_primary || '#6E454E',
                  }}
                >
                  <Clock size={11} className="text-[#C47D88]" />
                  Together Since {formattedTogetherDate}
                  <ChevronDown
                    size={11}
                    className="transition-transform"
                    style={{ transform: showTogetherDetail ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </button>
              )}

              <AnimatePresence>
                {showTogetherDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-2 px-3 py-2 rounded-2xl text-[11px] font-mono text-[#5D3A42] shadow-xs"
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {togetherStr}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* Card 1: Daily Note */}
            <section
              className="rounded-3xl p-4 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-semibold"
                  style={{ color: settings.text_primary || '#44292E' }}
                >
                  {settings.daily_note_title || `Daily Note 💌 :`}
                </span>
                {settings.daily_note_updated_at && (
                  <ClientDate
                    date={settings.daily_note_updated_at}
                    className="text-[9px] text-[#7A5B61] opacity-60"
                  />
                )}
              </div>
              <p
                className="text-sm md:text-base leading-relaxed font-script"
                style={{ color: settings.text_primary || '#44292E' }}
                dir="auto"
              >
                {settings.daily_note_content || `No note for today yet. Check back soon! 💕`}
              </p>
            </section>

            {/* Card 2: Hero Countdown */}
            {selectedEvent ? (
              <section
                className="rounded-3xl p-4 md:p-5 shadow-sm glow-card relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(240, 205, 175, 0.75)',
                }}
              >
                <CountdownDisplay
                  targetDate={selectedEvent.target_date}
                  label={selectedEvent.title}
                  accentColor={settings.accent_color}
                  switcher={
                    events.length > 1 ? (
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        {events.map((evt) => (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEventId(evt.id)}
                            className="text-[10px] px-3 py-1 rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            style={{
                              background: evt.id === selectedEvent.id ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                              color: evt.id === selectedEvent.id ? '#44292E' : '#7A5B61',
                              border: '1px solid rgba(255, 255, 255, 0.7)',
                              fontWeight: evt.id === selectedEvent.id ? 600 : 500,
                            }}
                          >
                            {evt.is_featured && <span>⭐</span>}
                            <span>{evt.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : null
                  }
                />
              </section>
            ) : (
              <section
                className="rounded-3xl p-6 text-center shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(16px)',
                  border: '1px dashed rgba(240, 205, 175, 0.8)',
                }}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-white/70 text-lg shadow-xs">
                  ⏳
                </div>
                <h3 className="text-sm font-semibold text-[#44292E]">No Upcoming Events Yet</h3>
                <p className="text-xs text-[#7A5B61] mt-1">
                  Add an upcoming milestone or surprise event in the Host Studio.
                </p>
              </section>
            )}

            {/* Card 3: Digital Vault */}
            {selectedEvent && (
              <section>
                <VaultCard event={selectedEvent} accentColor={settings.accent_color} />
              </section>
            )}
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: VAULT VIEW
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'vault' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: `'${settings.heading_font || 'Playfair Display'}', serif`,
                  color: settings.text_primary || '#44292E',
                }}
              >
                Digital Vault <span className="text-amber-400 text-lg">✨</span>
              </h1>
              <p className="text-xs text-[#7A5B61] mt-0.5">
                Special surprises and locked letters prepared by {settings.his_nickname || 'Bibo'}
              </p>
            </header>

            {/* Event Countdown Card & Vault Card */}
            {selectedEvent ? (
              <>
                <section
                  className="rounded-3xl p-4 shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(240, 205, 175, 0.75)',
                  }}
                >
                  <CountdownDisplay
                    targetDate={selectedEvent.target_date}
                    label={selectedEvent.title}
                    accentColor={settings.accent_color}
                    switcher={
                      events.length > 1 ? (
                        <div className="flex gap-1.5 flex-wrap justify-center mt-2">
                          {events.map((evt) => (
                            <button
                              key={evt.id}
                              onClick={() => setSelectedEventId(evt.id)}
                              className="text-[10px] px-3 py-1 rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              style={{
                                background: evt.id === selectedEvent.id ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                                color: evt.id === selectedEvent.id ? '#44292E' : '#7A5B61',
                                border: '1px solid rgba(255, 255, 255, 0.7)',
                                fontWeight: evt.id === selectedEvent.id ? 600 : 500,
                              }}
                            >
                              {evt.is_featured && <span>⭐</span>}
                              <span>{evt.title}</span>
                            </button>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                </section>

                {/* Vault Content Card */}
                <section>
                  <VaultCard event={selectedEvent} accentColor={settings.accent_color} />
                </section>
              </>
            ) : (
              <section
                className="rounded-3xl p-8 text-center shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(16px)',
                  border: '1px dashed rgba(240, 205, 175, 0.8)',
                }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/70 text-2xl shadow-xs">
                  🔒
                </div>
                <h3 className="text-sm font-semibold text-[#44292E]">No Vault Milestones Yet</h3>
                <p className="text-xs text-[#7A5B61] mt-1 max-w-xs mx-auto">
                  When you add an event in Host Studio with a secret letter or photos, it will appear locked here until the countdown completes or is unlocked.
                </p>
              </section>
            )}
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: ENVELOPES VIEW
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'envelopes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <header className="pt-1 flex items-center justify-between">
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    fontFamily: `'${settings.heading_font || 'Playfair Display'}', serif`,
                    color: settings.text_primary || '#44292E',
                  }}
                >
                  Open When Envelopes
                </h1>
                <p className="text-sm text-[#C47D88] font-script mt-0.5 font-bold">
                  For {settings.her_nickname || 'Jojo'} 💕
                </p>
              </div>

              {envelopes.length > 0 && (
                <div className="flex items-center gap-1 bg-white/60 p-1 rounded-full border border-white/80 shadow-xs">
                  <button
                    onClick={() => setEnvelopeViewMode('grid')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      envelopeViewMode === 'grid'
                        ? 'bg-white text-[#44292E] shadow-xs'
                        : 'text-[#7A5B61] hover:text-[#44292E]'
                    }`}
                  >
                    Grid ⊞
                  </button>
                  <button
                    onClick={() => setEnvelopeViewMode('expanded')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      envelopeViewMode === 'expanded'
                        ? 'bg-white text-[#44292E] shadow-xs'
                        : 'text-[#7A5B61] hover:text-[#44292E]'
                    }`}
                  >
                    Full 📜
                  </button>
                </div>
              )}
            </header>

            {/* Envelopes list / grid */}
            <section className="space-y-3">
              {envelopes.length > 0 ? (
                envelopeViewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {envelopes.map((env) => (
                      <EnvelopeCard
                        key={env.id}
                        envelope={env}
                        accentColor={settings.accent_color}
                        masterPassword={settings.master_password}
                        compact={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {envelopes.map((env) => (
                      <EnvelopeCard
                        key={env.id}
                        envelope={env}
                        accentColor={settings.accent_color}
                        masterPassword={settings.master_password}
                        compact={false}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div
                  className="rounded-3xl p-8 text-center shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(16px)',
                    border: '1px dashed rgba(240, 205, 175, 0.8)',
                  }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/70 text-2xl shadow-xs">
                    💌
                  </div>
                  <h3 className="text-sm font-semibold text-[#44292E]">No Envelopes Yet</h3>
                  <p className="text-xs text-[#7A5B61] mt-1 max-w-xs mx-auto">
                    When envelopes are created in Host Studio, they will appear here as &ldquo;Open When...&rdquo; letters for {settings.her_nickname || 'Jojo'} 💕
                  </p>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: MEMORIES VIEW
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'memories' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: `'${settings.heading_font || 'Playfair Display'}', serif`,
                  color: settings.text_primary || '#44292E',
                }}
              >
                Our Memory Lane
              </h1>
              <p className="text-sm text-[#C47D88] font-script mt-0.5 font-bold">
                Moments we cherish forever 💕
              </p>
            </header>

            <section>
              <MemoryLane memories={memories} accentColor={settings.accent_color} />
            </section>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: PING MODAL
           ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeTab === 'ping' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/40 backdrop-blur-xs p-4"
              onClick={(e) => { if (e.target === e.currentTarget) setActiveTab('home'); }}
            >
              <motion.div
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 50, scale: 0.95 }}
                className="w-full max-w-sm rounded-3xl p-5 shadow-2xl"
                style={{
                  background: 'linear-gradient(165deg, #FFF6F7 0%, #FAEBEC 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-base font-bold text-[#44292E]"
                    style={{ fontFamily: `'${settings.heading_font || 'Playfair Display'}', serif` }}
                  >
                    Ping {settings.his_nickname || 'Bibo'} ❤️
                  </h3>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-xs text-gray-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[#7A5B61] mb-3">
                  Send a love signal right to {settings.his_nickname || 'Bibo'}&apos;s Studio:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {quickSignals.map((sig) => (
                    <button
                      key={sig}
                      onClick={() => handleSendPing(sig)}
                      className="text-xs p-2.5 rounded-xl text-left transition-all shadow-xs hover:shadow-sm cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(240, 210, 215, 0.8)',
                        color: '#5D3A42',
                      }}
                    >
                      {sig}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={pingMessage}
                    onChange={(e) => setPingMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && pingMessage && handleSendPing(pingMessage)}
                    placeholder={`Write a custom note to ${settings.his_nickname || 'Bibo'}...`}
                    dir="auto"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-white/90 border border-pink-200 outline-none text-[#44292E]"
                  />
                  <button
                    onClick={() => pingMessage && handleSendPing(pingMessage)}
                    className="p-2.5 rounded-xl text-white shadow-sm shrink-0 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #C47D88, #B06974)' }}
                  >
                    <Send size={14} />
                  </button>
                </div>

                {showPingSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs mt-2 text-center text-pink-600 font-medium"
                  >
                    ✨ Love signal sent to {settings.his_nickname || 'Bibo'}! He&apos;ll see it right now 💕
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discreet Host Studio Link at bottom */}
        <div className="pt-8 pb-4 text-center">
          <a
            href="/host"
            className="inline-flex items-center gap-1.5 text-[11px] text-[#44292E]/40 hover:text-[#44292E]/80 transition-colors px-3 py-1.5 rounded-full hover:bg-white/40"
          >
            <span>🔒</span> {settings.his_nickname || 'Bibo'}&apos;s Host Studio
          </a>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 -4px 20px rgba(220, 180, 175, 0.15)',
        }}
      >
        <div className="max-w-md mx-auto flex justify-around py-2 px-2">
          {([
            { id: 'home' as TabId, icon: Home, label: 'Home' },
            { id: 'vault' as TabId, icon: Lock, label: 'Vault' },
            { id: 'envelopes' as TabId, icon: Mail, label: 'Envelopes' },
            { id: 'memories' as TabId, icon: Camera, label: 'Memories' },
            { id: 'ping' as TabId, icon: Heart, label: 'Signal' },
          ]).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative cursor-pointer ${
                  isActive ? 'text-[#8E4450]' : 'text-[#8C6B72] hover:text-[#5E3B42]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute inset-0 rounded-2xl -z-10"
                    style={{ background: 'rgba(235, 180, 185, 0.35)' }}
                  />
                )}
                <tab.icon size={18} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Lock, Mail, Camera, Heart, ChevronDown, Send, Clock } from 'lucide-react';
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
  const [showTogetherDetail, setShowTogetherDetail] = useState(false);
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [pingMessage, setPingMessage] = useState('');
  const [showPingSuccess, setShowPingSuccess] = useState(false);
  const [togetherStr, setTogetherStr] = useState('');

  // Find featured event
  const featuredEvent = events.find(e => e.is_featured) || events[0];
  const selectedEvent = events[selectedEventIdx] || featuredEvent;

  // Together since counter
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
    'Missing Bibo ❤️',
    'Thinking of you Bibo ✨',
    'Wish you were here 🥺',
    'I love you Bibo 💕',
  ];

  const handleSendPing = async (message: string) => {
    await sendSignal({ signal_type: 'heart', message });
    setShowPingSuccess(true);
    setPingMessage('');
    setTimeout(() => setShowPingSuccess(false), 2000);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(175deg, #F8DCDA 0%, #F4CBC8 40%, #EFC0BD 100%)',
        color: '#44292E',
        fontFamily: "'Inter', 'Cairo', sans-serif",
      }}
    >
      {/* Dynamic Particle atmosphere layer */}
      <ParticleBackground effect={settings.particle_effect || 'sakura'} accentColor={settings.accent_color} />

      {/* Floating Music Player pill in top right */}
      <MusicPlayer tracks={tracks} accentColor={settings.accent_color} />

      {/* Main Container */}
      <main className="relative z-10 max-w-md mx-auto px-4 pb-28 pt-4">

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: HOME VIEW (Image 4)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header: Bibo & Jojo ✨ + Together Badge */}
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight text-[#44292E]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bibo & Jojo <span className="text-amber-400 text-lg">✨</span>
              </h1>
              <button
                onClick={() => setShowTogetherDetail(!showTogetherDetail)}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full shadow-xs transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  color: '#6E454E',
                }}
              >
                <Clock size={11} className="text-[#C47D88]" />
                Together Since 15·09·2025
                <ChevronDown
                  size={11}
                  className="transition-transform"
                  style={{ transform: showTogetherDetail ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>

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

            {/* Card 1: Daily Note from Bibo */}
            <section
              className="rounded-3xl p-4 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#44292E]">
                  Daily Note from Bibo 💌 :
                </span>
                <ClientDate
                  date={settings.daily_note_updated_at}
                  className="text-[9px] text-[#7A5B61] opacity-60"
                />
              </div>
              <p
                className="text-sm md:text-base leading-relaxed text-[#44292E] font-script"
                dir="auto"
              >
                {settings.daily_note_content}
              </p>
            </section>

            {/* Card 2: Valentine's Day Surprise Hero Countdown */}
            <section
              className="rounded-3xl p-4 md:p-5 shadow-sm glow-card relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(240, 205, 175, 0.75)',
              }}
            >
              {/* Event switcher pill if more than 1 event */}
              <CountdownDisplay
                targetDate={selectedEvent.target_date}
                label={selectedEvent.title}
                accentColor={settings.accent_color}
                switcher={
                  events.length > 1 ? (
                    <div className="flex gap-1.5">
                      {events.map((evt, idx) => (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEventIdx(idx)}
                          className="text-[10px] px-3 py-1 rounded-full transition-all shadow-xs"
                          style={{
                            background: idx === selectedEventIdx ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                            color: idx === selectedEventIdx ? '#44292E' : '#7A5B61',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                            fontWeight: idx === selectedEventIdx ? 600 : 500,
                          }}
                        >
                          {evt.title.includes('Birthday') ? "Jojo's Birthday 🎂 30/6" : evt.title}
                        </button>
                      ))}
                    </div>
                  ) : null
                }
              />
            </section>

            {/* Card 3: Locked Digital Vault */}
            <section>
              <VaultCard event={selectedEvent} accentColor={settings.accent_color} />
            </section>

            {/* Card 4: Open When... Envelopes in 2-Column Grid */}
            <section className="grid grid-cols-2 gap-3 pt-1">
              {envelopes.slice(0, 2).map((env) => (
                <EnvelopeCard
                  key={env.id}
                  envelope={env}
                  accentColor={settings.accent_color}
                  compact={true}
                />
              ))}
            </section>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: VAULT VIEW (Image 2)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'vault' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header: Our Space ✨ */}
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight text-[#44292E]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Our Space <span className="text-amber-400 text-lg">✨</span>
              </h1>
            </header>

            {/* Countdown timer card showing 00:00:00 */}
            <section
              className="rounded-3xl p-4 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(240, 205, 175, 0.75)',
              }}
            >
              <CountdownDisplay
                targetDate={new Date(Date.now() - 1000).toISOString()}
                label="Anniversary Surprise"
                accentColor={settings.accent_color}
              />
            </section>

            {/* Unlocked Vault Material, Secret Letter, Polaroids, Coupon */}
            <section>
              <VaultCard event={{ ...selectedEvent, force_unlocked: true }} accentColor={settings.accent_color} />
            </section>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3 & 4: ENVELOPES & MEMORIES (Image 3)
           ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'envelopes' || activeTab === 'memories') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header: Envelopes & Memories + For Jojo 💕 */}
            <header className="pt-1">
              <h1
                className="text-2xl font-bold tracking-tight text-[#44292E]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Envelopes & Memories
              </h1>
              <p className="text-sm text-[#C47D88] font-script mt-0.5 font-bold">
                For Jojo 💕
              </p>
            </header>

            {/* Card 1: Open when you miss Bibo Wax Seal Envelope */}
            <section>
              <EnvelopeCard
                envelope={envelopes[0] || {
                  id: 'env-default',
                  title: 'Open when you miss Bibo 💌',
                  emoji: '💌',
                  letter_content: 'My dearest Jojo,\nwhenever you miss me,\ntap the Signal button\nbelow so I know!\n\nLove, Bibo ❤️',
                  media_url: '/images/wax_envelope.jpg',
                  audio_url: null,
                  requires_password: false,
                  sort_order: 1,
                  created_at: '2025-09-15T12:00:00.000Z',
                }}
                accentColor={settings.accent_color}
                compact={false}
              />
            </section>

            {/* Card 2: Memory Lane Polaroid Timeline */}
            <section>
              <MemoryLane memories={memories} accentColor={settings.accent_color} />
            </section>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: PING BIBO MODAL
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
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Ping Bibo ❤️
                  </h3>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-xs text-gray-500"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[#7A5B61] mb-3">
                  Send a love signal right to Bibo&apos;s Host Studio:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {quickSignals.map((sig) => (
                    <button
                      key={sig}
                      onClick={() => handleSendPing(sig)}
                      className="text-xs p-2.5 rounded-xl text-left transition-all shadow-xs hover:shadow-sm"
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
                    placeholder="Write a custom note to Bibo..."
                    dir="auto"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-white/90 border border-pink-200 outline-none text-[#44292E]"
                  />
                  <button
                    onClick={() => pingMessage && handleSendPing(pingMessage)}
                    className="p-2.5 rounded-xl text-white shadow-sm shrink-0"
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
                    ✨ Love signal sent to Bibo! He&apos;ll see it right now 💕
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
            <span>🔒</span> Bibo&apos;s Host Studio
          </a>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM NAVIGATION BAR (Matches Image 2, 3, 4)
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
            { id: 'ping' as TabId, icon: Heart, label: 'Send Signal' },
          ]).map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'envelopes' && activeTab === 'memories');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
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

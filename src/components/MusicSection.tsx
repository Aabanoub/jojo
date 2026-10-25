'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Music, ListMusic, Volume2, Sparkles, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlaylistTrack } from '@/lib/types';

export default function MusicSection({
  tracks,
  accentColor = '#D48C96',
  hisNickname = 'Bibo',
}: {
  tracks: PlaylistTrack[];
  accentColor?: string;
  hisNickname?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentIndex] || tracks[0] || null;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      nextTrack();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If no tracks added yet, display an elegant romantic invitation card
  if (!tracks || tracks.length === 0) {
    return (
      <section
        className="rounded-3xl p-5 text-center shadow-xs select-none transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          border: '1.5px dashed rgba(212, 140, 150, 0.45)',
        }}
      >
        <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center bg-rose-50 text-rose-400 shadow-xs">
          <Music size={22} className="animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-[#44292E] mb-1" dir="auto">
          أغانينا الخاصة 🎵
        </h3>
        <p className="text-xs text-[#7A5B61] leading-relaxed max-w-xs mx-auto" dir="auto">
          {hisNickname} بيجهّز قائمة الأغاني والموسيقى اللي بتفكرنا ببعض... أول ما يضيف أغاني في لوحة التحكم هتظهر هنا ونقدر نسمعها سوا 💕
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-3xl p-5 shadow-sm relative overflow-hidden transition-all"
      style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 12px 32px rgba(212, 140, 150, 0.18)',
      }}
    >
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-pink-300 flex items-center justify-center text-white shadow-xs">
            <Music size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#44292E] tracking-tight">Our Soundtrack 💕</h3>
            <p className="text-[10px] text-[#7A5B61]">{tracks.length} {tracks.length === 1 ? 'song' : 'songs'} in our playlist</p>
          </div>
        </div>

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
            showPlaylist
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white/70 text-[#5D3A42] hover:bg-white border border-rose-200/50'
          }`}
        >
          <ListMusic size={12} />
          <span>Playlist</span>
        </button>
      </div>

      {/* Main Player Display */}
      {currentTrack && (
        <div className="flex flex-col items-center text-center">
          {/* Animated Vinyl Record Disc */}
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="w-28 h-28 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'radial-gradient(circle, #302E39 35%, #18171E 70%, #0D0C11 100%)',
                boxShadow: isPlaying ? '0 8px 25px rgba(212, 140, 150, 0.45)' : '0 4px 15px rgba(0,0,0,0.15)',
              }}
            >
              {/* Grooves */}
              <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/10 pointer-events-none" />

              {/* Center Label */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/40 shadow-inner overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' }}
              >
                {currentTrack.cover_url ? (
                  <img src={currentTrack.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Disc size={20} className="text-white opacity-90" />
                )}
              </div>
            </motion.div>

            {/* Glowing music sparkles when playing */}
            {isPlaying && (
              <motion.span
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 text-base select-none pointer-events-none"
              >
                ✨
              </motion.span>
            )}
          </div>

          {/* Track Info */}
          <h4 className="text-sm font-bold text-[#44292E] mt-3 mb-0.5 truncate max-w-[260px]" title={currentTrack.title}>
            {currentTrack.title}
          </h4>
          <p className="text-[11px] text-[#7A5B61] font-medium mb-3">
            {currentTrack.artist || `${hisNickname} & Jojo`}
          </p>

          {/* Time scrubber */}
          <div className="w-full max-w-xs space-y-1 mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 bg-rose-200/60"
            />
            <div className="flex justify-between text-[10px] text-[#7A5B61] font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-4 text-[#5D3A42]">
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isRepeat ? 'text-rose-500 bg-rose-100/70' : 'text-[#7A5B61] hover:text-[#44292E]'
              }`}
              title={isRepeat ? 'Repeat active' : 'Repeat off'}
            >
              <Repeat size={16} />
            </button>

            <button
              onClick={prevTrack}
              className="p-2.5 rounded-full hover:bg-white/70 active:scale-95 transition-all cursor-pointer"
              title="Previous song"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF758C 0%, #FF7EB3 100%)',
                boxShadow: '0 6px 20px rgba(255, 117, 140, 0.4)',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-2.5 rounded-full hover:bg-white/70 active:scale-95 transition-all cursor-pointer"
              title="Next song"
            >
              <SkipForward size={18} />
            </button>

            <div className="w-8 flex items-center justify-center">
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  {[6, 12, 8, 14, 5].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 rounded-full bg-rose-400"
                      animate={{ height: [3, h, 3] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Playlist List */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-3 border-t border-rose-200/50"
          >
            <p className="text-[11px] font-semibold text-[#5D3A42] mb-2 px-1">All Songs in Playlist:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tracks.map((t, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border border-rose-400 text-rose-700 shadow-2xs font-semibold'
                        : 'bg-white/50 hover:bg-white/80 border border-white/60 text-[#44292E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono text-[#7A5B61] w-4 text-center">
                        {isSelected && isPlaying ? '▶' : `${idx + 1}`}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{t.title}</p>
                        <p className="text-[10px] text-[#7A5B61] truncate">{t.artist || 'Bibo & Jojo'}</p>
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <span className="text-[10px] text-rose-500 font-medium px-2 py-0.5 rounded-full bg-rose-100/80 animate-pulse shrink-0">
                        Playing 🎵
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

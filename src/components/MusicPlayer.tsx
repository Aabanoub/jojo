'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlaylistTrack } from '@/lib/types';

export default function MusicPlayer({ tracks, accentColor }: { tracks: PlaylistTrack[]; accentColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!tracks || tracks.length === 0) return null;

  const currentTrack = tracks[currentIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

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

  return (
    <div className="fixed top-3 right-3 z-40 select-none">
      <audio ref={audioRef} src={currentTrack.audio_url} onEnded={handleEnded} />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl p-1.5 pr-3 shadow-lg flex items-center gap-2.5 backdrop-blur-xl border border-white/80"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          boxShadow: '0 8px 24px rgba(212, 140, 150, 0.3)',
        }}
      >
        {/* Album thumbnail */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs border border-white/70 bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-xs">
          {currentTrack.cover_url ? (
            <img
              src={currentTrack.cover_url}
              alt="Song cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">🎵</span>
          )}
        </div>

        {/* Info & controls */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-1.5 max-w-[125px] sm:max-w-[160px]">
            <span className="text-xs font-bold truncate text-[#44292E]" title={currentTrack.title}>
              {currentTrack.title}
            </span>
            <Heart size={11} className="text-rose-400 fill-rose-400 shrink-0" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-1">
            {/* Waveform bars */}
            <div className="flex items-center gap-0.5 h-3">
              {[4, 9, 13, 7, 14, 10, 12, 6, 9, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: '#D48C96' }}
                  animate={isPlaying ? { height: [3, h, 3] } : { height: 3 }}
                  transition={{
                    duration: 0.6,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5 ml-1 text-[#66444B]">
              <button
                onClick={prevTrack}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/80 active:scale-95 transition-all cursor-pointer"
                title="Previous track"
              >
                <SkipBack size={13} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs active:scale-90 transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #FF758C 0%, #FF7EB3 100%)' }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
              </button>
              <button
                onClick={nextTrack}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/80 active:scale-95 transition-all cursor-pointer"
                title="Next track"
              >
                <SkipForward size={13} />
              </button>
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className="w-5 h-5 flex items-center justify-center rounded-full transition-all cursor-pointer"
                style={{ color: isRepeat ? '#D48C96' : '#99737C' }}
                title={isRepeat ? 'Repeat on' : 'Repeat off'}
              >
                <Repeat size={11} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

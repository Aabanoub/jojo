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
    <div className="fixed top-3 right-3 z-50">
      <audio ref={audioRef} src={currentTrack.audio_url} onEnded={handleEnded} />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl p-2 px-3 shadow-lg flex items-center gap-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 24px rgba(230, 180, 175, 0.25)',
        }}
      >
        {/* Album thumbnail */}
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/60 bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-xs">
          {currentTrack.cover_url ? (
            <img
              src={currentTrack.cover_url}
              alt="Song cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>🎵</span>
          )}
        </div>

        {/* Info & controls */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 max-w-[140px]">
            <span className="text-[11px] font-medium truncate text-[#44292E]">
              {currentTrack.title}
            </span>
            <Heart size={10} className="text-red-400 fill-red-400 shrink-0" />
          </div>

          {/* Waveform & controls */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* Waveform bars */}
            <div className="flex items-center gap-0.5 h-3">
              {[4, 8, 12, 6, 14, 9, 11, 5, 8, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: '#C47D88' }}
                  animate={isPlaying ? { height: [3, h, 4] } : { height: 3 }}
                  transition={{
                    duration: 0.6,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 ml-1 text-[#66444B]">
              <button onClick={prevTrack} className="hover:opacity-80 transition-opacity">
                <SkipBack size={11} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: '#C47D88' }}
              >
                {isPlaying ? <Pause size={8} /> : <Play size={8} className="ml-0.5" />}
              </button>
              <button onClick={nextTrack} className="hover:opacity-80 transition-opacity">
                <SkipForward size={11} />
              </button>
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className="hover:opacity-80 transition-opacity"
                style={{ color: isRepeat ? '#C47D88' : undefined }}
              >
                <Repeat size={10} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

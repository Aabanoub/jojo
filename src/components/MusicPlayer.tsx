'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlaylistTrack } from '@/lib/types';

export default function MusicPlayer({ tracks, accentColor }: { tracks: PlaylistTrack[]; accentColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  return (
    <div className="relative select-none flex items-center">
      <audio ref={audioRef} src={currentTrack.audio_url} onEnded={handleEnded} />
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xs cursor-pointer transition-all active:scale-90 relative overflow-hidden"
        style={{
          background: isPlaying
            ? 'linear-gradient(135deg, #FF758C 0%, #FF7EB3 100%)'
            : 'linear-gradient(135deg, #E08594 0%, #C46D7D 100%)',
          boxShadow: isPlaying ? '0 4px 14px rgba(255, 117, 140, 0.45)' : '0 2px 8px rgba(212, 140, 150, 0.25)',
        }}
        title={isPlaying ? `Pause: ${currentTrack.title}` : `Play music: ${currentTrack.title}`}
      >
        {isPlaying ? (
          <Pause size={14} className="drop-shadow-xs" />
        ) : (
          <Play size={14} className="ml-0.5 drop-shadow-xs" />
        )}
      </motion.button>
    </div>
  );
}

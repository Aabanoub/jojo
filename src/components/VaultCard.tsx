'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ChevronLeft, ChevronRight, Play, Pause, Sparkles, Gift } from 'lucide-react';
import ScratchVaultCard from './ScratchVaultCard';
import type { EventVault } from '@/lib/types';

interface VaultCardProps {
  event: EventVault;
  accentColor: string;
}

export default function VaultCard({ event, accentColor }: VaultCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('simulate') === 'unlock') {
        setIsSimulated(true);
        setUnlocked(true);
      }
    }
  }, []);

  const isTimeReached = new Date().getTime() >= new Date(event.target_date).getTime() || event.force_unlocked || isSimulated;

  const photos = event.vault_media.filter(m => m.type === 'image');
  const displayPhotos = photos.length > 0 ? photos : [
    { id: '1', type: 'image' as const, url: '/images/couple_portrait.jpg', caption: '15/09/25' },
    { id: '2', type: 'image' as const, url: '/images/couple_garden.jpg', caption: '25/06/25' },
    { id: '3', type: 'image' as const, url: '/images/couple_winter.jpg', caption: '24/12/25' },
  ];

  // ─────────────────────────────────────────────────────────────
  // 1. LOCKED STATE (Image 4)
  // ─────────────────────────────────────────────────────────────
  if (!isTimeReached && !unlocked) {
    return (
      <div
        className="relative rounded-3xl p-5 overflow-hidden shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
        }}
      >
        <h3
          className="text-xs font-semibold text-center text-[#5D3A42] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Locked Digital Vault
        </h3>

        {/* 3 Blurred photo thumbnails with golden Scratch Unlock overlay */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden flex gap-2 p-1.5 bg-white/20">
          <div className="flex-1 rounded-xl overflow-hidden filter blur-sm">
            <img src="/images/couple_portrait.jpg" alt="Preview 1" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 rounded-xl overflow-hidden filter blur-sm">
            <img src="/images/couple_garden.jpg" alt="Preview 2" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 rounded-xl overflow-hidden filter blur-sm">
            <img src="/images/couple_winter.jpg" alt="Preview 3" className="w-full h-full object-cover" />
          </div>

          {/* Golden Scratch & Unlock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-white drop-shadow-md">
              <span
                className="text-2xl md:text-3xl font-bold tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                Scratch
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-md">
                <Lock size={16} className="text-[#553311]" />
              </div>
              <span
                className="text-2xl md:text-3xl font-bold tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                Unlock
              </span>
            </div>
            <div
              className="mt-1 px-4 py-0.5 rounded-full text-xs font-medium text-white/95"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(200, 160, 100, 0.85), transparent)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              at 00:00
            </div>
          </div>
        </div>

        {event.teaser_clue && (
          <p className="text-[11px] text-center text-[#7A5B61] mt-2.5 italic" dir="auto">
            &ldquo;{event.teaser_clue}&rdquo;
          </p>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. READY TO SCRATCH (Interactive Foil Stage)
  // ─────────────────────────────────────────────────────────────
  if (isTimeReached && !unlocked) {
    return (
      <div
        className="relative rounded-3xl p-5 overflow-hidden shadow-lg border border-amber-200"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3 text-sm font-bold text-[#8C6239]">
          <Sparkles size={16} className="text-amber-500 animate-spin" />
          <span>Timer reached 00:00! Scratch foil to reveal:</span>
        </div>
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-amber-100 shadow-inner">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl mb-1">🎉</span>
            <p className="text-sm font-semibold text-[#44292E]">Bibo&apos;s Valentine Surprise is Ready!</p>
          </div>
          <ScratchVaultCard onReveal={() => setUnlocked(true)} accentColor={accentColor} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. UNLOCKED STATE (Image 2)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top Banner Card: Celebratory New Valentine's Day Surprise Unlocked! */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-3xl p-5 text-center overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(240, 205, 175, 0.8)',
          boxShadow: '0 0 30px rgba(235, 190, 160, 0.45)',
        }}
      >
        {/* Subtle decorative gold sparkle flakes */}
        <div className="absolute top-2 left-4 text-amber-400 opacity-70 text-xs">✨</div>
        <div className="absolute bottom-2 right-4 text-amber-400 opacity-70 text-xs">✨</div>
        <div className="absolute top-3 right-6 text-pink-400 opacity-60 text-xs">🎉</div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-md shrink-0">
            <Unlock size={20} className="text-[#553311]" />
          </div>
          <div className="text-left">
            <h3
              className="text-sm md:text-base font-bold text-[#44292E] leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Celebratory New<br />
              Valentine&apos;s Day Surprise<br />
              Unlocked! 🎉
            </h3>
          </div>
        </div>
      </motion.div>

      {/* Secret Letter Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 shadow-sm space-y-3.5"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        <h4 className="text-base text-[#44292E] font-script text-center font-bold">
          A Secret Letter from Bibo to Jojo 💌
        </h4>

        <div
          className="text-xs md:text-sm leading-relaxed text-[#44292E] text-center font-serif-elegant whitespace-pre-line"
          dir="auto"
        >
          {event.vault_letter || "Happy Valentine's Day, my love!\nEvery moment with you is a dream.\nHere's to us, forever... ❤️"}
        </div>

        {/* Voice Note Player Pill inside Letter */}
        <div
          className="rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid rgba(240, 210, 195, 0.6)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#44292E]">
              Voice Note from Bibo — 01:45
            </span>
            {/* Visualizer waveform */}
            <div className="flex items-center gap-0.5 h-3 mt-1">
              {[3, 6, 12, 8, 14, 10, 16, 7, 11, 5, 9, 4, 13, 8, 6, 4, 10, 6].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full transition-all duration-150"
                  style={{
                    height: `${h * 0.7}px`,
                    background: '#C47D88',
                    opacity: isPlayingAudio ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 shrink-0"
            style={{ background: 'linear-gradient(135deg, #C47D88, #B06974)' }}
          >
            {isPlayingAudio ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        </div>
      </motion.div>

      {/* 2-Column Grid: Uploaded Event Material + Surprise Coupon */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column: Uploaded Event Material */}
        <div
          className="rounded-3xl p-3 shadow-sm flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <h5 className="text-[11px] font-semibold text-center text-[#44292E] mb-2">
            Uploaded Event Material
          </h5>

          {/* Polaroid carousel */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden p-1.5 bg-white shadow-inner flex flex-col items-center">
            <img
              src={displayPhotos[currentPhotoIdx]?.url || '/images/couple_portrait.jpg'}
              alt="Material"
              className="w-full h-[78%] object-cover rounded-xl"
            />
            <span className="text-[9px] font-mono text-gray-500 mt-1">
              {displayPhotos[currentPhotoIdx]?.caption || '15/09/25'}
            </span>

            {/* Arrows */}
            <button
              onClick={() => setCurrentPhotoIdx((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center shadow-sm text-gray-600 hover:bg-white"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => setCurrentPhotoIdx((prev) => (prev + 1) % displayPhotos.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center shadow-sm text-gray-600 hover:bg-white"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Right Column: Surprise Coupon */}
        <div
          className="rounded-3xl p-3 shadow-sm flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <h5 className="text-[11px] font-semibold text-center text-[#44292E] mb-2">
            Surprise Coupon
          </h5>

          {/* Ticket style coupon */}
          <div className="relative w-full aspect-square rounded-2xl p-2.5 border-2 border-dashed border-amber-300 bg-amber-50/70 flex flex-col items-center justify-center text-center shadow-sm">
            <Gift size={20} className="text-amber-500 mb-1" />
            <span
              className="text-[11px] font-bold text-[#553311] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              1 Special Valentine<br />Date Night
            </span>
            <span className="text-[8px] text-amber-700/60 mt-1">
              ✨ Redeemable anytime ✨
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const photos = (event.vault_media || []).filter(m => m.type === 'image');
  const displayPhotos = photos;

  // ─────────────────────────────────────────────────────────────
  // 1. LOCKED STATE
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

        {/* Photo thumbnails or frosted gradient backdrop with golden Scratch Unlock overlay */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden flex gap-2 p-1.5 bg-white/20">
          {photos.length > 0 ? (
            photos.slice(0, 3).map((p, i) => (
              <div key={p.id || i} className="flex-1 rounded-xl overflow-hidden filter blur-sm">
                <img src={p.url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-r from-pink-200/40 via-rose-200/30 to-amber-200/40" />
          )}

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
            <p className="text-sm font-semibold text-[#44292E]">{event.title} is Ready!</p>
          </div>
          <ScratchVaultCard onReveal={() => setUnlocked(true)} accentColor={accentColor} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. UNLOCKED STATE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top Banner Card: Celebratory Surprise Unlocked! */}
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
              Celebratory Surprise<br />
              {event.title} Unlocked! 🎉
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
          A Secret Letter 💌
        </h4>

        <div
          className="text-xs md:text-sm leading-relaxed text-[#44292E] text-center font-serif-elegant whitespace-pre-line"
          dir="auto"
        >
          {event.vault_letter || 'Surprise unlocked! 🎉'}
        </div>

        {/* Voice Note Player Pill inside Letter */}
        <div className="flex justify-center pt-1">
          <div
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer shadow-xs transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(240, 205, 210, 0.8)',
            }}
          >
            <div className="w-6 h-6 rounded-full bg-[#D48C96] text-white flex items-center justify-center">
              {isPlayingAudio ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </div>
            <span className="text-xs font-semibold text-[#5D3A42]">Voice Note</span>
            <span className="text-[10px] text-[#8C6B72]">0:45</span>
          </div>
        </div>
      </motion.div>

      {/* Polaroid Memories Carousel (rendered only if photos were attached to event) */}
      {photos.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 shadow-sm relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-xs font-bold text-[#44292E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Vault Photos
            </h4>
            <span className="text-[10px] text-[#7A5B61]">
              {currentPhotoIdx + 1} / {photos.length}
            </span>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhotoIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-3 pb-6 rounded-2xl shadow-md mx-auto max-w-xs"
                style={{ transform: 'rotate(-1deg)' }}
              >
                <div className="w-full h-64 rounded-xl overflow-hidden bg-pink-50">
                  <img
                    src={photos[currentPhotoIdx]?.url}
                    alt={photos[currentPhotoIdx]?.caption || 'Vault photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {photos[currentPhotoIdx]?.caption && (
                  <p
                    className="text-xs text-center text-[#5D3A42] font-mono mt-3"
                    dir="auto"
                  >
                    {photos[currentPhotoIdx]?.caption}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#44292E] hover:bg-white transition-all active:scale-95"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPhotoIdx((prev) => (prev + 1) % photos.length)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#44292E] hover:bg-white transition-all active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Love Coupon Box */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl p-5 shadow-sm text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 235, 240, 0.8), rgba(255, 245, 235, 0.8))',
          backdropFilter: 'blur(16px)',
          border: '1.5px dashed rgba(212, 140, 150, 0.6)',
        }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[#8C4A55]">
          <Gift size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Love Coupon from Bibo</span>
        </div>
        <h4 className="text-base font-bold text-[#44292E] font-script">
          Redeemable: One Lifetime of Unconditional Love & Hugs
        </h4>
        <p className="text-[10px] text-[#7A5B61] mt-1">
          No expiration date • Valid anywhere in the universe 🌟
        </p>
      </motion.div>
    </div>
  );
}

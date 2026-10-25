'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Play, Pause, Lock } from 'lucide-react';
import type { OpenWhenEnvelope } from '@/lib/types';

interface EnvelopeCardProps {
  envelope: OpenWhenEnvelope;
  accentColor: string;
  masterPassword?: string;
  compact?: boolean;
}

export default function EnvelopeCard({ envelope, accentColor, masterPassword = 'Aj1592025=1', compact = false }: EnvelopeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleTap = () => {
    if (envelope.requires_password && !authenticated) {
      setShowPasswordPrompt(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === masterPassword) {
      setAuthenticated(true);
      setShowPasswordPrompt(false);
      setIsOpen(true);
    }
  };

  // Compact grid card (as shown on Image 4 Home view)
  if (compact) {
    return (
      <>
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTap}
          className="rounded-3xl p-3.5 shadow-sm cursor-pointer flex flex-col justify-between select-none relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            minHeight: '140px',
          }}
        >
          {/* Subtle envelope fold watermark */}
          <div
            className="absolute inset-x-2 top-2 h-14 rounded-2xl opacity-40 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(240, 200, 205, 0.4), rgba(255, 230, 235, 0.2))',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            }}
          />

          <div className="relative z-10 text-center">
            <h4
              className="text-xs font-bold text-[#44292E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Open When...
            </h4>
            <p className="text-[11px] text-[#6E474F] mt-1 font-medium">
              {envelope.title.replace(/^open when\s*/i, '') || envelope.title}
            </p>
          </div>

          <div className="relative z-10 flex justify-center mt-3">
            <span
              className="text-[10px] font-semibold px-4 py-1 rounded-full shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#5D3A42',
                border: '1px solid rgba(240, 210, 215, 0.8)',
              }}
            >
              Open
            </span>
          </div>
        </motion.div>

        {/* Modal when tapped */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
                style={{
                  background: 'linear-gradient(165deg, #FFF6F7 0%, #FAEBEC 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs text-gray-500 hover:bg-white"
                >
                  ✕
                </button>

                <h3
                  className="text-base font-bold text-[#44292E] mb-3 text-center"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {envelope.title}
                </h3>

                <div
                  className="p-4 rounded-2xl bg-white/80 shadow-inner text-sm leading-relaxed text-[#44292E] font-script whitespace-pre-line text-center text-base"
                  dir="auto"
                >
                  {envelope.letter_content}
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-1.5 rounded-full text-xs font-semibold text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #C47D88, #B06974)' }}
                  >
                    Close Letter
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Full detailed interactive envelope view (as in Image 3)
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-3xl p-5 shadow-sm relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
      }}
    >
      <h3 className="text-sm font-semibold text-[#44292E] mb-3">
        {envelope.title}
      </h3>

      <div className="relative rounded-2xl overflow-hidden p-3 bg-gradient-to-br from-pink-50/50 to-rose-100/50 flex flex-col items-center">
        {/* Wax seal open envelope photo */}
        <div className="w-full h-44 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
          {envelope.media_url ? (
            <img
              src={envelope.media_url}
              alt={envelope.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200/50 via-rose-100/40 to-amber-100/50 flex items-center justify-center">
              <span className="text-4xl opacity-70">💌</span>
            </div>
          )}

          {/* Letter note sticking out */}
          <div
            className="absolute inset-x-4 top-2 bottom-3 p-4 rounded-xl bg-amber-50/90 shadow-lg flex flex-col justify-between"
            style={{
              border: '1px solid rgba(230, 200, 160, 0.5)',
              transform: 'rotate(-1deg)',
            }}
          >
            <p
              className="text-xs md:text-sm text-[#44292E] font-script leading-relaxed text-center whitespace-pre-line"
              dir="auto"
            >
              {envelope.letter_content}
            </p>

            {/* Audio message pill */}
            <div
              className="mt-2 rounded-full px-3 py-1 bg-white/90 shadow-sm border border-pink-100 flex items-center justify-between mx-auto max-w-[200px] w-full cursor-pointer"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: '#C47D88' }}
                >
                  {isPlayingAudio ? <Pause size={8} /> : <Play size={8} className="ml-0.5" />}
                </div>
                <span className="text-[10px] font-medium text-[#44292E]">Voice Message</span>
              </div>
              {/* Waveform */}
              <div className="flex items-center gap-0.5 h-2">
                {[3, 6, 9, 5, 8, 4, 7, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full transition-all duration-150"
                    style={{
                      height: `${h}px`,
                      background: '#C47D88',
                      opacity: isPlayingAudio ? 1 : 0.7,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

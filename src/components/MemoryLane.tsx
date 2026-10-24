'use client';

import { motion } from 'framer-motion';
import { Camera, Calendar, Heart } from 'lucide-react';
import type { Memory } from '@/lib/types';
import ClientDate from './ClientDate';

interface MemoryLaneProps {
  memories: Memory[];
  accentColor: string;
}

export default function MemoryLane({ memories, accentColor }: MemoryLaneProps) {
  const displayMemories = memories.length > 0 ? memories : [
    {
      id: 'mem-1',
      title: '15 Sep 2025 — Where It All Began 💕',
      memory_date: '2025-09-15',
      caption: 'The start of forever.',
      image_url: '/images/couple_garden.jpg',
      sort_order: 1,
      created_at: '2025-09-15T12:00:00.000Z',
    },
    {
      id: 'mem-2',
      title: '24 Dec 2025 — Cozy Winter 🎄',
      memory_date: '2025-12-24',
      caption: 'Warm cocoa and twinkling lights.',
      image_url: '/images/couple_winter.jpg',
      sort_order: 2,
      created_at: '2025-12-24T12:00:00.000Z',
    },
  ];

  return (
    <div
      className="rounded-3xl p-5 shadow-sm relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-800 shadow-xs">
            15
          </div>
          <h3
            className="text-xs md:text-sm font-bold text-[#44292E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Memory Lane (Since 15-09-2025)
          </h3>
        </div>
        <span className="text-base">📷</span>
      </div>

      {/* Timeline path container */}
      <div className="relative py-2">
        {/* Glowing dotted vertical curve */}
        <div
          className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-amber-300/80 pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 6px rgba(240, 200, 140, 0.6))' }}
        />

        {/* Memory 1: 15 Sep 2025 */}
        <div className="relative flex items-center justify-between gap-3 mb-8">
          {/* Polaroid on left */}
          <div
            className="w-[125px] shrink-0 p-1.5 pb-3 bg-white rounded-xl shadow-md"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <img
              src={displayMemories[0]?.image_url || '/images/couple_garden.jpg'}
              alt="Where it began"
              className="w-full h-24 object-cover rounded-lg"
            />
            <p className="text-[8px] text-gray-400 text-center font-mono mt-1">15/09/2025</p>
          </div>

          {/* Glowing connector node in center */}
          <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-amber-300">
            <Heart size={10} className="text-pink-400 fill-pink-400" />
          </div>

          {/* Speech bubble badge on right */}
          <div
            className="flex-1 p-2.5 rounded-2xl bg-white/85 shadow-sm text-left border border-pink-100"
            style={{ transform: 'rotate(1deg)' }}
          >
            <p className="text-[11px] font-semibold text-[#44292E] leading-tight">
              15 Sep 2025 —<br />Where It All Began 💕
            </p>
          </div>
        </div>

        {/* Memory 2: 24 Dec 2025 */}
        <div className="relative flex items-center justify-between gap-3">
          {/* Speech bubble on left */}
          <div
            className="flex-1 p-2.5 rounded-2xl bg-white/85 shadow-sm text-right border border-pink-100"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <p className="text-[11px] font-semibold text-[#44292E] leading-tight">
              24 Dec 2025 —<br />Cozy Winter 🎄
            </p>
          </div>

          {/* Glowing connector node in center */}
          <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-amber-300">
            <Heart size={10} className="text-pink-400 fill-pink-400" />
          </div>

          {/* Polaroid on right */}
          <div className="relative">
            <div
              className="w-[125px] shrink-0 p-1.5 pb-3 bg-white rounded-xl shadow-md"
              style={{ transform: 'rotate(3deg)' }}
            >
              <img
                src={displayMemories[1]?.image_url || '/images/couple_winter.jpg'}
                alt="Cozy winter"
                className="w-full h-24 object-cover rounded-lg"
              />
              <p className="text-[8px] text-gray-400 text-center font-mono mt-1">24/12/2025</p>
            </div>

            {/* Pulsing Ping bubble overlay */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-3 -right-2 px-2.5 py-1 rounded-full bg-pink-500 text-white shadow-lg flex items-center gap-1 text-[9px] font-semibold z-10"
            >
              <span>Ping Bibo: I Miss You ❤️</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

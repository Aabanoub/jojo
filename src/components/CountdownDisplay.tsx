'use client';

import { useState, useEffect } from 'react';

interface CountdownDisplayProps {
  targetDate: string;
  label: string;
  accentColor: string;
  switcher?: React.ReactNode;
}

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  isZero: boolean;
}

function getTimeDiff(target: string): TimeLeft {
  const now = new Date().getTime();
  const end = new Date(target).getTime();
  const diff = end - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isZero: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return { days, hours, mins, secs, isZero: false };
}

export default function CountdownDisplay({ targetDate, label, switcher }: CountdownDisplayProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Check simulate flag
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('simulate') === 'unlock') {
        setTime({ days: 0, hours: 0, mins: 0, secs: 0, isZero: true });
        return;
      }
    }

    // Initial compute on client
    setTime(getTimeDiff(targetDate));

    const interval = setInterval(() => {
      setTime(getTimeDiff(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const digits = [
    { label: 'DAYS', value: time?.days ?? 0 },
    { label: 'HOURS', value: time?.hours ?? 0 },
    { label: 'MINS', value: time?.mins ?? 0 },
    { label: 'SECS', value: time?.secs ?? 0 },
  ];

  const isZero = time?.isZero ?? false;

  // Show skeleton until mounted
  if (!time) {
    return (
      <div className="text-center py-2 animate-pulse">
        <div className="h-6 bg-white/30 rounded-lg mx-8 mb-3" />
        <div className="flex items-center justify-center gap-2 my-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-10 bg-white/30 rounded-lg" />
              <div className="w-8 h-2 bg-white/20 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      {/* Title & Tag */}
      <div className="flex items-center justify-between mb-1 px-1">
        <h2
          className="text-base md:text-lg font-bold text-[#44292E] flex-1 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {isZero ? `✨ ${label} ✨` : label}
        </h2>
        {isZero && (
          <span className="text-[11px] font-medium text-[#C47D88] shrink-0">
            Time is Up! 🎉
          </span>
        )}
      </div>

      {/* Switcher pill if provided */}
      {switcher && (
        <div className="flex justify-center mb-4 mt-1">
          {switcher}
        </div>
      )}

      {/* Digits row */}
      <div className="flex items-center justify-center gap-2 md:gap-3 my-2">
        {digits.map((d, idx) => (
          <div key={d.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <span
                className="text-3xl md:text-4xl font-bold tracking-tight text-[#3E2328] tabular-nums"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {String(d.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] md:text-[10px] text-[#7A5B61] tracking-widest mt-1 font-medium">
                {d.label}
              </span>
            </div>
            {idx < digits.length - 1 && (
              <span
                className="text-2xl md:text-3xl font-light text-[#55333A] mx-2 -mt-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ScratchVaultCardProps {
  onReveal: () => void;
  accentColor: string;
}

export default function ScratchVaultCard({ onReveal, accentColor }: ScratchVaultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const scratchedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw metallic gold/rose-gold foil
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#c9a96e');
    grad.addColorStop(0.3, '#e8d5a3');
    grad.addColorStop(0.5, '#d4a574');
    grad.addColorStop(0.7, '#c9a96e');
    grad.addColorStop(1, '#b8956a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add shimmer pattern
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 30 + 5;
      const shimmer = ctx.createRadialGradient(x, y, 0, x, y, r);
      shimmer.addColorStop(0, 'rgba(255,255,255,0.8)');
      shimmer.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shimmer;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Text on foil
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch to reveal! ✨', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Use your finger or mouse', canvas.width / 2, canvas.height / 2 + 15);
  }, [revealed]);

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || scratchedRef.current) return;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    const total = imageData.data.length / 4;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    if (transparent / total > 0.45) {
      scratchedRef.current = true;
      setRevealed(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [accentColor, '#FFD700', '#FF69B4', '#fff'],
      });
      setTimeout(onReveal, 600);
    }
  }, [onReveal, accentColor]);

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || scratchedRef.current) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isScratching) return;
    scratch(clientX, clientY);
  }, [isScratching, scratch]);

  const handleEnd = useCallback(() => {
    setIsScratching(false);
    checkReveal();
  }, [checkReveal]);

  if (revealed) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing rounded-2xl"
      style={{ zIndex: 10, touchAction: 'none' }}
      onMouseDown={(e) => { setIsScratching(true); scratch(e.clientX, e.clientY); }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        setIsScratching(true);
        const t = e.touches[0];
        scratch(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={(e) => { e.preventDefault(); handleEnd(); }}
    />
  );
}

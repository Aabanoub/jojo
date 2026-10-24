'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  type?: 'sakura' | 'sparkle' | 'heart' | 'star';
  hue?: number;
}

export default function ParticleBackground({ effect, accentColor }: { effect: string; accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (effect === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 50;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        let pType: 'sakura' | 'sparkle' | 'heart' | 'star' = 'sparkle';
        if (effect === 'sakura') {
          pType = i % 2 === 0 ? 'sakura' : 'sparkle';
        } else if (effect === 'hearts') {
          pType = i % 2 === 0 ? 'heart' : 'sparkle';
        } else if (effect === 'stars') {
          pType = 'star';
        }

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 10 + 4,
          speedX: (Math.random() - 0.5) * (pType === 'sakura' ? 1.4 : 0.4),
          speedY: Math.random() * (pType === 'sakura' ? 1.5 : 0.6) + 0.3,
          opacity: Math.random() * 0.6 + 0.25,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 1.5,
          type: pType,
          hue: Math.random() * 30,
        });
      }
    };
    initParticles();

    const drawSparkle = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      grad.addColorStop(0, 'rgba(255, 240, 200, 0.95)');
      grad.addColorStop(0.4, 'rgba(255, 215, 160, 0.6)');
      grad.addColorStop(1, 'rgba(255, 180, 160, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // 4-point star glimmer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-0.5, -p.size * 0.8, 1, p.size * 1.6);
      ctx.fillRect(-p.size * 0.8, -0.5, p.size * 1.6, 1);
      ctx.restore();
    };

    const drawSakura = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity * 0.85;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = `rgba(244, 182, 194, 0.75)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity * 0.65;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      const s = p.size * 0.6;
      ctx.fillStyle = accentColor || '#D48C96';
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.5, 0, s * 1.5);
      ctx.bezierCurveTo(s * 1.5, s * 0.5, s, -s * 0.5, 0, s * 0.3);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(200,220,255,0.5)');
      grad.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        if (p.type === 'sakura') drawSakura(p);
        else if (p.type === 'heart') drawHeart(p);
        else if (p.type === 'star') drawStar(p);
        else drawSparkle(p);

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [effect, accentColor]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

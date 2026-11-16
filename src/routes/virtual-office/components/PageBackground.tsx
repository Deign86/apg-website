import React, { useEffect, useRef, useState } from 'react';

/**
 * PageBackground: Interactive Glassmorphism Tri-Tone (Black, Gold & White) Atmosphere
 * 
 * Features:
 * 1. Autonomous Continuous Motion: Floating frosted glass orbs drift, rotate, and breathe
 *    continuously even when idle / not hovered ("gumagalaw kahit hindi hinohover").
 * 2. Luminous Stardust & Champagne Bokeh Particle System:
 *    - Canvas-driven glowing golden dust, champagne embers, soft bokeh orbs, and twinkling micro-sparkles.
 *    - Continuously floats, drifts upward, and sways with harmonic sine waves.
 *    - Viewport-anchored via sticky positioning so particles follow the user as they scroll.
 * 3. Moving Silk Aurora Waves:
 *    - Undulating atmospheric golden caustics and luminous liquid light breathing behind the glass cards.
 * 4. Interactive Cursor Parallax & Halo Spotlight:
 *    - Smooth real-time reaction to pointer movements with fluid damping.
 * 5. Authentic Glassmorphic Styling:
 *    - Frosted glass discs and crystals with backdrop-blur-2xl, specular rim lights, and soft glows.
 *    - Zero grid lines or wireframes ("walang line line").
 */

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  speedY: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
  rgb: string;
  isBokeh: boolean;
  isSparkle: boolean;
  sparkleFreq: number;
}

export const PageBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0.5, y: 0.4 });
  const currentPos = useRef({ x: 0.5, y: 0.4 });
  const mouseViewportPos = useRef({ x: -1000, y: -1000 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const idleTimeRef = useRef(0);
  const userHasMovedMouse = useRef(false);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // 1. Initialize Particles
    const initParticles = (width: number, height: number) => {
      const count = Math.min(50, Math.max(30, Math.floor(width / 35)));
      const particles: Particle[] = [];
      const colorPalettes = [
        '212, 175, 55',   // Champagne Gold
        '247, 231, 169',  // Warm Ivory / Bright Gold
        '255, 255, 255',  // Diamond White
        '230, 195, 95',   // Rich Gold
      ];

      for (let i = 0; i < count; i++) {
        const isBokeh = i % 4 === 0;
        const isSparkle = !isBokeh && i % 3 === 0;
        const rgb = colorPalettes[i % colorPalettes.length];

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: isBokeh ? 6 + Math.random() * 10 : 1.2 + Math.random() * 2.2,
          baseAlpha: isBokeh ? 0.08 + Math.random() * 0.14 : 0.35 + Math.random() * 0.45,
          pulseSpeed: 1 + Math.random() * 2,
          pulseOffset: Math.random() * Math.PI * 2,
          speedY: isBokeh ? 0.08 + Math.random() * 0.14 : 0.18 + Math.random() * 0.32,
          swayFreq: 0.4 + Math.random() * 0.8,
          swayAmp: isBokeh ? 0.3 + Math.random() * 0.5 : 0.5 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          rgb,
          isBokeh,
          isSparkle,
          sparkleFreq: 0.8 + Math.random() * 1.5,
        });
      }
      particlesRef.current = particles;
    };

    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      initParticles(w, h);
    }

    // 2. Handle Resize with Device Pixel Ratio for Retina screens
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 3. Pointer Movement Handler
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      userHasMovedMouse.current = true;
      mouseViewportPos.current = { x: e.clientX, y: e.clientY };

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const normX = Math.max(0, Math.min(1, relX / rect.width));
      const normY = Math.max(0, Math.min(1, relY / rect.height));
      targetPos.current = { x: normX, y: normY };

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${relX}px, ${relY}px, 0)`;
        spotlightRef.current.style.opacity = '0.9';
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 4. Unified 60/120 FPS Animation Loop
    let lastTime = performance.now();

    const animateLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;
      idleTimeRef.current += dt;
      const t = idleTimeRef.current;

      // Parallax smooth interpolation
      const ease = 0.05;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      const pX = (currentPos.current.x - 0.5) * 45;
      const pY = (currentPos.current.y - 0.5) * 35;
      setParallax({ x: pX, y: pY });

      // Autonomous spotlight drift when idle
      if (!userHasMovedMouse.current && spotlightRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const autoX = rect.width * 0.5 + Math.sin(t * 0.8) * 120;
        const autoY = Math.min(rect.height * 0.25, 380) + Math.cos(t * 0.6) * 70;
        spotlightRef.current.style.transform = `translate3d(${autoX}px, ${autoY}px, 0)`;
      }

      // Render Floating Stardust & Bokeh Particles onto Canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const parent = canvas.parentElement;
        const w = parent?.clientWidth || window.innerWidth;
        const h = parent?.clientHeight || window.innerHeight;

        if (ctx) {
          ctx.clearRect(0, 0, w, h);

          const particles = particlesRef.current;
          const mx = mouseViewportPos.current.x;
          const my = mouseViewportPos.current.y;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Autonomous upward drift
            p.y -= p.speedY * (60 * dt);
            p.x += Math.sin(t * p.swayFreq + p.phase) * (p.swayAmp * (60 * dt) * 0.4);

            // Subtle mouse repulsion / aura interaction
            if (userHasMovedMouse.current) {
              const dx = p.x - mx;
              const dy = p.y - my;
              const distSq = dx * dx + dy * dy;
              const maxDist = 140;
              if (distSq < maxDist * maxDist && distSq > 1) {
                const dist = Math.sqrt(distSq);
                const force = ((maxDist - dist) / maxDist) * 0.6;
                p.x += (dx / dist) * force;
                p.y += (dy / dist) * force;
              }
            }

            // Loop back seamlessly from bottom/sides
            if (p.y < -30) {
              p.y = h + 20;
              p.x = Math.random() * w;
            }
            if (p.x < -30) p.x = w + 20;
            if (p.x > w + 30) p.x = -20;

            // Pulsing luminescence
            const alphaPulse = Math.sin(t * p.pulseSpeed + p.pulseOffset);
            const currentAlpha = Math.max(0.04, Math.min(1, p.baseAlpha * (0.75 + 0.35 * alphaPulse)));

            if (p.isBokeh) {
              // Soft out-of-focus bokeh disc
              const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
              grad.addColorStop(0, `rgba(${p.rgb}, ${currentAlpha * 0.8})`);
              grad.addColorStop(0.5, `rgba(${p.rgb}, ${currentAlpha * 0.35})`);
              grad.addColorStop(1, `rgba(${p.rgb}, 0)`);

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Glowing stardust speck / ember
              const haloRadius = p.radius * 2.8;
              const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
              grad.addColorStop(0, `rgba(${p.rgb}, ${currentAlpha})`);
              grad.addColorStop(0.35, `rgba(${p.rgb}, ${currentAlpha * 0.6})`);
              grad.addColorStop(1, `rgba(${p.rgb}, 0)`);

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
              ctx.fill();

              // Radiant sharp diamond-white core
              ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, currentAlpha * 1.3)})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(0.7, p.radius * 0.45), 0, Math.PI * 2);
              ctx.fill();

              // Micro-sparkle 4-point crosshair flare
              if (p.isSparkle) {
                const sparkleVal = Math.sin(t * p.sparkleFreq + p.phase);
                if (sparkleVal > 0.5) {
                  const flareIntensity = (sparkleVal - 0.5) * 2;
                  const flareLen = p.radius * (3.5 + 2 * flareIntensity);
                  ctx.strokeStyle = `rgba(255, 245, 215, ${flareIntensity * 0.65})`;
                  ctx.lineWidth = 0.8;
                  ctx.beginPath();
                  ctx.moveTo(p.x - flareLen, p.y);
                  ctx.lineTo(p.x + flareLen, p.y);
                  ctx.moveTo(p.x, p.y - flareLen);
                  ctx.lineTo(p.x, p.y + flareLen);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      animFrameId.current = requestAnimationFrame(animateLoop);
    };

    animFrameId.current = requestAnimationFrame(animateLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Keyframe animations for continuous autonomous drifting even without hover */}
      <style>{`
        @keyframes floatContinuous1 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(28px, -36px, 0) rotate(4deg) scale(1.04); }
          50% { transform: translate3d(-20px, -18px, 0) rotate(-3deg) scale(0.97); }
          75% { transform: translate3d(18px, 30px, 0) rotate(2deg) scale(1.02); }
        }
        @keyframes floatContinuous2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          30% { transform: translate3d(-38px, 28px, 0) rotate(-5deg) scale(1.05); }
          60% { transform: translate3d(24px, -22px, 0) rotate(4deg) scale(0.96); }
          85% { transform: translate3d(-18px, -32px, 0) rotate(-2deg) scale(1.03); }
        }
        @keyframes floatContinuous3 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(12deg) scale(1); }
          33% { transform: translate3d(32px, 24px, 0) rotate(18deg) scale(1.06); }
          66% { transform: translate3d(-24px, -28px, 0) rotate(6deg) scale(0.95); }
        }
        @keyframes floatContinuous4 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-8deg) scale(1); }
          40% { transform: translate3d(-30px, -40px, 0) rotate(-15deg) scale(1.04); }
          70% { transform: translate3d(28px, 26px, 0) rotate(-3deg) scale(0.96); }
        }
        @keyframes floatContinuous5 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -32px, 0) scale(1.07); }
        }
        @keyframes continuousPulseAura {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes auroraSilkWave1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 0.35; }
          50% { transform: translate3d(70px, -45px, 0) scale(1.18) rotate(4deg); opacity: 0.55; }
        }
        @keyframes auroraSilkWave2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: translate3d(-60px, 40px, 0) scale(1.14) rotate(-3deg); opacity: 0.5; }
        }
      `}</style>

      {/* 0. Top Feathered Gradient Dissolve: Smoothly blends in from the Landing Hero without any straight line */}
      <div 
        className="absolute top-0 inset-x-0 h-48 sm:h-72 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, #070707 0%, rgba(7, 7, 7, 0.85) 30%, rgba(7, 7, 7, 0.35) 70%, transparent 100%)'
        }}
      />

      {/* 1. Base Layer: Deep Multi-Tone Fluid Gradient (Black, Gold & White) */}
      <div 
        className="absolute inset-0 bg-[#060606]"
        style={{
          background: `
            radial-gradient(circle at 20% 12%, rgba(212, 175, 55, 0.42) 0%, transparent 48%),
            radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.32) 0%, transparent 42%),
            radial-gradient(circle at 50% 36%, rgba(212, 175, 55, 0.3) 0%, transparent 52%),
            radial-gradient(circle at 15% 58%, rgba(255, 255, 255, 0.24) 0%, transparent 46%),
            radial-gradient(circle at 85% 68%, rgba(212, 175, 55, 0.32) 0%, transparent 50%),
            radial-gradient(circle at 45% 88%, rgba(255, 255, 255, 0.2) 0%, transparent 46%),
            linear-gradient(165deg, #040404 0%, #151005 18%, #322607 35%, #080808 55%, #241c05 72%, #030303 100%)
          `
        }}
      />

      {/* 2. REAL-TIME INTERACTIVE CURSOR SPOTLIGHT / HALO */}
      <div 
        ref={spotlightRef}
        className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-300 opacity-80 will-change-transform"
        style={{
          background: `
            radial-gradient(circle at center, rgba(255, 255, 255, 0.22) 0%, rgba(212, 175, 55, 0.28) 32%, rgba(212, 175, 55, 0.08) 60%, transparent 75%)
          `,
          filter: 'blur(35px)',
          transform: 'translate3d(50%, 25%, 0)'
        }}
      />

      {/* 3. NEW: VIEWPORT-ANCHORED GOLDEN STARDUST & CHAMPAGNE BOKEH CANVAS */}
      {/* Follows user continuously as they scroll, providing living ambient motion */}
      <div className="sticky top-0 h-screen w-full pointer-events-none overflow-hidden z-10">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block pointer-events-none" 
        />
      </div>

      {/* 4. NEW: MOVING SILK AURORA WAVES (Fluid undulating atmospheric light ribbons) */}
      <div 
        className="absolute top-[18%] left-[-10%] w-[85vw] max-w-[1100px] h-[400px] rounded-full pointer-events-none filter blur-[100px] opacity-45 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.45) 0%, rgba(247,231,169,0.2) 42%, transparent 70%)',
          animation: 'auroraSilkWave1 18s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute top-[58%] right-[-12%] w-[80vw] max-w-[1000px] h-[380px] rounded-full pointer-events-none filter blur-[110px] opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.28) 0%, rgba(212,175,55,0.25) 45%, transparent 70%)',
          animation: 'auroraSilkWave2 22s ease-in-out infinite'
        }}
      />

      {/* 5. CONTINUOUSLY MOVING FROSTED GLASS ORBS & CRYSTAL DISCS */}
      
      {/* Orb 1: Upper-Left Golden Champagne Frosted Glass Disc */}
      <div 
        className="absolute top-[8%] left-[6%] transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${parallax.x * 1.2}px, ${parallax.y * 1.2}px, 0)` }}
      >
        <div 
          className="w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-white/35 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(212,175,55,0.2) 45%, rgba(0,0,0,0.4) 100%)',
            animation: 'floatContinuous1 11s ease-in-out infinite'
          }}
        >
          {/* Specular Edge Highlight */}
          <div className="absolute top-3 left-6 w-20 h-10 bg-gradient-to-r from-white/50 to-transparent rounded-full transform -rotate-12 blur-[2px]" />
          <div className="absolute bottom-6 right-8 w-12 h-6 bg-gradient-to-l from-[#d4af37]/40 to-transparent rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Orb 2: Top-Right Frosted Pearl-White Glass Sphere */}
      <div 
        className="absolute top-[12%] right-[8%] transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${-parallax.x * 0.9}px, ${-parallax.y * 0.9}px, 0)` }}
      >
        <div 
          className="w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-white/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.5)] relative"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 50%, rgba(212,175,55,0.12) 100%)',
            animation: 'floatContinuous2 13s ease-in-out infinite'
          }}
        >
          <div className="absolute top-4 right-8 w-24 h-12 bg-gradient-to-l from-white/60 to-transparent rounded-full transform rotate-12 blur-[3px]" />
        </div>
      </div>

      {/* Orb 3: Mid-Left Floating Amber Glass Pill */}
      <div 
        className="absolute top-[36%] -left-8 transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)` }}
      >
        <div 
          className="w-60 sm:w-84 h-40 sm:h-56 rounded-[44px] border border-[#d4af37]/45 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_3px_rgba(255,255,255,0.35)] relative"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(255,255,255,0.12) 40%, rgba(0,0,0,0.5) 100%)',
            animation: 'floatContinuous3 14s ease-in-out infinite'
          }}
        >
          <div className="absolute top-2 left-6 w-16 h-6 bg-gradient-to-r from-[#f7e7a9]/60 to-transparent rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Orb 4: Mid-Right Luminous Smoked Glass Polygon */}
      <div 
        className="absolute top-[55%] right-[4%] transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${-parallax.x * 1.1}px, ${-parallax.y * 1.1}px, 0)` }}
      >
        <div 
          className="w-64 sm:w-92 h-64 sm:h-92 rounded-[52px] border border-white/30 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.4)] relative"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.6) 60%, rgba(212,175,55,0.18) 100%)',
            animation: 'floatContinuous4 15s ease-in-out infinite'
          }}
        >
          <div className="absolute top-4 left-8 w-24 h-8 bg-gradient-to-r from-white/50 to-transparent rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Orb 5: Lower-Center Luminous Pearl Glass Orb */}
      <div 
        className="absolute top-[78%] left-[20%] transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${parallax.x * 0.7}px, ${parallax.y * 0.7}px, 0)` }}
      >
        <div 
          className="w-80 sm:w-[480px] h-64 sm:h-80 rounded-[60px] border border-white/25 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)] relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(212,175,55,0.18) 50%, rgba(0,0,0,0.5) 100%)',
            animation: 'floatContinuous5 16s ease-in-out infinite'
          }}
        />
      </div>

      {/* 6. ZONAL GRADIENT GLOWS (Tri-Tone: Gold, White & Black) */}
      
      {/* Top Zone / Pricing Glows */}
      <div 
        className="absolute top-[4%] -left-32 w-[650px] h-[650px] bg-gradient-to-tr from-[#d4af37]/45 via-[#ffd54f]/30 to-transparent rounded-full blur-[140px]"
        style={{ animation: 'continuousPulseAura 9s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-[8%] -right-28 w-[600px] h-[600px] bg-gradient-to-bl from-white/35 via-white/12 to-transparent rounded-full blur-[130px]"
        style={{ animation: 'continuousPulseAura 11s ease-in-out infinite 2s' }}
      />

      {/* Amenities Showcase Zone Glows */}
      <div className="absolute top-[38%] right-10 w-[650px] h-[650px] bg-gradient-to-bl from-white/28 via-white/10 to-transparent rounded-full blur-[140px]" />
      <div className="absolute top-[44%] left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#d4af37]/40 via-[#b3881b]/25 to-transparent rounded-full blur-[150px]" />

      {/* Calculator & Blueprint Zone Glows */}
      <div className="absolute top-[64%] left-1/4 w-[700px] h-[500px] bg-gradient-to-r from-white/22 via-transparent to-white/18 rounded-full blur-[150px]" />
      <div className="absolute top-[70%] -left-20 w-[600px] h-[600px] bg-[#d4af37]/35 rounded-full blur-[160px]" />

      {/* Bottom CTA & Footer Zone Glows */}
      <div className="absolute bottom-0 left-1/3 w-[800px] h-[450px] bg-gradient-to-t from-[#d4af37]/40 via-[#f7e7a9]/18 to-transparent rounded-full blur-[150px]" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-white/25 rounded-full blur-[120px]" />

      {/* 7. Smooth Ambient Vignette with Frosted Depth */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-black/20 to-black/60 pointer-events-none" />
    </div>
  );
};

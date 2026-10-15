import React, { useEffect, useRef } from 'react';
import { NavTab } from '../../types';

interface UnifiedLuxuryBackgroundProps {
  currentTab: NavTab;
}

// Safe helpers for gradients to prevent canvas errors
const safeCreateRadialGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): CanvasGradient | null => {
  if (
    !Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(r0) ||
    !Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(r1) ||
    r0 < 0 || r1 < 0
  ) {
    return null;
  }
  try {
    return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  } catch {
    return null;
  }
};

const safeCreateLinearGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient | null => {
  if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
    return null;
  }
  try {
    return ctx.createLinearGradient(x0, y0, x1, y1);
  } catch {
    return null;
  }
};

export const UnifiedLuxuryBackground: React.FC<UnifiedLuxuryBackgroundProps> = ({ currentTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTabRef = useRef<NavTab>(currentTab);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;

    // Rendered at 1x: it's a dim, soft backdrop, and full-DPR repaints of a viewport-sized
    // canvas every frame were a main cause of scroll jank on hi-DPI phones and laptops.
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // With reduced motion there is no loop, so repaint the single frame after a resize clears it.
    const onResize = () => {
      handleResize();
      if (reducedMotion) render();
    };
    window.addEventListener('resize', onResize);
    handleResize();

    const GOLD_COLORS = ['#FFFFFF', '#FFF8DC', '#FFE082', '#FFDF73', '#D4AF37', '#E2B857', '#C59B27', '#8A6D1C'];

    // Gradients depend only on a shape's fixed size and colours, so each is built once and reused
    // every frame: per-frame alpha goes through globalAlpha, per-frame position through the transform.
    const leafGradient = (size: number) => {
      const grad = safeCreateLinearGradient(ctx, -size, -size, size, size);
      if (grad) {
        grad.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
        grad.addColorStop(0.4, 'rgba(255, 223, 115, 0.85)');
        grad.addColorStop(0.8, 'rgba(212, 175, 55, 0.7)');
        grad.addColorStop(1, 'rgba(138, 109, 28, 0.3)');
      }
      return grad;
    };

    const crystalGradient = (size: number, opacity: number) => {
      const grad = safeCreateRadialGradient(ctx, 0, 0, 0, 0, 0, size * 1.2);
      if (grad) {
        grad.addColorStop(0, `rgba(255, 235, 150, ${(opacity * 0.22).toFixed(3)})`);
        grad.addColorStop(0.6, `rgba(212, 175, 55, ${(opacity * 0.1).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(6, 5, 3, 0)');
      }
      return grad;
    };

    const particleGradient = (type: 'speck' | 'spark' | 'bokeh', size: number, color: string) => {
      if (type === 'speck') return null;
      const grad = safeCreateRadialGradient(ctx, 0, 0, 0, 0, 0, type === 'bokeh' ? size : size * 2);
      if (grad && type === 'bokeh') {
        grad.addColorStop(0, 'rgba(255, 224, 130, 0.18)');
        grad.addColorStop(0.6, 'rgba(212, 175, 55, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (grad) {
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, 'rgba(255, 223, 115, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      return grad;
    };

    // 1. FLOATING ORGANIC GOLD LEAF / KINTSUGI FOIL FLAKES (3D Tumbling Gold Flakes)
    interface GoldLeafFlake {
      x: number;
      y: number;
      z: number; // depth scale 0.3 to 1.2
      vx: number;
      vy: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      vRotX: number;
      vRotY: number;
      vRotZ: number;
      size: number;
      opacity: number;
      shapePoints: { x: number; y: number }[]; // irregular torn shape
      fill: CanvasGradient | null;
    }

    const leafCount = 22;
    const goldLeaves: GoldLeafFlake[] = [];

    for (let i = 0; i < leafCount; i++) {
      // Generate 5 to 7 irregular jagged vertices for gold foil look
      const numVerts = Math.floor(Math.random() * 3) + 5;
      const shapePoints: { x: number; y: number }[] = [];
      const baseR = Math.random() * 8 + 6;
      for (let v = 0; v < numVerts; v++) {
        const angle = (v / numVerts) * Math.PI * 2;
        const rad = baseR * (0.6 + Math.random() * 0.8);
        shapePoints.push({
          x: Math.cos(angle) * rad,
          y: Math.sin(angle) * rad
        });
      }

      goldLeaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.9 + 0.3,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.4 - 0.1, // gently rising
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.02,
        vRotY: (Math.random() - 0.5) * 0.02,
        vRotZ: (Math.random() - 0.5) * 0.015,
        size: baseR,
        opacity: Math.random() * 0.5 + 0.3,
        shapePoints,
        fill: leafGradient(baseR)
      });
    }

    // 2. 3D GEOMETRIC GOLD POLYHEDRON CRYSTALS
    interface GeometricCrystal {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      vRotX: number;
      vRotY: number;
      vRotZ: number;
      size: number;
      sides: number;
      opacity: number;
      fill: CanvasGradient | null;
      stroke: string;
    }

    const crystalCount = 12;
    const crystals: GeometricCrystal[] = [];
    for (let i = 0; i < crystalCount; i++) {
      const sidesOptions = [4, 6, 8];
      const z = Math.random() * 0.8 + 0.2;
      const size = Math.random() * 28 + 16;
      const opacity = Math.random() * 0.3 + 0.15;
      crystals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.006,
        vRotY: (Math.random() - 0.5) * 0.006,
        vRotZ: (Math.random() - 0.5) * 0.004,
        size,
        sides: sidesOptions[Math.floor(Math.random() * sidesOptions.length)],
        opacity,
        fill: crystalGradient(size * z, opacity),
        stroke: `rgba(255, 235, 160, ${(opacity * 0.55).toFixed(3)})`
      });
    }

    // 3. ORGANIC KINTSUGI GOLD MARBLE VEINS (Branching natural root paths)
    interface MarbleVeinPoint {
      x: number;
      y: number;
      branches?: MarbleVeinPoint[];
      stroke?: CanvasGradient | null; // the edge from the parent to this point, built on first draw
    }

    const generateMarbleVeins = (w: number, h: number): MarbleVeinPoint[] => {
      const mainVeins: MarbleVeinPoint[] = [];
      const veinCount = 3; // 3 elegant diagonal organic veins across screen

      for (let v = 0; v < veinCount; v++) {
        let currX = (v / veinCount) * w * 1.2 - w * 0.1;
        let currY = -h * 0.1;

        const mainBranch: MarbleVeinPoint = { x: currX, y: currY, branches: [] };
        let parent = mainBranch;

        const steps = 18;
        for (let s = 0; s < steps; s++) {
          const angle = Math.PI * 0.28 + (Math.sin(s * 0.8 + v) * 0.35) + (Math.random() - 0.5) * 0.25;
          const dist = (h * 1.3) / steps;

          currX += Math.cos(angle) * dist;
          currY += Math.sin(angle) * dist;

          const node: MarbleVeinPoint = { x: currX, y: currY, branches: [] };

          // 25% chance to sprout a minor branch vein
          if (Math.random() < 0.35 && s > 2 && s < steps - 2) {
            let bX = currX;
            let bY = currY;
            const subBranch: MarbleVeinPoint = { x: bX, y: bY, branches: [] };
            let subParent = subBranch;

            const subSteps = 5;
            for (let sub = 0; sub < subSteps; sub++) {
              const subAngle = angle + (Math.random() > 0.5 ? 0.6 : -0.6) + (Math.random() - 0.5) * 0.3;
              bX += Math.cos(subAngle) * (dist * 0.6);
              bY += Math.sin(subAngle) * (dist * 0.6);
              const subNode: MarbleVeinPoint = { x: bX, y: bY };
              subParent.branches?.push(subNode);
              subParent = subNode;
            }
            node.branches?.push(subBranch);
          }

          parent.branches?.push(node);
          parent = node;
        }

        mainVeins.push(mainBranch);
      }
      return mainVeins;
    };

    let kintsugiVeins = generateMarbleVeins(window.innerWidth, window.innerHeight);

    // 4. INTERACTIVE PULSE RINGS
    interface PulseRing {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      speed: number;
    }
    const pulseRings: PulseRing[] = [];

    // 5. AMBIENT BOKEH & SPARK EMBERS
    interface EmberParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      baseOpacity: number;
      pulseSpeed: number;
      color: string;
      type: 'speck' | 'spark' | 'bokeh';
      glow: CanvasGradient | null;
    }
    const particleCount = Math.min(Math.floor((width * height) / 6500), 90);
    const ambientParticles: EmberParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const randType = Math.random();
      let type: 'speck' | 'spark' | 'bokeh' = 'speck';
      let size = Math.random() * 1.5 + 0.8;
      let opacity = Math.random() * 0.6 + 0.2;

      if (randType > 0.88) {
        type = 'bokeh';
        size = Math.random() * 14 + 6;
        opacity = Math.random() * 0.1 + 0.03;
      } else if (randType > 0.6) {
        type = 'spark';
        size = Math.random() * 2.5 + 1.2;
        opacity = Math.random() * 0.75 + 0.25;
      }

      const color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.1,
        size,
        opacity,
        baseOpacity: opacity,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        color,
        type,
        glow: particleGradient(type, size, color)
      });
    }

    // Scroll & Mouse Tracking
    let targetScrollY = 0;
    let currentScrollY = 0;

    let lastScrollAt = 0;
    const handleScroll = () => {
      targetScrollY = window.scrollY;
      lastScrollAt = performance.now();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let lastPulseTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;

      const now = Date.now();
      if (now - lastPulseTime > 450 && pulseRings.length < 6) {
        lastPulseTime = now;
        pulseRings.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: Math.random() * 120 + 90,
          opacity: 0.35,
          speed: Math.random() * 1.2 + 0.8
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      pulseRings.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 200,
        opacity: 0.6,
        speed: 2.0
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let time = 0;

    // Recursive helper to render branching marble veins
    const renderVeinTree = (
      node: MarbleVeinPoint,
      depth: number,
      timeShift: number,
      normMouseX: number,
      normMouseY: number
    ) => {
      if (!node.branches || node.branches.length === 0) return;

      node.branches.forEach((child) => {
        // Subtle organic swaying motion
        const swayX = Math.sin(time + node.y * 0.005 + timeShift) * 6 + normMouseX * 0.3;
        const swayY = Math.cos(time + node.x * 0.005 + timeShift) * 4 + normMouseY * 0.3;

        ctx.beginPath();
        ctx.moveTo(node.x + swayX, node.y + swayY);
        ctx.lineTo(child.x + swayX, child.y + swayY);

        // The gradient spans the unswayed edge, which never moves: build it once.
        if (child.stroke === undefined) {
          child.stroke = safeCreateLinearGradient(ctx, node.x, node.y, child.x, child.y);
          if (child.stroke && depth === 0) {
            child.stroke.addColorStop(0, 'rgba(255, 235, 160, 0.35)');
            child.stroke.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)');
            child.stroke.addColorStop(1, 'rgba(184, 134, 11, 0.25)');
          } else if (child.stroke) {
            child.stroke.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
            child.stroke.addColorStop(1, 'rgba(138, 109, 28, 0.1)');
          }
        }
        if (child.stroke) {
          ctx.lineWidth = depth === 0 ? 1.6 : 0.9;
          ctx.strokeStyle = child.stroke;
          ctx.stroke();
        }

        // Draw glowing gold junction node at main branch splits
        if (depth === 0 && Math.random() < 0.3) {
          ctx.fillStyle = '#FFF8DC';
          ctx.beginPath();
          ctx.arc(child.x + swayX, child.y + swayY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        renderVeinTree(child, depth + 1, timeShift, normMouseX, normMouseY);
      });
    };

    // Motion steps below are tuned per 60 Hz frame; `step` scales them to the time since the last
    // drawn frame so faster screens don't run the scene faster (or draw it more than ~60 times a second).
    const FRAME_MS = 1000 / 60;
    let lastFrameAt = performance.now() - FRAME_MS;
    const html = document.documentElement; // useModalDialog flags data-modal-open here

    // --- MAIN ANIMATION RENDER LOOP ---
    const render = (frameTime?: number) => {
      const now = frameTime ?? performance.now();
      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
        // Hold the last frame while the page is scrolling so the main thread is free for the scroll
        // (the eased scroll parallax catches up once scrolling stops), and while nothing can see the
        // canvas: /enterprises is opaque, and modal dialogs cover it with a near-black backdrop.
        const hidden = currentTabRef.current === 'enterprises' || !!html.dataset.modalOpen;
        // Ripples started by pointer moves while hidden would otherwise all play at once on resume.
        if (hidden) pulseRings.length = 0;
        if (hidden || now - lastScrollAt < 150) {
          lastFrameAt = now;
          return;
        }
        if (now - lastFrameAt < 12) return;
      }
      const step = reducedMotion ? 1 : Math.min(3, (now - lastFrameAt) / FRAME_MS);
      lastFrameAt = now;

      time += 0.008 * step;

      if (!width || !height || width <= 0 || height <= 0) return;

      currentScrollY += (targetScrollY - currentScrollY) * (1 - (1 - 0.05) ** step);
      mouseX += (targetMouseX - mouseX) * (1 - (1 - 0.04) ** step);
      mouseY += (targetMouseY - mouseY) * (1 - (1 - 0.04) ** step);

      const normMouseX = (mouseX / width - 0.5) * 30;
      const normMouseY = (mouseY / height - 0.5) * 20;
      const scrollOffset = currentScrollY * 0.12;

      ctx.clearRect(0, 0, width, height);

      // 1. DEEP RICH LUXURY MATTE CANVAS
      ctx.fillStyle = '#060503';
      ctx.fillRect(0, 0, width, height);

      // 2. VOLUMETRIC GOLD SUNBEAMS / AURORA BEAMS
      ctx.save();
      const beamX = width * 0.65 + Math.sin(time * 0.25) * (width * 0.12) + normMouseX;
      const beamY = -height * 0.2 - scrollOffset;

      const beamGrad = safeCreateLinearGradient(ctx, beamX, beamY, beamX - width * 0.35, height * 1.2);
      if (beamGrad) {
        beamGrad.addColorStop(0, 'rgba(255, 230, 150, 0.07)');
        beamGrad.addColorStop(0.4, 'rgba(212, 175, 55, 0.035)');
        beamGrad.addColorStop(0.8, 'rgba(138, 109, 28, 0.015)');
        beamGrad.addColorStop(1, 'rgba(6, 5, 3, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamX - 100, beamY);
        ctx.lineTo(beamX + 180, beamY);
        ctx.lineTo(beamX - width * 0.2 + 280, height * 1.2);
        ctx.lineTo(beamX - width * 0.2 - 280, height * 1.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. AMBIENT VOLUMETRIC GOLDEN GLOW CENTERS
      ctx.save();
      const auraGlow = safeCreateRadialGradient(
        ctx,
        width * 0.55 + normMouseX,
        height * 0.42 - scrollOffset + normMouseY,
        10,
        width * 0.5,
        height * 0.42 - scrollOffset,
        Math.max(width, height) * 0.75
      );

      if (auraGlow) {
        auraGlow.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
        auraGlow.addColorStop(0.38, 'rgba(35, 25, 8, 0.26)');
        auraGlow.addColorStop(1, '#060503');
        ctx.fillStyle = auraGlow;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // 4. ROTATING LUXURY SACRED GEOMETRIC CREST / ASTROLABE WATERMARK
      ctx.save();
      const crestCenterX = width * 0.78 + normMouseX * 0.3;
      const crestCenterY = height * 0.32 - scrollOffset * 0.4 + normMouseY * 0.3;
      const crestRadius = Math.min(width, height) * 0.24;

      ctx.translate(crestCenterX, crestCenterY);

      // Outer rotating degree ring
      ctx.save();
      ctx.rotate(time * 0.04);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.045)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(0, 0, crestRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Tick marks on outer ring
      const numTicks = 36;
      for (let t = 0; t < numTicks; t++) {
        const tickAngle = (t / numTicks) * Math.PI * 2;
        const innerR = crestRadius - (t % 3 === 0 ? 10 : 5);
        ctx.beginPath();
        ctx.moveTo(Math.cos(tickAngle) * innerR, Math.sin(tickAngle) * innerR);
        ctx.lineTo(Math.cos(tickAngle) * crestRadius, Math.sin(tickAngle) * crestRadius);
        ctx.stroke();
      }
      ctx.restore();

      // Inner counter-rotating 8-pointed luxury star
      ctx.save();
      ctx.rotate(-time * 0.06);
      ctx.strokeStyle = 'rgba(255, 235, 160, 0.055)';
      ctx.lineWidth = 0.9;

      const starR1 = crestRadius * 0.7;
      const starR2 = crestRadius * 0.3;
      const points = 8;

      ctx.beginPath();
      for (let p = 0; p < points * 2; p++) {
        const pAngle = (p / (points * 2)) * Math.PI * 2;
        const r = p % 2 === 0 ? starR1 : starR2;
        const px = Math.cos(pAngle) * r;
        const py = Math.sin(pAngle) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner concentric accent circle
      ctx.beginPath();
      ctx.arc(0, 0, crestRadius * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // 5. ORGANIC KINTSUGI GOLD MARBLE VEINS (Natural fluid gold resin flow)
      ctx.save();
      kintsugiVeins.forEach((root, idx) => {
        renderVeinTree(root, 0, idx * 1.5, normMouseX, normMouseY);
      });
      ctx.restore();

      // 6. FLOATING ORGANIC GOLD LEAF / FOIL FLAKES (3D Tumbling & Shimmering)
      ctx.save();
      goldLeaves.forEach((leaf) => {
        leaf.y += leaf.vy * step;
        leaf.x += (leaf.vx + Math.sin(time * 1.5 + leaf.y * 0.01) * 0.3) * step;
        leaf.rotX += leaf.vRotX * step;
        leaf.rotY += leaf.vRotY * step;
        leaf.rotZ += leaf.vRotZ * step;

        if (leaf.y < -40) {
          leaf.y = height + 40;
          leaf.x = Math.random() * width;
        }
        if (leaf.x < -40) leaf.x = width + 40;
        if (leaf.x > width + 40) leaf.x = -40;

        ctx.save();
        ctx.translate(
          leaf.x + normMouseX * leaf.z,
          leaf.y - scrollOffset * leaf.z + normMouseY * leaf.z
        );

        // 3D Perspective tumble transform
        const cosY = Math.cos(leaf.rotY);
        const cosX = Math.cos(leaf.rotX);
        const currentScale = leaf.z;

        ctx.rotate(leaf.rotZ);
        ctx.scale(cosY * currentScale, cosX * currentScale);

        // Calculate specular gold reflection based on tilt angle
        const specularFactor = Math.abs(cosY * cosX);
        const glOpacity = Math.max(0.15, leaf.opacity * (0.4 + specularFactor * 0.6));

        ctx.beginPath();
        leaf.shapePoints.forEach((pt, pIdx) => {
          if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        // Metallic Gold Foil Gradient (its stop alphas scaled by the shimmer opacity)
        ctx.globalAlpha = glOpacity;
        if (leaf.fill) {
          ctx.fillStyle = leaf.fill;
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(255, 248, 200, 0.8)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      });
      ctx.restore();

      // 7. 3D GEOMETRIC GOLD POLYHEDRON CRYSTALS
      ctx.save();
      crystals.forEach((crys) => {
        crys.x += crys.vx * step;
        crys.y += crys.vy * step;
        crys.rotX += crys.vRotX * step;
        crys.rotY += crys.vRotY * step;
        crys.rotZ += crys.vRotZ * step;

        if (crys.x < -60) crys.x = width + 60;
        if (crys.x > width + 60) crys.x = -60;
        if (crys.y < -60) crys.y = height + 60;
        if (crys.y > height + 60) crys.y = -60;

        ctx.save();
        ctx.translate(
          crys.x + normMouseX * crys.z,
          crys.y - scrollOffset * crys.z + normMouseY * crys.z
        );

        const cosY = Math.cos(crys.rotY);
        const cosX = Math.cos(crys.rotX);
        const currentSize = crys.size * crys.z;

        ctx.rotate(crys.rotZ);

        ctx.beginPath();
        for (let s = 0; s < crys.sides; s++) {
          const angle = (s / crys.sides) * Math.PI * 2;
          let px = Math.cos(angle) * currentSize * cosY;
          let py = Math.sin(angle) * currentSize * cosX;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (crys.fill) {
          ctx.fillStyle = crys.fill;
          ctx.fill();
        }

        ctx.strokeStyle = crys.stroke;
        ctx.lineWidth = 0.9 * crys.z;
        ctx.stroke();

        ctx.restore();
      });
      ctx.restore();

      // 8. INTERACTIVE MOUSE PULSE RIPPLE RINGS
      ctx.save();
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        ring.radius += ring.speed * step;
        ring.opacity -= 0.006 * ring.speed * step;

        if (ring.opacity <= 0 || ring.radius >= ring.maxRadius) {
          pulseRings.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 224, 130, ${ring.opacity.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 9. FLOATING AMBIENT BOKEH & SPARK EMBERS
      ctx.save();
      ambientParticles.forEach((pt) => {
        pt.y += pt.vy * step;
        pt.x += (pt.vx + Math.sin(time + pt.y * 0.01) * 0.2) * step;

        if (pt.y < -30) {
          pt.y = height + 30;
          pt.x = Math.random() * width;
        }
        if (pt.x < -30) pt.x = width + 30;
        if (pt.x > width + 30) pt.x = -30;

        pt.opacity += pt.pulseSpeed * step;
        if (pt.opacity > pt.baseOpacity || pt.opacity < 0.08) {
          pt.pulseSpeed = -pt.pulseSpeed;
        }

        ctx.globalAlpha = Math.max(0.05, Math.min(1, pt.opacity));

        if (pt.glow) {
          // Bokeh and spark glows are built around the origin: move the origin to the particle.
          ctx.translate(pt.x, pt.y);
          ctx.fillStyle = pt.glow;
          ctx.beginPath();
          ctx.arc(0, 0, pt.type === 'bokeh' ? pt.size : pt.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.translate(-pt.x, -pt.y);
        } else if (pt.type === 'speck') {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060503]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {/* Executive Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: 'inset 0 0 160px rgba(0,0,0,0.85)'
        }}
      />
    </div>
  );
};

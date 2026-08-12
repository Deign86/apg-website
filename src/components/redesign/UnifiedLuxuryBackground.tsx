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
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const GOLD_COLORS = ['#FFFFFF', '#FFF8DC', '#FFE082', '#FFDF73', '#D4AF37', '#E2B857', '#C59B27', '#8A6D1C'];

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
        shapePoints
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
    }

    const crystalCount = 12;
    const crystals: GeometricCrystal[] = [];
    for (let i = 0; i < crystalCount; i++) {
      const sidesOptions = [4, 6, 8];
      crystals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.006,
        vRotY: (Math.random() - 0.5) * 0.006,
        vRotZ: (Math.random() - 0.5) * 0.004,
        size: Math.random() * 28 + 16,
        sides: sidesOptions[Math.floor(Math.random() * sidesOptions.length)],
        opacity: Math.random() * 0.3 + 0.15
      });
    }

    // 3. ORGANIC KINTSUGI GOLD MARBLE VEINS (Branching natural root paths)
    interface MarbleVeinPoint {
      x: number;
      y: number;
      branches?: MarbleVeinPoint[];
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

      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.1,
        size,
        opacity,
        baseOpacity: opacity,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        type
      });
    }

    // Scroll & Mouse Tracking
    let targetScrollY = 0;
    let currentScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
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

        const veinGrad = safeCreateLinearGradient(ctx, node.x, node.y, child.x, child.y);
        if (veinGrad) {
          if (depth === 0) {
            veinGrad.addColorStop(0, 'rgba(255, 235, 160, 0.35)');
            veinGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)');
            veinGrad.addColorStop(1, 'rgba(184, 134, 11, 0.25)');
            ctx.lineWidth = 1.6;
            ctx.shadowColor = '#FFE082';
            ctx.shadowBlur = 8;
          } else {
            veinGrad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
            veinGrad.addColorStop(1, 'rgba(138, 109, 28, 0.1)');
            ctx.lineWidth = 0.9;
            ctx.shadowBlur = 3;
          }
          ctx.strokeStyle = veinGrad;
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

    // --- MAIN ANIMATION RENDER LOOP ---
    const render = () => {
      time += 0.008;

      if (!width || !height || width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      currentScrollY += (targetScrollY - currentScrollY) * 0.05;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

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
        leaf.y += leaf.vy;
        leaf.x += leaf.vx + Math.sin(time * 1.5 + leaf.y * 0.01) * 0.3;
        leaf.rotX += leaf.vRotX;
        leaf.rotY += leaf.vRotY;
        leaf.rotZ += leaf.vRotZ;

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

        // Metallic Gold Foil Gradient
        const leafGrad = safeCreateLinearGradient(ctx, -leaf.size, -leaf.size, leaf.size, leaf.size);
        if (leafGrad) {
          leafGrad.addColorStop(0, `rgba(255, 250, 220, ${(glOpacity * 0.95).toFixed(3)})`);
          leafGrad.addColorStop(0.4, `rgba(255, 223, 115, ${(glOpacity * 0.85).toFixed(3)})`);
          leafGrad.addColorStop(0.8, `rgba(212, 175, 55, ${(glOpacity * 0.7).toFixed(3)})`);
          leafGrad.addColorStop(1, `rgba(138, 109, 28, ${(glOpacity * 0.3).toFixed(3)})`);

          ctx.fillStyle = leafGrad;
          ctx.shadowColor = '#FFE082';
          ctx.shadowBlur = specularFactor > 0.7 ? 10 : 3;
          ctx.fill();
        }

        ctx.strokeStyle = `rgba(255, 248, 200, ${(glOpacity * 0.8).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      });
      ctx.restore();

      // 7. 3D GEOMETRIC GOLD POLYHEDRON CRYSTALS
      ctx.save();
      crystals.forEach((crys) => {
        crys.x += crys.vx;
        crys.y += crys.vy;
        crys.rotX += crys.vRotX;
        crys.rotY += crys.vRotY;
        crys.rotZ += crys.vRotZ;

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

        const crysGrad = safeCreateRadialGradient(ctx, 0, 0, 0, 0, 0, currentSize * 1.2);
        if (crysGrad) {
          crysGrad.addColorStop(0, `rgba(255, 235, 150, ${(crys.opacity * 0.22).toFixed(3)})`);
          crysGrad.addColorStop(0.6, `rgba(212, 175, 55, ${(crys.opacity * 0.1).toFixed(3)})`);
          crysGrad.addColorStop(1, 'rgba(6, 5, 3, 0)');
          ctx.fillStyle = crysGrad;
          ctx.fill();
        }

        ctx.strokeStyle = `rgba(255, 235, 160, ${(crys.opacity * 0.55).toFixed(3)})`;
        ctx.lineWidth = 0.9 * crys.z;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6 * crys.z;
        ctx.stroke();

        ctx.restore();
      });
      ctx.restore();

      // 8. INTERACTIVE MOUSE PULSE RIPPLE RINGS
      ctx.save();
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        ring.radius += ring.speed;
        ring.opacity -= 0.006 * ring.speed;

        if (ring.opacity <= 0 || ring.radius >= ring.maxRadius) {
          pulseRings.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 224, 130, ${ring.opacity.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#FFE082';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 9. FLOATING AMBIENT BOKEH & SPARK EMBERS
      ctx.save();
      ambientParticles.forEach((pt) => {
        pt.y += pt.vy;
        pt.x += pt.vx + Math.sin(time + pt.y * 0.01) * 0.2;

        if (pt.y < -30) {
          pt.y = height + 30;
          pt.x = Math.random() * width;
        }
        if (pt.x < -30) pt.x = width + 30;
        if (pt.x > width + 30) pt.x = -30;

        pt.opacity += pt.pulseSpeed;
        if (pt.opacity > pt.baseOpacity || pt.opacity < 0.08) {
          pt.pulseSpeed = -pt.pulseSpeed;
        }

        ctx.globalAlpha = Math.max(0.05, Math.min(1, pt.opacity));

        if (pt.type === 'bokeh') {
          const bGlow = safeCreateRadialGradient(ctx, pt.x, pt.y, 0, pt.x, pt.y, pt.size);
          if (bGlow) {
            bGlow.addColorStop(0, 'rgba(255, 224, 130, 0.18)');
            bGlow.addColorStop(0.6, 'rgba(212, 175, 55, 0.06)');
            bGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bGlow;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (pt.type === 'spark') {
          const sGlow = safeCreateRadialGradient(ctx, pt.x, pt.y, 0, pt.x, pt.y, pt.size * 2);
          if (sGlow) {
            sGlow.addColorStop(0, pt.color);
            sGlow.addColorStop(0.5, 'rgba(255, 223, 115, 0.5)');
            sGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = sGlow;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
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

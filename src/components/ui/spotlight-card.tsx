import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
  gold: { base: 45, spread: 180 },
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'gold',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      // Local cursor coordinates relative to THIS card's top-left corner
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', x.toFixed(2));
      card.style.setProperty('--y', y.toFixed(2));

      // Proximity check: active when pointer is inside or within 80px of card boundary
      const proximity = 80;
      const isNear = 
        e.clientX >= rect.left - proximity &&
        e.clientX <= rect.right + proximity &&
        e.clientY >= rect.top - proximity &&
        e.clientY <= rect.bottom + proximity;

      card.style.setProperty('--active', isNear ? '1' : '0');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.gold;

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties & Record<string, any> => {
    const baseStyles: React.CSSProperties & Record<string, any> = {
      '--base': base,
      '--spread': spread,
      '--radius': '16',
      '--border': '2',
      '--backdrop': 'rgba(10, 8, 3, 0.85)',
      '--size': '320',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 320) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0.5) * var(--spread, 0)))',
      backgroundColor: 'var(--backdrop)',
      position: 'relative',
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow] {
      border: 1px solid rgba(196, 154, 42, 0.18);
      transition: border-color 0.4s ease, box-shadow 0.4s ease;
    }

    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: -2px;
      border: 2px solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      opacity: var(--active, 0);
      transition: opacity 0.35s ease;
      
      /* Pure Border Masking: Exclude interior so light renders strictly on border edges & corners */
      mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
      -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
    }
    
    /* Metallic Gold Border Spotlight Beam on Sides/Edges centered at local cursor (x, y) */
    [data-glow]::before {
      background-image: radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 50%) * 1px)
        calc(var(--y, 50%) * 1px),
        hsl(45, 90%, 55%) 0%,
        rgba(196, 154, 42, 0.4) 40%,
        transparent 100%
      );
      filter: brightness(1.8);
    }
    
    /* White/Gold Core Specular Beam Highlight */
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45) at
        calc(var(--x, 50%) * 1px)
        calc(var(--y, 50%) * 1px),
        rgba(255, 245, 215, 0.95) 0%,
        transparent 100%
      );
    }

    /* Subtle edge glow when active */
    [data-glow][style*="--active: 1"] {
      border-color: rgba(196, 154, 42, 0.45) !important;
      box-shadow: 0 8px 32px rgba(196, 154, 42, 0.12);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-2xl 
          relative 
          flex
          flex-col
          p-6 
          gap-4 
          backdrop-blur-[12px]
          transition-all
          duration-300
          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
};

export { GlowCard };

import React, { useEffect, useRef, useState, ReactNode } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const updatePointer = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      // Calculate cursor position RELATIVE to the card's top-left corner
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--x', `${x.toFixed(2)}`);
      card.style.setProperty('--y', `${y.toFixed(2)}`);
      card.style.setProperty('--xp', `${(x / rect.width).toFixed(2)}`);
      card.style.setProperty('--yp', `${(y / rect.height).toFixed(2)}`);
    };

    const handlePointerEnter = () => {
      setIsHovered(true);
      card.style.setProperty('--active', '1');
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
      card.style.setProperty('--active', '0');
    };

    card.addEventListener('pointermove', updatePointer);
    card.addEventListener('pointerenter', handlePointerEnter);
    card.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      card.removeEventListener('pointermove', updatePointer);
      card.removeEventListener('pointerenter', handlePointerEnter);
      card.removeEventListener('pointerleave', handlePointerLeave);
    };
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
      '--border': '1.5',
      '--backdrop': 'rgba(8, 6, 2, 0.75)',
      '--size': '300',
      '--border-size': 'calc(var(--border, 1.5) * 1px)',
      '--spotlight-size': 'calc(var(--size, 300) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0.5) * var(--spread, 0)))',
      
      // Card inner spotlight fill centered at relative local (x, y)
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 50%) * 1px)
        calc(var(--y, 50%) * 1px),
        hsla(var(--hue, 45), 100%, 65%, calc(0.18 * var(--active, 0))),
        transparent 80%
      )`,
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
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: -1.5px;
      border: 1.5px solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-repeat: no-repeat;
      background-position: 0 0;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
      -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      -webkit-mask-clip: padding-box, border-box;
      -webkit-mask-composite: source-in;
      transition: opacity 0.3s ease;
      opacity: var(--active, 0);
    }
    
    /* Vibrant metallic gold border spotlight centered directly at local cursor (x, y) */
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.9) calc(var(--spotlight-size) * 0.9) at
        calc(var(--x, 50%) * 1px)
        calc(var(--y, 50%) * 1px),
        hsl(var(--hue, 45) 100% 60% / 0.95),
        transparent 100%
      );
      filter: brightness(1.6);
    }
    
    /* White specular core highlight at cursor center */
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45) at
        calc(var(--x, 50%) * 1px)
        calc(var(--y, 50%) * 1px),
        hsl(45 100% 88% / 0.95),
        transparent 100%
      );
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
          shadow-[0_1rem_2rem_-1rem_black] 
          p-6 
          gap-4 
          backdrop-blur-[12px]
          transition-all
          duration-300
          ${isHovered ? 'shadow-[0_8px_32px_rgba(196,154,42,0.2)]' : ''}
          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
};

export { GlowCard };

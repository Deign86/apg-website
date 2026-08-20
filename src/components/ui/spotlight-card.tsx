import React, { useState, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  size = 'md',
  width,
  height,
  customSize = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      border: isHovered ? '1px solid rgba(196, 154, 42, 0.55)' : '1px solid rgba(196, 154, 42, 0.2)',
      boxShadow: isHovered ? '0 12px 40px rgba(196, 154, 42, 0.12)' : 'none',
      transition: 'border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease',
    };
    if (width !== undefined) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }
    return styles;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-[3/4]' : ''}
        rounded-2xl 
        relative 
        overflow-hidden
        flex
        flex-col
        p-6 
        gap-4 
        bg-[#080602]/70
        backdrop-blur-[12px]
        ${className}
      `}
    >
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export { GlowCard };

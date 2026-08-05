import React from 'react';

interface AlphaPremierLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function AlphaPremierLogo({ className = "h-16", iconOnly = false }: AlphaPremierLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} id="alpha-premier-logo">
      <img 
        src="/images/realty-banner-logo.png" 
        alt="Alpha Premier Realty" 
        className="w-full h-full object-contain filter drop-shadow-[0_4px_25px_rgba(197,168,92,0.3)]" 
      />
    </div>
  );
}

import React, { useState } from 'react';

/* Design tokens — high-contrast palette calibrated for legibility */
export const TEAL = '#082636';       /* Dark Slate Teal - primary text & dark bg */
export const TEAL2 = '#0d4e66';      /* Deep Ocean Teal */
export const ACCENT = '#14927b';     /* Vibrant Mint Teal - accessible on light bg */
export const MINT_LIGHT = '#4de8b8'; /* Neon Mint - high contrast on dark bg */
export const MUTED = '#3b626e';      /* High-contrast readable body text */

/* Base path for image assets */
export const ASSET_BASE = '/assets/alta-venture';

export const heroBg = `${ASSET_BASE}/image_5.png`;
export const heroVideo = `${ASSET_BASE}/gifBG.mp4`;
export const altaLogo = `${ASSET_BASE}/3._Alta_Venture_-_Logo.png`;
export const logo88Prime = `${ASSET_BASE}/1._88_Prime.png`;
export const logoDynTree = `${ASSET_BASE}/2._Dynamic_Tree.png`;
export const logoConstruct = `${ASSET_BASE}/construction.png`;
export const logoLuxe = `${ASSET_BASE}/7._LOGO_LUXE_PRIME-png.png`;
export const logoAlpha = `${ASSET_BASE}/6._Alpha_Realty.jpg`;
export const logoSwiftClear = `${ASSET_BASE}/swiftclear-logo.png`;
export const logoAlphaGroup = `${ASSET_BASE}/alphalogo11.png`;

/* ImageWithFallback — plain JS */
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4K';

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  if (didError) {
    return (
      <div className={`av-img-error ${className ?? ''}`} style={style}>
        <div className="av-img-error-inner">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />;
}

/* Shared primitives — enhanced contrast and glassmorphism styling */
export function Glass({ children, className = '', style = {}, hoverEffect = false, ...rest }) {
  return (
    <div
      className={`transition-all duration-300 ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-2xl' : ''} ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(13, 78, 102, 0.12)',
        boxShadow: '0 10px 32px rgba(8, 38, 54, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Pill({ children, light = false }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 transition-all duration-200"
      style={{
        background: light ? 'rgba(255, 255, 255, 0.15)' : 'rgba(8, 38, 54, 0.06)',
        border: `1px solid ${light ? 'rgba(255, 255, 255, 0.30)' : 'rgba(8, 38, 54, 0.15)'}`,
        color: light ? '#ffffff' : TEAL,
      }}
    >
      <span className="av-pill-dot" style={{ background: light ? MINT_LIGHT : ACCENT }} />
      <span className="av-pill-label">{children}</span>
    </div>
  );
}


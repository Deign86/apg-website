import React, { useState } from 'react';

/* Design tokens — kept identical to the Figma export so visuals match. */
export const TEAL = '#0d3d52';
export const TEAL2 = '#1a5870';
export const ACCENT = '#19a48a';
export const MUTED = '#4a7a86';

/* Base path for image assets (copied to public/assets/alta-venture/ during integration). */
export const ASSET_BASE = '/assets/alta-venture';

export const heroBg = `${ASSET_BASE}/image_5.png`;
export const altaLogo = `${ASSET_BASE}/3._Alta_Venture_-_Logo.png`;
export const logo88Prime = `${ASSET_BASE}/1._88_Prime.png`;
export const logoDynTree = `${ASSET_BASE}/2._Dynamic_Tree.png`;
export const logoConstruct = `${ASSET_BASE}/construction.png`;
export const logoLuxe = `${ASSET_BASE}/7._LOGO_LUXE_PRIME-png.png`;
export const logoAlpha = `${ASSET_BASE}/6._Alpha_Realty.jpg`;
export const logoSwiftClear = `${ASSET_BASE}/swiftclear-logo.png`;
export const logoAlphaGroup = `${ASSET_BASE}/alphalogo11.png`;

/* ImageWithFallback — inlined from the Figma helper, plain JS. */
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

/* Shared primitives — identical visuals to the Figma export. */
export function Glass({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow: '0 4px 28px rgba(13,61,82,0.07), inset 0 1px 0 rgba(255,255,255,0.90)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({ children, light = false }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
      style={{
        background: light ? 'rgba(255,255,255,0.14)' : 'rgba(13,61,82,0.06)',
        border: `1px solid ${light ? 'rgba(255,255,255,0.28)' : 'rgba(13,61,82,0.14)'}`,
        color: light ? 'rgba(255,255,255,0.88)' : TEAL,
      }}
    >
      <span className="av-pill-dot" style={{ background: ACCENT }} />
      <span className="av-pill-label">{children}</span>
    </div>
  );
}

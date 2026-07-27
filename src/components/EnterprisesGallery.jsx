import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LOGO_MAP = {
  'realty': '/assets/images/sstcompany-realty.png',
  'swift-clear': '/assets/images/sstcompany-swiftclear1.png',
  'dynamic-tree': '/assets/images/main-dynamic-tree/Dynamic_Tree_Logo.png',
  'luxe-prime': '/assets/images/sstcompany-luxeprime.png',
  'alta-venture': '/assets/images/3. Alta Venture - Logo.png',
  'construction': '/assets/images/construction.png',
  '88-prime': '/assets/images/main-88prime/sstcompany-88prime11.png',
};

// Component that dynamically processes PNGs to convert any dark/black background box into true transparent pixels
export const DynamicTransparentLogo = ({ src, alt, className, disableCleaning }) => {
  const [cleanedSrc, setCleanedSrc] = useState(src);

  const shouldSkip =
    disableCleaning ||
    alt.toLowerCase().includes('dynamic') ||
    src.toLowerCase().includes('dynamic');

  useEffect(() => {
    if (shouldSkip) {
      setCleanedSrc(src);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to detect background box color
        const corners = [
          0,
          (canvas.width - 1) * 4,
          (canvas.height - 1) * canvas.width * 4,
          ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4
        ];

        let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
        corners.forEach(idx => {
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          sumA += data[idx + 3];
        });
        const cornerAlpha = sumA / 4;
        const bgR = sumR / 4;
        const bgG = sumG / 4;
        const bgB = sumB / 4;
        const bgMax = Math.max(bgR, bgG, bgB);

        // Only process background keying if corners are opaque AND dark (like Luxe Prime's black box background)
        const isCornerDarkBox = cornerAlpha > 200 && bgMax < 60;

        if (!isCornerDarkBox) {
          if (isMounted) setCleanedSrc(src);
          return;
        }

        const threshold = 65;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxBrightness = Math.max(r, g, b);

          let alphaFactor = 1;
          let processAlpha = false;

          if (maxBrightness < threshold) {
            alphaFactor = maxBrightness / threshold;
            processAlpha = true;
          } else {
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            if (dist < 50) {
              alphaFactor = dist / 50;
              processAlpha = true;
            }
          }

          if (processAlpha) {
            data[i + 3] = Math.floor(data[i + 3] * alphaFactor * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultUrl = canvas.toDataURL('image/png');
        if (isMounted) {
          setCleanedSrc(resultUrl);
        }
      } catch (err) {
        if (isMounted) setCleanedSrc(src);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src, shouldSkip]);

  return <img src={cleanedSrc} alt={alt} className={className} />;
};

// Card dark background themes matching the enterprise identities
const CARD_THEMES = {
  realty: {
    bg: 'bg-gradient-to-b from-[#242B3E] via-[#171D2B] to-[#0F131D]',
    border: 'border-[#E2B857]/50 hover:border-[#E2B857]',
    accent: 'text-[#E2B857]',
  },
  'swift-clear': {
    bg: 'bg-gradient-to-b from-[#1E3366] via-[#132349] to-[#0E1A36]',
    border: 'border-blue-400/50 hover:border-blue-400',
    accent: 'text-blue-400',
  },
  'dynamic-tree': {
    bg: 'bg-gradient-to-b from-[#342746] via-[#221A30] to-[#161020]',
    border: 'border-rose-400/50 hover:border-rose-400',
    accent: 'text-rose-400',
  },
  'luxe-prime': {
    bg: 'bg-gradient-to-b from-[#332A1E] via-[#221B13] to-[#15100B]',
    border: 'border-[#D4AF37]/50 hover:border-[#D4AF37]',
    accent: 'text-[#D4AF37]',
  },
  'alta-venture': {
    bg: 'bg-gradient-to-b from-[#223B4C] via-[#152835] to-[#0E1A23]',
    border: 'border-teal-400/50 hover:border-teal-400',
    accent: 'text-teal-400',
  },
  construction: {
    bg: 'bg-gradient-to-b from-[#382E1E] via-[#241D12] to-[#16120B]',
    border: 'border-amber-400/50 hover:border-amber-400',
    accent: 'text-amber-400',
  },
  '88-prime': {
    bg: 'bg-gradient-to-b from-[#223E50] via-[#152B38] to-[#0E1C25]',
    border: 'border-cyan-400/50 hover:border-cyan-400',
    accent: 'text-cyan-400',
  },
};

export const EnterprisesGallery = ({ enterprises }) => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-8 lg:px-16 bg-[#030406] overflow-hidden border-y border-[#181C26]">
      
      {/* Deep Space Background Particle / Star Web Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(226,184,87,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.06),transparent_60%)] pointer-events-none" />
      
      {/* Dotted Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Futuristic Section Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            OUR ENTERPRISES
          </h2>
          <div className="w-16 h-0.5 bg-white mx-auto shadow-[0_0_12px_#ffffff] rounded-full" />
        </div>

        {/* Horizontal Expandable Accordion Container - Squeezable Center Gallery */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full h-32 sm:h-36 md:h-40 lg:h-44 my-2">
          {enterprises.map((item) => {
            const isHovered = hoveredId === item.id;
            const logoSrc = LOGO_MAP[item.id];
            const theme = CARD_THEMES[item.id] || CARD_THEMES.realty;

            return (
              <Link
                to={item.href}
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  relative h-full transition-all duration-500 ease-in-out cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border shrink-0 sm:shrink
                  ${theme.bg} ${theme.border}
                  ${isHovered 
                    ? 'flex-[3.5] min-w-[180px] sm:min-w-[240px] md:min-w-[300px] lg:min-w-[360px] shadow-[0_0_25px_rgba(0,0,0,0.85)] border-opacity-100 ring-1 ring-white/20' 
                    : 'aspect-square h-full flex-none sm:flex-1 max-w-[110px] sm:max-w-[140px] opacity-85 hover:opacity-100'
                  }
                `}
              >
                {/* Glossy Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 pointer-events-none" />

                {/* CARD CONTENT - IMAGE ONLY */}
                <div className="relative z-10 h-full w-full p-3 sm:p-4 flex items-center justify-center">
                  {logoSrc ? (
                    <DynamicTransparentLogo 
                      src={logoSrc} 
                      alt={item.name}
                      className={`object-contain transition-all duration-500 ${
                        isHovered 
                          ? 'h-14 sm:h-18 md:h-22 max-w-[85%] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] scale-105' 
                          : 'h-10 sm:h-12 md:h-14 max-w-[85%] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'
                      }`}
                    />
                  ) : (
                    <div className={`font-black text-xs sm:text-sm uppercase text-center ${theme.accent}`}>
                      {item.name}
                    </div>
                  )}
                </div>

              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

import React from 'react';

interface GoldWavesBackgroundProps {
  activeTab?: string; // 'home' | 'services' | 'blogs' | 'careers'
}

export default function GoldWavesBackground({ activeTab = 'home' }: GoldWavesBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-transparent" id="gold-waves-bg">
      {/* Custom keyframe animations for organic wave motion and glowing metallic shimmer */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes metallic-gold-shimmer {
          0%, 100% { opacity: 0.65; filter: drop-shadow(0 0 10px rgba(197, 168, 92, 0.3)); }
          50% { opacity: 0.88; filter: drop-shadow(0 0 22px rgba(226, 203, 143, 0.55)); }
        }
        @keyframes gentle-float-a {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-10px) translateX(6px) rotate(0.3deg); }
        }
        @keyframes gentle-float-b {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(12px) translateX(-8px) rotate(-0.4deg); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        .anim-gold-shimmer { animation: metallic-gold-shimmer 9s ease-in-out infinite; }
        .anim-float-a { animation: gentle-float-a 20s ease-in-out infinite; }
        .anim-float-b { animation: gentle-float-b 24s ease-in-out infinite; }
        .anim-sparkle-1 { animation: sparkle-pulse 4s ease-in-out infinite; }
        .anim-sparkle-2 { animation: sparkle-pulse 6s ease-in-out infinite 2s; }
      `}} />

      {/* SVG GLOBAL DEFINITIONS - ALPHA PREMIER REALTY BRAND CHAMPAGNE GOLD GRADIENTS */}
      <svg className="absolute w-0 h-0 overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Main Ribbon Gradient 1 - Guaranteed 0% and 100% opacity fade stops to prevent cutoffs */}
          <linearGradient id="ap-gold-thick-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5e4c1f" stopOpacity="0" />
            <stop offset="15%" stopColor="#8c6e2a" stopOpacity="0.25" />
            <stop offset="45%" stopColor="#c5a85c" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#e2cb8f" stopOpacity="0.50" />
            <stop offset="88%" stopColor="#8c6e2a" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#5e4c1f" stopOpacity="0" />
          </linearGradient>

          {/* Main Ribbon Gradient 2 */}
          <linearGradient id="ap-gold-thick-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5e4c1f" stopOpacity="0" />
            <stop offset="20%" stopColor="#8c6e2a" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#c5a85c" stopOpacity="0.40" />
            <stop offset="80%" stopColor="#e2cb8f" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#8c6e2a" stopOpacity="0" />
          </linearGradient>

          {/* Hairline Strand Gradient 1 */}
          <linearGradient id="ap-gold-thin-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a85c" stopOpacity="0" />
            <stop offset="25%" stopColor="#e2cb8f" stopOpacity="0.50" />
            <stop offset="65%" stopColor="#c5a85c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8c6e2a" stopOpacity="0" />
          </linearGradient>

          {/* Hairline Strand Gradient 2 */}
          <linearGradient id="ap-gold-thin-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8c6e2a" stopOpacity="0" />
            <stop offset="30%" stopColor="#d2ba78" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#e2cb8f" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#c5a85c" stopOpacity="0" />
          </linearGradient>

          {/* Glow Filter for Metallic Waves */}
          <filter id="ap-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>


      {/* =========================================================================
          PAGE 1: HOME PAGE WAVES
         ========================================================================= */}
      {activeTab === 'home' && (
        <>
          {/* Wave 1: About Us Section (~800px) */}
          <div className="absolute top-[800px] left-0 w-full h-[750px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 750" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -300 700 C 100 500, 400 320, 480 -250" stroke="url(#ap-gold-thin-1)" strokeWidth="1.5" />
              <path d="M -300 730 C 130 530, 430 350, 510 -250" stroke="url(#ap-gold-thin-2)" strokeWidth="2.5" />
              <path d="M -300 770 C 180 570, 490 390, 570 -250" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -300 810 C 220 610, 530 430, 610 -250" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>

          {/* Wave 2: Exclusive Spaces (~1800px) */}
          <div className="absolute top-[1800px] right-0 w-[550px] h-[950px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 550 950" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 750 -100 C 380 180, 160 480, 400 780 C 500 900, 600 1000, 750 1150" stroke="url(#ap-gold-thin-2)" strokeWidth="1.5" />
              <path d="M 750 -40 C 310 230, 90 530, 330 830 C 430 950, 530 1050, 750 1200" stroke="url(#ap-gold-thick-2)" strokeWidth="24" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 750 20 C 250 280, 40 580, 280 880 C 380 1000, 480 1100, 750 1250" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>

          {/* Wave 3: Featured Listings (~2800px) */}
          <div className="absolute top-[2800px] left-0 w-full h-[650px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 650" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -300 520 Q 250 220, 750 450 T 1500 280 Q 1700 230, 1900 330" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M -300 570 Q 250 270, 750 500 T 1500 330 Q 1700 280, 1900 380" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -300 615 Q 250 315, 750 545 T 1500 375 Q 1700 325, 1900 425" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>

          {/* Wave 4: Why Choose Us (~3950px) */}
          <div className="absolute top-[3950px] left-0 w-[650px] h-[850px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 650 850" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -250 50 C 300 180, 550 480, 180 780 C 60 860, -70 890, -250 920" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M -250 110 C 360 240, 610 530, 240 830 C 120 910, -10 940, -250 970" stroke="url(#ap-gold-thick-2)" strokeWidth="24" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -250 160 C 400 290, 650 580, 280 870 C 160 950, 30 980, -250 1010" stroke="url(#ap-gold-thin-2)" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Wave 5: Footer (~5050px) */}
          <div className="absolute top-[5050px] right-0 w-[800px] h-[800px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 1000 180 C 700 300, 450 500, 150 880" stroke="url(#ap-gold-thin-2)" strokeWidth="1.8" />
              <path d="M 1000 240 C 650 360, 380 560, 80 930" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 1000 290 C 610 400, 330 610, 20 960" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>
        </>
      )}


      {/* =========================================================================
          PAGE 2: SERVICES / LISTINGS PAGE WAVES
         ========================================================================= */}
      {activeTab === 'services' && (
        <>
          {/* Services Wave 1: Header Arc (~100px) */}
          <div className="absolute top-[100px] right-0 w-full h-[500px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 500" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 150 C 400 20, 900 180, 1800 30" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M -200 200 C 400 70, 900 230, 1800 80" stroke="url(#ap-gold-thick-2)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 240 C 400 110, 900 270, 1800 120" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>

          {/* Services Wave 2: Left Gutter Serpentine (~850px) */}
          <div className="absolute top-[850px] left-0 w-[480px] h-[1000px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 480 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 -50 C 180 120, 380 380, 120 700 C -10 840, -80 900, -200 950" stroke="url(#ap-gold-thin-2)" strokeWidth="1.6" />
              <path d="M -200 10 C 220 180, 420 440, 160 760 C 30 900, -40 960, -200 1010" stroke="url(#ap-gold-thick-1)" strokeWidth="24" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 65 C 260 235, 460 495, 200 815 C 70 955, 0 1015, -200 1065" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>

          {/* Services Wave 3: Right Gutter Counter-Curve (~1400px) */}
          <div className="absolute top-[1400px] right-0 w-[420px] h-[900px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 420 900" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 600 20 C 320 200, 180 480, 380 780 C 420 860, 480 920, 600 1000" stroke="url(#ap-gold-thin-1)" strokeWidth="1.5" />
              <path d="M 600 70 C 270 250, 130 530, 330 830 C 370 910, 430 970, 600 1050" stroke="url(#ap-gold-thick-2)" strokeWidth="20" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 600 115 C 230 295, 90 575, 290 875 C 330 955, 390 1015, 600 1095" stroke="url(#ap-gold-thin-2)" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Services Wave 4: Inquire Banner Base Wave (~2200px) */}
          <div className="absolute top-[2200px] left-0 w-full h-[550px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 550" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 420 C 300 200, 800 380, 1300 160 C 1500 80, 1650 60, 1800 40" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M -200 460 C 300 240, 800 420, 1300 200 C 1500 120, 1650 100, 1800 80" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 495 C 300 275, 800 455, 1300 235 C 1500 155, 1650 135, 1800 115" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>
        </>
      )}


      {/* =========================================================================
          PAGE 3: BLOGS PAGE WAVES (BESPOKE EDITORIAL JOURNAL COMPOSITION)
          - Design: Gentle Floating Golden Auras along margins, never blocking text
         ========================================================================= */}
      {activeTab === 'blogs' && (
        <>
          {/* Blogs Wave 1: Editorial Header Crown (~60px) - Arcs gracefully over header row */}
          <div className="absolute top-[60px] left-0 w-full h-[450px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 450" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 220 C 300 40, 750 180, 1200 30 C 1450 -40, 1650 -60, 1800 -80" stroke="url(#ap-gold-thin-1)" strokeWidth="1.5" />
              <path d="M -200 260 C 300 80, 750 220, 1200 70 C 1450 0, 1650 -20, 1800 -40" stroke="url(#ap-gold-thick-1)" strokeWidth="20" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 295 C 300 115, 750 255, 1200 105 C 1450 35, 1650 15, 1800 -5" stroke="url(#ap-gold-thin-2)" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Blogs Wave 2: Right Margin Editorial Ribbon (~750px) - Sweeps right side gutter beside featured post */}
          <div className="absolute top-[750px] right-0 w-[500px] h-[850px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 850" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 700 -50 C 380 180, 180 450, 420 750 C 480 830, 550 900, 700 980" stroke="url(#ap-gold-thin-2)" strokeWidth="1.6" />
              <path d="M 700 0 C 330 230, 130 500, 370 800 C 430 880, 500 950, 700 1030" stroke="url(#ap-gold-thick-2)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 700 45 C 280 275, 80 545, 320 845 C 380 925, 450 995, 700 1075" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>

          {/* Blogs Wave 3: Left Margin Gentle Accent Stream (~1250px) - Frames left edge of blog grid */}
          <div className="absolute top-[1250px] left-0 w-[450px] h-[750px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 750" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 100 C 180 240, 380 460, 120 720" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M -200 150 C 220 290, 420 510, 160 770" stroke="url(#ap-gold-thick-1)" strokeWidth="20" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 190 C 250 330, 450 550, 190 810" stroke="url(#ap-gold-thin-2)" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Blogs Wave 4: Bottom Horizon (~1800px) - Floating golden stream beneath lower articles */}
          <div className="absolute top-[1800px] left-0 w-full h-[500px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 500" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 380 C 350 200, 850 360, 1350 160 C 1520 90, 1680 70, 1800 50" stroke="url(#ap-gold-thin-1)" strokeWidth="1.6" />
              <path d="M -200 420 C 350 240, 850 400, 1350 200 C 1520 130, 1680 110, 1800 90" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 455 C 350 275, 850 435, 1350 235 C 1520 165, 1680 145, 1800 125" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>
        </>
      )}


      {/* =========================================================================
          PAGE 4: CAREERS PAGE WAVES (BESPOKE ASPIRATIONAL GROWTH COMPOSITION)
          - Design: Soaring Upward Diagonal Rays & Side Growth Arcs
         ========================================================================= */}
      {activeTab === 'careers' && (
        <>
          {/* Careers Wave 1: Soaring Upward Growth Rays (~80px) - Sweeps low left to high right */}
          <div className="absolute top-[80px] left-0 w-full h-[600px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1600 600" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 550 C 350 380, 900 150, 1800 -80" stroke="url(#ap-gold-thin-2)" strokeWidth="1.8" />
              <path d="M -200 600 C 350 430, 900 200, 1800 -30" stroke="url(#ap-gold-thick-2)" strokeWidth="24" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 640 C 350 470, 900 240, 1800 10" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>

          {/* Careers Wave 2: Culture & Values Right Arc (~750px) - Frames quote slider edge */}
          <div className="absolute top-[750px] right-0 w-[480px] h-[850px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 480 850" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 650 40 C 320 180, 160 450, 380 750" stroke="url(#ap-gold-thin-1)" strokeWidth="1.8" />
              <path d="M 650 90 C 270 230, 110 500, 330 800" stroke="url(#ap-gold-thick-1)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 650 135 C 220 275, 60 545, 280 845" stroke="url(#ap-gold-thin-2)" strokeWidth="2" />
            </svg>
          </div>

          {/* Careers Wave 3: Job Listings Left Margin Flow (~1400px) - Frames open roles margin */}
          <div className="absolute top-[1400px] left-0 w-[450px] h-[850px] pointer-events-none anim-float-b anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 850" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M -200 50 C 180 200, 380 450, 120 750 C 40 820, -40 860, -200 890" stroke="url(#ap-gold-thin-2)" strokeWidth="1.6" />
              <path d="M -200 100 C 220 250, 420 500, 160 800 C 80 870, 0 910, -200 940" stroke="url(#ap-gold-thick-2)" strokeWidth="22" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M -200 145 C 260 295, 460 545, 200 845 C 120 915, 40 955, -200 985" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>

          {/* Careers Wave 4: Application Section Corner Frame (~2000px) - Frames bottom application CTA */}
          <div className="absolute top-[2000px] right-0 w-[600px] h-[600px] pointer-events-none anim-float-a anim-gold-shimmer">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 800 40 C 500 220, 250 420, -100 650" stroke="url(#ap-gold-thin-2)" strokeWidth="1.8" />
              <path d="M 800 85 C 500 265, 250 465, -100 695" stroke="url(#ap-gold-thick-1)" strokeWidth="20" strokeLinecap="round" filter="url(#ap-gold-glow)" />
              <path d="M 800 125 C 500 305, 250 505, -100 735" stroke="url(#ap-gold-thin-1)" strokeWidth="2" />
            </svg>
          </div>
        </>
      )}

      {/* Floating subtle ambient luxury gold dust particles */}
      <div className="absolute top-[12%] left-[15%] w-2 h-2 rounded-full bg-[#e2cb8f] blur-[1px] opacity-40 anim-sparkle-1" />
      <div className="absolute top-[28%] right-[10%] w-1.5 h-1.5 rounded-full bg-[#c5a85c] blur-[1px] opacity-50 anim-sparkle-2" />
      <div className="absolute top-[48%] left-[8%] w-2.5 h-2.5 rounded-full bg-[#f5e5b8] blur-[2px] opacity-35 anim-sparkle-1" />
      <div className="absolute top-[68%] right-[18%] w-2 h-2 rounded-full bg-[#e2cb8f] blur-[1px] opacity-45 anim-sparkle-2" />
      <div className="absolute top-[85%] left-[22%] w-1.5 h-1.5 rounded-full bg-[#c5a85c] blur-[1px] opacity-40 anim-sparkle-1" />
    </div>
  );
}

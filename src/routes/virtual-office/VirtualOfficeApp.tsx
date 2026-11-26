/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { LandingHero } from './components/LandingHero';
import { VirtualOfficeSection } from './components/VirtualOfficeSection';

export default function VirtualOfficeApp() {
  const packagesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToPackages = () => {
    if (packagesRef.current) {
      packagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white selection:bg-[#d4af37]/30 selection:text-[#f7e7a9] overflow-x-hidden scroll-smooth">
      {/* Scroll Progress Bar at the top with ambient gold glow */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27] z-50 origin-left shadow-[0_0_12px_rgba(212,175,55,0.8)] pointer-events-none"
      />

      {/* 1. Landing Page Hero: Crisp, corporate backdrop that smoothly dissolves down */}
      <section className="relative z-20 w-full">
        <LandingHero onExplorePackages={scrollToPackages} />
      </section>

      {/* 2. Virtual Office Section: Seamlessly merged with organic gradient mist & continuous glassmorphism */}
      <div ref={packagesRef} id="virtual-office-packages" className="relative z-10 w-full -mt-8 sm:-mt-12">
        <VirtualOfficeSection />
      </div>
    </div>
  );
}

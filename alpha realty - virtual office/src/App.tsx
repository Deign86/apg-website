/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { LandingHero } from './components/LandingHero';
import { VirtualOfficeSection } from './components/VirtualOfficeSection';

export default function App() {
  const packagesRef = useRef<HTMLDivElement>(null);

  const scrollToPackages = () => {
    if (packagesRef.current) {
      packagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white selection:bg-[#d4af37]/30 selection:text-[#f7e7a9] overflow-x-hidden">
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

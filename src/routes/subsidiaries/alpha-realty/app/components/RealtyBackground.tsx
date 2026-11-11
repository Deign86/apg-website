import { useEffect, useRef } from 'react';

/*
 * The light behind every Realty page. The film grain and the gold glow at the top are a fixed layer in
 * styles/index.css; this adds one soft gold light, pinned to the viewport, that swings to the other side once per
 * screen of scrolling, so it reads as lighting rather than particles.
 *
 * The swing is a CSS scroll-driven animation (`.realty-drift` in styles/index.css), so scrolling costs no
 * JavaScript; it repeats once per screen, which needs the page's length in screens (--realty-screens), measured
 * when the page or window resizes, never while scrolling. Still where scroll-driven animations are unsupported or
 * motion is reduced.
 */
export default function RealtyBackground() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = light.current;
    if (!el) return undefined;
    const measure = () => {
      const screens = Math.max(1, (document.documentElement.scrollHeight - window.innerHeight) / window.innerHeight);
      el.style.setProperty('--realty-screens', screens.toFixed(3));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        ref={light}
        className="realty-drift fixed left-1/2 top-1/2 size-[clamp(30rem,105vw,90rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(197,168,92,0.14),rgba(197,168,92,0.05)_50%,transparent)]"
      />
    </div>
  );
}

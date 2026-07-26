import { useState, useEffect } from "react";

const SAKURA_PETALS = Array.from({ length: 22 }, (_, i) => {
  const s = (i * 137.508) % 100;
  return {
    id: i,
    left: s,
    size: 9 + (s % 11),
    duration: 1.6 + (s % 18) * 0.08,
    delay: (s % 28) * 0.09,
    hue: s < 50 ? "#F4A8BF" : s < 75 ? "#EF8FA8" : "#FBBFD3",
  };
});

/**
 * SakuraBurst — A 1-shot quick falling shower of sakura leaves for subpages
 * (Services, Blogs, Careers, Inquire). Automatically unmounts after 3.2s.
 */
export default function SakuraBurst() {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAlive(false), 3400);
    return () => clearTimeout(timer);
  }, []);

  if (!alive) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {SAKURA_PETALS.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: -24,
            width: p.size,
            height: p.size * 0.78,
            animation: `sakuraBurstDrop ${p.duration * 1.3}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        >
          <svg viewBox="0 0 24 19" fill="none">
            <ellipse cx="12" cy="9.5" rx="12" ry="9.5" fill={p.hue} fillOpacity="0.85" />
            <ellipse cx="12" cy="9.5" rx="7" ry="5.5" fill="#fff" fillOpacity="0.35" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes sakuraBurstDrop {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.88; }
          75%  { opacity: 0.72; }
          100% { transform: translateY(108vh) rotate(500deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

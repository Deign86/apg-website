import React, { useEffect, useRef, useState } from 'react';

interface SeamlessHeroVideoProps {
  src: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Muted looping hero background.
 *
 * One <video loop>: the browser restarts it itself, in every tab state. Browsers refuse or
 * interrupt play() while the page is hidden (background tab, power saving) or until a user
 * gesture (iOS Low Power Mode), so playback is retried whenever it becomes possible: tab shown,
 * hero scrolled into view, first tap/key. It pauses while off-screen, and visitors who prefer
 * reduced motion get the still poster. The video source is attached only after the window load
 * event, so its download doesn't compete with the page's images and fonts (the poster covers it).
 */
export const SeamlessHeroVideo: React.FC<SeamlessHeroVideoProps> = ({
  src,
  poster,
  className = 'w-full h-full object-cover',
  overlayClassName = 'bg-gradient-to-b from-[#181207]/70 via-[#120E05]/50 to-[#1C1509]/90',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reduceMotion] = useState(prefersReducedMotion);
  const [pageLoaded, setPageLoaded] = useState(() => document.readyState === 'complete');

  useEffect(() => {
    if (pageLoaded) return undefined;
    // Re-check here: the load event may have fired between the first render and this effect.
    if (document.readyState === 'complete') {
      setPageLoaded(true);
      return undefined;
    }
    const onLoad = () => setPageLoaded(true);
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, [pageLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion || !pageLoaded) return;

    let onScreen = true;
    const tryPlay = () => {
      if (onScreen && document.visibilityState === 'visible' && video.paused) {
        video.play().catch(() => {
          // Still not allowed (hidden, power saving, no gesture yet): the listeners below retry.
        });
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) tryPlay();
      else video.pause();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', tryPlay);
    window.addEventListener('pointerdown', tryPlay, { passive: true });
    window.addEventListener('keydown', tryPlay);
    tryPlay();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', tryPlay);
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, [src, reduceMotion, pageLoaded]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Poster until the first frame actually plays (and permanently for reduced motion). */}
      {poster && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isPlaying ? 'opacity-0' : 'opacity-70'}`}
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {!reduceMotion && (
        <video
          ref={videoRef}
          src={pageLoaded ? src : undefined}
          muted
          loop
          playsInline
          autoPlay
          preload={pageLoaded ? 'auto' : 'none'}
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setIsPlaying(true)}
          className={`absolute inset-0 ${className} transition-opacity duration-1000 ease-out motion-reduce:transition-none ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scale(1.02)' /* hides sub-pixel edge lines */ }}
        />
      )}

      {/* Atmospheric Luxury Ambient Overlay */}
      <div className={`absolute inset-0 ${overlayClassName} pointer-events-none z-[1]`} />
    </div>
  );
};

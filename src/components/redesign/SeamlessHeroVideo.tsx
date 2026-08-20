import React, { useRef, useState, useEffect } from 'react';

interface SeamlessHeroVideoProps {
  src: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
  crossfadeDuration?: number; // duration of crossfade in seconds, default 1.2s
}

export const SeamlessHeroVideo: React.FC<SeamlessHeroVideoProps> = ({
  src,
  poster,
  className = 'w-full h-full object-cover',
  overlayClassName = 'bg-gradient-to-b from-[#181207]/70 via-[#120E05]/50 to-[#1C1509]/90',
  crossfadeDuration = 1.2,
}) => {
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  // activeVideo: 1 or 2
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1) return;

    // Ensure v1 plays on mount
    const startInitialPlayback = async () => {
      try {
        v1.currentTime = 0;
        await v1.play();
        setIsLoaded(true);
      } catch (err) {
        // Autoplay may be restricted until user interaction
        console.warn('Autoplay blocked or waiting for interaction:', err);
      }
    };

    startInitialPlayback();

    // Loop check interval using requestAnimationFrame / timeupdate
    let animId: number;

    const checkLoop = () => {
      const currentActive = activeVideo === 1 ? v1 : v2;
      const nextVideo = activeVideo === 1 ? v2 : v1;

      if (currentActive && nextVideo && currentActive.duration > 0) {
        const remaining = currentActive.duration - currentActive.currentTime;

        // When nearing the end of the current video, trigger the next video
        if (remaining <= crossfadeDuration && !isTransitioningRef.current && remaining > 0) {
          isTransitioningRef.current = true;
          setIsTransitioning(true);

          nextVideo.currentTime = 0;
          nextVideo.play().catch(() => {});

          const nextIndex = activeVideo === 1 ? 2 : 1;
          setActiveVideo(nextIndex);

          // After crossfade transition finishes, pause and reset the old video
          setTimeout(() => {
            currentActive.pause();
            currentActive.currentTime = 0;
            isTransitioningRef.current = false;
            setIsTransitioning(false);
          }, crossfadeDuration * 1000 + 200);
        }
      }

      animId = requestAnimationFrame(checkLoop);
    };

    animId = requestAnimationFrame(checkLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeVideo, crossfadeDuration]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Fallback Poster Background */}
      {poster && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            isLoaded ? 'opacity-0' : 'opacity-70'
          }`}
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      {/* Video Player 1 */}
      <video
        ref={video1Ref}
        src={src}
        muted
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        onLoadedData={() => setIsLoaded(true)}
        className={`absolute inset-0 ${className} transition-opacity duration-1000 ease-in-out ${
          activeVideo === 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'scale(1.02)', // prevent any subpixel edge borders
          willChange: 'opacity',
        }}
      />

      {/* Video Player 2 (Crossfade Peer) */}
      <video
        ref={video2Ref}
        src={src}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        className={`absolute inset-0 ${className} transition-opacity duration-1000 ease-in-out ${
          activeVideo === 2 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'scale(1.02)',
          willChange: 'opacity',
        }}
      />

      {/* Atmospheric Luxury Ambient Overlay */}
      <div className={`absolute inset-0 ${overlayClassName} pointer-events-none z-[1]`} />
    </div>
  );
};

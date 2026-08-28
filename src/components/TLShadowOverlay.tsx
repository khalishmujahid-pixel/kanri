import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamLeaderData } from '../data/characters';

interface TLShadowOverlayProps {
  isVisible: boolean;
  tl: TeamLeaderData | null;
}

export const TLShadowOverlay: React.FC<TLShadowOverlayProps> = ({ isVisible, tl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Callback ref to guarantee muted DOM property is set before browser autoplay checks
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.defaultMuted = true;
      node.muted = true;
      node.playsInline = true;
      node.play().catch(() => {
        // Autoplay policy fallback: will play on first interaction
      });
    }
  }, []);

  // Ensure video plays smoothly when visibility transitions or TL changes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = true;

    if (isVisible) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Retry on loadeddata/canplay
        });
      }
    } else {
      vid.pause();
    }
  }, [isVisible, tl?.tlVideoUrl]);

  if (!tl) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="tl-shadow-overlay"
          initial={{ opacity: 0, y: 100, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.92 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 28,
            mass: 0.7,
          }}
          aria-label={`Team Leader: ${tl.name}`}
          style={{ pointerEvents: 'none' }}
        >
          {/* Header Bar */}
          <div className="tl-overlay-header">
            <span className="tl-crown-icon">👑</span>
            <span className="tl-overlay-label">TEAM LEADER</span>
          </div>

          {/* Video */}
          <div className="tl-overlay-video-wrap">
            <video
              ref={setVideoRef}
              key={tl.tlVideoUrl}
              className="tl-overlay-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={tl.image}
              onCanPlay={(e) => {
                const vid = e.currentTarget;
                vid.muted = true;
                vid.play().catch(() => {});
              }}
              onLoadedData={(e) => {
                const vid = e.currentTarget;
                vid.muted = true;
                vid.play().catch(() => {});
              }}
            >
              <source src={tl.tlVideoUrl} type="video/mp4" />
            </video>
            {/* Subtle vignette overlay on video */}
            <div className="tl-video-vignette" />
          </div>

          {/* Footer */}
          <div className="tl-overlay-footer">
            <img
              src={tl.image}
              alt={tl.name}
              className="tl-overlay-avatar"
              draggable={false}
            />
            <div className="tl-overlay-info">
              <span className="tl-overlay-name">{tl.name}</span>
              <span className="tl-overlay-zone">{tl.zone}</span>
            </div>
            {/* Pulsing "SHADOWING" indicator */}
            <div className="tl-shadowing-pill">
              <span className="tl-shadow-dot" />
              SHADOWING
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


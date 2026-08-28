import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamLeaderData } from '../data/characters';

interface TLShadowOverlayProps {
  isVisible: boolean;
  tl: TeamLeaderData | null;
}

export const TLShadowOverlay: React.FC<TLShadowOverlayProps> = ({ isVisible, tl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay + loop when visible
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isVisible) {
      vid.currentTime = 0;
      vid.play().catch(() => {/* autoplay blocked — silently ignore */});
    } else {
      vid.pause();
    }
  }, [isVisible]);

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
              ref={videoRef}
              src={tl.tlVideoUrl}
              className="tl-overlay-video"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
            />
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

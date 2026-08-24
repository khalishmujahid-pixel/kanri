import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, ShieldCheck, Activity } from 'lucide-react';
import '../styles/introScreen.css';

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  // Listen for Enter or Space key to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <motion.div
      className="intro-screen-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="intro-grid-pattern" aria-hidden="true" />

      <motion.div
        className="intro-content-card"
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Telemetry Beacon Badge */}
        <div className="intro-top-badge">
          <span className="intro-radar-dot" />
          <span>F1 PIT GARAGE // LIVE | SHIFT RED TEAM</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="intro-main-title">
          <span className="highlight-orange">PW MAINT BODY#2</span> <br />
          RED ZONE
        </h1>

        <p className="intro-sub-tagline">
          KANRI OPERATION &amp; KAIZEN INTELLIGENCE PLATFORM
        </p>

        {/* Interactive Start Button */}
        <div className="intro-start-btn-wrap">
          <motion.button
            type="button"
            className="intro-start-btn"
            onClick={onStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            autoFocus
          >
            <div className="intro-btn-icon">
              <Play size={13} fill="#ffffff" />
            </div>
            <span>START SYSTEM</span>
            <Zap size={14} className="zap-glow-icon" />
          </motion.button>

          <div className="intro-start-hint">
            <span>Tekan</span>
            <kbd>ENTER</kbd>
            <span>atau Klik untuk Masuk</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Telemetry HUD Status */}
      <div className="intro-footer-telemetry">
        <div className="intro-telemetry-item">
          <span className="dot-green" />
          <span>SYSTEM READY</span>
        </div>
        <div className="intro-telemetry-item">
          <Activity size={11} color="#ff6a1a" />
          <span>WELDING BODY #2</span>
        </div>
        <div className="intro-telemetry-item">
          <ShieldCheck size={11} color="#22c55e" />
          <span>SECURITY ZONE AUTHENTICATED</span>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import '../styles/introScreen.css';

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const [showTitles, setShowTitles] = useState(false);

  // Show center text after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitles(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard listener for Enter or Space key to proceed
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
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Cinematic Vignette Overlay */}
      <div className="intro-vignette" aria-hidden="true" />

      {/* Center Titles (Appears after 2 seconds — Clean Plain Text) */}
      {showTitles && (
        <div className="intro-center-titles">
          <h1 className="intro-title-line1">KANRI MEETING</h1>
          <h2 className="intro-title-line2">BODY#2 RED</h2>
          <p className="intro-title-line3">Agustus 2026</p>
        </div>
      )}

      {/* Elegant Center-Bottom Action Hub */}
      <motion.div
        className="intro-action-hub"
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 15, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          type="button"
          className="intro-elegant-btn"
          onClick={onStart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          autoFocus
        >
          <div className="intro-play-icon-wrap">
            <Play size={10} fill="currentColor" />
          </div>
          <span>START OPERATION</span>
          <Sparkles size={13} style={{ color: '#ff9f1c', opacity: 0.8 }} />
        </motion.button>

        <div className="intro-sub-hint">
          <span>TEKAN</span>
          <kbd>ENTER</kbd>
          <span>ATAU KLIK UNTUK MASUK</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

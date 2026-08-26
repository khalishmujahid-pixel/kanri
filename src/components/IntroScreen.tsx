import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import '../styles/introScreen.css';

interface IntroScreenProps {
  onStart: () => void;
}

const LINE_1 = "KANRI MEETING";
const LINE_2 = "BODY#2 RED";
const LINE_3 = "AGUSTUS 2026";

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const [cycleKey, setCycleKey] = useState<number>(0);
  const [isTypingVisible, setIsTypingVisible] = useState<boolean>(false);

  // Initial 2-second delay on first load, then starts the loop
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTypingVisible(true);
    }, 2000);
    return () => clearTimeout(startTimer);
  }, []);

  // Cycle loop: Hard-impact slam typewriter -> Freeze for 5s -> Disappear blur -> Repeat
  useEffect(() => {
    if (!isTypingVisible) return;

    // Typewrite (~2.4s) + Freeze (5.0s) + Disappear Blur & pause (~1.2s) = 8.6s total per cycle
    const cycleTimer = setTimeout(() => {
      setCycleKey(prev => prev + 1);
    }, 8600);

    return () => clearTimeout(cycleTimer);
  }, [cycleKey, isTypingVisible]);

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

      {/* Center Titles with Hard-Impact Slam Typewriter & Disappear Blur Exit */}
      {isTypingVisible && (
        <AnimatePresence mode="wait">
          <motion.div
            key={cycleKey}
            className="intro-center-titles"
            initial={{ opacity: 1, filter: 'blur(0px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              filter: 'blur(22px)',
              scale: 1.06,
              y: -12,
              transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            {/* Line 1: KANRI MEETING */}
            <div className="intro-title-line1">
              {LINE_1.split('').map((char, index) => (
                <motion.span
                  key={`l1-${index}`}
                  className="intro-slam-char"
                  initial={{ opacity: 0, scale: 2.5, y: -16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.16,
                    delay: index * 0.07,
                    ease: [0.175, 0.885, 0.32, 1.275]
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            {/* Line 2: BODY#2 RED */}
            <div className="intro-title-line2">
              {LINE_2.split('').map((char, index) => (
                <motion.span
                  key={`l2-${index}`}
                  className="intro-slam-char"
                  initial={{ opacity: 0, scale: 2.2, y: -12, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.16,
                    delay: 0.95 + index * 0.07,
                    ease: [0.175, 0.885, 0.32, 1.275]
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            {/* Line 3: AGUSTUS 2026 */}
            <div className="intro-title-line3">
              {LINE_3.split('').map((char, index) => (
                <motion.span
                  key={`l3-${index}`}
                  className="intro-slam-char"
                  initial={{ opacity: 0, scale: 2.0, y: -10, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.14,
                    delay: 1.75 + index * 0.055,
                    ease: [0.175, 0.885, 0.32, 1.275]
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
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

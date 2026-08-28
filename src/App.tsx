import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { INITIAL_CHARACTERS, MEMBER_TO_TL_MAP } from './data/characters';
import type { Character } from './types/character';
import { CharacterDetail } from './components/CharacterDetail';
import { F1GarageHeader } from './components/F1GarageHeader';
import { IntroScreen } from './components/IntroScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeSelector } from './components/ThemeSelector';
import { initKaizenMemoryCache, preloadCriticalAssets } from './utils/assetCache';
import { TLShadowOverlay } from './components/TLShadowOverlay';

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h7M3 3v7M21 3h-7M21 3v7M3 21h7M3 21v-7M21 21h-7M21 21v-7" />
    </svg>
  );
}

function BackToIntroButton({ onClick, isMobile }: { onClick: () => void; isMobile?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Kembali ke halaman intro video"
      style={{
        position: 'fixed',
        top: 'clamp(12px, 2.5vh, 24px)',
        left: 'clamp(12px, 2.5vw, 28px)',
        zIndex: 100,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: isMobile ? '6px 12px' : '7px 14px',
        borderRadius: 999,
        background: hovered ? 'rgba(255, 85, 0, 0.22)' : 'var(--theme-bottom-bar-bg)',
        border: `1px solid ${hovered ? '#ff8c42' : 'var(--theme-border)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: hovered ? '#ffffff' : 'var(--theme-text-primary)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: isMobile ? 10 : 11,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: hovered ? '0 0 20px rgba(255, 85, 0, 0.45)' : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: hovered ? '#ff8c42' : 'var(--theme-accent)',
          transition: 'transform 0.25s ease',
          transform: hovered ? 'translateX(-2px)' : 'none',
        }}
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>INTRO</span>
    </button>
  );
}


function SkipVideoButton({ onSkip, isMobile }: { onSkip: () => void; isMobile?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onSkip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Lewati video intro (Space / Click)"
      style={{
        position: 'fixed',
        bottom: 'clamp(20px, 4vh, 36px)',
        right: 'clamp(20px, 4vw, 36px)',
        zIndex: 150,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: isMobile ? '7px 14px' : '9px 20px',
        borderRadius: 999,
        background: hovered ? 'rgba(255, 85, 0, 0.35)' : 'rgba(8, 12, 22, 0.68)',
        border: `1.5px solid ${hovered ? '#ff8c42' : 'rgba(255, 140, 50, 0.55)'}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#ffffff',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: isMobile ? 10.5 : 11.5,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: hovered ? '0 0 28px rgba(255, 85, 0, 0.65)' : '0 8px 24px rgba(0,0,0,0.55)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <span>SKIP VIDEO</span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: '#ff8c42',
          transition: 'transform 0.25s ease',
          transform: hovered ? 'translateX(2px)' : 'none',
        }}
      >
        <path d="m6 17 5-5-5-5" />
        <path d="m13 17 5-5-5-5" />
      </svg>
    </button>
  );
}


function AppInner() {
  const { theme } = useTheme();

  const characters = INITIAL_CHARACTERS;
  const total = characters.length;


  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  // Controls whether user has clicked START on the intro page
  const [hasStarted, setHasStarted] = useState(false);
  // Controls full background video playback state before dealing cards
  const [isPlayingFullVideo, setIsPlayingFullVideo] = useState(false);
  // Controls the fade-in of the showroom UI after video ends or user clicks SKIP
  const [showUI, setShowUI] = useState(false);
  // Controls card dealing animation (pembagian kartu remi)
  const [cardsDealt, setCardsDealt] = useState(false);
  // Tracks whether the active card's character video has loaded and is ready to play
  const [activeVideoReady, setActiveVideoReady] = useState(false);
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Responsive device detection
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  // Interactive 3D Card Tilt & Parallax Tracking (rAF Throttled for 120fps fluid motion)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const tiltRafRef = useRef<number | null>(null);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, isCenter: boolean) => {
    if (!isCenter || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const newX = Math.round(x * 12 * 10) / 10;
    const newY = Math.round(-y * 12 * 10) / 10;

    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      setTilt({ x: newX, y: newY });
    });
  }, [isMobile]);

  const handleCardMouseLeave = useCallback(() => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTilt({ x: 0, y: 0 });
  }, []);

  // Drag & Touch Swipe handling
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const prev = useCallback(() => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTilt({ x: 0, y: 0 });
    setActive(i => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTilt({ x: 0, y: 0 });
    setActive(i => (i + 1) % total);
  }, [total]);

  // Comprehensive Preloading & Local Memory Caching for zero-lag smooth 60/120fps interactions
  useEffect(() => {
    initKaizenMemoryCache();

    // Preload background video metadata
    const bgVidPreload = document.createElement('video');
    bgVidPreload.src = '/assets/videos/background.mp4';
    bgVidPreload.preload = 'metadata';

    // Preload character portraits and images into local memory cache
    const charImages: string[] = [];
    characters.forEach(char => {
      if (char.image) charImages.push(char.image);
      if (char.portrait) charImages.push(char.portrait);
    });
    preloadCriticalAssets(charImages);
  }, [characters]);

  // Reset video-ready state each time the active card changes
  useEffect(() => {
    setActiveVideoReady(false);
  }, [active]);

  // Handler: When user clicks "START OPERATION" on Intro Screen
  const handleStartIntro = useCallback(() => {
    setHasStarted(true);
    setIsPlayingFullVideo(true);
    setShowUI(false);
    setCardsDealt(false);

    if (bgVideoRef.current) {
      bgVideoRef.current.currentTime = 0;
      bgVideoRef.current.playbackRate = 1.25;
      bgVideoRef.current.loop = false;
      bgVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Handler: When full video finishes playing OR user clicks "SKIP VIDEO"
  const handleFinishVideo = useCallback(() => {
    setIsPlayingFullVideo(false);
    setShowUI(true);

    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 1.25;
      bgVideoRef.current.loop = true;
      bgVideoRef.current.play().catch(() => {});
    }

    // Trigger card dealing sequence completion after ~1.8s
    setTimeout(() => {
      setCardsDealt(true);
    }, 1800);
  }, []);

  // Enforce 1.25x playback rate on background video
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 1.25;
    }
  }, [hasStarted, isPlayingFullVideo, showUI]);

  // Handler: When user clicks "INTRO" to return to landing screen
  const handleBackToIntro = useCallback(() => {
    setShowUI(false);
    setCardsDealt(false);
    setIsPlayingFullVideo(false);
    setHasStarted(false);

    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 1.25;
      bgVideoRef.current.loop = true;
      bgVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Keyboard navigation & Skip video shortcut
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (isPlayingFullVideo) {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        handleFinishVideo();
      }
      return;
    }
    if (!hasStarted) return;
    if (selectedCharacter) {
      // While in Character Detail view, all keyboard events are managed by child modals (zoom/lightbox)
      return;
    }
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Enter') setSelectedCharacter(characters[active]);
  }, [isPlayingFullVideo, hasStarted, handleFinishVideo, selectedCharacter, prev, next, characters, active]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const getOffset = (idx: number) => {
    let d = idx - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  const toggleLike = () => {
    setLiked(s => {
      const n = new Set(s);
      n.has(active) ? n.delete(active) : n.add(active);
      return n;
    });
  };

  const current = characters[active];

  // Theme-aware inline style helpers
  const isPresentation = theme === 'presentation';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--theme-bg-primary)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'background 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* 1. Intro Screen Video Layer (intro.mp4) — Subtle Opacity for High Text Contrast */}
      {!hasStarted && (
        <video
          key="video-intro"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.85,
          }}
        >
          <source src="/assets/videos/intro.mp4" type="video/mp4" />
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
      )}

      {/* 2. Transition Cutscene & Dashboard Video Layer (background.mp4) */}
      {hasStarted && (
        <video
          ref={bgVideoRef}
          key="video-dashboard"
          autoPlay
          loop={!isPlayingFullVideo}
          muted
          playsInline
          onPlay={(e) => {
            (e.currentTarget as HTMLVideoElement).playbackRate = 1.25;
          }}
          onLoadedMetadata={(e) => {
            (e.currentTarget as HTMLVideoElement).playbackRate = 1.25;
          }}
          onEnded={() => {
            if (isPlayingFullVideo) {
              handleFinishVideo();
            }
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isPresentation ? 0 : 1,
            transition: 'opacity 0.6s ease-in-out',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
      )}

      {/* 3. Frosted/Vignette Tint Overlay — active only on Dashboard */}
      {hasStarted && !isPlayingFullVideo && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--theme-bg-overlay)',
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'background 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* Presentation: soft linen texture overlay */}
      {hasStarted && !isPlayingFullVideo && isPresentation && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(220,232,255,0.5) 50%, rgba(255,255,255,0.35) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 4. Subtle center soft glow — active on Dashboard */}
      {hasStarted && !isPlayingFullVideo && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '65vw',
            height: '45vh',
            background: 'var(--theme-center-glow)',
            filter: 'blur(50px)',
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'background 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* ─── UI Wrapper — immediate container visibility for sharp card dealing ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          opacity: showUI ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: showUI ? 'auto' : 'none',
        }}
      >

      {/* Floating Header Controls: Back to Intro (Top Left) & Theme Selector (Top Right) */}
      <BackToIntroButton
        onClick={handleBackToIntro}
        isMobile={isMobile}
      />
      <ThemeSelector />

      {/* 4. Top Header & Identity Tag with F1 Garage Pit Wall Visuals & Special Animation */}
      <F1GarageHeader isMobile={isMobile} />


      {/* 5. Main 3D Card Carousel (Responsive & Centered: Portrait on Mobile, 4:3 on Tablet, 16:9 on Desktop) */}
      <div
        style={{
          position: 'absolute',
          top: isMobile ? 'calc(50% - 10px)' : 'calc(50% - 8px)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: isMobile ? 'clamp(410px, 64vh, 520px)' : isTablet ? 'clamp(380px, 60vh, 540px)' : 'clamp(360px, 58vh, 520px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: isMobile ? '1000px' : '1400px',
          cursor: dragging ? 'grabbing' : 'grab',
          zIndex: 10,
        }}
        onPointerDown={e => {
          if (e.pointerType === 'touch') return;
          setDragging(true);
          setDragStart(e.clientX);
        }}
        onPointerUp={e => {
          if (e.pointerType === 'touch' || !dragging) return;
          setDragging(false);
          const delta = e.clientX - dragStart;
          if (delta < -45) next();
          else if (delta > 45) prev();
        }}
        onPointerLeave={() => setDragging(false)}
        onTouchStart={e => {
          touchStartXRef.current = e.touches[0].clientX;
          touchStartYRef.current = e.touches[0].clientY;
        }}
        onTouchEnd={e => {
          const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
          const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
          if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) next();
            else prev();
          }
        }}
      >
        {characters.map((char, idx) => {
          const offset = getOffset(idx);
          const abs = Math.abs(offset);
          if (abs > 2) return null;

          const isCenter = offset === 0;
          const xPct = offset * (isMobile ? 86 : isTablet ? 68 : 66);
          const scale = isCenter ? 1 : isMobile ? (0.72 - abs * 0.06) : (0.76 - abs * 0.05);
          const zIdx = isCenter ? 10 : 5 - abs;
          const rotX = isCenter ? tilt.y : 0;
          const rotY = (offset * (isMobile ? -16 : -14)) + (isCenter ? tilt.x : 0);
          const opacity = isCenter ? 1 : isMobile ? (0.45 - abs * 0.15) : (0.55 - abs * 0.12);
          const blur = isCenter ? 0 : abs * (isMobile ? 3 : 2);

          const cardW = isMobile ? 'clamp(270px, 80vw, 340px)' : isTablet ? 'clamp(380px, 54vw, 520px)' : 'clamp(420px, 46vw, 640px)';
          const cardAspect = isMobile ? '3 / 4' : isTablet ? '4 / 3' : '16 / 9';

          // Card Dealing Animation (Pembagian Kartu Remi yang Sangat Terasa & Tajam)
          // Dealing order: Leftmost visible card (-2) -> Mid-left (-1) -> Center (0) -> Mid-right (+1) -> Rightmost (+2)
          const dealOrder = offset === -2 ? 0 : offset === -1 ? 1 : offset === 0 ? 2 : offset === 1 ? 3 : 4;
          const dealDelay = `${dealOrder * 0.22}s`;
          
          // Initial Deck Position: Cards start stacked at bottom center (hidden deck)
          const initialDealTransform = `translate(0, 360px) scale(0.18) rotate(${offset * 14 - 28}deg)`;
          const finalTransform = `translateX(${xPct}%) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

          const cardTransform = !cardsDealt && !showUI ? initialDealTransform : finalTransform;
          const cardOpacity = !cardsDealt && !showUI ? 0 : opacity;

          // Punchy casino card dealing physics with distinct overshoot snap
          const cardTransition = !cardsDealt
            ? `transform 0.72s cubic-bezier(0.18, 1.25, 0.35, 1) ${dealDelay}, opacity 0.4s ease ${dealDelay}, filter 0.4s ease ${dealDelay}, box-shadow 0.4s ease ${dealDelay}`
            : dragging
            ? 'none'
            : isCenter && (tilt.x !== 0 || tilt.y !== 0)
            ? 'transform 0.1s ease-out'
            : 'all 0.55s cubic-bezier(0.34,1.1,0.64,1)';

          return (
            <div
              key={char.id}
              className={isCenter ? 'card-center-active' : ''}
              onMouseMove={e => handleCardMouseMove(e, isCenter)}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => {
                if (!dragging && abs > 0) setActive(idx);
              }}
              style={{
                position: 'absolute',
                width: cardW,
                aspectRatio: cardAspect,
                borderRadius: isMobile ? 18 : 22,
                overflow: 'hidden',
                transform: cardTransform,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
                zIndex: zIdx,
                opacity: cardOpacity,
                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                transition: cardTransition,
                cursor: isCenter ? 'default' : 'pointer',
                boxShadow: isCenter
                  ? 'var(--theme-card-shadow)'
                  : 'var(--theme-card-shadow-side)',
                background: 'var(--theme-bg-card)',
              }}
            >
              {/* Character Video — auto-plays only on the active center card.
                  Sits below the photo (zIndex 1) and fades in once ready. */}
              {isCenter && (
                <video
                  ref={activeVideoRef}
                  key={char.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onCanPlay={() => setActiveVideoReady(true)}
                  onError={() => setActiveVideoReady(false)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: isMobile ? 'center 18%' : isTablet ? 'center 30%' : 'center center',
                    zIndex: 1,
                    pointerEvents: 'none',
                    opacity: activeVideoReady ? 1 : 0,
                    transition: 'opacity 0.7s ease-in-out',
                  }}
                >
                  <source src={`/assets/characters/${char.id}.mp4`} type="video/mp4" />
                </video>
              )}

              {/* Character Photo — always rendered, fades out once video is ready on active card.
                  Stays fully visible on inactive side cards. */}
              <img
                src={char.image}
                alt={char.name}
                draggable={false}
                className={isCenter ? 'character-animate-active' : ''}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: isMobile ? 'center 18%' : isTablet ? 'center 30%' : 'center center',
                  display: 'block',
                  pointerEvents: 'none',
                  zIndex: 2,
                  opacity: isCenter && activeVideoReady ? 0 : 1,
                  transition: 'opacity 0.7s ease-in-out',
                }}
              />

              {/* Futuristic Cyber Hologram Shimmer & Laser Scanner Sweep */}
              {isCenter && (
                <>
                  <div className="character-shimmer-beam" />
                  <div className="character-laser-scanner" />
                </>
              )}

              {/* Contrast Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(10,14,23,0.1) 0%, transparent 40%, rgba(6,9,16,0.82) 80%, rgba(6,9,16,0.98) 100%)',
                }}
              />

              {/* Active Center Card Detailed Content */}
              {isCenter && (
                <>
                  {/* Top Bar: Expand CTA & Status Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobile ? 12 : 14,
                      left: isMobile ? 12 : 16,
                      right: isMobile ? 12 : 16,
                      zIndex: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCharacter(char);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'rgba(10,14,23,0.72)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,85,0,0.45)',
                        borderRadius: 999,
                        padding: isMobile ? '4px 10px' : '5px 12px',
                        color: '#ffffff',
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <ExpandIcon />
                      <span>EXPAND</span>
                    </button>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(16,185,129,0.2)',
                        border: '1px solid rgba(16,185,129,0.45)',
                        borderRadius: 999,
                        padding: isMobile ? '3px 8px' : '3px 9px',
                        fontSize: isMobile ? 9 : 9.5,
                        fontFamily: 'var(--font-mono)',
                        color: '#10b981',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#10b981',
                          boxShadow: '0 0 6px #10b981',
                        }}
                      />
                      <span>ACTIVE</span>
                    </div>
                  </div>

                  {/* Character Code Badge & Counter */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobile ? 44 : 48,
                      left: isMobile ? 12 : 16,
                      background: 'rgba(255,85,0,0.22)',
                      border: '1px solid rgba(255,85,0,0.5)',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: isMobile ? 9.5 : 10,
                      fontFamily: 'var(--font-mono)',
                      color: '#ff6a1a',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    CODE: {char.code}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: isMobile ? 46 : 50,
                      right: isMobile ? 12 : 16,
                      fontSize: isMobile ? 10 : 10.5,
                      fontFamily: 'var(--font-mono)',
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {active + 1} / {total}
                  </div>

                  {/* ── Improvement Notification Badge (luxury shimmer) ── */}
                  {char.categories.improvement.recordsCount > 0 && (
                    <div className="kaizen-notif-badge">
                      <span className="kaizen-notif-shimmer" />
                      <span className="kaizen-notif-icon">⚡</span>
                      <span className="kaizen-notif-text">KAIZEN</span>
                      <span className="kaizen-notif-count">{char.categories.improvement.recordsCount}</span>
                    </div>
                  )}

                  {/* Bottom Character Info with High Contrast Glass Backdrop */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      padding: isMobile ? '20px 14px 14px' : '24px 20px 18px',
                      background: 'linear-gradient(to top, rgba(5,7,14,0.96) 0%, rgba(5,7,14,0.85) 60%, rgba(5,7,14,0.4) 85%, transparent 100%)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      borderBottomLeftRadius: isMobile ? 18 : 22,
                      borderBottomRightRadius: isMobile ? 18 : 22,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? 9.5 : 10.5,
                        fontWeight: 800,
                        color: '#ff6a1a',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: isMobile ? 2 : 4,
                        textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                      }}
                    >
                      {char.department} • {char.unit}
                    </div>

                    <h2
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: isMobile ? 'clamp(18px, 4.8vw, 22px)' : 'clamp(20px, 2.8vw, 26px)',
                        fontWeight: 900,
                        margin: isMobile ? '0 0 4px' : '0 0 6px',
                        color: '#ffffff',
                        lineHeight: 1.15,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)',
                      }}
                    >
                      {char.name}
                    </h2>

                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: isMobile ? 11 : 12,
                        lineHeight: isMobile ? 1.4 : 1.5,
                        color: '#f1f5f9',
                        fontWeight: 500,
                        margin: isMobile ? '0 0 8px' : '0 0 10px',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                      }}
                    >
                      {char.summary}
                    </p>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        color: '#ffd080',
                        fontSize: isMobile ? 10 : 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        background: 'rgba(255,85,0,0.2)',
                        border: '1px solid rgba(255,85,0,0.45)',
                        borderRadius: 999,
                        padding: isMobile ? '3px 9px' : '4px 12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      <PinIcon />
                      <span>{char.zone}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Side Cards Preview Label with High Contrast Glass Backdrop */}
              {!isCenter && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: isMobile ? 8 : 12,
                    left: isMobile ? 8 : 12,
                    right: isMobile ? 8 : 12,
                    zIndex: 10,
                    padding: isMobile ? '8px 10px' : '10px 14px',
                    background: 'rgba(8, 12, 22, 0.88)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: isMobile ? 10 : 14,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: 800,
                      color: '#ff6a1a',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginBottom: 2,
                    }}
                  >
                    CODE: {char.code}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: isMobile ? 11.5 : 13.5,
                      fontWeight: 800,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      marginBottom: 2,
                      lineHeight: 1.2,
                      letterSpacing: '0.02em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    {char.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: isMobile ? 9 : 10,
                      color: '#ffd080',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {char.zone}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 7. Bottom Navigation Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 20 : isTablet ? 26 : 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 12,
          background: 'var(--theme-bottom-bar-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--theme-border)',
          borderRadius: 999,
          padding: isMobile ? '6px 8px 6px 10px' : '10px 12px 10px 16px',
          zIndex: 20,
          width: isMobile ? 'min(92vw, 360px)' : isTablet ? 'clamp(340px, 55vw, 440px)' : 'clamp(290px, 42vw, 420px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          transition: 'background 0.5s ease, border-color 0.5s ease',
        }}
      >
        <button
          onClick={prev}
          style={{
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <ChevronLeft />
        </button>

        {/* Character circular thumbnail */}
        <div
          onClick={() => setSelectedCharacter(current)}
          style={{
            width: isMobile ? 34 : 42,
            height: isMobile ? 34 : 42,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1.5px solid #ff5500',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(255,85,0,0.3)',
          }}
        >
          <img
            src={current.image}
            alt={current.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Member Info */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedCharacter(current)}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 12 : 13.5,
              fontWeight: 800,
              color: 'var(--theme-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              transition: 'color 0.5s ease',
            }}
          >
            {current.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? 9 : 10,
              color: 'var(--theme-text-secondary)',
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.5s ease',
            }}
          >
            {current.department} // {current.zone}
          </div>
        </div>


        {/* Like Button */}
        <button
          onClick={toggleLike}
          style={{
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            borderRadius: '50%',
            background: liked.has(active) ? 'rgba(255,85,0,0.25)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${liked.has(active) ? '#ff5500' : 'rgba(255,255,255,0.12)'}`,
            color: liked.has(active) ? '#ff6a1a' : 'rgba(255,255,255,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          <HeartIcon filled={liked.has(active)} />
        </button>

        {/* Next Button */}
        <button
          onClick={next}
          style={{
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <ChevronRight />
        </button>
      </div>

      {/* 8. 5-Dot Pagination Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          zIndex: 20,
        }}
      >
        {characters.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 22 : 6,
              height: 6,
              borderRadius: 999,
              background: i === active ? 'var(--theme-dot-active)' : 'var(--theme-dot-inactive)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: i === active ? `0 0 10px var(--theme-dot-glow)` : 'none',
              transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
              padding: 0,
            }}
          />
        ))}
      </div>
      {/* ─── End Dot Indicators ─── */}

      </div>
      {/* ─── End UI Wrapper ────────────────────────────────────────────────── */}

      {/* ─── Cinematic Intro / Landing Screen (Before Entering Showroom) ─── */}
      <AnimatePresence>
        {!hasStarted && (
          <IntroScreen onStart={handleStartIntro} />
        )}
      </AnimatePresence>

      {/* ─── Skip Video Button (Active during Full Video Playback) ─── */}
      <AnimatePresence>
        {isPlayingFullVideo && (
          <SkipVideoButton onSkip={handleFinishVideo} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* 9. Full Character Detail View Modal / Overlay */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail
            character={selectedCharacter}
            onBackToShowroom={() => setSelectedCharacter(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── TL Shadow Overlay (Machrus) — visible when active/selected char is a member ─── */}
      {(() => {
        // Priority: selected char (detail view) > carousel active char (dashboard)
        const currentId = selectedCharacter?.id ?? characters[active]?.id;
        const activeTL = currentId ? MEMBER_TO_TL_MAP[currentId] ?? null : null;
        return (
          <TLShadowOverlay
            isVisible={!!activeTL && showUI}
            tl={activeTL}
          />
        );
      })()}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

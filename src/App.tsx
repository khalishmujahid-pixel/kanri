import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { INITIAL_CHARACTERS } from './data/characters';
import type { Character } from './types/character';
import { CharacterDetail } from './components/CharacterDetail';
import { F1GarageHeader } from './components/F1GarageHeader';

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


export default function App() {
  const characters = INITIAL_CHARACTERS;
  const total = characters.length;

  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  // Controls the staggered fade-in of the entire UI after background video loads
  const [showUI, setShowUI] = useState(false);
  // Tracks whether the active card's character video has loaded and is ready to play
  const [activeVideoReady, setActiveVideoReady] = useState(false);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

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

  // Interactive 3D Card Tilt & Parallax Tracking
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, isCenter: boolean) => {
    if (!isCenter || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: Math.round(x * 12 * 10) / 10, y: Math.round(-y * 12 * 10) / 10 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Drag & Touch Swipe handling
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const prev = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setActive(i => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setActive(i => (i + 1) % total);
  }, [total]);

  // Preload character images
  useEffect(() => {
    characters.forEach(char => {
      const img = new Image();
      img.src = char.image;
    });
  }, [characters]);

  // Reset video-ready state each time the active card changes
  // This ensures the photo is shown first, then video cross-fades in once loaded
  useEffect(() => {
    setActiveVideoReady(false);
  }, [active]);

  // Trigger UI fade-in after background video loads.
  // Give it 1.8s of pure video playback first so the user sees the atmosphere.
  // Falls back after 4s in case the video is slow to load on mobile.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (videoLoaded) {
      timer = setTimeout(() => setShowUI(true), 1800);
    } else {
      // Fallback: show UI after 4s regardless, so users are never stuck
      timer = setTimeout(() => setShowUI(true), 4000);
    }
    return () => clearTimeout(timer);
  }, [videoLoaded]);

  // Keyboard navigation
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedCharacter) {
      if (e.key === 'Escape') setSelectedCharacter(null);
      return;
    }
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Enter') setSelectedCharacter(characters[active]);
  }, [prev, next, selectedCharacter, characters, active]);

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

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#070911',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 1. Dynamic Background Video with 83% Opacity as requested */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: videoLoaded ? 0.83 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <source src="/assets/videos/background.mp4" type="video/mp4" />
      </video>

      {/* 2. Frosted/Vignette Tint Overlay to guarantee high contrast & readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(7,9,17,0.3) 0%, rgba(7,9,17,0.72) 75%, rgba(4,6,12,0.92) 100%), linear-gradient(to top, rgba(7,9,17,0.85) 0%, transparent 35%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Subtle center soft glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '65vw',
          height: '45vh',
          background: 'radial-gradient(circle, rgba(255,85,0,0.14) 0%, rgba(255,85,0,0.03) 45%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ─── UI Wrapper — fades in after intro video plays ─────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          opacity: showUI ? 1 : 0,
          transform: showUI ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 1.2s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: showUI ? 'auto' : 'none',
        }}
      >

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
                transform: `translateX(${xPct}%) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
                zIndex: zIdx,
                opacity,
                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                transition: dragging ? 'none' : isCenter && (tilt.x !== 0 || tilt.y !== 0) ? 'transform 0.1s ease-out' : 'all 0.55s cubic-bezier(0.34,1.1,0.64,1)',
                cursor: isCenter ? 'default' : 'pointer',
                boxShadow: isCenter
                  ? '0 35px 80px rgba(0,0,0,0.75), 0 0 0 1.5px rgba(255,85,0,0.45), 0 0 35px rgba(255,85,0,0.25)'
                  : '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                background: '#0e1422',
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
          background: 'rgba(12, 17, 29, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 999,
          padding: isMobile ? '6px 8px 6px 10px' : '10px 12px 10px 16px',
          zIndex: 20,
          width: isMobile ? 'min(92vw, 360px)' : isTablet ? 'clamp(340px, 55vw, 440px)' : 'clamp(290px, 42vw, 420px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
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
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {current.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? 9 : 10,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
              background: i === active ? '#ff5500' : 'rgba(255,255,255,0.25)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: i === active ? '0 0 10px rgba(255,85,0,0.6)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
              padding: 0,
            }}
          />
        ))}
      </div>
      {/* ─── End Dot Indicators ─── */}

      </div>
      {/* ─── End UI Wrapper ────────────────────────────────────────────────── */}

      {/* 9. Full Character Detail View Modal / Overlay */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail
            character={selectedCharacter}
            onBackToShowroom={() => setSelectedCharacter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

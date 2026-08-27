import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  ExternalLink,
  Download,
  Play,
  Pause,
  RotateCcw,
  Grid,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import type { ImprovementSlideItem } from '../../types/improvement';
import { preloadAndCacheImage } from '../../utils/assetCache';

interface ImprovementSlideDeckProps {
  slides: ImprovementSlideItem[];
  projectTitle: string;
  picName: string;
  pptxUrl?: string;
}

export const ImprovementSlideDeck: React.FC<ImprovementSlideDeckProps> = ({
  slides,
  projectTitle,
  picName,
  pptxUrl,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  // Preload all slides into memory on initial mount
  useEffect(() => {
    slides.forEach((s) => {
      preloadAndCacheImage(s.url);
    });
  }, [slides]);

  // Slide 6 Video Player Mode (Kaizen 1 & Kaizen 2 Sequential Dual View with Continuous Loop)
  const [slide6ViewMode, setSlide6ViewMode] = useState<'image' | 'video'>('image');
  const [isPlayingSequential, setIsPlayingSequential] = useState<boolean>(false);
  const [activeVideoTrack, setActiveVideoTrack] = useState<1 | 2 | null>(null);
  const [video1Status, setVideo1Status] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [video2Status, setVideo2Status] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIdx];
  const isSlide6 = currentIdx === 5; // Slide 6

  const goToNext = () => {
    setCurrentIdx((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const goToPrev = () => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  // Keyboard navigation for presentation slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
          e.preventDefault();
        } else if (slide6ViewMode === 'video') {
          // Esc button returns back to Slide 6 presentation view
          setSlide6ViewMode('image');
          stopAllVideos();
          e.preventDefault();
        }
      } else if (e.key >= '1' && e.key <= String(totalSlides)) {
        const targetIdx = parseInt(e.key, 10) - 1;
        if (targetIdx < totalSlides) {
          setCurrentIdx(targetIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, isZoomed, slide6ViewMode]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      goToNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, currentIdx, totalSlides]);

  // Reset video states when switching slides
  useEffect(() => {
    if (!isSlide6) {
      setSlide6ViewMode('image');
      stopAllVideos();
    }
  }, [currentIdx, isSlide6]);

  const stopAllVideos = () => {
    if (video1Ref.current) {
      video1Ref.current.pause();
    }
    if (video2Ref.current) {
      video2Ref.current.pause();
    }
    setIsPlayingSequential(false);
    setActiveVideoTrack(null);
  };

  // Start Sequential Playback: Video 1 -> Video 2 -> Loops continuously while open
  const handleStartSequentialPlay = () => {
    setIsPlayingSequential(true);
    setVideo1Status('playing');
    setVideo2Status('idle');
    setActiveVideoTrack(1);

    if (video2Ref.current) {
      video2Ref.current.pause();
      video2Ref.current.currentTime = 0;
    }

    if (video1Ref.current) {
      video1Ref.current.currentTime = 0;
      video1Ref.current.play().catch(() => {});
    }
  };

  const handlePauseSequential = () => {
    setIsPlayingSequential(false);
    if (activeVideoTrack === 1 && video1Ref.current) {
      video1Ref.current.pause();
      setVideo1Status('idle');
    } else if (activeVideoTrack === 2 && video2Ref.current) {
      video2Ref.current.pause();
      setVideo2Status('idle');
    }
  };

  const handleResetVideos = () => {
    stopAllVideos();
    if (video1Ref.current) {
      video1Ref.current.currentTime = 0;
    }
    if (video2Ref.current) {
      video2Ref.current.currentTime = 0;
    }
    setVideo1Status('idle');
    setVideo2Status('idle');
  };

  // Video 1 Ended Event: Stop at final frame and trigger Video 2
  const handleVideo1Ended = () => {
    setVideo1Status('completed');
    setActiveVideoTrack(2);
    setVideo2Status('playing');

    if (video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play().catch(() => {});
    }
  };

  // Video 2 Ended Event: Automatically loop back to Video 1 while in video mode!
  const handleVideo2Ended = () => {
    setVideo2Status('completed');
    if (slide6ViewMode === 'video') {
      setTimeout(() => {
        if (video1Ref.current) {
          setActiveVideoTrack(1);
          setVideo1Status('playing');
          setVideo2Status('idle');
          video1Ref.current.currentTime = 0;
          video1Ref.current.play().catch(() => {});
        }
      }, 500);
    } else {
      setIsPlayingSequential(false);
      setActiveVideoTrack(null);
    }
  };

  return (
    <div className="slide-deck-container">
      {/* ── Slide Deck Control Header ── */}
      <div className="slide-deck-header">
        <div className="slide-deck-title-box">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="slide-deck-badge">
              <FileText size={13} />
              <span>DOKUMEN PRESENTASI KAIZEN</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">{projectTitle}</span>

            {/* Special Badge on Slide 6 for Available Video Footage */}
            {isSlide6 && (
              <span className="slide-deck-video-available-chip">
                <Video size={12} />
                <span>VIDEO DOKUMENTASI TERSEDIA (PART 1 & 2)</span>
              </span>
            )}
          </div>
          <h2 className="slide-deck-title">{currentSlide.title}</h2>
          {currentSlide.caption && (
            <p className="slide-deck-caption">{currentSlide.caption}</p>
          )}
        </div>

        <div className="slide-deck-actions">
          {/* Slide 6: Switch between Image Slide and Dual Video Player */}
          {isSlide6 && (
            <div className="slide6-view-switcher">
              <button
                type="button"
                className={`slide6-mode-btn ${slide6ViewMode === 'image' ? 'active' : ''}`}
                onClick={() => {
                  setSlide6ViewMode('image');
                  stopAllVideos();
                }}
                title="Tampilkan Slide Dokumen Gambar (Esc)"
              >
                <ImageIcon size={13} />
                <span>SLIDE GAMBAR</span>
              </button>
              <button
                type="button"
                className={`slide6-mode-btn video-mode ${slide6ViewMode === 'video' ? 'active' : ''}`}
                onClick={() => {
                  setSlide6ViewMode('video');
                  handleStartSequentialPlay();
                }}
                title="Tampilkan Video Dokumentasi Aktual Kaizen (Sejajar)"
              >
                <Video size={13} />
                <span>VIDEO AKTUAL AFTER</span>
              </button>
            </div>
          )}

          {/* Download Official PPTX File */}
          {pptxUrl && (
            <a
              href={pptxUrl}
              download="Pilar Kaizen.pptx"
              className="slide-action-btn pptx-btn"
              title="Download Dokumen Presentasi Resmi (Pilar Kaizen.pptx)"
            >
              <Download size={14} />
              <span>DOWNLOAD PPTX</span>
            </a>
          )}

          {/* Autoplay Toggle */}
          <button
            type="button"
            className={`slide-action-btn ${autoPlay ? 'active' : ''}`}
            onClick={() => setAutoPlay(!autoPlay)}
            title={autoPlay ? 'Jeda Slideshow' : 'Putar Slideshow Otomatis'}
          >
            {autoPlay ? <Pause size={14} /> : <Play size={14} />}
            <span>{autoPlay ? 'PAUSE' : 'AUTO PLAY'}</span>
          </button>

          {/* Zoom HD Lightbox */}
          <button
            type="button"
            className="slide-action-btn"
            onClick={() => setIsZoomed(true)}
            title="Perbesar Tampilan HD (Fullscreen)"
          >
            <ZoomIn size={14} />
            <span>ZOOM HD</span>
          </button>

          {/* Download Current Slide Image */}
          <a
            href={currentSlide.url}
            download={`Kaizen_${picName}_Slide_${currentIdx + 1}.png`}
            className="slide-action-btn"
            title="Download gambar slide ini"
          >
            <Download size={14} />
            <span>DOWNLOAD SLIDE</span>
          </a>

          {/* Open New Tab */}
          <a
            href={currentSlide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="slide-action-btn"
            title="Buka gambar asli di tab baru"
          >
            <ExternalLink size={14} />
            <span>TAB BARU</span>
          </a>
        </div>
      </div>

      {/* ── Main Presentation Canvas Screen ── */}
      <div className="slide-main-stage">
        {/* Previous Button */}
        <button
          type="button"
          className="slide-stage-nav-btn prev"
          onClick={goToPrev}
          aria-label="Previous Slide (Arrow Left)"
          title="Slide Sebelumnya (←)"
        >
          <ChevronLeft size={28} />
        </button>

        {/* ── Condition A: Slide 6 Dual Video Player Mode (Sejajar 1 Frame) ── */}
        {isSlide6 && slide6ViewMode === 'video' ? (
          <div className="slide6-dual-video-stage">
            {/* Top Video Stage Bar */}
            <div className="slide6-video-topbar">
              <div className="slide6-video-heading">
                <span className="video-hero-tag">
                  <Sparkles size={13} />
                  <span>DOKUMENTASI VIDEO KAIZEN (HASIL AFTER SECARA KESELURUHAN)</span>
                </span>
                <span className="video-hero-desc">
                  Pemutaran Sekuensial: Video 1 play hingga selesai (freeze di akhir) ➔ Langsung memutar Video 2
                </span>
              </div>

              {/* Master Playback Controls */}
              <div className="slide6-video-controls-hub">
                {!isPlayingSequential ? (
                  <button
                    type="button"
                    className="slide6-master-play-btn"
                    onClick={handleStartSequentialPlay}
                    title="Putar Video 1 lalu lanjut otomatis ke Video 2"
                  >
                    <Play size={15} />
                    <span>PUTAR SEKUENSIAL (1 ➔ 2)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="slide6-master-play-btn pause"
                    onClick={handlePauseSequential}
                    title="Jeda Pemutaran Video"
                  >
                    <Pause size={15} />
                    <span>JEDA (PAUSE)</span>
                  </button>
                )}

                <button
                  type="button"
                  className="slide6-icon-control-btn"
                  onClick={handleResetVideos}
                  title="Putar Ulang dari Awal"
                >
                  <RotateCcw size={14} />
                  <span>RESET</span>
                </button>

                <button
                  type="button"
                  className={`slide6-icon-control-btn ${!isMuted ? 'active' : ''}`}
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isMuted ? 'MUTE' : 'UNMUTE'}</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Unified Video Frame (Grid 2 Kolom Sejajar) */}
            <div className="slide6-dual-video-grid">
              {/* ── Frame 1: Kaizen 1.mp4 ── */}
              <div className={`video-chassis-card ${activeVideoTrack === 1 ? 'active-track' : ''}`}>
                <div className="video-chassis-header">
                  <div className="video-badge-group">
                    <span className="video-index-badge">VIDEO 01</span>
                    <span className="video-title-label">Kaizen 1.mp4 — Proses Aliran OHC (After Part 1)</span>
                  </div>
                  <span className={`video-status-chip ${video1Status}`}>
                    {video1Status === 'playing' && <span className="status-pulse-dot" />}
                    {video1Status === 'completed' && <CheckCircle2 size={12} />}
                    <span>
                      {video1Status === 'idle' && 'STANDBY'}
                      {video1Status === 'playing' && 'SEDANG BERJALAN'}
                      {video1Status === 'completed' && 'SELESAI (STOP DI FRAME AKHIR)'}
                    </span>
                  </span>
                </div>

                <div
                  className="video-player-wrapper"
                  onClick={() => {
                    if (video1Ref.current) {
                      if (video1Ref.current.paused) {
                        video1Ref.current.play();
                        setVideo1Status('playing');
                        setActiveVideoTrack(1);
                      } else {
                        video1Ref.current.pause();
                        setVideo1Status('idle');
                      }
                    }
                  }}
                >
                  <video
                    ref={video1Ref}
                    src="/assets/improvements/Kaizen 1.mp4"
                    className="video-media-element"
                    playsInline
                    muted={isMuted}
                    preload="metadata"
                    onEnded={handleVideo1Ended}
                    onPlay={() => {
                      setVideo1Status('playing');
                      setActiveVideoTrack(1);
                    }}
                    onPause={() => {
                      if (video1Status !== 'completed') {
                        setVideo1Status('idle');
                      }
                    }}
                  />
                  {video1Status === 'idle' && (
                    <div className="video-center-play-overlay">
                      <Play size={28} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Frame 2: Kaizen 2.mp4 ── */}
              <div className={`video-chassis-card ${activeVideoTrack === 2 ? 'active-track' : ''}`}>
                <div className="video-chassis-header">
                  <div className="video-badge-group">
                    <span className="video-index-badge">VIDEO 02</span>
                    <span className="video-title-label">Kaizen 2.mp4 — Hasil Siklus Berkelanjutan (After Part 2)</span>
                  </div>
                  <span className={`video-status-chip ${video2Status}`}>
                    {video2Status === 'playing' && <span className="status-pulse-dot" />}
                    {video2Status === 'completed' && <CheckCircle2 size={12} />}
                    <span>
                      {video2Status === 'idle' && 'STANDBY'}
                      {video2Status === 'playing' && 'SEDANG BERJALAN'}
                      {video2Status === 'completed' && 'SELESAI (STOP DI FRAME AKHIR)'}
                    </span>
                  </span>
                </div>

                <div
                  className="video-player-wrapper"
                  onClick={() => {
                    if (video2Ref.current) {
                      if (video2Ref.current.paused) {
                        video2Ref.current.play();
                        setVideo2Status('playing');
                        setActiveVideoTrack(2);
                      } else {
                        video2Ref.current.pause();
                        setVideo2Status('idle');
                      }
                    }
                  }}
                >
                  <video
                    ref={video2Ref}
                    src="/assets/improvements/Kaizen 2.mp4"
                    className="video-media-element"
                    playsInline
                    muted={isMuted}
                    preload="metadata"
                    onEnded={handleVideo2Ended}
                    onPlay={() => {
                      setVideo2Status('playing');
                      setActiveVideoTrack(2);
                    }}
                    onPause={() => {
                      if (video2Status !== 'completed') {
                        setVideo2Status('idle');
                      }
                    }}
                  />
                  {video2Status === 'idle' && (
                    <div className="video-center-play-overlay">
                      <Play size={28} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Condition B: Standard Slide Image Display ── */
          <div
            className="slide-image-wrapper"
            onClick={() => setIsZoomed(true)}
            title="Klik untuk memperbesar gambar (HD Zoom)"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`slide-${currentIdx}`}
                src={currentSlide.url}
                alt={currentSlide.title}
                className="slide-image-element"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>

            {/* Slide Indicator Overlay Chip */}
            <div className="slide-counter-chip">
              <span className="curr-num">{String(currentIdx + 1).padStart(2, '0')}</span>
              <span className="sep">/</span>
              <span className="total-num">{String(totalSlides).padStart(2, '0')}</span>
            </div>

            {/* If on Slide 6, show a direct floating button to switch to Video Mode */}
            {isSlide6 ? (
              <button
                type="button"
                className="slide-floating-video-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlide6ViewMode('video');
                  handleStartSequentialPlay();
                }}
                title="Buka Video Dokumentasi Aktual Kaizen (Part 1 & 2)"
              >
                <Video size={16} />
                <span>PUTAR DOKUMENTASI VIDEO AKTUAL (KAIZEN 1 & 2)</span>
              </button>
            ) : (
              <div className="slide-hover-zoom-hint">
                <ZoomIn size={16} />
                <span>KLIK UNTUK FULLSCREEN ZOOM</span>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          className="slide-stage-nav-btn next"
          onClick={goToNext}
          aria-label="Next Slide (Arrow Right / Space)"
          title="Slide Selanjutnya (→ / Space)"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* ── Interactive Bottom Thumbnails Strip (1 - N) ── */}
      <div className="slide-thumbnails-strip-wrap">
        <div className="slide-thumbnails-header">
          <div className="strip-label-box">
            <Grid size={13} />
            <span>PILIH SLIDE PRESENTASI ({totalSlides} SLIDES)</span>
          </div>
          <span className="strip-hotkey-hint">Tekan angka 1-{totalSlides} pada keyboard untuk lompat cepat</span>
        </div>

        <div className="slide-thumbnails-grid">
          {slides.map((s, sIdx) => {
            const isSelected = sIdx === currentIdx;
            const isThumbSlide6 = sIdx === 5;

            return (
              <motion.button
                key={s.id}
                type="button"
                className={`slide-thumb-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setCurrentIdx(sIdx)}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.96 }}
                title={`Slide ${sIdx + 1}: ${s.title}`}
              >
                <div className="slide-thumb-image-box">
                  <img src={s.url} alt={s.title} className="slide-thumb-img" loading="lazy" />
                  <span className="slide-thumb-badge">0{sIdx + 1}</span>
                  {isSelected && <span className="slide-thumb-active-dot" />}
                  {isThumbSlide6 && (
                    <span className="slide-thumb-video-icon-tag" title="Tersedia Video">
                      <Video size={10} />
                    </span>
                  )}
                </div>
                <span className="slide-thumb-title-text">{s.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Fullscreen Zoom Presentation (PowerPoint F5 Mode) ── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="slide-zoom-modal-backdrop f5-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (slide6ViewMode === 'video') {
                setSlide6ViewMode('image');
                stopAllVideos();
              } else {
                setIsZoomed(false);
              }
            }}
          >
            <div
              className="slide-zoom-modal-content f5-canvas"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Top Control HUD */}
              <div className="slide-zoom-topbar f5-hud">
                <div className="zoom-meta-info">
                  <div className="flex items-center gap-2">
                    <span className="zoom-title-chip">
                      SLIDE {currentIdx + 1} / {totalSlides}
                    </span>
                    <span className="f5-mode-tag">F5 PRESENTATION MODE</span>
                  </div>
                  <h3 className="zoom-slide-title">{currentSlide.title}</h3>
                </div>

                <div className="zoom-top-actions">
                  {isSlide6 && (
                    <div className="slide6-view-switcher mr-2">
                      <button
                        type="button"
                        className={`slide6-mode-btn ${slide6ViewMode === 'image' ? 'active' : ''}`}
                        onClick={() => {
                          setSlide6ViewMode('image');
                          stopAllVideos();
                        }}
                        title="Tampilkan Slide Dokumen Gambar"
                      >
                        <ImageIcon size={13} />
                        <span>SLIDE GAMBAR</span>
                      </button>
                      <button
                        type="button"
                        className={`slide6-mode-btn video-mode ${slide6ViewMode === 'video' ? 'active' : ''}`}
                        onClick={() => {
                          setSlide6ViewMode('video');
                          handleStartSequentialPlay();
                        }}
                        title="Putar Video Dokumentasi Kaizen"
                      >
                        <Video size={13} />
                        <span>VIDEO AKTUAL</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className="zoom-btn close"
                    onClick={() => {
                      setIsZoomed(false);
                      if (slide6ViewMode === 'video') {
                        setSlide6ViewMode('image');
                        stopAllVideos();
                      }
                    }}
                    title="Keluar dari Fullscreen (Esc)"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Fullscreen Edge-to-Edge Stage */}
              <div className="slide-zoom-stage f5-stage">
                <button
                  type="button"
                  className="zoom-nav-btn prev f5-nav"
                  onClick={goToPrev}
                  title="Sebelumnya (←)"
                >
                  <ChevronLeft size={36} />
                </button>

                {/* If on Slide 6 & Video Mode in Zoom */}
                {isSlide6 && slide6ViewMode === 'video' ? (
                  <div className="zoom-f5-video-container">
                    <div className="zoom-f5-video-topbar">
                      <div className="flex items-center gap-2">
                        <span className="video-hero-tag">
                          <Sparkles size={14} />
                          <span>DOKUMENTASI VIDEO KAIZEN (HASIL AFTER)</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Pemutaran Sekuensial &amp; Looping Berkelanjutan (1 ➔ 2 ➔ 1)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isPlayingSequential ? (
                          <button
                            type="button"
                            className="slide6-master-play-btn"
                            onClick={handleStartSequentialPlay}
                          >
                            <Play size={15} />
                            <span>PUTAR SEKUENSIAL</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="slide6-master-play-btn pause"
                            onClick={handlePauseSequential}
                          >
                            <Pause size={15} />
                            <span>JEDA</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="slide6-icon-control-btn"
                          onClick={handleResetVideos}
                          title="Reset"
                        >
                          <RotateCcw size={14} />
                          <span>RESET</span>
                        </button>
                        <button
                          type="button"
                          className={`slide6-icon-control-btn ${!isMuted ? 'active' : ''}`}
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span>{isMuted ? 'MUTE' : 'UNMUTE'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="zoom-f5-video-grid">
                      {/* Video 1 */}
                      <div className={`video-chassis-card ${activeVideoTrack === 1 ? 'active-track' : ''}`}>
                        <div className="video-chassis-header">
                          <div className="video-badge-group">
                            <span className="video-index-badge">VIDEO 01</span>
                            <span className="video-title-label">Kaizen 1.mp4 — Proses Aliran OHC</span>
                          </div>
                          <span className={`video-status-chip ${video1Status}`}>
                            {video1Status === 'playing' && <span className="status-pulse-dot" />}
                            {video1Status === 'completed' && <CheckCircle2 size={12} />}
                            <span>
                              {video1Status === 'idle' && 'STANDBY'}
                              {video1Status === 'playing' && 'SEDANG BERJALAN'}
                              {video1Status === 'completed' && 'SELESAI'}
                            </span>
                          </span>
                        </div>
                        <div
                          className="video-player-wrapper f5-player"
                          onClick={() => {
                            if (video1Ref.current) {
                              if (video1Ref.current.paused) {
                                video1Ref.current.play();
                                setVideo1Status('playing');
                                setActiveVideoTrack(1);
                              } else {
                                video1Ref.current.pause();
                                setVideo1Status('idle');
                              }
                            }
                          }}
                        >
                          <video
                            ref={video1Ref}
                            src="/assets/improvements/Kaizen 1.mp4"
                            className="video-media-element"
                            playsInline
                            muted={isMuted}
                            preload="metadata"
                            onEnded={handleVideo1Ended}
                            onPlay={() => {
                              setVideo1Status('playing');
                              setActiveVideoTrack(1);
                            }}
                            onPause={() => {
                              if (video1Status !== 'completed') {
                                setVideo1Status('idle');
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Video 2 */}
                      <div className={`video-chassis-card ${activeVideoTrack === 2 ? 'active-track' : ''}`}>
                        <div className="video-chassis-header">
                          <div className="video-badge-group">
                            <span className="video-index-badge">VIDEO 02</span>
                            <span className="video-title-label">Kaizen 2.mp4 — Siklus Berkelanjutan</span>
                          </div>
                          <span className={`video-status-chip ${video2Status}`}>
                            {video2Status === 'playing' && <span className="status-pulse-dot" />}
                            {video2Status === 'completed' && <CheckCircle2 size={12} />}
                            <span>
                              {video2Status === 'idle' && 'STANDBY'}
                              {video2Status === 'playing' && 'SEDANG BERJALAN'}
                              {video2Status === 'completed' && 'SELESAI'}
                            </span>
                          </span>
                        </div>
                        <div
                          className="video-player-wrapper f5-player"
                          onClick={() => {
                            if (video2Ref.current) {
                              if (video2Ref.current.paused) {
                                video2Ref.current.play();
                                setVideo2Status('playing');
                                setActiveVideoTrack(2);
                              } else {
                                video2Ref.current.pause();
                                setVideo2Status('idle');
                              }
                            }
                          }}
                        >
                          <video
                            ref={video2Ref}
                            src="/assets/improvements/Kaizen 2.mp4"
                            className="video-media-element"
                            playsInline
                            muted={isMuted}
                            preload="metadata"
                            onEnded={handleVideo2Ended}
                            onPlay={() => {
                              setVideo2Status('playing');
                              setActiveVideoTrack(2);
                            }}
                            onPause={() => {
                              if (video2Status !== 'completed') {
                                setVideo2Status('idle');
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Image in Zoom F5 */
                  <div className="f5-image-wrapper">
                    <img
                      src={currentSlide.url}
                      alt={currentSlide.title}
                      className="slide-zoom-img f5-img"
                    />

                    {/* Floating Video Button in Fullscreen Mode on Slide 6 */}
                    {isSlide6 && (
                      <button
                        type="button"
                        className="slide-floating-video-btn f5-floating-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlide6ViewMode('video');
                          handleStartSequentialPlay();
                        }}
                        title="Putar Video Dokumentasi Kaizen 1 & 2"
                      >
                        <Video size={18} />
                        <span>PUTAR DOKUMENTASI VIDEO AKTUAL (KAIZEN 1 & 2)</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="zoom-nav-btn next f5-nav"
                  onClick={goToNext}
                  title="Selanjutnya (→ / Space)"
                >
                  <ChevronRight size={36} />
                </button>
              </div>

              {/* Floating Bottom HUD */}
              <div className="slide-zoom-footer f5-bottom-hud">
                <div className="zoom-dots">
                  {slides.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`zoom-dot ${dotIdx === currentIdx ? 'active' : ''}`}
                      onClick={() => setCurrentIdx(dotIdx)}
                    />
                  ))}
                </div>
                <span className="zoom-hint-text">
                  Gunakan tombol panah ← / → atau Space | Tekan Esc untuk kembali
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Layers,
  FileText,
  Video,
  Image as ImageIcon,
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

  // Slide 6 Video Player Mode (Unified Single Video: Video Kaizen Pilar with Continuous Loop)
  const [slide6ViewMode, setSlide6ViewMode] = useState<'image' | 'video'>('image');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zoomVideoRef = useRef<HTMLVideoElement | null>(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIdx];
  const isSlide6 = currentIdx === 5; // Slide 6

  const goToNext = () => {
    setCurrentIdx((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const goToPrev = () => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  // Stop video playback safely
  const stopAllVideos = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (zoomVideoRef.current) {
      zoomVideoRef.current.pause();
    }
    setIsVideoPlaying(false);
  };

  // Direct Play Handler: Immediately starts video playback on click
  const handleDirectPlayVideo = () => {
    setSlide6ViewMode('video');
    setIsVideoPlaying(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      if (zoomVideoRef.current) {
        zoomVideoRef.current.currentTime = 0;
        zoomVideoRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const handleTogglePlay = () => {
    const activeRef = isZoomed ? zoomVideoRef : videoRef;
    if (activeRef.current) {
      if (activeRef.current.paused) {
        activeRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      } else {
        activeRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleResetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (zoomVideoRef.current) {
      zoomVideoRef.current.currentTime = 0;
      zoomVideoRef.current.play().catch(() => {});
    }
    setIsVideoPlaying(true);
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
        e.preventDefault();
        // Priority 1: If in video mode, always go back to slide image first (never exit presentation)
        if (slide6ViewMode === 'video') {
          setSlide6ViewMode('image');
          stopAllVideos();
        } else if (isZoomed) {
          // Priority 2: Only close zoom if NOT in video mode
          setIsZoomed(false);
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
                <span>VIDEO DOKUMENTASI TERSEDIA (LOOP AKTIF)</span>
              </span>
            )}
          </div>
          <h2 className="slide-deck-title">{currentSlide.title}</h2>
          {currentSlide.caption && (
            <p className="slide-deck-caption">{currentSlide.caption}</p>
          )}
        </div>

        <div className="slide-deck-actions">
          {/* Slide 6: Switch between Image Slide and Single Video Player */}
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
                  handleDirectPlayVideo();
                }}
                title="Putar Video Dokumentasi Kaizen Langsung"
              >
                <Video size={13} />
                <span>VIDEO AKTUAL</span>
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

        {/* ── Condition A: Slide 6 Single Unified Video Player Mode (Full Frame Looping) ── */}
        {isSlide6 && slide6ViewMode === 'video' ? (
          <div className="slide6-single-video-stage">
            {/* Top Video Stage Bar */}
            <div className="slide6-video-topbar">
              <div className="slide6-video-heading">
                <span className="video-hero-tag">
                  <Sparkles size={13} />
                  <span>DOKUMENTASI VIDEO KAIZEN (HASIL AFTER SECARA KESELURUHAN)</span>
                </span>
                <span className="video-hero-desc">
                  Video Kaizen Pilar.mp4 — Hasil Optimasi Aliran OHC (Pemutaran Looping Otomatis)
                </span>
              </div>

              {/* Master Playback Controls */}
              <div className="slide6-video-controls-hub">
                <button
                  type="button"
                  className={`slide6-master-play-btn ${isVideoPlaying ? 'pause' : ''}`}
                  onClick={handleTogglePlay}
                  title={isVideoPlaying ? 'Jeda Video' : 'Putar Video'}
                >
                  {isVideoPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isVideoPlaying ? 'JEDA (PAUSE)' : 'PUTAR VIDEO'}</span>
                </button>

                <button
                  type="button"
                  className="slide6-icon-control-btn"
                  onClick={handleResetVideo}
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

            {/* Unified Single Video Frame (Full Canvas) */}
            <div className="slide6-single-video-player-wrapper" onClick={handleTogglePlay}>
              <video
                ref={videoRef}
                src="/assets/videos/Video Kaizen Pilar.mp4"
                className="video-media-element single-player"
                playsInline
                autoPlay
                loop
                muted={isMuted}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <div className="video-center-play-overlay">
                  <Play size={48} />
                </div>
              )}
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

            {/* If on Slide 6, show direct floating button to switch & immediately play video */}
            {isSlide6 ? (
              <button
                type="button"
                className="slide-floating-video-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectPlayVideo();
                }}
                title="Buka & Putar Video Dokumentasi Kaizen Langsung"
              >
                <Play size={16} />
                <span>PUTAR DOKUMENTASI VIDEO KAIZEN (DIRECT PLAY)</span>
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
          <div className="flex items-center gap-2">
            <Layers size={13} />
            <span className="font-mono text-[11px] font-bold text-slate-300">
              NAVIGASI DOKUMEN SLIDE ({currentIdx + 1}/{totalSlides})
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Klik thumbnail atau gunakan tombol keyboard ← / →
          </span>
        </div>

        <div className="slide-thumbnails-grid">
          {slides.map((s, idx) => {
            const isActive = idx === currentIdx;
            const isSlide6Thumb = idx === 5;
            return (
              <div
                key={s.id || idx}
                className={`slide-thumb-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIdx(idx);
                  if (idx !== 5) {
                    setSlide6ViewMode('image');
                    stopAllVideos();
                  }
                }}
                title={`Slide ${idx + 1}: ${s.title}`}
              >
                <div className="slide-thumb-img-wrapper">
                  <img
                    src={s.url}
                    alt={s.title}
                    className="slide-thumb-img"
                    loading="lazy"
                  />
                  <div className="slide-thumb-index-tag">{idx + 1}</div>
                  {isSlide6Thumb && (
                    <div className="slide-thumb-video-icon-tag" title="Tersedia Video Footage">
                      <Video size={10} />
                    </div>
                  )}
                </div>
                <div className="slide-thumb-info">
                  <span className="slide-thumb-num">SLIDE {idx + 1}</span>
                  <span className="slide-thumb-title">{s.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          FULLSCREEN ZOOM LIGHTBOX MODAL (PORTAL TO DOCUMENT.BODY)
          ═════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isZoomed && (
              <motion.div
                className="slide-zoom-modal-backdrop"
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
                  className="slide-zoom-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Control Bar */}
                  <div className="slide-zoom-topbar">
                    <div className="zoom-meta-info">
                      <div className="flex items-center gap-2">
                        <span className="zoom-title-chip">
                          SLIDE {currentIdx + 1} / {totalSlides}
                        </span>
                        <span className="f5-mode-tag">PRESENTATION HD</span>
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
                            className={`slide6-mode-btn ${slide6ViewMode === 'video' ? 'active' : ''}`}
                            onClick={() => {
                              handleDirectPlayVideo();
                            }}
                            title="Putar Video Dokumentasi Kaizen Langsung"
                          >
                            <Video size={13} />
                            <span>VIDEO AKTUAL</span>
                          </button>
                        </div>
                      )}

                      {pptxUrl && (
                        <a
                          href={pptxUrl}
                          download="Pilar Kaizen.pptx"
                          className="zoom-btn"
                          title="Download Dokumen PPTX"
                        >
                          <Download size={15} />
                        </a>
                      )}

                      <button
                        type="button"
                        className="zoom-btn close"
                        onClick={() => {
                          if (slide6ViewMode === 'video') {
                            setSlide6ViewMode('image');
                            stopAllVideos();
                          } else {
                            setIsZoomed(false);
                          }
                        }}
                        title="Tutup (Esc)"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stage Presentation Frame */}
                  <div className="slide-zoom-stage">
                    <button
                      type="button"
                      className="zoom-nav-btn prev"
                      onClick={goToPrev}
                      title="Sebelumnya (←)"
                    >
                      <ChevronLeft size={28} />
                    </button>

                    {isSlide6 && slide6ViewMode === 'video' ? (
                      /* Single Unified Video Player inside Zoom */
                      <div className="zoom-f5-video-container">
                        <div className="zoom-f5-video-topbar">
                          <div className="flex items-center gap-2">
                            <span className="video-status-chip playing">
                              <span className="status-pulse-dot" />
                              <span>{isVideoPlaying ? 'MEMUTAR: VIDEO KAIZEN PILAR (LOOP AKTIF)' : 'VIDEO DIJEDA'}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="video-ctrl-btn play"
                              onClick={handleTogglePlay}
                            >
                              {isVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
                              <span>{isVideoPlaying ? 'JEDA' : 'PUTAR'}</span>
                            </button>
                            <button
                              type="button"
                              className="video-ctrl-btn reset"
                              onClick={handleResetVideo}
                            >
                              <RotateCcw size={12} />
                              <span>RESET</span>
                            </button>
                            <button
                              type="button"
                              className="video-ctrl-btn mute"
                              onClick={() => setIsMuted(!isMuted)}
                            >
                              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="zoom-f5-single-video-wrapper" onClick={handleTogglePlay}>
                          <video
                            ref={zoomVideoRef}
                            src="/assets/videos/Video Kaizen Pilar.mp4"
                            className="video-element"
                            playsInline
                            autoPlay
                            loop
                            muted={isMuted}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                          />
                          {!isVideoPlaying && (
                            <div className="video-center-play-overlay">
                              <Play size={64} />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Standard Clean PPTX Image Frame */
                      <div className="f5-image-wrapper">
                        <img
                          src={currentSlide.url}
                          alt={currentSlide.title}
                          className="slide-zoom-img"
                        />

                        {/* Floating Video Button in Fullscreen Mode on Slide 6 */}
                        {isSlide6 && (
                          <button
                            type="button"
                            className="slide-floating-video-btn f5-floating-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectPlayVideo();
                            }}
                            title="Putar Video Dokumentasi Kaizen Langsung"
                          >
                            <Play size={16} />
                            <span>PUTAR DOKUMENTASI VIDEO KAIZEN (DIRECT PLAY)</span>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      className="zoom-nav-btn next"
                      onClick={goToNext}
                      title="Selanjutnya (→ / Space)"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="slide-zoom-footer">
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
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

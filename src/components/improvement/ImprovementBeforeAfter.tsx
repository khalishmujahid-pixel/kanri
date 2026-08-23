import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Maximize2,
  ShieldCheck,
  Zap,
  ZoomIn,
  X,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import type { BeforeAfterAspect } from '../../types/improvement';

interface ImprovementBeforeAfterProps {
  aspects: BeforeAfterAspect[];
}

export const ImprovementBeforeAfter: React.FC<ImprovementBeforeAfterProps> = ({ aspects }) => {
  const [selectedAspectIdx, setSelectedAspectIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'both' | 'before' | 'after'>('both');
  const [beforeImageIdx, setBeforeImageIdx] = useState<number>(0);
  const [afterImageIdx, setAfterImageIdx] = useState<number>(0);
  const [lightboxData, setLightboxData] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Escape key handler specifically for Before/After lightbox
  useEffect(() => {
    if (!lightboxData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setLightboxData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [lightboxData]);

  const currentAspect = aspects[selectedAspectIdx] ?? aspects[0];

  // Active images
  const beforeGallery = currentAspect.before.galleryImages ?? (currentAspect.before.imageUrl ? [{
    url: currentAspect.before.imageUrl,
    title: `BEFORE: ${currentAspect.before.title}`,
    caption: currentAspect.before.imageCaption,
    typeBadge: 'BEFORE PHOTO'
  }] : []);

  const afterGallery = currentAspect.after.galleryImages ?? (currentAspect.after.imageUrl ? [{
    url: currentAspect.after.imageUrl,
    title: `AFTER: ${currentAspect.after.title}`,
    caption: currentAspect.after.imageCaption,
    typeBadge: 'AFTER PHOTO'
  }] : []);

  const activeBeforeImg = beforeGallery[beforeImageIdx] ?? beforeGallery[0];
  const activeAfterImg = afterGallery[afterImageIdx] ?? afterGallery[0];

  return (
    <>
      <motion.div
        className="imp-beforeafter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28 }}
      >
        {/* ── Aspect Selector (if more than 1) ── */}
        {aspects.length > 1 && (
          <div className="imp-aspect-tabs-bar">
            <span className="aspect-tabs-label">KATEGORI ASPEK:</span>
            <div className="aspect-tabs-list">
              {aspects.map((aspect, idx) => (
                <button
                  key={aspect.id}
                  type="button"
                  className={`aspect-tab-btn ${idx === selectedAspectIdx ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAspectIdx(idx);
                    setBeforeImageIdx(0);
                    setAfterImageIdx(0);
                  }}
                >
                  <span className="aspect-btn-num">{idx + 1}</span>
                  <span>{aspect.aspectTitle}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Kadai Target Direction ── */}
        <div className="imp-kadai-banner">
          <div className="kadai-badge">
            <Zap size={14} />
            <span>KADAI</span>
          </div>
          <h4 className="kadai-title">{currentAspect.kadai.replace(/^KADAI\s*→\s*/i, '')}</h4>
        </div>

        {/* ── View Toggle Toolbar ── */}
        <div className="imp-ba-toolbar">
          <div className="ba-toggle-group">
            <button
              type="button"
              className={`ba-toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              <Maximize2 size={13} />
              <span>SIDE-BY-SIDE</span>
            </button>
            <button
              type="button"
              className={`ba-toggle-btn before ${viewMode === 'before' ? 'active' : ''}`}
              onClick={() => setViewMode('before')}
            >
              <AlertTriangle size={13} />
              <span>BEFORE ONLY</span>
            </button>
            <button
              type="button"
              className={`ba-toggle-btn after ${viewMode === 'after' ? 'active' : ''}`}
              onClick={() => setViewMode('after')}
            >
              <Lightbulb size={13} />
              <span>AFTER ONLY</span>
            </button>
          </div>
        </div>

        {/* ── Before vs After Split Grid ── */}
        <div className={`imp-ba-grid mode-${viewMode}`}>
          {/* BEFORE CARD */}
          {(viewMode === 'both' || viewMode === 'before') && (
            <motion.div
              className="imp-ba-card before-card"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ba-card-header">
                <div className="ba-pill before">
                  <AlertTriangle size={13} />
                  <span>BEFORE</span>
                </div>
                <span className="ba-warning-tag">{currentAspect.before.warningTag}</span>
              </div>

              {/* ── Image Preview or Schematic for Before ── */}
              {activeBeforeImg ? (
                <div className="ba-image-preview-card before">
                  {/* Multi-image switcher if more than 1 */}
                  {beforeGallery.length > 1 && (
                    <div className="ba-gallery-tabs">
                      {beforeGallery.map((img, gIdx) => (
                        <button
                          key={gIdx}
                          type="button"
                          className={`ba-gallery-tab-btn before ${gIdx === beforeImageIdx ? 'active' : ''}`}
                          onClick={() => setBeforeImageIdx(gIdx)}
                        >
                          <Layers size={11} />
                          <span>{img.typeBadge || `Foto ${gIdx + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="ba-image-thumb-btn"
                    onClick={() =>
                      setLightboxData({
                        url: activeBeforeImg.url,
                        title: activeBeforeImg.title || `BEFORE: ${currentAspect.before.title}`,
                        caption: activeBeforeImg.caption || currentAspect.before.imageCaption,
                      })
                    }
                    title="Klik untuk membuka gambar resolusi penuh (Zoom HD)"
                  >
                    <img
                      src={activeBeforeImg.url}
                      alt={activeBeforeImg.title || currentAspect.before.title}
                      className="ba-image-thumb"
                    />
                    <div className="ba-image-hover-overlay">
                      <ZoomIn size={22} className="zoom-icon-glow" />
                      <span>KLIK UNTUK ZOOM HD</span>
                    </div>
                  </button>
                  {(activeBeforeImg.caption || currentAspect.before.imageCaption) && (
                    <div className="ba-image-caption-bar before">
                      <ImageIcon size={12} />
                      <span>{activeBeforeImg.caption || currentAspect.before.imageCaption}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ba-schematic-wrap before">
                  {currentAspect.before.illustrationType === 'cover_deflector' && (
                    <div className="ba-schematic-proximity before">
                      <div className="prox-head-diagram unshielded">
                        <div className="prox-sensor-barrel">
                          <span className="barrel-label">PROXIMITY SENSOR M12/M18</span>
                          <div className="prox-sensing-face dirty">
                            <span className="face-tag">SENSING FACE TERBUKA</span>
                            <span className="spatter-badge">TERTUTUP GRAM SPATTER</span>
                          </div>
                        </div>
                        <div className="spatter-fall-zone">
                          <span className="fall-line">PERCIKAN SPATTER LAS</span>
                        </div>
                      </div>
                      <div className="prox-status-banner danger">
                        <span className="status-indicator-dot red" />
                        <span>FALSE INDUCTION: SENSOR AKTIF TERUS (FREEZE CONTINUOUS ON)</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.before.illustrationType === 'robot_position' && (
                    <div className="ba-schematic-robot before">
                      <div className="schematic-bordesk-line">
                        <span className="bordesk-label">POSISI BORDESK</span>
                      </div>
                      <div className="schematic-robot-gun under">
                        <span className="gun-label">POSISI GUN DI BAWAH BORDESK</span>
                        <span className="collision-warning">RISIKO TABRAKAN SAAT JUMP</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.before.illustrationType === 'ergonomics' && (
                    <div className="ba-schematic-ergo before">
                      <div className="ergo-posture-box poor">
                        <span className="ergo-status-badge">TIDAK ERGONOMIS</span>
                        <span className="ergo-desc">Teknisi membungkuk di bawah bordesk untuk mengganti cup tip robot</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.before.illustrationType === 'inverter_alarm' && (
                    <div className="ba-schematic-inverter before">
                      <div className="inverter-telemetry-box offline">
                        <div className="telemetry-row">
                          <span className="param-key">P257 (Control Cap)</span>
                          <span className="param-val danger">0% (DROPPED)</span>
                        </div>
                        <div className="telemetry-status-tag">HMI: TIDAK ADA VISUALISASI ALARM DINI</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 className="ba-card-title">{currentAspect.before.title}</h4>
              <p className="ba-card-desc">{currentAspect.before.description}</p>

              <ul className="ba-bullet-list before">
                {currentAspect.before.bulletPoints.map((point, pIdx) => (
                  <li key={pIdx}>
                    <AlertTriangle size={13} className="bullet-icon-before" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* AFTER CARD */}
          {(viewMode === 'both' || viewMode === 'after') && (
            <motion.div
              className="imp-ba-card after-card"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ba-card-header">
                <div className="ba-pill after">
                  <Lightbulb size={13} />
                  <span>AFTER</span>
                </div>
                <span className="ba-solution-tag">{currentAspect.after.solutionTag}</span>
              </div>

              {/* ── Image Preview or Schematic for After ── */}
              {activeAfterImg ? (
                <div className="ba-image-preview-card after">
                  {/* Multi-image switcher for After (e.g. 1. Modifikasi HMI, 2. Modifikasi PLC) */}
                  {afterGallery.length > 1 && (
                    <div className="ba-gallery-tabs">
                      {afterGallery.map((img, gIdx) => (
                        <button
                          key={gIdx}
                          type="button"
                          className={`ba-gallery-tab-btn after ${gIdx === afterImageIdx ? 'active' : ''}`}
                          onClick={() => setAfterImageIdx(gIdx)}
                        >
                          <Layers size={11} />
                          <span>{img.typeBadge || `Foto ${gIdx + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="ba-image-thumb-btn"
                    onClick={() =>
                      setLightboxData({
                        url: activeAfterImg.url,
                        title: activeAfterImg.title || `AFTER: ${currentAspect.after.title}`,
                        caption: activeAfterImg.caption || currentAspect.after.imageCaption,
                      })
                    }
                    title="Klik untuk membuka gambar resolusi penuh (Zoom HD)"
                  >
                    <img
                      src={activeAfterImg.url}
                      alt={activeAfterImg.title || currentAspect.after.title}
                      className="ba-image-thumb"
                    />
                    <div className="ba-image-hover-overlay after">
                      <ZoomIn size={22} className="zoom-icon-glow" />
                      <span>KLIK UNTUK ZOOM HD</span>
                    </div>
                  </button>
                  {(activeAfterImg.caption || currentAspect.after.imageCaption) && (
                    <div className="ba-image-caption-bar after">
                      <ImageIcon size={12} />
                      <span>{activeAfterImg.caption || currentAspect.after.imageCaption}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ba-schematic-wrap after">
                  {currentAspect.after.illustrationType === 'cover_deflector' && (
                    <div className="ba-schematic-proximity after">
                      <div className="prox-head-diagram shielded">
                        <div className="prox-deflector-cover">
                          <span className="roof-label">COVER DEFLECTOR SUDUT ANTI-STICK</span>
                          <span className="deflect-badge">SPATTER TERPANTUL 100%</span>
                        </div>
                        <div className="prox-sensor-barrel protected">
                          <span className="barrel-label">PROXIMITY SENSOR</span>
                          <div className="prox-sensing-face clean">
                            <span className="face-tag">SENSING FACE BERSIH</span>
                          </div>
                        </div>
                      </div>
                      <div className="prox-status-banner success">
                        <span className="status-indicator-dot green" />
                        <span>100% RELIABLE: HANYA AKTIF SAAT BENDA KERJA MASUK // ZERO FALSE SIGNAL</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.after.illustrationType === 'robot_position' && (
                    <div className="ba-schematic-robot after">
                      <div className="schematic-robot-gun above">
                        <span className="gun-label">POSISI GUN +300mm (DI ATAS BORDESK)</span>
                        <span className="clearance-safe">CLEARANCE AMAN 100%</span>
                      </div>
                      <div className="schematic-bordesk-line">
                        <span className="bordesk-label">POSISI BORDESK</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.after.illustrationType === 'ergonomics' && (
                    <div className="ba-schematic-ergo after">
                      <div className="ergo-posture-box good">
                        <span className="ergo-status-badge success">100% ERGONOMIS</span>
                        <span className="ergo-desc">Teknisi berdiri tegak sejajar dada saat pergantian cup tip consumable</span>
                      </div>
                    </div>
                  )}

                  {currentAspect.after.illustrationType === 'inverter_alarm' && (
                    <div className="ba-schematic-inverter after">
                      <div className="inverter-telemetry-box online">
                        <div className="telemetry-row">
                          <span className="param-key">P256 / P257 / P258</span>
                          <span className="param-val success">LIVE HMI &amp; PLC MAPPED</span>
                        </div>
                        <div className="telemetry-status-tag success">EARLY WARNING POPUP ACTIVE</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 className="ba-card-title">{currentAspect.after.title}</h4>
              <p className="ba-card-desc">{currentAspect.after.description}</p>

              <ul className="ba-bullet-list after">
                {currentAspect.after.bulletPoints.map((point, pIdx) => (
                  <li key={pIdx}>
                    <CheckCircle2 size={13} className="bullet-icon-after" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* ── Result & Impact Metrics ── */}
        <div className="imp-results-card">
          <div className="results-header">
            <ShieldCheck size={16} className="text-success" />
            <span className="results-title">HASIL EVALUASI &amp; DAMPAK PERBAIKAN (RESULT)</span>
          </div>

          <div className="results-items-grid">
            {currentAspect.results.map((res, rIdx) => (
              <div key={rIdx} className="result-item-pill">
                <div className="result-ok-circle">
                  <span>OK</span>
                </div>
                <span className="result-text">{res.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Yokoten Highlight Pill ── */}
        {currentAspect.yokotenNote && (
          <div className="imp-aspect-yokoten-bar">
            <Share2 size={14} className="yokoten-star-icon" />
            <span>{currentAspect.yokotenNote}</span>
          </div>
        )}
      </motion.div>

      {/* ── Fullscreen Interactive Image Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxData && (
          <motion.div
            className="imp-image-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxData(null)}
          >
            <motion.div
              className="imp-image-lightbox-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-modal-header">
                <div className="lightbox-title-wrap">
                  <h3 className="lightbox-modal-title">{lightboxData.title}</h3>
                  {lightboxData.caption && (
                    <p className="lightbox-modal-caption">{lightboxData.caption}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setLightboxData(null)}
                  title="Tutup (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="lightbox-modal-image-wrap">
                <img
                  src={lightboxData.url}
                  alt={lightboxData.title}
                  className="lightbox-full-image"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

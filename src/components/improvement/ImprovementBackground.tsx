import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  GitCommit,
  CheckCircle,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  ZoomIn,
  X,
  Maximize2,
  MapPin,
  Eye,
  Sliders
} from 'lucide-react';
import type { BackgroundData } from '../../types/improvement';

interface ImprovementBackgroundProps {
  data: BackgroundData;
}

export const ImprovementBackground: React.FC<ImprovementBackgroundProps> = ({ data }) => {
  const [isBlueprintMode, setIsBlueprintMode] = useState<boolean>(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<string>('st5');

  // Escape key handler specifically for CAD lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isLightboxOpen]);

  return (
    <>
      <motion.div
        className="imp-background-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28 }}
      >
        {/* ── 1. Real CAD Engineering Layout & Station Schematic ── */}
        <div className="imp-card imp-layout-card">
          <div className="imp-card-header">
            <div className="imp-card-header-left">
              <Layers size={16} className="imp-icon-accent" />
              <span className="imp-card-title">{data.layoutTitle}</span>
            </div>
            <div className="imp-layout-controls">
              {data.layoutImageUrl && (
                <div className="imp-layout-toggle-group">
                  <button
                    type="button"
                    className={`imp-layout-toggle-btn ${isBlueprintMode ? 'active' : ''}`}
                    onClick={() => setIsBlueprintMode(true)}
                    title="Tampilan High-Contrast Blueprint Neon"
                  >
                    <Sliders size={12} />
                    <span>DARK BLUEPRINT</span>
                  </button>
                  <button
                    type="button"
                    className={`imp-layout-toggle-btn ${!isBlueprintMode ? 'active' : ''}`}
                    onClick={() => setIsBlueprintMode(false)}
                    title="Tampilan Original CAD Hi-Contrast"
                  >
                    <Eye size={12} />
                    <span>ORIGINAL CAD</span>
                  </button>
                </div>
              )}
              {data.activeEquipmentName && (
                <span className="imp-target-pill">
                  TARGET: <strong>{data.activeEquipmentName}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Real CAD Layout Map Display */}
          {data.layoutImageUrl && (
            <div className="imp-real-cad-wrapper">
              <div
                className={`imp-cad-image-container ${isBlueprintMode ? 'blueprint-mode' : 'original-mode'}`}
                onClick={() => setIsLightboxOpen(true)}
                title="Klik untuk membuka peta layout CAD resolusi penuh (Zoom HD)"
              >
                {/* Visual Grid Scanlines */}
                <div className="cad-grid-overlay" />

                {/* Real CAD Image */}
                <img
                  src={data.layoutImageUrl}
                  alt="Real CAD Mapping UBF Line"
                  className="imp-cad-real-image"
                />

                {/* HUD Interactive Station Radar Target Badges on CAD */}
                <div className="cad-hud-station-marker st5-marker">
                  <div className="hud-radar-pulse occurrence" />
                  <div className="hud-marker-badge occurrence">
                    <AlertTriangle size={11} />
                    <span>ST#5 UBF (GBL)</span>
                    <small>OCCURRENCE POINT</small>
                  </div>
                </div>

                <div className="cad-hud-station-marker st2-marker">
                  <div className="hud-radar-pulse yokoten" />
                  <div className="hud-marker-badge yokoten">
                    <CheckCircle size={11} />
                    <span>ST#2 UBF</span>
                    <small>YOKOTEN TARGET</small>
                  </div>
                </div>

                {/* Hover Click-to-Zoom Callout */}
                <div className="cad-zoom-hover-hint">
                  <ZoomIn size={18} className="zoom-hint-icon" />
                  <span>KLIK UNTUK ZOOM HD LAYOUT TEKNIKAL</span>
                </div>
              </div>

              {/* Caption Banner below CAD */}
              {data.layoutImageCaption && (
                <div className="cad-layout-caption-bar">
                  <MapPin size={13} className="caption-pin-icon" />
                  <span>{data.layoutImageCaption}</span>
                  <button
                    type="button"
                    className="cad-open-hd-btn"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Maximize2 size={12} />
                    <span>FULLSCREEN CAD</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Station Strip Nodes */}
          <div className="imp-stations-strip">
            {data.stations.map((st) => (
              <div
                key={st.id}
                className={`imp-station-node ${st.isHighlight ? 'is-highlighted' : ''} ${st.status ? `status-${st.status}` : ''} ${selectedStation === st.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedStation(st.id)}
              >
                <div className="imp-station-dot" />
                <span className="imp-station-name">{st.name}</span>
                {st.details && (
                  <span className="imp-station-detail-tag">{st.details}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Problem Statement ── */}
        <div className="imp-problem-banner">
          <div className="imp-problem-icon-wrap">
            <AlertTriangle size={22} className="imp-problem-icon" />
          </div>
          <div className="imp-problem-text">
            <span className="imp-problem-tag">PROBLEM IDENTIFIED</span>
            <h4 className="imp-problem-title">{data.problemTitle}</h4>
            <p className="imp-problem-desc">{data.problemDescription}</p>
          </div>
        </div>

        {/* ── 3. Flowchart Comparison (Standard vs Actual) — Robot Kaizen ── */}
        {data.standardFlow && data.actualFlow && (
          <div className="imp-card imp-flowchart-card">
            <div className="imp-card-header">
              <div className="imp-card-header-left">
                <GitCommit size={16} className="imp-icon-accent" />
                <span className="imp-card-title">ANALISIS PENYEBAB: STANDARD VS ACTUAL FLOW</span>
              </div>
            </div>

            <div className="imp-flow-comparison-grid">
              {/* Standard Flow */}
              <div className="imp-flow-column standard">
                <div className="imp-flow-col-header">
                  <CheckCircle size={14} className="text-success" />
                  <span>STANDARD FLOW</span>
                </div>
                <div className="imp-flow-steps">
                  {data.standardFlow.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="imp-flow-step-node standard">
                        <span className="step-num">{idx + 1}</span>
                        <span className="step-text">{step.step}</span>
                      </div>
                      {idx < data.standardFlow!.length - 1 && (
                        <ArrowRight size={14} className="imp-flow-arrow" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Actual Flow */}
              <div className="imp-flow-column actual">
                <div className="imp-flow-col-header">
                  <XCircle size={14} className="text-danger" />
                  <span>ACTUAL FLOW (OCCURRENCE)</span>
                </div>
                <div className="imp-flow-steps">
                  {data.actualFlow.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className={`imp-flow-step-node actual ${step.isProblem ? 'has-problem' : ''}`}>
                        <span className="step-num">{idx + 1}</span>
                        <span className="step-text">{step.step}</span>
                        {step.notes && (
                          <span className="step-issue-alert">
                            <Flame size={12} /> {step.notes}
                          </span>
                        )}
                      </div>
                      {idx < data.actualFlow!.length - 1 && (
                        <ArrowRight size={14} className="imp-flow-arrow" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Root Cause Effects Chain */}
            {data.rootCauseEffects && data.rootCauseEffects.length > 0 && (
              <div className="imp-root-effects-box">
                <span className="effects-title">RANTAI DAMPAK KERUSAKAN (CASCADE EFFECT):</span>
                <div className="effects-pills-row">
                  {data.rootCauseEffects.map((eff, i) => (
                    <div key={i} className="effect-pill">
                      <span className="effect-idx">{i + 1}</span>
                      <span>{eff}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. Why-Why Analysis Tree ── */}
        {data.whyWhyTree && (
          <div className="imp-card imp-whywhy-card">
            <div className="imp-card-header">
              <div className="imp-card-header-left">
                <Cpu size={16} className="imp-icon-accent" />
                <span className="imp-card-title">DIRECT CAUSES: WHY-WHY ANALYSIS</span>
              </div>
            </div>

            <div className="imp-whywhy-tree">
              <div className="why-root-badge">
                <span className="why-badge-label">ROOT SYMPTOM</span>
                <span className="why-badge-title">{data.whyWhyTree.rootFault}</span>
              </div>

              <div className="why-nodes-track">
                {data.whyWhyTree.nodes.map((node) => (
                  <div key={node.id} className={`why-node-card level-${node.level} ${node.isTrigger ? 'is-trigger' : ''}`}>
                    <div className="why-node-header">
                      <span className="why-level-tag">WHY {node.level}</span>
                      {node.value && <span className="why-value-tag">{node.value}</span>}
                    </div>
                    <h5 className="why-node-label">{node.label}</h5>
                    {node.description && (
                      <p className="why-node-desc">{node.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {data.whyWhyTree.guideline && (
                <div className="why-guideline-alert">
                  <HelpCircle size={15} />
                  <span><strong>Manual Book Standard:</strong> {data.whyWhyTree.guideline}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5. Challenge Statement Callout ── */}
        <div className="imp-challenge-banner">
          <div className="challenge-tag">CHALLENGE</div>
          <div className="challenge-quote">
            &ldquo;{data.challenge}&rdquo;
          </div>
        </div>
      </motion.div>

      {/* ── Fullscreen Interactive CAD Lightbox Modal ── */}
      <AnimatePresence>
        {isLightboxOpen && data.layoutImageUrl && (
          <motion.div
            className="imp-image-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              className="imp-image-lightbox-modal cad-modal-wide"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-modal-header">
                <div className="lightbox-title-wrap">
                  <h3 className="lightbox-modal-title">
                    REAL CAD LAYOUT: {data.layoutTitle}
                  </h3>
                  <p className="lightbox-modal-caption">
                    Stasiun Under Body Final: ST#1 $\rightarrow$ ST#2 (Yokoten) $\rightarrow$ ST#3 $\rightarrow$ ST#4 $\rightarrow$ ST#5 (GBL Occurrence Point) $\rightarrow$ ST#6
                  </p>
                </div>
                <div className="lightbox-header-actions">
                  <button
                    type="button"
                    className={`cad-mode-toggle-btn ${isBlueprintMode ? 'active' : ''}`}
                    onClick={() => setIsBlueprintMode(!isBlueprintMode)}
                  >
                    {isBlueprintMode ? 'MODE: DARK BLUEPRINT' : 'MODE: ORIGINAL CAD'}
                  </button>
                  <button
                    type="button"
                    className="lightbox-close-btn"
                    onClick={() => setIsLightboxOpen(false)}
                    title="Tutup (Esc)"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="lightbox-modal-image-wrap cad-lightbox-wrap">
                <img
                  src={data.layoutImageUrl}
                  alt="Real CAD Mapping UBF Full"
                  className={`lightbox-full-image ${isBlueprintMode ? 'blueprint-filter' : 'contrast-filter'}`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowLeft,
  Play,
  Calendar,
  X,
  Keyboard
} from 'lucide-react';
import { IMPROVEMENT_PROJECTS } from '../../data/improvementData';
import { ImprovementBackground } from './ImprovementBackground';
import { ImprovementBeforeAfter } from './ImprovementBeforeAfter';
import { ImprovementYokoten } from './ImprovementYokoten';
import type { Character } from '../../types/character';
import type { ImprovementProject } from '../../types/improvement';

interface ImprovementViewerProps {
  character: Character;
}

type StepKey = 'background' | 'before_after' | 'yokoten';

export const ImprovementViewer: React.FC<ImprovementViewerProps> = ({ character }) => {
  // Initially null -> shows only the list of improvement titles
  const [activeProject, setActiveProject] = useState<ImprovementProject | null>(null);
  const [activeStep, setActiveStep] = useState<StepKey>('background');

  const stepsConfig: Array<{ key: StepKey; num: string; label: string; icon: React.ReactNode }> = [
    { key: 'background', num: '01', label: 'BACKGROUND & ROOT CAUSES', icon: <Layers size={16} /> },
    { key: 'before_after', num: '02', label: 'IMPROVEMENT (BEFORE / AFTER)', icon: <Sparkles size={16} /> },
    { key: 'yokoten', num: '03', label: 'YOKOTEN ACTIVITY', icon: <Share2 size={16} /> }
  ];

  const currentStepIdx = stepsConfig.findIndex(s => s.key === activeStep);

  const goToNextStep = () => {
    if (currentStepIdx < stepsConfig.length - 1) {
      setActiveStep(stepsConfig[currentStepIdx + 1].key);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIdx > 0) {
      setActiveStep(stepsConfig[currentStepIdx - 1].key);
    }
  };

  // Keyboard navigation when in presentation view
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPrevStep();
      } else if (e.key === 'Escape') {
        setActiveProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, currentStepIdx]);

  return (
    <div className="improvement-main-wrapper">
      {/* ══════════════════════════════════════════════════════════════════
          1. INITIAL VIEW: LIST OF IMPROVEMENT TITLES ONLY
         ══════════════════════════════════════════════════════════════════ */}
      {!activeProject && (
        <motion.div
          className="imp-list-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
        >
          <div className="imp-list-header-bar">
            <div>
              <span className="imp-list-subtitle">KANRI MEETING // {character.zone.toUpperCase()}</span>
              <h3 className="imp-list-title">DAFTAR MATERI IMPROVEMENT &amp; KAIZEN</h3>
            </div>
            <span className="imp-list-count-badge">
              {IMPROVEMENT_PROJECTS.length} PROYEK TERSEDIA
            </span>
          </div>

          <div className="imp-cards-grid">
            {IMPROVEMENT_PROJECTS.map((proj, idx) => (
              <motion.div
                key={proj.id}
                className="imp-summary-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => {
                  setActiveProject(proj);
                  setActiveStep('background');
                }}
              >
                <div className="imp-card-top-row">
                  <span className="imp-card-num-chip">0{idx + 1}</span>
                  <div className="imp-card-meta-wrap">
                    <span className="imp-card-code">{proj.code}</span>
                    <span className="imp-card-period">
                      <Calendar size={11} />
                      {proj.period}
                    </span>
                  </div>
                  <span className={`imp-status-pill ${proj.status.toLowerCase()}`}>
                    <Award size={12} />
                    {proj.status}
                  </span>
                </div>

                <h4 className="imp-card-main-title">{proj.title}</h4>

                <p className="imp-card-snippet">
                  {proj.background.problemDescription}
                </p>

                <div className="imp-card-footer-row">
                  <div className="imp-card-target-box">
                    <span className="target-lbl">TARGET AREA:</span>
                    <span className="target-val">{proj.background.layoutTitle}</span>
                  </div>

                  <button
                    type="button"
                    className="imp-open-presentation-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProject(proj);
                      setActiveStep('background');
                    }}
                  >
                    <Play size={14} className="play-icon" />
                    <span>BUKA PRESENTASI</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. DEDICATED FULLSCREEN PRESENTATION STAGE (SUASANA BARU)
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className="imp-presentation-stage-overlay"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Navigation & Status Bar */}
            <div className="stage-top-bar">
              <button
                type="button"
                className="stage-back-btn"
                onClick={() => setActiveProject(null)}
                title="Kembali ke daftar improvement (Esc)"
              >
                <ArrowLeft size={15} />
                <span>KEMBALI KE DAFTAR</span>
              </button>

              <div className="stage-meeting-branding">
                <span className="branding-cup">NASRI CUP // BODY 2 WHITE SHIFT</span>
                <span className="branding-sep">|</span>
                <span className="branding-title">KANRI MEETING {activeProject.period.toUpperCase()}</span>
              </div>

              <div className="stage-top-right">
                <span className="stage-code-chip">{activeProject.code}</span>
                <button
                  type="button"
                  className="stage-close-icon-btn"
                  onClick={() => setActiveProject(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Stage Presentation Header */}
            <div className="stage-hero-header">
              <div className="stage-hero-meta">
                <span className="stage-division-badge">{activeProject.unitShift}</span>
                <span className="stage-target-badge">{activeProject.background.layoutTitle}</span>
              </div>
              <h1 className="stage-main-title">{activeProject.title}</h1>
            </div>

            {/* 3-Step Animated Stepper Bar */}
            <nav className="stage-stepper-bar" aria-label="Presentation Steps">
              {stepsConfig.map((st, idx) => {
                const isActive = activeStep === st.key;
                const isPassed = currentStepIdx > idx;

                return (
                  <button
                    key={st.key}
                    type="button"
                    className={`stage-step-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    onClick={() => setActiveStep(st.key)}
                  >
                    <div className="step-btn-top">
                      <span className="step-btn-num">{st.num}</span>
                      <span className="step-btn-icon">{st.icon}</span>
                    </div>
                    <span className="step-btn-label">{st.label}</span>
                    {isActive && (
                      <motion.div
                        className="stage-active-indicator"
                        layoutId="stageActiveTab"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Slide Body Viewport */}
            <div className="stage-slide-viewport">
              <AnimatePresence mode="wait">
                {activeStep === 'background' && (
                  <ImprovementBackground key={`bg-${activeProject.id}`} data={activeProject.background} />
                )}

                {activeStep === 'before_after' && (
                  <ImprovementBeforeAfter key={`ba-${activeProject.id}`} aspects={activeProject.aspects} />
                )}

                {activeStep === 'yokoten' && activeProject.yokoten && (
                  <ImprovementYokoten key={`yoko-${activeProject.id}`} data={activeProject.yokoten} />
                )}
              </AnimatePresence>
            </div>

            {/* Presentation Stage Footer Controls */}
            <div className="stage-footer-bar">
              <button
                type="button"
                className="stage-nav-btn prev"
                onClick={goToPrevStep}
                disabled={currentStepIdx === 0}
              >
                <ChevronLeft size={16} />
                <span>PREV SLIDE</span>
              </button>

              <div className="stage-progress-indicator">
                <div className="stage-dots-group">
                  {stepsConfig.map((st, i) => (
                    <span
                      key={st.key}
                      className={`stage-dot ${i === currentStepIdx ? 'active' : ''}`}
                      onClick={() => setActiveStep(st.key)}
                      title={st.label}
                    />
                  ))}
                </div>
                <div className="stage-keyboard-hint">
                  <Keyboard size={12} />
                  <span>Tekan tombol ← / → keyboard</span>
                </div>
              </div>

              <button
                type="button"
                className="stage-nav-btn next"
                onClick={goToNextStep}
                disabled={currentStepIdx === stepsConfig.length - 1}
              >
                <span>NEXT SLIDE</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { IMPROVEMENT_PROJECTS } from '../../data/improvementData';
import { ImprovementBackground } from './ImprovementBackground';
import { ImprovementBeforeAfter } from './ImprovementBeforeAfter';
import { ImprovementYokoten } from './ImprovementYokoten';
import type { Character } from '../../types/character';

interface ImprovementViewerProps {
  character: Character;
}

type StepKey = 'background' | 'before_after' | 'yokoten';

export const ImprovementViewer: React.FC<ImprovementViewerProps> = ({ character }) => {
  // Find project that may relate to character or default to first project
  const initialProjectId =
    IMPROVEMENT_PROJECTS.find(p => p.picName.toLowerCase().includes(character.name.toLowerCase().split(' ')[0]))?.id ??
    IMPROVEMENT_PROJECTS[0].id;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [activeStep, setActiveStep] = useState<StepKey>('background');

  const currentProject =
    IMPROVEMENT_PROJECTS.find(p => p.id === selectedProjectId) ?? IMPROVEMENT_PROJECTS[0];

  const stepsConfig: Array<{ key: StepKey; num: string; label: string; icon: React.ReactNode }> = [
    { key: 'background', num: '01', label: 'BACKGROUND & ROOT CAUSES', icon: <Layers size={15} /> },
    { key: 'before_after', num: '02', label: 'IMPROVEMENT (BEFORE / AFTER)', icon: <Sparkles size={15} /> },
    { key: 'yokoten', num: '03', label: 'YOKOTEN ACTIVITY', icon: <Share2 size={15} /> }
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

  // Keyboard shortcut listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIdx]);

  return (
    <div className="improvement-viewer-container">
      {/* ── Project Switcher Bar ── */}
      <div className="imp-project-selector-bar">
        <span className="project-selector-label">SELECT IMPROVEMENT PROJECT:</span>
        <div className="project-chips-list">
          {IMPROVEMENT_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              type="button"
              className={`project-chip-btn ${proj.id === selectedProjectId ? 'active' : ''}`}
              onClick={() => {
                setSelectedProjectId(proj.id);
                setActiveStep('background');
              }}
            >
              <TrendingUp size={13} className="project-chip-icon" />
              <span className="project-chip-title">{proj.title}</span>
              <span className="project-chip-pic">({proj.picName.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Project Banner Card ── */}
      <div className="imp-active-project-card">
        <div className="imp-proj-header-top">
          <div className="imp-proj-meta">
            <span className="imp-code-badge">{currentProject.code}</span>
            <span className="imp-period-tag">{currentProject.period} // {currentProject.unitShift}</span>
          </div>
          <div className="imp-status-badge">
            <Award size={13} />
            <span>{currentProject.status}</span>
          </div>
        </div>
        <h2 className="imp-proj-main-title">{currentProject.title}</h2>
      </div>

      {/* ── 3-Step Animated Stepper Navigation ── */}
      <nav className="imp-stepper-bar" aria-label="Improvement Steps">
        {stepsConfig.map((st, idx) => {
          const isActive = activeStep === st.key;
          const isPassed = currentStepIdx > idx;

          return (
            <button
              key={st.key}
              type="button"
              className={`imp-step-tab ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
              onClick={() => setActiveStep(st.key)}
            >
              <div className="step-tab-top">
                <span className="step-tab-num">{st.num}</span>
                <span className="step-tab-icon">{st.icon}</span>
              </div>
              <span className="step-tab-label">{st.label}</span>
              {isActive && (
                <motion.div
                  className="step-tab-indicator"
                  layoutId="impActiveIndicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Step Content Body with Animated Transitions ── */}
      <div className="imp-step-content-viewport">
        <AnimatePresence mode="wait">
          {activeStep === 'background' && (
            <ImprovementBackground key={`bg-${currentProject.id}`} data={currentProject.background} />
          )}

          {activeStep === 'before_after' && (
            <ImprovementBeforeAfter key={`ba-${currentProject.id}`} aspects={currentProject.aspects} />
          )}

          {activeStep === 'yokoten' && currentProject.yokoten && (
            <ImprovementYokoten key={`yoko-${currentProject.id}`} data={currentProject.yokoten} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Presentation Stepper Footer Controls ── */}
      <div className="imp-footer-controls">
        <button
          type="button"
          className="imp-nav-btn prev"
          onClick={goToPrevStep}
          disabled={currentStepIdx === 0}
        >
          <ChevronLeft size={16} />
          <span>PREVIOUS STAGE</span>
        </button>

        <div className="imp-stepper-dots">
          {stepsConfig.map((st, i) => (
            <span
              key={st.key}
              className={`stepper-dot ${i === currentStepIdx ? 'active' : ''}`}
              onClick={() => setActiveStep(st.key)}
            />
          ))}
        </div>

        <button
          type="button"
          className="imp-nav-btn next"
          onClick={goToNextStep}
          disabled={currentStepIdx === stepsConfig.length - 1}
        >
          <span>NEXT STAGE</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

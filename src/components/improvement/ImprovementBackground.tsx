import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  GitCommit,
  CheckCircle,
  XCircle,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';
import type { BackgroundData } from '../../types/improvement';

interface ImprovementBackgroundProps {
  data: BackgroundData;
}

export const ImprovementBackground: React.FC<ImprovementBackgroundProps> = ({ data }) => {
  return (
    <motion.div
      className="imp-background-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {/* ── 1. Layout Station Schematic ── */}
      <div className="imp-card imp-layout-card">
        <div className="imp-card-header">
          <div className="imp-card-header-left">
            <Layers size={16} className="imp-icon-accent" />
            <span className="imp-card-title">{data.layoutTitle}</span>
          </div>
          {data.activeEquipmentName && (
            <span className="imp-target-pill">
              TARGET: <strong>{data.activeEquipmentName}</strong>
            </span>
          )}
        </div>

        <div className="imp-stations-strip">
          {data.stations.map((st) => (
            <div
              key={st.id}
              className={`imp-station-node ${st.isHighlight ? 'is-highlighted' : ''} ${st.status ? `status-${st.status}` : ''}`}
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

      {/* ── 4. Why-Why Analysis Tree — Inverter Kaizen ── */}
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
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  Calendar,
  Clock,
  Check
} from 'lucide-react';
import type { YokotenData } from '../../types/improvement';

interface ImprovementYokotenProps {
  data: YokotenData;
}

export const ImprovementYokoten: React.FC<ImprovementYokotenProps> = ({ data }) => {
  const hasDiagnostics = data.diagnosticRows && data.diagnosticRows.length > 0;

  return (
    <motion.div
      className="imp-yokoten-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {/* ── 1. Diagnostic Data Scanning Table ── */}
      {hasDiagnostics && (
        <div className="imp-card imp-yokoten-table-card">
          <div className="imp-card-header">
            <div className="imp-card-header-left">
              <Table size={16} className="imp-icon-accent" />
              <span className="imp-card-title">DATA SCANNING &amp; DIAGNOSA KONDISI PERALATAN</span>
            </div>
            <span className="imp-status-chip">PARAMETER SCANNING OK</span>
          </div>

          <div className="imp-table-overflow-wrap">
            <table className="imp-diag-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="th-no">NO</th>
                  <th rowSpan={2} className="th-param">DATA / PARAMETER</th>
                  <th rowSpan={2} className="th-std">STANDAR</th>
                  {data.stationHeaders.map((st, i) => (
                    <th key={i} colSpan={st.spans} className="th-station-group">
                      {st.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  {data.stationHeaders.map((st, sIdx) =>
                    st.subTypes.map((sub, subIdx) => (
                      <th key={`${sIdx}-${subIdx}`} className="th-sub-type">
                        {sub === 'SINGLE' ? '-' : sub}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {data.diagnosticRows.map((row) => (
                  <tr key={row.no}>
                    <td className="td-no">{row.no}</td>
                    <td className="td-param">{row.paramName}</td>
                    <td className="td-std">{row.standard}</td>
                    {row.readings.map((reading, rIdx) => (
                      <td key={rIdx} className={`td-reading status-${reading.status}`}>
                        <span className="reading-val">{reading.value}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 2. Implementation Gantt Timeline ── */}
      {data.timelineRows && data.timelineRows.length > 0 && (
        <div className="imp-card imp-yokoten-timeline-card">
          <div className="imp-card-header">
            <div className="imp-card-header-left">
              <Calendar size={16} className="imp-icon-accent" />
              <span className="imp-card-title">JADWAL IMPLEMENTASI &amp; HORIZONTAL DEPLOYMENT (YOKOTEN)</span>
            </div>
          </div>

          <div className="imp-table-overflow-wrap">
            <table className="imp-gantt-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="th-gantt-st">STATION / UNIT</th>
                  <th colSpan={4} className="th-month agustus">AGUSTUS 2026</th>
                  <th colSpan={4} className="th-month september">SEPTEMBER 2026</th>
                </tr>
                <tr>
                  <th className="th-week">W1</th>
                  <th className="th-week">W2</th>
                  <th className="th-week">W3</th>
                  <th className="th-week">W4</th>
                  <th className="th-week">W1</th>
                  <th className="th-week">W2</th>
                  <th className="th-week">W3</th>
                  <th className="th-week">W4</th>
                </tr>
              </thead>
              <tbody>
                {data.timelineRows.map((tRow, idx) => (
                  <tr key={idx}>
                    <td className="td-gantt-st">{tRow.station}</td>
                    {/* Agustus W1-W4 */}
                    <td className={`td-gantt-cell ${tRow.agustus.w1 ? 'is-active' : ''}`}>
                      {tRow.agustus.w1 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.agustus.w2 ? 'is-active' : ''}`}>
                      {tRow.agustus.w2 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.agustus.w3 ? 'is-active' : ''}`}>
                      {tRow.agustus.w3 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.agustus.w4 ? 'is-active' : ''}`}>
                      {tRow.agustus.w4 && <Check size={12} className="gantt-check" />}
                    </td>
                    {/* September W1-W4 */}
                    <td className={`td-gantt-cell ${tRow.september.w1 ? 'is-active' : ''}`}>
                      {tRow.september.w1 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.september.w2 ? 'is-active' : ''}`}>
                      {tRow.september.w2 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.september.w3 ? 'is-active' : ''}`}>
                      {tRow.september.w3 && <Check size={12} className="gantt-check" />}
                    </td>
                    <td className={`td-gantt-cell ${tRow.september.w4 ? 'is-active' : ''}`}>
                      {tRow.september.w4 && <Check size={12} className="gantt-check" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. Target Completion Callout ── */}
      {data.targetCompletion && (
        <div className="imp-target-completion-banner">
          <div className="target-icon-wrap">
            <Clock size={20} className="target-clock-icon" />
          </div>
          <div className="target-content">
            <span className="target-heading">TARGET YOKOTEN COMPLETION</span>
            <p className="target-text">{data.targetCompletion}</p>
          </div>
          <div className="target-ok-badge">
            <span>ON TRACK (OK)</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

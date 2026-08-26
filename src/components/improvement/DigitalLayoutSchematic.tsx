import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Settings2,
  Activity,
  Workflow
} from 'lucide-react';

interface StationInfo {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  role: string;
  isOccurrence?: boolean;
  isYokoten?: boolean;
  robots?: string[];
  equipment: string;
  statusTag: string;
  details: string[];
}

const STATIONS: StationInfo[] = [
  {
    id: 'st1',
    code: 'ST#1',
    name: 'ST#1 UBF',
    subtitle: 'UNDER BODY INTAKE',
    role: 'Loading & Auto Clamp Fixture',
    equipment: 'Hydraulic Clamp & Locator Pin',
    statusTag: 'NORMAL OPERATION',
    details: [
      'Pemasangan part Underbody depan & tengah',
      'Pneumatic centering clamp sequence',
      'Part presence detection sensor OK'
    ]
  },
  {
    id: 'st2',
    code: 'ST#2',
    name: 'ST#2 UBF',
    subtitle: 'ROBOT NC LOCATOR CELL',
    role: 'Yokoten Target (NC Model Change)',
    isYokoten: true,
    robots: ['R1', 'R2'],
    equipment: 'Mesin NC Locator ST#2 & Robot Spot',
    statusTag: 'TARGET YOKOTEN KAIZEN',
    details: [
      'Standardisasi program timer timeout PLC',
      'Pemasangan spatter protection cover NC',
      'Horizontal deployment pencegahan freeze'
    ]
  },
  {
    id: 'st3',
    code: 'ST#3',
    name: 'ST#3 UBF',
    subtitle: 'SUB-ASSEMBLY SPOT',
    role: 'Cross Member & Floor Reinforcement',
    robots: ['R3'],
    equipment: 'Robot Spot Welder & Jig Fixed',
    statusTag: 'NORMAL OPERATION',
    details: [
      'Pengelasan titik Cross Member No. 2',
      'Bracket reinforcement joining',
      'Manual visual spot check station'
    ]
  },
  {
    id: 'st4',
    code: 'ST#4',
    name: 'ST#4 UBF',
    subtitle: 'MAIN GEOMETRY FIXTURE',
    role: 'Floor Pan Geometric Setting',
    robots: ['R4', 'R5'],
    equipment: 'Main Geometry Locator & Spot Guns',
    statusTag: 'NORMAL OPERATION',
    details: [
      'Penguncian akurasi geometri dimensi lantai',
      'High-precision multi-point spot welding',
      'Repeatability check +/- 0.2mm'
    ]
  },
  {
    id: 'st5',
    code: 'ST#5',
    name: 'ST#5 UBF (GBL)',
    subtitle: 'GLOBAL BODY LINE (OCCURRENCE)',
    role: 'Titik Masalah: NC Locator Model Change',
    isOccurrence: true,
    robots: ['R6'],
    equipment: 'Mesin GBL ST#5 Lokator NC (D26A/D03B/230B)',
    statusTag: 'PROBLEM OCCURRENCE POINT',
    details: [
      'Gram spatter menumpuk pada sensor proximity',
      'Sensor freeze ON konstan saat pergantian model',
      'PLC mengunci interlock -> Silent Line Stop (0 Alarm)'
    ]
  },
  {
    id: 'st6',
    code: 'ST#6',
    name: 'ST#6 UBF',
    subtitle: 'EXIT & TRANSFER SHUTTLE',
    role: 'Unload to Main Body Line',
    equipment: 'Lifter Shuttle Transfer & Optical Gate',
    statusTag: 'NORMAL OPERATION',
    details: [
      'Unloading unit Underbody lengkap',
      'Shuttle transfer menuju Main Body Framing',
      'Final station clearance sensor OK'
    ]
  }
];

export const DigitalLayoutSchematic: React.FC = () => {
  const [activeStationId, setActiveStationId] = useState<string>('st5');

  const activeStation = STATIONS.find(s => s.id === activeStationId) || STATIONS[4];

  return (
    <div className="digital-schematic-container">
      {/* ── Schematic Header Banner ── */}
      <div className="schematic-top-bar">
        <div className="schematic-line-badge">
          <Workflow size={14} className="schematic-icon" />
          <span>PROCESS FLOW: <strong>UNDER BODY FINAL (UBF) // GLOBAL BODY LINE</strong></span>
        </div>

        <div className="schematic-flow-direction">
          <span className="flow-dot pulse" />
          <span>CONVEYOR FLOW: ST#1 ➜ ST#6</span>
          <div className="flow-animated-arrows">
            <span className="arrow a1">›</span>
            <span className="arrow a2">›</span>
            <span className="arrow a3">›</span>
          </div>
        </div>

        <div className="schematic-model-chip">
          <Settings2 size={12} />
          <span>MODEL: <strong>D26A / D03B ⟷ 230B</strong></span>
        </div>
      </div>

      {/* ── Upper Robots & Tooling Visualization Bar ── */}
      <div className="schematic-tooling-zone">
        <div className="tooling-legend-pill">
          <Cpu size={12} />
          <span>AUTOMATION & ROBOTICS ZONE</span>
        </div>
        <div className="tooling-track-line" />
      </div>

      {/* ── Main Production Station Blocks Grid (6 Blocks) ── */}
      <div className="schematic-stations-grid">
        {STATIONS.map((station) => {
          const isSelected = activeStationId === station.id;

          return (
            <motion.div
              key={station.id}
              className={`schematic-station-card ${station.isOccurrence ? 'is-occurrence' : ''} ${station.isYokoten ? 'is-yokoten' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setActiveStationId(station.id)}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              {/* Top Tag / Status Pill */}
              <div className="station-card-top">
                <span className="station-code-badge">{station.code}</span>
                {station.isOccurrence && (
                  <span className="station-highlight-pill occurrence">
                    <AlertTriangle size={10} />
                    <span>OCCURRENCE</span>
                  </span>
                )}
                {station.isYokoten && (
                  <span className="station-highlight-pill yokoten">
                    <CheckCircle2 size={10} />
                    <span>YOKOTEN</span>
                  </span>
                )}
              </div>

              {/* Station Block Graphic Frame */}
              <div className="station-graphic-box">
                {/* Robot / Machine Icon Indicator */}
                <div className="station-machine-icon">
                  {station.isOccurrence ? (
                    <Zap size={22} className="machine-svg alert" />
                  ) : station.isYokoten ? (
                    <ShieldCheck size={22} className="machine-svg check" />
                  ) : (
                    <Activity size={20} className="machine-svg normal" />
                  )}
                </div>

                <div className="station-title-group">
                  <h4 className="station-card-title">{station.name}</h4>
                  <p className="station-card-subtitle">{station.subtitle}</p>
                </div>

                {station.robots && (
                  <div className="station-robots-row">
                    {station.robots.map(r => (
                      <span key={r} className="robot-badge">{r}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Station Role Summary */}
              <div className="station-role-text">
                <span>{station.role}</span>
              </div>

              {/* Station Selection Indicator Glow */}
              {isSelected && <div className="station-active-underline" />}
            </motion.div>
          );
        })}
      </div>

      {/* ── Conveyor Rail Track with Direction Indicators ── */}
      <div className="schematic-conveyor-rail">
        <div className="rail-line-track" />
        <div className="rail-station-nodes">
          {STATIONS.map((st) => (
            <div key={st.id} className={`rail-node ${st.isOccurrence ? 'occurrence' : ''} ${st.isYokoten ? 'yokoten' : ''} ${activeStationId === st.id ? 'active' : ''}`}>
              <div className="rail-node-dot" />
              <span className="rail-node-label">{st.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dynamic Station Inspection Detail Panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStation.id}
          className={`schematic-detail-panel ${activeStation.isOccurrence ? 'occurrence-theme' : activeStation.isYokoten ? 'yokoten-theme' : 'normal-theme'}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <div className="detail-panel-left">
            <div className="detail-status-badge">
              {activeStation.isOccurrence ? (
                <AlertTriangle size={14} />
              ) : activeStation.isYokoten ? (
                <CheckCircle2 size={14} />
              ) : (
                <Layers size={14} />
              )}
              <span>{activeStation.statusTag}</span>
            </div>

            <h3 className="detail-station-heading">
              {activeStation.name} — {activeStation.subtitle}
            </h3>
            <p className="detail-equipment-name">
              <strong>Peralatan:</strong> {activeStation.equipment}
            </p>
          </div>

          <div className="detail-panel-right">
            <span className="detail-list-title">POIN ANALISIS TEKNIKAL:</span>
            <ul className="detail-bullets-list">
              {activeStation.details.map((d, i) => (
                <li key={i}>
                  <ArrowRight size={12} className="bullet-arrow" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

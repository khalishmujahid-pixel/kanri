import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Maximize2,
  X,
  Zap,
  Radio,
  RefreshCw,
} from 'lucide-react';
import type { PmEquipmentEntry } from '../types/character';

interface PmSCurveChartProps {
  schedule: PmEquipmentEntry[];
  month: number;
  year: number;
  monthName: string;
  isLiveActive?: boolean;
  isLiveSyncing?: boolean;
  lastSyncedTime?: string | null;
  onForceSync?: () => void;
}

export const PmSCurveChart: React.FC<PmSCurveChartProps> = ({
  schedule,
  month,
  year,
  monthName,
  isLiveActive = false,
  isLiveSyncing = false,
  lastSyncedTime = null,
  onForceSync,
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Close zoom modal on ESC key
  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isZoomed]);

  const daysInMonth = new Date(year, month, 0).getDate(); // e.g. 31 for August

  // Flatten all tasks
  const allTasks = schedule.flatMap((eq) =>
    eq.tasks.map((t) => ({
      ...t,
      equipmentName: eq.equipmentName,
      coreEquipment: eq.coreEquipment,
      area: eq.area,
      noKanban: eq.noKanban,
      equipmentNo: eq.no,
    }))
  );

  // Latest day with recorded actual task
  const doneActualDays = allTasks
    .filter((t) => t.done && t.actualDay != null)
    .map((t) => t.actualDay!);
  const maxActualDay = doneActualDays.length > 0 ? Math.max(...doneActualDays) : 0;

  // Dynamic running date: takes whichever is larger between current date, max actual recorded, or day 19
  const isCurrentMonth = year === 2026 && month === 8;
  const calendarDay = new Date().getDate();
  const currentRunningDay = isCurrentMonth
    ? Math.min(daysInMonth, Math.max(calendarDay, maxActualDay, 19))
    : daysInMonth;

  const totalPlanMonth = allTasks.length; // 27 tasks for August
  const planToday = allTasks.filter((t) => t.planDay <= currentRunningDay).length;
  const actualToday = allTasks.filter(
    (t) => t.done && (t.actualDay ?? t.planDay) <= currentRunningDay
  ).length;
  const delayToday = planToday - actualToday;
  const achievementRateToday =
    planToday > 0 ? Math.round((actualToday / planToday) * 100) : 0;

  // Breakdown per Kanban Type
  const kanbanA = allTasks.filter((t) => t.kanbanType === 'A');
  const kanbanB = allTasks.filter((t) => t.kanbanType === 'B');
  const kanbanC = allTasks.filter((t) => t.kanbanType === 'C');
  const kanbanD = allTasks.filter((t) => t.kanbanType === 'D');

  const kanbanADone = kanbanA.filter((t) => t.done).length;
  const kanbanBDone = kanbanB.filter((t) => t.done).length;
  const kanbanCDone = kanbanC.filter((t) => t.done).length;
  const kanbanDDone = kanbanD.filter((t) => t.done).length;

  // Calculate cumulative curves day by day (1..daysInMonth)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const cumulativeData = daysArray.map((day) => {
    const planCum = allTasks.filter((t) => t.planDay <= day).length;
    const actualCum = allTasks.filter(
      (t) => t.done && (t.actualDay ?? t.planDay) <= day
    ).length;
    const gap = planCum - actualCum;
    return {
      day,
      plan: planCum,
      actual: actualCum,
      gap,
      isPastOrToday: day <= currentRunningDay,
    };
  });

  // Reusable SVG renderer for normal and zoomed modes
  const renderSvgChart = (svgWidth: number, svgHeight: number, isModal = false) => {
    const padding = isModal
      ? { top: 40, right: 45, bottom: 55, left: 60 }
      : { top: 30, right: 35, bottom: 45, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const maxY = Math.max(totalPlanMonth + 2, 10);

    const getX = (day: number) =>
      padding.left + ((day - 1) / (daysInMonth - 1)) * chartWidth;
    const getY = (val: number) =>
      padding.top + chartHeight - (val / maxY) * chartHeight;

    // Plan Path (Days 1 to 31)
    const planPath = cumulativeData
      .map(
        (d, i) =>
          `${i === 0 ? 'M' : 'L'} ${getX(d.day).toFixed(1)} ${getY(d.plan).toFixed(1)}`
      )
      .join(' ');

    // Actual Path (Solid line up to currentRunningDay 19)
    const actualActiveData = cumulativeData.filter(
      (d) => d.day <= currentRunningDay
    );
    const actualPath = actualActiveData
      .map(
        (d, i) =>
          `${i === 0 ? 'M' : 'L'} ${getX(d.day).toFixed(1)} ${getY(d.actual).toFixed(1)}`
      )
      .join(' ');

    // Flat projection line from currentRunningDay to 31
    const lastActualVal =
      actualActiveData[actualActiveData.length - 1]?.actual ?? 0;

    // Area paths
    const planArea = `${planPath} L ${getX(daysInMonth)} ${getY(0)} L ${getX(1)} ${getY(0)} Z`;
    const actualArea = `${actualPath} L ${getX(currentRunningDay)} ${getY(0)} L ${getX(1)} ${getY(0)} Z`;

    const activeHoverData = hoveredDay
      ? cumulativeData.find((d) => d.day === hoveredDay)
      : null;

    const todayX = getX(currentRunningDay);

    return (
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="pm-scurve-svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`planGrad-${isModal}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient
            id={`actualGrad-${isModal}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#ff6a1a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0.0" />
          </linearGradient>
          <filter
            id={`glowOrange-${isModal}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Future Shading (Day 20 - 31) */}
        {currentRunningDay < daysInMonth && (
          <rect
            x={todayX}
            y={padding.top}
            width={getX(daysInMonth) - todayX}
            height={chartHeight}
            fill="rgba(255, 255, 255, 0.015)"
          />
        )}

        {/* Gridlines Horizontal */}
        {[
          0,
          Math.round(maxY * 0.25),
          Math.round(maxY * 0.5),
          Math.round(maxY * 0.75),
          maxY,
        ].map((val) => {
          const y = getY(val);
          return (
            <g key={val} className="grid-line-group">
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.45)"
                fontSize={isModal ? '11' : '10'}
                fontFamily="JetBrains Mono, monospace"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gridlines Vertical (Days) */}
        {daysArray.map((day) => {
          if (day === 1 || day % 2 === 0 || day === daysInMonth) {
            const x = getX(day);
            const isToday = day === currentRunningDay;
            return (
              <g key={day}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={
                    isToday
                      ? 'rgba(255, 85, 0, 0.25)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }
                />
                <text
                  x={x}
                  y={svgHeight - padding.bottom + (isModal ? 22 : 18)}
                  textAnchor="middle"
                  fill={
                    isToday
                      ? '#ff6a1a'
                      : hoveredDay === day
                      ? '#38bdf8'
                      : 'rgba(255, 255, 255, 0.45)'
                  }
                  fontSize={isToday ? (isModal ? '11.5' : '10.5') : isModal ? '10.5' : '9.5'}
                  fontWeight={isToday || hoveredDay === day ? '700' : '500'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {day}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Area under curves */}
        <path d={planArea} fill={`url(#planGrad-${isModal})`} />
        <path d={actualArea} fill={`url(#actualGrad-${isModal})`} />

        {/* Plan Line (Steel Gray with Square Markers) */}
        <path
          d={planPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={isModal ? '2.8' : '2.2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Actual Line (Active execution up to Day 19) */}
        <path
          d={actualPath}
          fill="none"
          stroke="#ff6a1a"
          strokeWidth={isModal ? '3.4' : '2.8'}
          filter={`url(#glowOrange-${isModal})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Projected Flat Line (Day 19 to 31) */}
        {currentRunningDay < daysInMonth && (
          <line
            x1={todayX}
            y1={getY(lastActualVal)}
            x2={getX(daysInMonth)}
            y2={getY(lastActualVal)}
            stroke="#ff6a1a"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        )}

        {/* Vertical Marker for TODAY / RUNNING DATE (Day 19) */}
        <g className="today-marker-group">
          <line
            x1={todayX}
            y1={padding.top - 8}
            x2={todayX}
            y2={padding.top + chartHeight}
            stroke="#ff6a1a"
            strokeWidth="1.8"
            strokeDasharray="4 2"
          />
          {/* Today Pin Top Badge */}
          <rect
            x={todayX - 32}
            y={padding.top - 24}
            width="64"
            height="18"
            rx="4"
            fill="#ff6a1a"
          />
          <text
            x={todayX}
            y={padding.top - 12}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="9"
            fontWeight="800"
            fontFamily="JetBrains Mono, monospace"
          >
            TODAY: D19
          </text>
        </g>

        {/* Plan Point Dots (Square Markers) */}
        {cumulativeData.map((d) => (
          <rect
            key={`plan-${d.day}`}
            x={getX(d.day) - (isModal ? 3.5 : 3)}
            y={getY(d.plan) - (isModal ? 3.5 : 3)}
            width={isModal ? '7' : '6'}
            height={isModal ? '7' : '6'}
            fill="#0f172a"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        ))}

        {/* Actual Point Dots (Glowing circles up to Day 19) */}
        {actualActiveData.map((d) => (
          <circle
            key={`actual-${d.day}`}
            cx={getX(d.day)}
            cy={getY(d.actual)}
            r={isModal ? '4.5' : '3.5'}
            fill="#ff6a1a"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}

        {/* Hover Crosshair & Pointer */}
        {hoveredDay && activeHoverData && (
          <g>
            <line
              x1={getX(hoveredDay)}
              y1={padding.top}
              x2={getX(hoveredDay)}
              y2={padding.top + chartHeight}
              stroke="#38bdf8"
              strokeWidth="1.4"
              strokeDasharray="2 2"
            />
            <circle
              cx={getX(hoveredDay)}
              cy={getY(activeHoverData.plan)}
              r={isModal ? '6' : '5'}
              fill="#94a3b8"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle
              cx={getX(hoveredDay)}
              cy={getY(activeHoverData.actual)}
              r={isModal ? '6.5' : '5.5'}
              fill="#ff6a1a"
              stroke="#ffffff"
              strokeWidth="2"
              filter={`url(#glowOrange-${isModal})`}
            />
          </g>
        )}

        {/* Invisible interactive hover rects */}
        {daysArray.map((day) => {
          const x = getX(day) - chartWidth / (daysInMonth * 2);
          const w = chartWidth / daysInMonth;
          return (
            <rect
              key={`hover-rect-${day}`}
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ cursor: 'crosshair' }}
            />
          );
        })}
      </svg>
    );
  };

  const activeHoverData = hoveredDay
    ? cumulativeData.find((d) => d.day === hoveredDay)
    : null;

  return (
    <>
      <div className="pm-scurve-container">
        {/* Telemetry Header HUD */}
        <div className="pm-scurve-header">
          <div className="pm-scurve-title-group">
            <div className="pm-scurve-icon-box">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="pm-scurve-sub-tag">
                S-CURVE ANALYSIS // {monthName.toUpperCase()} {year} // LIVE CUTOFF: D{currentRunningDay} {monthName.toUpperCase()}
              </div>
              <h4 className="pm-scurve-title">
                CUMULATIVE PLAN VS ACTUAL PM PROGRESS
              </h4>
            </div>
          </div>

          <div className="pm-header-action-group">
            {/* Live Sync Status Pill inside Header */}
            {onForceSync && (
              <div className={`pm-header-live-pill ${isLiveActive ? 'is-active' : ''}`}>
                <Radio size={11} className={isLiveActive ? 'live-pulsing' : ''} />
                <span className="live-status-txt">
                  {isLiveActive ? 'LIVE AUTO-SYNC (20s)' : 'READY TO SYNC'}
                </span>
                {lastSyncedTime && (
                  <span className="live-time-chip">{lastSyncedTime}</span>
                )}
              </div>
            )}

            {/* FORCE SYNC Button */}
            {onForceSync && (
              <button
                type="button"
                className={`pm-header-sync-btn ${isLiveSyncing ? 'is-spinning' : ''}`}
                onClick={onForceSync}
                disabled={isLiveSyncing}
                title="Tarik data terbaru dari Google Sheets sekarang"
              >
                <RefreshCw size={11} className={isLiveSyncing ? 'spin-anim' : ''} />
                <span>{isLiveSyncing ? 'SYNCING...' : 'FORCE SYNC'}</span>
              </button>
            )}

            {/* Clear Telegram Cache Button */}
            <button
              type="button"
              className="pm-toggle-table-btn"
              style={{ background: 'rgba(255, 60, 60, 0.15)', borderColor: 'rgba(255, 60, 60, 0.4)' }}
              onClick={async () => {
                const btn = document.activeElement as HTMLButtonElement;
                const origText = btn.innerText;
                btn.innerText = "⏳ CLEARING...";
                try {
                  const token = "8951359806:AAFXsn4VhlXx7_gGNZfohEf3kZ-T-RIoJhk";
                  const url = "https://script.google.com/macros/s/AKfycbzYvd259Z8Cw8g4kBsyTGkvnwaswS6rinGICFW6fWiPP445sw3v2zldOdMf1WqRRJAAtw/exec";
                  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
                  await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${url}`);
                  btn.innerText = "✅ CLEARED!";
                  setTimeout(() => (btn.innerText = origText), 2000);
                } catch(e) {
                  btn.innerText = "❌ ERROR";
                  setTimeout(() => (btn.innerText = origText), 2000);
                }
              }}
              title="Bersihkan Antrian Error Bot Telegram"
            >
              <span>CLEAR CACHE</span>
            </button>

            {/* Zoom / Maximize Button */}
            <button
              type="button"
              className="pm-zoom-btn"
              onClick={() => setIsZoomed(true)}
              title="Perbesar grafik (80% layar)"
            >
              <Maximize2 size={13} />
              <span>ZOOM CHART (80%)</span>
            </button>

            {/* Action Toggle for Table Breakdown */}
            <button
              type="button"
              className="pm-toggle-table-btn"
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showTable ? 'HIDE TASK MATRIX' : 'VIEW TASK MATRIX'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Chips Bar */}
        <div className="pm-scurve-metrics-bar">
          <div className="pm-metric-chip">
            <span className="metric-label">CORE EQUIPMENT</span>
            <span className="metric-val">{schedule.length}</span>
            <span className="metric-sub">UNITS TOTAL</span>
          </div>

          <div className="pm-metric-chip">
            <span className="metric-label">PLAN TARGET (D{currentRunningDay})</span>
            <span className="metric-val">{planToday} / {totalPlanMonth}</span>
            <span className="metric-sub">TASKS SCHEDULED</span>
          </div>

          <div className="pm-metric-chip success">
            <span className="metric-label">ACTUAL DONE (D{currentRunningDay})</span>
            <span className="metric-val">{actualToday}</span>
            <span className="metric-sub">TASKS COMPLETED</span>
          </div>

          <div
            className={`pm-metric-chip ${delayToday > 0 ? 'warning' : 'success'}`}
          >
            <span className="metric-label">CURRENT DELAY (D{currentRunningDay})</span>
            <span className="metric-val">
              {delayToday > 0 ? `-${delayToday}` : 'ON TRACK'}
            </span>
            <span className="metric-sub">
              {delayToday > 0 ? 'TASKS BEHIND TODAY' : 'ON SCHEDULE'}
            </span>
          </div>

          <div className="pm-metric-chip highlight">
            <span className="metric-label">RATE AS OF D{currentRunningDay}</span>
            <span className="metric-val">{achievementRateToday}%</span>
            <span className="metric-sub">{actualToday} OF {planToday} TARGETS</span>
          </div>
        </div>

        {/* Kanban Sub-breakdown Row */}
        <div className="pm-kanban-breakdown-row">
          <div className="kanban-chip kanban-a">
            <span className="kanban-badge a">KANBAN A (ROUTINE)</span>
            <span className="kanban-count">
              {kanbanADone} / {kanbanA.length} Done
            </span>
          </div>
          <div className="kanban-chip kanban-b">
            <span className="kanban-badge b">KANBAN B (PERIODIC)</span>
            <span className="kanban-count">
              {kanbanBDone} / {kanbanB.length} Done
            </span>
          </div>
          {kanbanC.length > 0 && (
            <div className="kanban-chip kanban-c">
              <span className="kanban-badge c">KANBAN C</span>
              <span className="kanban-count">
                {kanbanCDone} / {kanbanC.length} Done
              </span>
            </div>
          )}
          {kanbanD.length > 0 && (
            <div className="kanban-chip kanban-d">
              <span className="kanban-badge d">KANBAN D</span>
              <span className="kanban-count">
                {kanbanDDone} / {kanbanD.length} Done
              </span>
            </div>
          )}
        </div>

        {/* Clickable SVG S-Curve Chart Area (Wide Horizontal Ratio) */}
        <div
          className="pm-scurve-chart-box"
          onClick={() => {
            if (!hoveredDay) setIsZoomed(true);
          }}
          title="Klik untuk membuka tampilan layar penuh (80%)"
        >
          {renderSvgChart(1050, 260, false)}

          {/* Hover Telemetry Card */}
          {activeHoverData && (
            <div
              className="pm-scurve-tooltip"
              style={{
                left: `${((activeHoverData.day - 1) / (daysInMonth - 1)) * 88 + 6}%`,
              }}
            >
              <div className="tooltip-day">
                TANGGAL {activeHoverData.day} {monthName.toUpperCase()}{' '}
                {activeHoverData.day === currentRunningDay && '(HARI INI)'}
              </div>
              <div className="tooltip-row">
                <span className="dot plan" />
                <span>PLAN CUMULATIVE:</span>
                <strong>{activeHoverData.plan} TASKS</strong>
              </div>
              <div className="tooltip-row">
                <span className="dot actual" />
                <span>ACTUAL CUMULATIVE:</span>
                <strong>
                  {activeHoverData.isPastOrToday
                    ? `${activeHoverData.actual} TASKS`
                    : 'FUTURE'}
                </strong>
              </div>
              <div
                className={`tooltip-row ${activeHoverData.gap > 0 ? 'delay' : 'ok'}`}
              >
                <span className="dot gap" />
                <span>GAP STATUS:</span>
                <strong>
                  {activeHoverData.gap > 0
                    ? `DELAY ${activeHoverData.gap} TASKS`
                    : activeHoverData.gap === 0
                    ? 'ON TARGET'
                    : `+${Math.abs(activeHoverData.gap)} AHEAD`}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="pm-scurve-legend-bar">
          <div className="legend-entry">
            <span className="legend-symbol plan-symbol" />
            <span className="legend-name">
              PLAN CUMULATIVE ({totalPlanMonth} TASKS TOTAL)
            </span>
          </div>
          <div className="legend-entry">
            <span className="legend-symbol actual-symbol" />
            <span className="legend-name">
              ACTUAL CUMULATIVE (8 DONE AS OF D19)
            </span>
          </div>
          <div className="legend-entry">
            <span className="legend-symbol today-symbol" />
            <span className="legend-name">
              TODAY CUTOFF (19 AGUSTUS 2026)
            </span>
          </div>
          <div className="legend-entry">
            <span className="legend-symbol delay-symbol" />
            <span className="legend-name">
              GAP AS OF TODAY: {delayToday} TASKS
            </span>
          </div>
        </div>

        {/* Optional Detailed Equipment Task Matrix */}
        {showTable && (
          <div className="pm-task-matrix-container">
            <div className="matrix-title">
              <Cpu size={14} />
              <span>EQUIPMENT PM SCHEDULE &amp; EXECUTION MATRIX</span>
            </div>
            <div className="matrix-table-wrap">
              <table className="pm-matrix-table">
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>CORE EQUIPMENT</th>
                    <th>EQUIPMENT NAME</th>
                    <th>AREA</th>
                    <th>NO KANBAN</th>
                    <th>TASKS &amp; EXECUTION</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((eq) => (
                    <tr key={eq.no}>
                      <td className="col-no">
                        {String(eq.no).padStart(2, '0')}
                      </td>
                      <td className="col-core">{eq.coreEquipment}</td>
                      <td className="col-name">{eq.equipmentName}</td>
                      <td className="col-area">{eq.area}</td>
                      <td className="col-kanban">{eq.noKanban || '—'}</td>
                      <td className="col-tasks">
                        <div className="task-tags-container">
                          {eq.tasks.map((task, tIdx) => (
                            <span
                              key={tIdx}
                              className={`task-exec-tag ${task.done ? 'is-done' : 'is-pending'} kanban-${task.kanbanType.toLowerCase()}`}
                            >
                              <span className="tag-type">
                                KANBAN {task.kanbanType}
                              </span>
                              <span className="tag-plan">
                                PLAN: D{task.planDay}
                              </span>
                              {task.done ? (
                                <span className="tag-actual done">
                                  <CheckCircle2 size={10} /> D
                                  {task.actualDay ?? task.planDay} (DONE)
                                </span>
                              ) : (
                                <span className="tag-actual pending">
                                  <AlertTriangle size={10} /> PENDING
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Full-Screen 80% Zoom Lightbox Modal ── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="pm-zoom-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              className="pm-zoom-modal-card"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="pm-zoom-modal-header">
                <div className="pm-zoom-modal-title-wrap">
                  <div className="pm-scurve-icon-box">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div className="pm-scurve-sub-tag">
                      HIGH DEFINITION TELEMETRY // {monthName.toUpperCase()} {year} // LIVE CUTOFF: 19 AGUSTUS
                    </div>
                    <h3 className="pm-zoom-modal-title">
                      S-CURVE PM CUMULATIVE PLAN VS ACTUAL (EXPANDED VIEW)
                    </h3>
                  </div>
                </div>

                <div className="pm-zoom-controls">
                  <div className="pm-zoom-badge">
                    <Zap size={12} />
                    <span>80% SCREEN SCALE</span>
                  </div>
                  <button
                    type="button"
                    className="pm-zoom-close-btn"
                    onClick={() => setIsZoomed(false)}
                    title="Tutup (ESC)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Metrics Overview */}
              <div className="pm-zoom-metrics-bar">
                <div className="pm-metric-chip">
                  <span className="metric-label">TOTAL PLAN (MONTH)</span>
                  <span className="metric-val">{totalPlanMonth} TASKS</span>
                </div>
                <div className="pm-metric-chip">
                  <span className="metric-label">PLAN TARGET (AS OF D19)</span>
                  <span className="metric-val">{planToday} TASKS</span>
                </div>
                <div className="pm-metric-chip success">
                  <span className="metric-label">ACTUAL DONE (D19)</span>
                  <span className="metric-val">{actualToday} COMPLETED</span>
                </div>
                <div className="pm-metric-chip warning">
                  <span className="metric-label">CURRENT DELAY (D19)</span>
                  <span className="metric-val">-{delayToday} TASKS</span>
                </div>
                <div className="pm-metric-chip highlight">
                  <span className="metric-label">CURRENT ACHIEVEMENT</span>
                  <span className="metric-val">{achievementRateToday}%</span>
                </div>
              </div>

              {/* Modal Expanded SVG Chart Box */}
              <div className="pm-zoom-chart-wrap">
                {renderSvgChart(1100, 420, true)}

                {/* Hover Tooltip in Modal */}
                {activeHoverData && (
                  <div
                    className="pm-scurve-tooltip zoomed"
                    style={{
                      left: `${((activeHoverData.day - 1) / (daysInMonth - 1)) * 90 + 5}%`,
                    }}
                  >
                    <div className="tooltip-day">
                      TANGGAL {activeHoverData.day} {monthName.toUpperCase()}{' '}
                      {activeHoverData.day === currentRunningDay && '(HARI INI)'}
                    </div>
                    <div className="tooltip-row">
                      <span className="dot plan" />
                      <span>PLAN CUMULATIVE:</span>
                      <strong>{activeHoverData.plan} TASKS</strong>
                    </div>
                    <div className="tooltip-row">
                      <span className="dot actual" />
                      <span>ACTUAL CUMULATIVE:</span>
                      <strong>
                        {activeHoverData.isPastOrToday
                          ? `${activeHoverData.actual} TASKS`
                          : 'FUTURE'}
                      </strong>
                    </div>
                    <div
                      className={`tooltip-row ${activeHoverData.gap > 0 ? 'delay' : 'ok'}`}
                    >
                      <span className="dot gap" />
                      <span>GAP STATUS:</span>
                      <strong>
                        {activeHoverData.gap > 0
                          ? `DELAY ${activeHoverData.gap} TASKS`
                          : activeHoverData.gap === 0
                          ? 'ON TARGET'
                          : `+${Math.abs(activeHoverData.gap)} AHEAD`}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Legend */}
              <div className="pm-scurve-legend-bar">
                <div className="legend-entry">
                  <span className="legend-symbol plan-symbol" />
                  <span>PLAN CUMULATIVE ({totalPlanMonth} TASKS)</span>
                </div>
                <div className="legend-entry">
                  <span className="legend-symbol actual-symbol" />
                  <span>ACTUAL CUMULATIVE ({actualToday} DONE AS OF D19)</span>
                </div>
                <div className="legend-entry">
                  <span className="legend-symbol today-symbol" />
                  <span>RUNNING DATE CUTOFF: 19 AGUSTUS 2026</span>
                </div>
                <div className="legend-entry">
                  <span className="legend-symbol delay-symbol" />
                  <span>GAP TODAY: {delayToday} TASKS PENDING</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

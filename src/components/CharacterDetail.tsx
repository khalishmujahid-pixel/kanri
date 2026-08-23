import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ChevronDown,
  ZoomIn,
  X,
  ExternalLink,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import type { Character, CategoryKey, PmDocument, PmEquipmentEntry } from '../types/character';
import { PmProgressChart } from './PmProgressChart';
import { PmSCurveChart } from './PmSCurveChart';
import { ImprovementViewer } from './improvement/ImprovementViewer';
import { fetchLivePmSchedule } from '../services/googleSheetsService';
import { RefreshCw } from 'lucide-react';

interface CharacterDetailProps {
  character: Character;
  onBackToShowroom: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Derive available years from a list of PM documents */
function getYears(docs: PmDocument[]): number[] {
  return [...new Set(docs.map(d => d.year))].sort((a, b) => b - a);
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({
  character,
  onBackToShowroom,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('pm');

  // PM document filter state — default to latest doc's year/month
  const pmDocs = character.categories.pm.pmDocuments ?? [];
  const defaultYear = pmDocs.length > 0 ? pmDocs[pmDocs.length - 1].year : new Date().getFullYear();
  const defaultMonth = pmDocs.length > 0 ? pmDocs[pmDocs.length - 1].month : new Date().getMonth() + 1;
  const [pmYear, setPmYear] = useState<number>(defaultYear);
  const [pmMonth, setPmMonth] = useState<number>(defaultMonth);

  // Live Google Sheets Sync state
  const [liveSchedule, setLiveSchedule] = useState<PmEquipmentEntry[] | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  const syncFromSheets = async (isBackground = false) => {
    if (!isBackground) setIsLiveSyncing(true);
    const firstName = character.name.split(' ')[0]; // e.g. "KURDI"
    const data = await fetchLivePmSchedule(firstName);
    if (data && data.length > 0) {
      setLiveSchedule(data);
      setIsLiveActive(true);
      setLastSyncedTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }
    if (!isBackground) setIsLiveSyncing(false);
  };

  // Auto-fetch on entry + background polling every 20 seconds
  React.useEffect(() => {
    if (activeCategory === 'pm') {
      setLiveSchedule(null);
      setIsLiveActive(false);
      syncFromSheets(false); // Initial immediate sync
      const intervalId = setInterval(() => {
        syncFromSheets(true); // Background silent sync every 20s
      }, 20000);
      return () => clearInterval(intervalId);
    }
  }, [activeCategory, character.name]);

  // Lightbox state for PM document
  const [lightboxDoc, setLightboxDoc] = useState<PmDocument | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'image'>('pdf');

  // Escape key handler specifically for PM lightbox modal
  React.useEffect(() => {
    if (!lightboxDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setLightboxDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [lightboxDoc]);

  // Spotlight video playback state for expand menu
  const [spotlightVideoReady, setSpotlightVideoReady] = useState(false);

  const categoriesConfig: Array<{
    key: CategoryKey;
    icon: React.ReactNode;
    code: string;
    label: string;
  }> = [
    { key: 'idea', icon: <Lightbulb size={17} />, code: 'SEC-01', label: 'IDEA' },
    { key: 'pm', icon: <Wrench size={17} />, code: 'SEC-02', label: 'PM' },
    { key: 'improvement', icon: <TrendingUp size={17} />, code: 'SEC-03', label: 'IMPROVEMENT' },
    { key: 'safety', icon: <ShieldCheck size={17} />, code: 'SEC-04', label: 'SAFETY' },
  ];

  const currentCategoryData = character.categories[activeCategory];

  // Filtered PM documents based on selected year + month
  const filteredPmDocs = pmDocs.filter(d => d.year === pmYear && d.month === pmMonth);
  const availableYears = pmDocs.length > 0 ? getYears(pmDocs) : [new Date().getFullYear()];

  return (
    <>
      <motion.div
        className="detail-view-container"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Detail Navigation Header */}
        <div className="detail-header-bar">
          <button
            type="button"
            className="return-button"
            onClick={onBackToShowroom}
          >
            <ArrowLeft size={14} />
            <span>RETURN TO SHOWROOM</span>
          </button>

          <div className="detail-header-id">
            <span className="detail-code-badge">{character.code}</span>
            <span className="detail-header-title">
              {character.name} <span className="detail-header-sep">//</span> {character.zone}
            </span>
          </div>
        </div>

        {/* Main 2-Column Split / Responsive Flow */}
        <div className="detail-body-layout">
          {/* Left Column: Character Spotlight */}
          <aside className="detail-character-spotlight">
            <div className="spotlight-card">
              {/* Character Video Auto-Play in Expand Menu */}
              <video
                key={character.id}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setSpotlightVideoReady(true)}
                onError={() => setSpotlightVideoReady(false)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  opacity: spotlightVideoReady ? 1 : 0,
                  transition: 'opacity 0.7s ease-in-out',
                }}
              >
                <source src={`/assets/characters/${character.id}.mp4`} type="video/mp4" />
              </video>

              {/* Base Photo Fallback Layer */}
              <img
                src={character.image}
                alt={character.name}
                className="spotlight-photo"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  zIndex: 0,
                }}
              />
              <div className="spotlight-overlay" style={{ zIndex: 2 }} />
              <div className="spotlight-info-wrap" style={{ zIndex: 3 }}>
                <span className="spotlight-division">
                  {character.department} • {character.unit}
                </span>
                <h2 className="spotlight-name">{character.name}</h2>
              </div>
            </div>

            {/* Standardized Meta Data Structure */}
            <div className="spotlight-meta-block">
              <div className="meta-row">
                <span className="meta-key">DESIGNATION CODE</span>
                <span className="meta-val">{character.code}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">TEAM / ASSIGNMENT</span>
                <span className="meta-val">{character.department}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">SECURITY ZONE</span>
                <span className="meta-val">{character.zone}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">PROFILE STATUS</span>
                <span className="meta-val meta-status-active">
                  {character.status}
                </span>
              </div>
            </div>
          </aside>

          {/* Right Column: 4 Category Tabs & Content Area */}
          <main className="detail-main-content">
            {/* Category Navigation Tabs: IDEA | PM | IMPROVEMENT | SAFETY */}
            <nav className="category-nav-grid" aria-label="Category Sections">
              {categoriesConfig.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`category-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <div className="tab-top-row">
                      <span className="tab-code">{cat.code}</span>
                      <span className="tab-icon-wrap">
                        {cat.icon}
                      </span>
                    </div>
                    <span className="tab-label">{cat.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Active Category Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategoryData.id}
                className="category-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="panel-header-card">
                  <div className="panel-header-info">
                    <div className="panel-tagline">
                      {currentCategoryData.code} // {currentCategoryData.tagline}
                    </div>
                    <h3 className="panel-title">{currentCategoryData.label}</h3>
                    <p className="panel-desc">{currentCategoryData.description}</p>
                  </div>
                  <div className="panel-status-badge">
                    <FileText size={12} />
                    <span>{currentCategoryData.status}</span>
                  </div>
                </div>

                {/* ── PM special view: S-Curve Live Hero + Annual Execution Tracker + Filter ── */}
                {activeCategory === 'pm' ? (
                  <div className="category-content-body pm-dashboard-flow">
                    {/* S-Curve cumulative chart for active month (Primary Hero Top) */}
                    {((liveSchedule && liveSchedule.length > 0) || (filteredPmDocs.length > 0 && filteredPmDocs[0].equipmentSchedule && filteredPmDocs[0].equipmentSchedule.length > 0)) ? (
                      <PmSCurveChart
                        schedule={liveSchedule || filteredPmDocs[0].equipmentSchedule!}
                        month={pmMonth}
                        year={pmYear}
                        monthName={MONTHS[pmMonth - 1]}
                        isLiveActive={isLiveActive}
                        isLiveSyncing={isLiveSyncing}
                        lastSyncedTime={lastSyncedTime}
                        onForceSync={() => syncFromSheets(false)}
                      />
                    ) : (
                      <div className="ready-notice-box" style={{ margin: '8px 0 14px' }}>
                        <div className="ready-icon-wrap">
                          <RefreshCw size={18} className={isLiveSyncing ? 'spin-anim' : ''} />
                        </div>
                        <div className="ready-notice-text">
                          <span className="ready-notice-title">
                            {isLiveSyncing ? 'Menghubungkan & Memuat Data Live PM...' : `Jadwal PM Live untuk ${character.name}`}
                          </span>
                          <span className="ready-notice-sub">
                            {isLiveSyncing ? 'Mengambil data matrix peralatan dan kanban terkini dari Google Sheets.' : 'Klik tombol FORCE SYNC di atas jika data belum tampil.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Annual Tracker Grid (Secondary Overview) */}
                    {pmDocs.length > 0 && (
                      <PmProgressChart
                        pmDocuments={pmDocs}
                        year={pmYear}
                        selectedMonth={pmMonth}
                        onSelectMonth={setPmMonth}
                      />
                    )}

                    {/* Filter row */}
                    <div className="pm-filter-row">
                      {/* Year selector */}
                      <div className="pm-select-wrap">
                        <label className="pm-select-label">TAHUN</label>
                        <div className="pm-select-box">
                          <select
                            className="pm-select"
                            value={pmYear}
                            onChange={e => setPmYear(Number(e.target.value))}
                          >
                            {availableYears.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="pm-select-chevron" />
                        </div>
                      </div>

                      {/* Month selector */}
                      <div className="pm-select-wrap">
                        <label className="pm-select-label">BULAN</label>
                        <div className="pm-select-box">
                          <select
                            className="pm-select"
                            value={pmMonth}
                            onChange={e => setPmMonth(Number(e.target.value))}
                          >
                            {MONTHS.map((name, idx) => (
                              <option key={idx + 1} value={idx + 1}>{name}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="pm-select-chevron" />
                        </div>
                      </div>

                      <div className="pm-filter-info">
                        {filteredPmDocs.length > 0
                          ? `${filteredPmDocs.length} dokumen ditemukan`
                          : 'Tidak ada dokumen untuk periode ini'}
                      </div>
                    </div>

                    {/* Document cards — Sleek Proportional Dashboard Layout */}
                    {filteredPmDocs.length > 0 ? (
                      filteredPmDocs.map(doc => (
                        <div key={doc.id} className="pm-doc-card">
                          {/* Left: Compact Interactive Preview Thumbnail */}
                          <div className="pm-doc-thumb-container">
                            <button
                              type="button"
                              className="pm-doc-thumb-btn"
                              onClick={() => {
                                setViewMode('pdf');
                                setLightboxDoc(doc);
                              }}
                              title="Klik untuk membuka dokumen PDF HD"
                            >
                              <img
                                src={doc.imageUrl}
                                alt={doc.title}
                                className="pm-doc-thumb"
                              />
                              <div className="pm-doc-thumb-overlay">
                                <ZoomIn size={20} />
                                <span>Buka PDF HD</span>
                              </div>
                            </button>
                            <span className="pm-doc-thumb-caption">PREVIEW SCHEDULE</span>
                          </div>

                          {/* Right: Telemetry & Actions Hub */}
                          <div className="pm-doc-info-hub">
                            <div className="pm-doc-card-header">
                              <div className="pm-doc-tags-wrap">
                                <span className="card-id-tag">{doc.id}</span>
                                <span className="card-status-tag">
                                  {doc.status}
                                </span>
                                {doc.pdfUrl && (
                                  <span className="pm-doc-badge-pdf">
                                    <FileSpreadsheet size={11} />
                                    <span>VECTOR PDF HD</span>
                                  </span>
                                )}
                              </div>
                              <span className="pm-doc-period">
                                {MONTHS[doc.month - 1]} {doc.year}
                              </span>
                            </div>

                            <h4 className="pm-doc-card-title">{doc.title}</h4>

                            {doc.notes && (
                              <div className="pm-doc-meta-chips">
                                {doc.notes.split('|').map((note, nIdx) => {
                                  const trimmed = note.trim();
                                  return (
                                    <span key={nIdx} className="pm-meta-chip">
                                      {trimmed}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Action Buttons Bar */}
                            <div className="pm-doc-actions-bar">
                              <button
                                type="button"
                                className="pm-action-btn primary"
                                onClick={() => {
                                  setViewMode('pdf');
                                  setLightboxDoc(doc);
                                }}
                              >
                                <ZoomIn size={14} />
                                <span>Buka Viewer PDF (HD / Zoomable)</span>
                              </button>

                              {doc.pdfUrl && (
                                <a
                                  href={doc.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pm-action-btn secondary"
                                  title="Buka PDF di tab baru browser"
                                >
                                  <ExternalLink size={13} />
                                  <span>Tab Baru</span>
                                </a>
                              )}

                              {doc.pdfUrl && (
                                <a
                                  href={doc.pdfUrl}
                                  download={`PM_Schedule_${character.name}_${doc.year}_${doc.month}.pdf`}
                                  className="pm-action-btn secondary"
                                  title="Download file PDF asli"
                                >
                                  <Download size={13} />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="ready-notice-box">
                        <div className="ready-icon-wrap">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="ready-notice-text">
                          <span className="ready-notice-title">
                            Belum ada dokumen PM untuk {MONTHS[pmMonth - 1]} {pmYear}
                          </span>
                          <span className="ready-notice-sub">
                            Dokumen akan muncul di sini setelah ditambahkan ke sistem.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeCategory === 'improvement' ? (
                  /* ── Dedicated Interactive Improvement Kaizen View ── */
                  <div className="category-content-body improvement-view">
                    <ImprovementViewer character={character} />
                  </div>
                ) : (
                  /* Default view for non-PM/non-Improvement categories (IDEA, SAFETY) */
                  <div className="category-content-body">
                    {currentCategoryData.placeholderItems.map((item) => (
                      <div key={item.id} className="placeholder-card">
                        <div className="placeholder-card-header">
                          <span className="card-id-tag">{item.id}</span>
                          <span className="card-status-tag">{item.status}</span>
                        </div>
                        <h4 className="card-item-title">{item.title}</h4>
                        <p className="card-item-summary">{item.summary}</p>
                      </div>
                    ))}

                    {/* Structured Next Phase Ready Notice */}
                    <div className="ready-notice-box">
                      <div className="ready-icon-wrap">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="ready-notice-text">
                        <span className="ready-notice-title">
                          {currentCategoryData.label} Architecture Locked &amp; Ready
                        </span>
                        <span className="ready-notice-sub">
                          Detailed records, KPI metrics, logs, and submissions will populate this container in the next project step.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </motion.div>

      {/* ── PM Document Full-Screen Interactive Lightbox ── */}
      <AnimatePresence>
        {lightboxDoc && (
          <motion.div
            className="pm-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxDoc(null)}
          >
            <motion.div
              className="pm-lightbox-inner"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pm-lightbox-header">
                <div>
                  <span className="pm-lightbox-title">{lightboxDoc.title}</span>
                  <span className="pm-lightbox-period">
                    {MONTHS[lightboxDoc.month - 1]} {lightboxDoc.year} • {lightboxDoc.notes}
                  </span>
                </div>

                <div className="pm-lightbox-controls">
                  {lightboxDoc.pdfUrl && (
                    <div className="pm-view-toggle">
                      <button
                        type="button"
                        className={`pm-toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                        onClick={() => setViewMode('pdf')}
                      >
                        PDF HD (Vektor)
                      </button>
                      <button
                        type="button"
                        className={`pm-toggle-btn ${viewMode === 'image' ? 'active' : ''}`}
                        onClick={() => setViewMode('image')}
                      >
                        Gambar
                      </button>
                    </div>
                  )}

                  {lightboxDoc.pdfUrl && (
                    <a
                      href={lightboxDoc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pm-header-action-btn"
                      title="Buka di tab baru"
                    >
                      <ExternalLink size={14} />
                      <span>Buka Tab Baru</span>
                    </a>
                  )}

                  {lightboxDoc.pdfUrl && (
                    <a
                      href={lightboxDoc.pdfUrl}
                      download={`PM_Schedule_${character.name}_${lightboxDoc.year}_${lightboxDoc.month}.pdf`}
                      className="pm-header-action-btn"
                      title="Download PDF"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  )}

                  <button
                    type="button"
                    className="pm-lightbox-close"
                    onClick={() => setLightboxDoc(null)}
                    title="Tutup (ESC)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Viewer body */}
              <div className="pm-lightbox-content-wrap">
                {viewMode === 'pdf' && lightboxDoc.pdfUrl ? (
                  <iframe
                    src={`${lightboxDoc.pdfUrl}#toolbar=1&view=FitH`}
                    title={lightboxDoc.title}
                    className="pm-lightbox-iframe"
                  />
                ) : (
                  <div className="pm-lightbox-img-scroll">
                    <img
                      src={lightboxDoc.imageUrl}
                      alt={lightboxDoc.title}
                      className="pm-lightbox-img"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

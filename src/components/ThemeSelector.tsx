import React, { useState } from 'react';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';

interface ThemeConfig {
  id: ThemeMode;
  label: string;
  sublabel: string;
  dot: string;
  dotGlow: string;
  ring: string;
  icon: React.ReactNode;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'midnight',
    label: 'MIDNIGHT',
    sublabel: 'F1 Dark',
    dot: '#ff5500',
    dotGlow: 'rgba(255,85,0,0.55)',
    ring: 'rgba(255,85,0,0.4)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    id: 'presentation',
    label: 'PRESENT',
    sublabel: 'Boardroom',
    dot: '#2563eb',
    dotGlow: 'rgba(37,99,235,0.55)',
    ring: 'rgba(37,99,235,0.4)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="14" x="3" y="3" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'aurora',
    label: 'AURORA',
    sublabel: 'Elegant',
    dot: '#8b5cf6',
    dotGlow: 'rgba(139,92,246,0.55)',
    ring: 'rgba(139,92,246,0.4)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<ThemeMode | null>(null);

  const activeTheme = THEMES.find(t => t.id === theme)!;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'clamp(12px, 2.5vh, 24px)',
        right: 'clamp(12px, 2.5vw, 28px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {/* Expanded theme options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-end',
          overflow: 'hidden',
          maxHeight: isExpanded ? 200 : 0,
          opacity: isExpanded ? 1 : 0,
          transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
      >
        {THEMES.map((t) => {
          const isActive = t.id === theme;
          const isHovered = hoveredId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setIsExpanded(false); }}
              onMouseEnter={() => setHoveredId(t.id)}
              onMouseLeave={() => setHoveredId(null)}
              title={`Switch to ${t.label} theme`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px 7px 10px',
                borderRadius: 999,
                border: `1px solid ${isActive ? t.dot : isHovered ? t.ring : 'rgba(255,255,255,0.14)'}`,
                background: isActive
                  ? `rgba(${t.dot.replace('#','').match(/.{2}/g)!.map(h=>parseInt(h,16)).join(',')},0.18)`
                  : isHovered
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(12,17,29,0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isActive
                  ? `0 4px 18px ${t.dotGlow}, 0 0 0 1px ${t.dot}`
                  : '0 4px 12px rgba(0,0,0,0.4)',
                transform: isHovered ? 'translateX(-3px)' : 'translateX(0)',
              }}
            >
              {/* Dot indicator */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.dot,
                  boxShadow: isActive ? `0 0 8px ${t.dotGlow}` : 'none',
                  transition: 'box-shadow 0.2s',
                  flexShrink: 0,
                }}
              />
              {/* Icon */}
              <span
                style={{
                  color: isActive ? t.dot : 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
              >
                {t.icon}
              </span>
              {/* Label */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: isActive ? t.dot : isHovered ? '#ffffff' : 'rgba(255,255,255,0.65)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}
              >
                {t.label}
              </span>
              {/* Sublabel */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.sublabel}
              </span>
              {/* Active checkmark */}
              {isActive && (
                <span style={{ color: t.dot, marginLeft: 2, display: 'flex' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Toggle Pill — always visible */}
      <button
        onClick={() => setIsExpanded(e => !e)}
        title="Ganti tema"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 13px 7px 10px',
          borderRadius: 999,
          border: `1px solid ${isExpanded ? activeTheme.ring : 'rgba(255,255,255,0.16)'}`,
          background: isExpanded
            ? `rgba(${activeTheme.dot.replace('#','').match(/.{2}/g)!.map(h=>parseInt(h,16)).join(',')},0.15)`
            : 'rgba(12,17,29,0.78)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: isExpanded
            ? `0 6px 24px ${activeTheme.dotGlow}, 0 0 0 1px ${activeTheme.ring}`
            : '0 6px 20px rgba(0,0,0,0.45)',
        }}
      >
        {/* Active dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: activeTheme.dot,
            boxShadow: `0 0 8px ${activeTheme.dotGlow}`,
            animation: 'themeDotPulse 2.5s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        {/* Palette icon */}
        <span style={{ color: activeTheme.dot, display: 'flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
        </span>
        {/* Label */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: activeTheme.dot,
            whiteSpace: 'nowrap',
          }}
        >
          {activeTheme.label}
        </span>
        {/* Chevron */}
        <span
          style={{
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.3s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </span>
      </button>

      <style>{`
        @keyframes themeDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
};

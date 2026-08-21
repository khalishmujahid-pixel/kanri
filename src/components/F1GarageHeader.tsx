import React from 'react';

interface F1GarageHeaderProps {
  isMobile?: boolean;
}

export const F1GarageHeader: React.FC<F1GarageHeaderProps> = ({ isMobile = false }) => {
  return (
    <header className="f1-garage-header-container" aria-label="F1 Garage Pit Wall Header">
      <div className="f1-garage-badge">
        {/* Animated Neon Racing Border Sweep */}
        <div className="f1-badge-glow-border" />
        
        {/* Laser Scanline Beam Sweep */}
        <div className="f1-header-laser" />

        {/* Top Telemetry Row */}
        <div className="f1-telemetry-top-row">
          <div className="f1-beacon-wrap">
            <span className="f1-beacon-dot" />
            <span className="f1-beacon-ring" />
          </div>
          <span className="f1-pit-status-tag">
            {isMobile ? 'PIT GARAGE' : 'F1 PIT GARAGE // LIVE'}
          </span>
          <span className="f1-telemetry-sep" />
          <span className="f1-pit-shift-tag">
            {isMobile ? 'SHIFT RED' : 'SHIFT RED TEAM'}
          </span>
        </div>

        {/* Main Special Animated F1 Racing Text */}
        <div className="f1-main-title-row">
          <span className="f1-chevrons left">&gt;&gt;&gt;</span>
          <h1 className="f1-racing-text">PW MAINT BODY#2 RED ZONE</h1>
          <span className="f1-chevrons right">&gt;&gt;&gt;</span>
        </div>
      </div>
    </header>
  );
};

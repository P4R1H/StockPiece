// Notification.tsx
import React from 'react';
import './Onboarding.css';

interface TutorialOverlayProps {
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <button className="close" onClick={onClose}>×</button>
        <div className="welcome-section">
          <img src="/assets/stockpiecelogo.png" alt="StockPiece Logo" className="logo-image" />
        </div>
        <div className="tutorial-steps">
        <div className="section-title">Getting Started</div>
        <div className="info-list">
            <li>- Start with 5000 berries</li>
            <li>- Earn 100 berries on daily login!</li>
            <li>- Earn 500 berries per referral</li>
          </div>

          <div className="section-title">Market Schedule</div>
        <div className="info-list">
          <li>
            <span className="market-status market-green">Opens</span>
            : Thursday 8:30 PM UTC (TCB release)
          </li>
          <li>
            <span className="market-status market-red">Closes</span>
            : Monday 8:30 PM UTC (Spoilers)
          </li>
          <li>
            <span className="market-status market-blue">Prices Update</span>
            : Tuesday 8:30 PM UTC
          </li>
        </div>
        </div>

        <button className="start-button" onClick={onClose}>
          yeah man i know this shit already
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
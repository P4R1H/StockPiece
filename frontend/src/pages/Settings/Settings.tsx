import React, { useState } from 'react';
import './Settings.css'
import { } from './SettingsServices'

const SettingsPage: React.FC = () => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteAccount = () => {
    setShowConfirmDelete(true);
    // Implement delete account logic
  };

  const handleClearData = () => {
    // Implement clear data logic
  };

  return (
    <div className="settings-root">
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        
        <section className="settings-section">
          <h2>Account Settings</h2>
          <div className="settings-item" onClick={handleDeleteAccount}>
            <span>Delete account</span>
            <span className="settings-item-arrow">›</span>
          </div>
          <div className="settings-item" onClick={handleClearData}>
            <span>Clear data</span>
            <span className="settings-item-arrow">›</span>
          </div>
        </section>

        <section className="settings-section">
        </section>
      </div>

      <div className="about-container">
        <h2 className="about-title">About</h2>
        <div className="about-content">
          <p>Version 1.0.0</p>
          <p>© 2023 StockPiece</p>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="modal">
          {/* Add delete confirmation modal content */}
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
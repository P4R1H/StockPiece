import React, { useState } from 'react';
import './Settings.css';

interface Section {
  name: string;
  info: string;
  image: string;
}

const sections: Section[] = [
  {
    name: 'Crew',
    info: 'Crew:\nThe creators who made it.',
    image: '/assets/crew.png',
  },
  {
    name: 'Storage',
    info: 'Tools & Libraries:\nInformation about the tools and libraries used in the project.',
    image: '/assets/storage.png',
  },
  {
    name: 'Top Deck',
    info: '',
    image: '/assets/deck.png',
  },
  {
    name: 'Crows Nest',
    info: 'Settings:\nDelete Account\nDelete All Data',
    image: '/assets/crows_next.png',
  },
  {
    name: 'Ship Sails',
    info: '',
    image: '/assets/sails.png',
  },


];

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const handleSectionClick = (index: number) => {
    setActiveSection(activeSection === index ? null : index);
  };

  return (
    <div className="settings-page">
      {/* Animated Ocean Waves */}
      <div className="ocean-container">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`wave wave-${i}`}
            style={{
              animationDelay: `${-2*(i-1)}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Ship Container */}
        <div className="ship-container">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`ship-section ${activeSection === index ? 'active' : ''}`}
            >
              {/* Ship Image */}
              <div
                className="ship-image"
                style={{ backgroundImage: `url(${section.image})` }}
              />
              
              {/* Info Panel */}
              {activeSection === index && section.info && (
                <div className="info-overlay">
                  <h2>{section.name}</h2>
                  <div className="info-panel">
                    {section.info.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="nav-buttons">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => handleSectionClick(index)}
                className={`nav-button ${activeSection === index ? 'active' : ''}`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
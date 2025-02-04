import React from 'react';
import './Settings.css';

const SettingsPage: React.FC = () => {
  return (
    <div className="page">
      <div className="main-page-container">
        <div className="settings-container">
          {/* Title */}
          <div className="container-title">
            <span className="main-title">Captain's Quarters</span>
          </div>

          {/* Controls Section */}
          <section className="settings-section">
            <h2>Controls</h2>
            <div className="controls-buttons">
              <button className="danger-button">Delete Account</button>
              <button className="danger-button">Clear Data</button>
            </div>
          </section>

          <hr className="section-divider" />

          {/* Crew Section */}
          <section className="settings-section">
            <h2>Crew</h2>
            <div className="crew-members">
              <div className="crew-member">
                <img
                  src="https://avatars.githubusercontent.com/u/3075523?v=4"
                  alt="Developer 1"
                  className="crew-avatar"
                />
                <div className="crew-links">
                  <a
                    href="https://github.com/dev1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                      alt="GitHub"
                    />
                  </a>
                  <a
                    href="https://linkedin.com/in/dev1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios11/512/linkedin.png"
                      alt="LinkedIn"
                    />
                  </a>
                </div>
              </div>

              <div className="crew-member">
                <img
                  src="https://styles.redditmedia.com/t5_w4pxp/styles/profileIcon_8piqdbuaa8m91.png"
                  alt="Developer 2"
                  className="crew-avatar"
                />
                <div className="crew-links">
                  <a
                    href="https://github.com/dev2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                      alt="GitHub"
                    />
                  </a>
                  <a
                    href="https://linkedin.com/in/dev2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios11/512/linkedin.png"
                      alt="LinkedIn"
                    />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* Supplies Used Section */}
          <section className="settings-section">
            <h2>Supplies Used</h2>
            <div className="section-box supplies-box">
              <div className="supplies-icons">
                <img
                  src="https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png"
                  alt="React"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png"
                  alt="TypeScript"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
                  alt="JavaScript"
                  className="supply-icon"
                />
                <img
                  src="https://www.w3.org/html/logo/downloads/HTML5_Badge_512.png"
                  alt="HTML"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/CSS3_logo.svg/2048px-CSS3_logo.svg.png"
                  alt="CSS"
                  className="supply-icon"
                />
                <img
                  src="https://img.icons8.com/?size=512&id=74402&format=png"
                  alt="MongoDB"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/2078px-Vitejs-logo.svg.png"
                  alt="Vite"
                  className="supply-icon"
                />
                <img
                  src="https://static-00.iconduck.com/assets.00/node-js-icon-1817x2048-g8tzf91e.png"
                  alt="Node.js"
                  className="supply-icon"
                />
                <img
                  src="https://img.icons8.com/color/512/express-js.png"
                  alt="Express"
                  className="supply-icon"
                />
                              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* Manifesto Section */}
          <section className="settings-section">
            <h2>Manifesto</h2>
            <div className="section-box">
              <p className="manifesto-text">
                This website is a labor of love, built to provide a seamless and
                enjoyable experience for all users. We strive to create a platform
                that is both functional and beautiful, with a focus on user privacy
                and data security. Thank you for being part of our journey!
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

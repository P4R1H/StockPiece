import React from 'react';
import './Settings.css';

const SettingsPage: React.FC = () => {
  const [deleteText, setDeleteText] = React.useState("Delete Account");
  
  const deleteAccount = () => {
    if (!deleteText.includes("really")) {
      setDeleteText("Do you really want to delete account");
    } else {
      setDeleteText(`Do you ${"really ".repeat(deleteText.split("really").length)} want to delete account`);
    }
  }

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
              <button className="danger-button" onClick={deleteAccount}>{deleteText}</button>
              <button className="danger-button">Clear Data</button>
            </div>
          </section>

          <hr className="section-divider" />

          {/* Rest of the code remains the same */}
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
                    href="https://github.com/vc252"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Github_logo_svg.svg/1200px-Github_logo_svg.svg.png?20230420150203"
                      alt="GitHub"
                    />
                  </a>
                   
                  {/* Linkedin removed */}

                </div>
              </div>

              <div className="crew-member">
                <img
                  src="https://avatars.githubusercontent.com/u/76397616"
                  alt="Developer 2"
                  className="crew-avatar"
                />
                <div className="crew-links">
                  <a
                    href="https://github.com/P4R1H"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Github_logo_svg.svg/1200px-Github_logo_svg.svg.png?20230420150203"
                      alt="GitHub"
                    />
                  </a>

                  {/* Linkedin removed */}

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
                  title="React"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png"
                  alt="TypeScript"
                  title="TypeScript"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
                  alt="JavaScript"
                  title="JavaScript"
                  className="supply-icon"
                />
                <img
                  src="https://www.w3.org/html/logo/downloads/HTML5_Badge_512.png"
                  alt="HTML"
                  title="HTML"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/CSS3_logo.svg/2048px-CSS3_logo.svg.png"
                  alt="CSS"
                  title="CSS"
                  className="supply-icon"
                />
                <img
                  src="https://img.icons8.com/?size=512&id=74402&format=png"
                  alt="MongoDB"
                  title="MongoDB"
                  className="supply-icon"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/2078px-Vitejs-logo.svg.png"
                  alt="Vite"
                  title="Vite"
                  className="supply-icon"
                />
                <img
                  src="https://static-00.iconduck.com/assets.00/node-js-icon-1817x2048-g8tzf91e.png"
                  alt="Node.js"
                  title="Node.js"
                  className="supply-icon"
                />
                <img
                  src="https://img.icons8.com/color/512/express-js.png"
                  alt="Express"
                  title="Express"
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
                This website is a labor of love, built to provide a fun way for
                everyone to participate in predictions from an interface that is
                both functional and beautiful. We can't wait to see the 
                trends. Thank you for being part of our journey!
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="footer-links">
            <a
              href="https://reddit.com/r/stockpiece"
              target="_blank"
              rel="noopener noreferrer"
            >
              Feedback?
            </a>
            <a
              href="https://github.com/p4r1h/stockpiece"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contribute?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

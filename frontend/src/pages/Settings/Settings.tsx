import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import './Settings.css';

const SettingsPage: React.FC = () => {
  const [deleteText, setDeleteText] = useState("Delete Account");
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  // Add a usage counter state
  const [referralUses, setReferralUses] = useState(0);
  
  const deleteAccount = () => {
    if (!deleteText.includes("really")) {
      setDeleteText("Do you really want to delete account");
    } else {
      setDeleteText(`Do you ${"really ".repeat(deleteText.split("really").length)} want to delete account`);
    }
  }

  const toggleReferralInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReferralInfo(!showReferralInfo);
  }

  const generateReferralCode = () => {
    const code = 'Coming soon!';
    setReferralCode(code);
    setReferralUses(Math.floor(Math.random() * 5));
    setShowReferralCode(true);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
            <div className="referral-button-container">
              {!showReferralCode ? (
                <button className="primary-button" onClick={generateReferralCode}>
                  View Referral Code
                  <span className="info-icon" onClick={toggleReferralInfo}>?</span>
                </button>
              ) : (
                <div className="referral-code-container">
                  <div className="referral-info-wrapper">
                    <span className="referral-label">Your code: </span>
                    <span className="referral-usage" title="uses">{referralUses}/5</span>
                  </div>
                  <input type="text" className="referral-code-input" value={referralCode} readOnly />
                  <button className="copy-button" onClick={copyToClipboard} title={copied ? "Copied!" : "Copy to clipboard"}>
                    {copied ? <Check size={16} className="copy-icon" /> : <Copy size={16} className="copy-icon" />}
                  </button>
                </div>
              )}
              {showReferralInfo && (
                <div className="referral-info">
                  <p>Refer and earn! Every friend you bring gets you and your friend 500B, just ask them to enter your referral code while logging in with a new account in the "Enter coupon" field!</p>
                </div>
              )}
            </div>
          </section>

          <hr className="section-divider" />

          {/* Crew Section */}
          <section className="settings-section">
            <h2>Crew & Tools</h2>
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
                </div>
              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* Supplies Used Section */}
          <section className="settings-section">
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

          {/* Footer Links - updated with titles and hover effects */}
          <section className="settings-section socials-section">
            <h2>Socials</h2>
            <div className="footer-links">
              <a
                href="https://reddit.com/r/stockpiece"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                data-tooltip="r/stockpiece"
              >
                <img 
                  src="https://redditinc.com/hs-fs/hubfs/Reddit%20Inc/Brand/Reddit_Logo.png?width=800&height=800&name=Reddit_Logo.png" 
                  alt="Reddit" 
                  className="footer-icon" 
                />
              </a>
              <a
                href="https://github.com/P4R1H/StockPiece"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                data-tooltip="Contribute"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/24/Github_logo_svg.svg" 
                  alt="GitHub" 
                  className="footer-icon" 
                />
              </a>
              <a
                href="https://discord.gg/weFsk76xtq"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                data-tooltip="Feedback"
              >
                <img 
                  src="/assets/icons/discord.png" 
                  alt="GitHub" 
                  className="footer-icon" 
                />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
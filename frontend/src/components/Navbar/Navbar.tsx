import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  TrophyIcon, 
  SettingsIcon, 
  LogoutIcon, 
  LoginIcon, 
  MenuIcon 
} from './NavIcons'
import './Navbar.css'


interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const collapseBtnRef = useRef<HTMLButtonElement>(null);
  let scrollTimeout: number;

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        // Hide mobile nav and show the collapse button on scroll
        mobileNavRef.current?.classList.add('hidden');
        collapseBtnRef.current?.classList.add('visible');
        collapseBtnRef.current?.classList.remove('shine');

        window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          collapseBtnRef.current?.classList.add('shine');
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);

  const handleCollapseClick = () => {
    mobileNavRef.current?.classList.remove('hidden');
    collapseBtnRef.current?.classList.remove('visible', 'shine');
  };

  return (
    <>
      <header className="market-header">
        <div className="pirate-banner">
          <Link to="/">
            <img
              src="/assets/stockpiecelogo.png"
              alt="StockPiece Logo"
              className="market-logo"
            />
          </Link>
          <h1 className="market-title">Grand Line Exchange</h1>
        </div>
        <div className="nav-group desktop-nav">
          <Link to="/" className="nav-btn" data-tooltip="Home">
            <HomeIcon />
          </Link>
          <Link to="/leaderboard" className="nav-btn" data-tooltip="Leaderboard">
            <TrophyIcon />
          </Link>
          <Link to="/settings" className="nav-btn" data-tooltip="Settings">
            <SettingsIcon />
          </Link>
          {isLoggedIn ? (
            <button className="nav-btn logout-btn" data-tooltip="Logout" onClick={onLogout}>
              <LogoutIcon />
            </button>
          ) : (
            <Link to="/login" className="nav-btn login-btn" data-tooltip="Login">
              <LoginIcon />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      <div ref={mobileNavRef} className="nav-group mobile-nav">
        <Link to="/" className="nav-btn" data-tooltip="Home">
          <HomeIcon />
        </Link>
        <Link to="/leaderboard" className="nav-btn" data-tooltip="Leaderboard">
          <TrophyIcon />
        </Link>
        <Link to="/settings" className="nav-btn" data-tooltip="Settings">
          <SettingsIcon />
        </Link>
        {isLoggedIn ? (
          <button className="nav-btn logout-btn" data-tooltip="Logout" onClick={onLogout}>
            <LogoutIcon />
          </button>
        ) : (
          <Link to="/login" className="nav-btn login-btn" data-tooltip="Login">
            <LoginIcon />
          </Link>
        )}
      </div>

      {/* Collapse Button for Mobile */}
      <button ref={collapseBtnRef} className="collapse-btn" onClick={handleCollapseClick}>
        <MenuIcon />
      </button>
    </>
  );
};

export default React.memo(Navbar);

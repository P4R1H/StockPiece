import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import HomePage from './pages/Home/Home';
import LeaderboardPage from './pages/Leaderboard/Leaderboard';
import LoginPage from './pages/Login/Login';
import SettingsPage from './pages/Settings/Settings';
import AdminPanel from './pages/Admin/Admin';
import './App.css';
import { loginExists, logoutUser } from './pages/Login/LoginServices';

interface OnePieceStockMarketProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const OnePieceStockMarket: React.FC<OnePieceStockMarketProps> = ({ isLoggedIn, onLogout }) => {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showCollapseBtn, setShowCollapseBtn] = useState(false);
  const [shine, setShine] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        if (!navCollapsed) {
          setNavCollapsed(true);
        }
        setShowCollapseBtn(true);
        setShine(false);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setShine(true);
        }, 500);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [navCollapsed]);

  const handleCollapseBtnClick = () => {
    setNavCollapsed(false);
    setShowCollapseBtn(false);
    setShine(false);
  };

  return (
    <div className="one-piece-stock-market">
      <header className="market-header">
        <div className="pirate-banner">
          <img 
            src="/assets/stockpiecelogo.png" 
            alt="StockPiece Logo" 
            className="market-logo" 
          />
          <h1 className="market-title">Grand Line Exchange</h1>
        </div>
        <div className="nav-group desktop-nav">
          <Link to="/" className="nav-btn" data-tooltip="Home">
            <i className="fas fa-home"></i>
          </Link>
          <Link to="/leaderboard" className="nav-btn" data-tooltip="Leaderboard">
            <i className="fas fa-trophy"></i>
          </Link>
          <Link to="/settings" className="nav-btn" data-tooltip="Settings">
            <i className="fas fa-cog"></i>
          </Link>
          {isLoggedIn ? (
            <button className="nav-btn logout-btn" data-tooltip="Logout" onClick={onLogout}>
              <i className="fas fa-door-open"></i>
            </button>
          ) : (
            <Link to="/login" className="nav-btn login-btn" data-tooltip="Login">
              <i className="fas fa-sign-in-alt"></i>
            </Link>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route path="/leaderboard" element={<LeaderboardPage/>} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <footer className="market-footer">
        <p>© {new Date().getFullYear()} Straw Hat Investments. Sailing the Seas of Profit!</p>
      </footer>
      <div className={`nav-group mobile-nav ${navCollapsed ? 'hidden' : 'visible'}`}>
        <Link to="/" className="nav-btn" data-tooltip="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to="/leaderboard" className="nav-btn" data-tooltip="Leaderboard">
          <i className="fas fa-trophy"></i>
        </Link>
        <Link to="/settings" className="nav-btn" data-tooltip="Settings">
          <i className="fas fa-cog"></i>
        </Link>
        {isLoggedIn ? (
          <button className="nav-btn logout-btn" data-tooltip="Logout" onClick={onLogout}>
            <i className="fas fa-door-open"></i>
          </button>
        ) : (
          <Link to="/login" className="nav-btn login-btn" data-tooltip="Login">
            <i className="fas fa-sign-in-alt"></i>
          </Link>
        )}
      </div>
      <button 
        className={`collapse-btn ${showCollapseBtn ? 'visible' : ''} ${shine ? 'shine' : ''}`}
        onClick={handleCollapseBtnClick}
      >
        <i className="fas fa-bars"></i>
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await loginExists();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['leaderboardData']})
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardData']})  
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/Admin" element={<AdminPanel />} />
        <Route path="/*" element={
          <OnePieceStockMarket 
            isLoggedIn={isLoggedIn} 
            onLogout={handleLogout} 
          />
        } />
      </Routes>
    </Router>
  );
};

export default App;

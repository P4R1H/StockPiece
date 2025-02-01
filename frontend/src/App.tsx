import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/Home';
import LeaderboardPage from './pages/Leaderboard/Leaderboard';
import LoginPage from './pages/Login/Login';
import AdminPanel from './pages/Admin/Admin';
import './App.css';
import { refreshUserToken, logoutUser } from './pages/Login/LoginServices';

interface OnePieceStockMarketProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const OnePieceStockMarket: React.FC<OnePieceStockMarketProps> = ({ isLoggedIn, onLogout }) => {  
  return (
    <div className="one-piece-stock-market">
      <header className="market-header">
        <div className="pirate-banner">
          <img 
            src="/assets/skull-flag.png" 
            alt="Pirate Flag" 
            className="pirate-flag" 
          />
          <h1 className="market-title">StockPiece: Grand Line Exchange</h1>
        </div>
        
        <div className="nav-group">
          <Link 
            to="/" 
            className="nav-btn" 
            data-tooltip="Home"
          >
            <i className="fas fa-home"></i>
          </Link>
          <Link 
            to="/leaderboard" 
            className="nav-btn" 
            data-tooltip="Leaderboard"
          >
            <i className="fas fa-trophy"></i>
          </Link>
          <button 
            className="nav-btn" 
            data-tooltip="Settings"
          >
          <i className="fas fa-cog"></i>
          </button>
          {isLoggedIn ? (
            <button 
              className="nav-btn logout-btn" 
              data-tooltip="Logout"
              onClick={onLogout}
            >
            <i className="fas fa-door-open"></i>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="nav-btn login-btn" 
              data-tooltip="Login"
            >
              <i className="fas fa-sign-in-alt"></i>
            </Link>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/" element={
          <HomePage
            isLoggedIn={isLoggedIn}
          />
        } />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
      <footer className="market-footer">
        <p>© {new Date().getFullYear()} Straw Hat Investments. Sailing the Seas of Profit!</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await refreshUserToken();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []); // Empty array = run once on mount

  const authHandlers = useMemo(() => ({
    handleLogin: () => setIsLoggedIn(true),
    handleLogout: async () => {
      try {
        await logoutUser();
        setIsLoggedIn(false);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }), []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/" /> : <LoginPage onLogin={authHandlers.handleLogin} />
        } />
        <Route path="/Admin" element = {
          <AdminPanel />
        } />
        <Route path="/*" element={
          <OnePieceStockMarket 
            isLoggedIn={isLoggedIn} 
            onLogout={authHandlers.handleLogout} 
          />
        } />
      </Routes>
    </Router>
  );
};

export default App;
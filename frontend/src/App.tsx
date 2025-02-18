// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import HomePage from './pages/Home/Home';
import LeaderboardPage from './pages/Leaderboard/Leaderboard';
import LoginPage from './pages/Login/Login';
import SettingsPage from './pages/Settings/Settings';
import AdminPanel from './pages/Admin/Admin';
import './App.css';
import { loginExists, logoutUser } from './pages/Login/LoginServices';
import Navbar from './components/Navbar/Navbar';

interface OnePieceStockMarketProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const OnePieceStockMarket: React.FC<OnePieceStockMarketProps> = ({ isLoggedIn, onLogout }) => {
  return (
    <div className="one-piece-stock-market">
      {/* Entire Navbar is now a separate component */}
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      <footer className="market-footer">
        <p>© {new Date().getFullYear()} Straw Hat Investments. Sailing the Seas of Profit!</p>
      </footer>
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
    queryClient.invalidateQueries({ queryKey: ['leaderboardData'] });
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardData'] });
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route path="/Admin" element={<AdminPanel />} />
        <Route
          path="/*"
          element={<OnePieceStockMarket isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

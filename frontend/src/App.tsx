import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { useQueryClient } from '@tanstack/react-query'; 
import './App.css'; 
import { loginExists, logoutUser } from './pages/Login/LoginServices'; 
import Navbar from './components/Navbar/Navbar'; 
import HomePage from './pages/Home/Home'; 

const LeaderboardPage = React.lazy(() => import('./pages/Leaderboard/Leaderboard'));
const LoginPage = React.lazy(() => import('./pages/Login/Login'));
const SettingsPage = React.lazy(() => import('./pages/Settings/Settings'));
const AdminPanel = React.lazy(() => import('./pages/Admin/Admin'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

interface OnePieceStockMarketProps { 
  isLoggedIn: boolean; 
  onLogout: () => void; 
} 
 
const OnePieceStockMarket: React.FC<OnePieceStockMarketProps> = ({ isLoggedIn, onLogout }) => { 
  return ( 
    <div className="one-piece-stock-market"> 
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} /> 
      
      <Routes> 
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} /> 
        <Route path="/leaderboard" element={
            <LeaderboardPage />
        } /> 
        <Route path="/settings" element={
            <SettingsPage />
        } /> 
        <Route path="*" element={
            <NotFound />
        } />
      </Routes>
 
      <footer className="market-footer"> 
        <p>© {new Date().getFullYear()} StockPiece. Sailing the Seas of Profit!</p> 
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
        const resp = await loginExists(); 
        setIsLoggedIn(resp.data.loginStatus); 
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
 
  const isAdminDomain = window.location.host.includes('admin.'); 
 
  return ( 
    <Router> 
      <Routes> 
        {isAdminDomain ? ( 
          <Route path="/*" element={
              <AdminPanel />
          } /> 
        ) : ( 
          <> 
            <Route 
              path="/login" 
              element={isLoggedIn ? <Navigate to="/" /> : (
                  <LoginPage onLogin={handleLogin} />
              )} 
            /> 
            <Route 
              path="/*" 
              element={<OnePieceStockMarket isLoggedIn={isLoggedIn} onLogout={handleLogout} />} 
            /> 
          </> 
        )} 
      </Routes>
    </Router> 
  ); 
}; 
 
export default App;
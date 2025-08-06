import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { useQueryClient } from '@tanstack/react-query'; 
import './App.css'; 
import { loginExists, logoutUser } from './pages/Login/LoginServices'; 
import Navbar from './components/Navbar/Navbar'; 
import HomePage from './pages/Home/Home'; 
import WaitlistPage from './pages/Waitlist/Waitlist';
import { LoginResponse } from './pages/Login/LoginServices';
import { Toaster } from './components/Notifications/CustomSonner/CustomSonner';

const TutorialOverlay = React.lazy(()  => import('./components/Notifications/Onboarding/Onboarding'));
const LeaderboardPage = React.lazy(() => import('./pages/Leaderboard/Leaderboard'));
const LoginPage = React.lazy(() => import('./pages/Login/Login'));
const SettingsPage = React.lazy(() => import('./pages/Settings/Settings'));
const AdminPanel = React.lazy(() => import('./pages/Admin/Admin'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

interface OnePieceStockMarketProps { 
  isLoggedIn: boolean; 
  onLogout: () => void; 
  showTutorial: boolean; // Add to props
  setShowTutorial: (show: boolean) => void; // Add to props
} 



const OnePieceStockMarket: React.FC<OnePieceStockMarketProps> = ({ isLoggedIn, onLogout, showTutorial, setShowTutorial }) => { 
  const location = useLocation();
  const isWaitlistPage = location.pathname === '/waitlist';

  return ( 
    <div className="one-piece-stock-market"> 
      {!isWaitlistPage && <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />} 
      
      {showTutorial && (
        <TutorialOverlay 
          onClose={() => setShowTutorial(false)}
        />
      )}

      <Routes> 
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} /> 
        <Route path="/waitlist" element={<WaitlistPage />} />
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
 
      {!isWaitlistPage && (
        <footer className="market-footer"> 
          <p>© {new Date().getFullYear()} StockPiece. Sailing the Seas of Profit!</p> 
        </footer>
      )}
    </div> 
  ); 
}; 
 

const App: React.FC = () => { 
  const queryClient = useQueryClient(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showTutorial, setShowTutorial] = useState(false);

  const checkLoginStatus = async () => { 
    try { 
      const resp = await loginExists(); 
      setIsLoggedIn(resp.data.loginStatus); 
    } catch { 
      setIsLoggedIn(false); 
    } 
  }; 

  useEffect(() => { 
    checkLoginStatus(); 
  }, []); 
 
  const handleLogin = (loginResponse: LoginResponse) => {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardData'] });
      checkLoginStatus();
      
      if (loginResponse.data.firstTimeLogin) {
        setShowTutorial(true);
      }
    }, 300);
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
    <>
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
                element={<OnePieceStockMarket isLoggedIn={isLoggedIn} onLogout={handleLogout} showTutorial={showTutorial} setShowTutorial={setShowTutorial} />} 
              /> 
            </> 
          )} 
        </Routes>
      </Router> 
      <Toaster />
    </>
  ); 
}; 
 
export default App;
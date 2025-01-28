import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin();
      navigate('/');
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="ocean-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="sun-beam"></div>
      <div className="login-ship"></div>

      <div className="login-box">
        <div className="jolly-roger-container">
          <img
            src="/assets/skull-flag.png"
            alt="Jolly Roger"
            className="jolly-roger"
          />
          <div className="jolly-roger-glow"></div>
        </div>

        <h1 className="login-title">
          <span>StockPiece</span>
        </h1>
        <h3 className="login-subtitle">Put your bellies where your agenda is</h3>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group pirate-input">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Captain's Name"
              required
            />
          </div>

          <div className="input-group pirate-input">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="login-button pirate-button" disabled={isLoading}>
            {isLoading ? 'Setting Sail...' : activeTab === 'login' ? 'Hoist the Flag!' : 'Join the Crew!'}
            <div className="button-sheen"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
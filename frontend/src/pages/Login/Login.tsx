import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from './LoginServices';
import './Login.css';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (username.length < 3) errors.username = 'Username must be at least 3 characters long.';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters long.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearErrors = () => {
    setError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
  
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      if (activeTab === 'login') {
        await loginUser(username, password);
        onLogin();
        navigate('/');
      } else {
        await registerUser(username, password);
        console.log('User registered successfully');
        setActiveTab('login');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => {
              setActiveTab('login');
              clearErrors();
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              clearErrors();
            }}
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group pirate-input">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearErrors();
              }}
              placeholder="Captain's Name"
              required
            />
            {validationErrors.username && (
              <div className="tooltip">{validationErrors.username}</div>
            )}
          </div>

          <div className="input-group pirate-input">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearErrors();
              }}
              placeholder="Password"
              required
            />
            {validationErrors.password && (
              <div className="tooltip">{validationErrors.password}</div>
            )}
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
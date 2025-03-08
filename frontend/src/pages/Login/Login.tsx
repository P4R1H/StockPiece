import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from './LoginServices';
import { LoginResponse } from './LoginServices';
import './Login.css';

interface LoginPageProps {
  onLogin: (response: LoginResponse) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formState, setFormState] = useState({
    username: '',
    password: '',
    couponCode: '',
    isCouponActive: false,
    activeTab: 'login' as 'login' | 'register',
    isLoading: false,
    error: null as string | null,
    validationErrors: {} as { username?: string; password?: string; couponCode?: string }
  });

  const navigate = useNavigate();

  const isValid = useMemo(() => {
    const errors: { username?: string; password?: string; couponCode?: string } = {};
    if (formState.username.length < 3 && formState.username.length != 0) errors.username = 'Username must be at least 3 characters long';
    if (formState.password.length < 6 && formState.password.length != 0) errors.password = 'Password must be at least 6 characters long';
    setFormState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  }, [formState.username, formState.password]);

  const toggleCouponField = useCallback(() => {
    if (!formState.isCouponActive) {
      setFormState(prev => ({ ...prev, isCouponActive: true }));
    }
  }, [formState.isCouponActive]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (formState.activeTab === 'login') {
        const response = await loginUser(formState.username, formState.password, formState.couponCode);
        onLogin(response);
        navigate('/');
      } else {
        // Register first
        await registerUser(formState.username, formState.password);
        
        // Then automatically log in with the same credentials and pass the coupon code
        const loginResponse = await loginUser(formState.username, formState.password, formState.couponCode);
        onLogin(loginResponse);
        navigate('/');
      }
    } catch (err) {
      // Format error message with only first letter capitalized
      let errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      errorMsg = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1);
      
      setFormState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false
      }));
    }
  }, [formState.activeTab, formState.username, formState.password, formState.couponCode, isValid, navigate, onLogin]);

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
            src="/assets/skull-flag.webp"
            alt="Jolly Roger"
            className="jolly-roger"
          />
          <div className="jolly-roger-glow"></div>
        </div>

        <h1 className="login-title">
          <span>StockPiece</span>
        </h1>
        <h3 className="login-subtitle">Put your berries where your agenda is</h3>

        <div className="tabs">
          <button
            className={`tab ${formState.activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setFormState(prev => ({ ...prev, activeTab: 'login', error: null }))}
          >
            Login
          </button>
          <button
            className={`tab ${formState.activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setFormState(prev => ({ ...prev, activeTab: 'register', error: null }))}
          >
            Register
          </button>
        </div>

        {formState.error && <div className="error-message">{formState.error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group pirate-input">
            <input
              type="text"
              value={formState.username}
              onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value, error: null }))}
              placeholder="Captain's Name"
              required
            />
            {formState.validationErrors.username && (
              <div className="tooltip">{formState.validationErrors.username}</div>
            )}
          </div>

          <div className="input-group pirate-input">
            <input
              type="password"
              value={formState.password}
              onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value, error: null }))}
              placeholder="Password"
              required
            />
            {formState.validationErrors.password && (
              <div className="tooltip">{formState.validationErrors.password}</div>
            )}
          </div>

          <button type="submit" className="login-button pirate-button" disabled={formState.isLoading}>
            {formState.isLoading ? 'Setting Sail...' : formState.activeTab === 'login' ? 'Hoist the Flag!' : 'Join the Crew!'}
            <div className="button-sheen"></div>
          </button>
        </form>

        <div className={`coupon-container ${formState.isCouponActive ? 'active' : ''}`}>
          {!formState.isCouponActive ? (
            <div className="coupon-toggle" onClick={toggleCouponField}>
              Have a coupon?
            </div>
          ) : (
            <div className="coupon-input-container">
              <input
                type="text"
                value={formState.couponCode}
                onChange={(e) => setFormState(prev => ({ ...prev, couponCode: e.target.value }))}
                placeholder="Enter coupon code"
                className="coupon-field"
                autoFocus
                onBlur={() => {
                  if (!formState.couponCode.trim()) {
                    setFormState(prev => ({ ...prev, isCouponActive: false }));
                  }
                }}
              />
              {formState.validationErrors.couponCode && (
                <div className="tooltip">{formState.validationErrors.couponCode}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
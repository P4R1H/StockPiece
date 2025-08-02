import React, { useState, useCallback } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import './Waitlist.css';

const WaitlistPage: React.FC = () => {
  const [formState, setFormState] = useState({
    email: '',
    isLoading: false,
    isSuccess: false,
    error: null as string | null,
    validationError: null as string | null
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormState(prev => ({
      ...prev,
      email,
      error: null,
      validationError: email && !validateEmail(email) ? 'Please enter a valid email address' : null
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.email.trim()) {
      setFormState(prev => ({ ...prev, error: 'Email is required' }));
      return;
    }

    if (!validateEmail(formState.email)) {
      setFormState(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('https://backend.stockpiece.fun/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formState.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      setFormState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        email: ''
      }));
    } catch (err) {
      let errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      errorMsg = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1);
      
      setFormState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false
      }));
    }
  }, [formState.email]);

  return (
    <div className="waitlist-container">
      <div className="ocean-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="sun-beam"></div>
      <div className="waitlist-ship"></div>

      <div className="waitlist-box">
        <div className="jolly-roger-container">
          <img
            src="/assets/skull-flag.webp"
            alt="Jolly Roger"
            className="jolly-roger"
          />
          <div className="jolly-roger-glow"></div>
        </div>

        <h1 className="waitlist-title">
          <span>StockPiece</span>
        </h1>
        <h2 className="waitlist-subtitle">Relaunching September 2025</h2>
        <h3 className="waitlist-description">Get notified by entering your mail, We will never spam you.</h3>

        {formState.isSuccess ? (
          <div className="success-container">
            <CheckCircle size={48} className="success-icon" />
            <h3 className="success-title">Welcome aboard!</h3>
            <p className="success-message">
              You'll be notified as soon as we relaunch in September 2025.
            </p>
            <button 
              className="success-button pirate-button"
              onClick={() => setFormState(prev => ({ ...prev, isSuccess: false }))}
            >
              Add Another Email
              <div className="button-sheen"></div>
            </button>
          </div>
        ) : (
          <>
            {formState.error && <div className="error-message">{formState.error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group pirate-input">
                <div className="email-input-container">
                  <Mail size={20} className="email-icon" />
                  <input
                    type="email"
                    value={formState.email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    required
                    disabled={formState.isLoading}
                  />
                </div>
                {formState.validationError && (
                  <div className="tooltip">{formState.validationError}</div>
                )}
              </div>

              <button 
                type="submit" 
                className="waitlist-button pirate-button" 
                disabled={formState.isLoading || !!formState.validationError}
              >
                {formState.isLoading ? 'Subscribing...' : 'Join Waitlist'}
                <div className="button-sheen"></div>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitlistPage;

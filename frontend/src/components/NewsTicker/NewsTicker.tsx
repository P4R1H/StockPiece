import React, { useState, useEffect } from 'react';
/* Important: CSS import order */
import './NewsTicker.css';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';

interface NewsTickerProps {
  isLoggedIn?: boolean;
  marketStatusOverride?: 'closed' | 'open' | 'updating';
}

const NewsTicker: React.FC<NewsTickerProps> = ({ 
  isLoggedIn = false,
  marketStatusOverride 
}) => {
  const newsItems = isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS;
  
  const [marketStatus, setMarketStatus] = useState<'closed' | 'open' | 'updating'>('closed');

  useEffect(() => {
    if (marketStatusOverride !== undefined) {
      setMarketStatus(marketStatusOverride);
      return;
    }

    const determineMarketStatus = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = now.getUTCHours(); // IST is UTC+5:30
      const minutes = now.getUTCMinutes();
      
      // Convert current time to IST (UTC+5:30)
      let istHours = (hours + 5) % 24;
      const istMinutes = (minutes + 30) % 60;
      // If minutes overflow, add an hour
      if (minutes + 30 >= 60) {
        istHours = (istHours + 1) % 24;
      }

      // Monday 11:59 PM IST - Market Opens
      if (dayOfWeek === 1 && istHours === 23 && istMinutes === 59) {
        return 'open';
      }
      // Tuesday 11:59 PM IST - Market Updates
      else if (dayOfWeek === 2 && istHours === 23 && istMinutes === 59) {
        return 'updating';
      }
      // Thursday 11:59 PM IST - Market Closes
      else if (dayOfWeek === 4 && istHours === 23 && istMinutes === 59) {
        return 'closed';
      }
      
      // Otherwise, keep current status
      return marketStatus;
    };
    
    // Set initial market status
    setMarketStatus(determineMarketStatus());
    
    // Update market status every minute
    const intervalId = setInterval(() => {
      setMarketStatus(determineMarketStatus());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [marketStatusOverride, marketStatus]);
  
  return (
    <div className={`news-ticker market-${marketStatus}`}>
      <div className="ticker-content">
        {newsItems.map((item, index) => (
          <span key={index} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;

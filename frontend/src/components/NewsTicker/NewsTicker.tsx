import React, { useState, useEffect } from 'react';
import './NewsTicker.css';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';

// Market status enum
enum MarketStatus {
  CLOSED = 'closed',
  OPEN = 'open',
  UPDATING = 'updating'
}

interface NewsTickerProps {
  isLoggedIn?: boolean;
  // Optional override for market status (for testing)
  marketStatusOverride?: MarketStatus;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ 
  isLoggedIn = false,
  marketStatusOverride 
}) => {
  // Determine which news items to display based on login status
  const newsItems = isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS;
  
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(MarketStatus.CLOSED);

  useEffect(() => {
    // If an override is provided, use it
    if (marketStatusOverride !== undefined) {
      setMarketStatus(marketStatusOverride);
      return;
    }

    // Otherwise, determine market status based on time
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
        return MarketStatus.OPEN;
      }
      // Tuesday 11:59 PM IST - Market Updates
      else if (dayOfWeek === 2 && istHours === 23 && istMinutes === 59) {
        return MarketStatus.UPDATING;
      }
      // Thursday 11:59 PM IST - Market Closes
      else if (dayOfWeek === 4 && istHours === 23 && istMinutes === 59) {
        return MarketStatus.CLOSED;
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
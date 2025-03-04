import React, { useState, useEffect } from 'react';
import './NewsTicker.css';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';

interface NewsTickerProps {
  isLoggedIn?: boolean;
  // Optional override for market status (for testing)
  marketStatusOverride?: string;
}

const NewsTicker: React.FC<NewsTickerProps> = ({
  isLoggedIn = false,
  marketStatusOverride,
}) => {
  const newsItems = isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS;
  
  // Using string state directly; default is "closed"
  const [marketStatus, setMarketStatus] = useState('closed');

  useEffect(() => {
    // If an override is provided, use it
    if (marketStatusOverride !== undefined) {
      setMarketStatus(marketStatusOverride);
      return;
    }

    const determineMarketStatus = () => {
      const now = new Date();
      const istTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      // JS getDay() returns: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
      const day = istTime.getDay();
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      const boundary = 23 * 60 + 59; // 11:59 PM = 1439 minutes

      // Open period: from Thursday 11:59 PM to Monday 11:59 PM
      // (Thursday: if time >= 11:59, Friday, Saturday, Sunday,
      //  Monday: if time is before 11:59)
      if (
        (day === 4 && currentMinutes >= boundary) ||
        day === 5 ||
        day === 6 ||
        day === 0 ||
        (day === 1 && currentMinutes < boundary)
      ) {
        return 'open';
      }

      // Updating period: from Monday 11:59 PM to Tuesday 11:59 PM
      if (
        (day === 1 && currentMinutes >= boundary) ||
        (day === 2 && currentMinutes < boundary)
      ) {
        return 'updating';
      }

      // Closed period: from Tuesday 11:59 PM to Thursday 11:59 PM
      if (
        (day === 2 && currentMinutes >= boundary) ||
        day === 3 ||
        (day === 4 && currentMinutes < boundary)
      ) {
        return 'closed';
      }

      // Default to closed
      return 'closed';
    };

    // Set the initial market status
    setMarketStatus(determineMarketStatus());

    // Update the market status every minute
    const intervalId = setInterval(() => {
      setMarketStatus(determineMarketStatus());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [marketStatusOverride]);

  return (
    <div className={marketStatus === 'open' 
      ? 'news-ticker market-open' 
      : marketStatus === 'updating' 
        ? 'news-ticker market-updating' 
        : 'news-ticker market-closed'}>
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

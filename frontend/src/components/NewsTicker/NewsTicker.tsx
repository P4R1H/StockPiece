import React from 'react';
import './NewsTicker.css';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';

interface NewsTickerProps {
  isLoggedIn?: boolean;  // Make this optional with a default value
}

const NewsTicker: React.FC<NewsTickerProps> = ({ isLoggedIn = false }) => {
  // Determine which news items to display based on login status
  const newsItems = isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS;
  
  return (
    <div className="news-ticker">
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
import React from 'react';
import './NewsTicker.css';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';
import { MarketStatus } from '../../utils/MarketStatus';

interface NewsTickerProps {
  isLoggedIn?: boolean;
  marketStatus: MarketStatus;
}

const NewsTicker: React.FC<NewsTickerProps> = ({
  isLoggedIn = false,
  marketStatus
}) => {
  const newsItems = isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS;
  
  return (
    <div className={
      marketStatus === 'open' 
        ? 'news-ticker market-open' 
        : marketStatus === 'updating' 
          ? 'news-ticker market-updating' 
          : 'news-ticker market-closed'
    }>
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

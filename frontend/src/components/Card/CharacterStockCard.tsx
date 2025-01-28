import React from 'react';
import { Eye, EyeOff, Crosshair } from 'lucide-react';
import './CharacterStockCard.css';

interface CharacterStock {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  ownedCount: number;
  visibility: 'show' | 'hide' | 'only';
}

interface CharacterStockCardProps {
  stock: CharacterStock;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
  onVisibilityChange: (characterId: string, newState: 'show' | 'hide' | 'only') => void;
}

const CharacterStockCard: React.FC<CharacterStockCardProps> = ({ 
  stock, 
  onBuy, 
  onSell,
  onVisibilityChange
}) => {
  const { id, name, image, currentPrice, ownedCount, visibility } = stock;

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'show': return <Eye size={14} />;
      case 'hide': return <EyeOff size={14} />;
      case 'only': return <Crosshair size={14} />;
    }
  };

  const cycleVisibility = () => {
    const nextState = visibility === 'show' ? 'hide' : visibility === 'hide' ? 'only' : 'show';
    onVisibilityChange(id, nextState);
  };

  return (
    <div className="op-stock-card">
      <div className="op-image-container">
        <img src={image} alt={name} className="op-character-image" />
        <button 
          className="op-visibility-toggle"
          onClick={cycleVisibility}
          data-visibility={visibility}
        >
          {getVisibilityIcon()}
        </button>
      </div>
      
      <div className="op-divider" />

      <div className="op-card-body">
        <div className="op-header">
          <h3 className="op-character-name">{name}</h3>
          <span className="op-character-price">{currentPrice.toLocaleString()}฿</span>
        </div>

        <div className="op-meta">
          <span className="op-owned">Owned: {ownedCount}</span>
          <div className="op-actions">
            <button 
              className="op-buy-button"
              onClick={() => onBuy(id)}
            >
              Buy
            </button>
            <button 
              className="op-sell-button"
              onClick={() => onSell(id)}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterStockCard;
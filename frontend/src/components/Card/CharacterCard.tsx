import React from 'react';
import { Eye, EyeOff, Crosshair } from 'lucide-react';
import { CharacterCardProps } from '../../types/Stocks';
import './CharacterCard.css';

const CharacterCard: React.FC<CharacterCardProps> = ({ 
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

  const stockBought = async ( name : string ) => {
   
    
  }

  const stockSold = ( name : string) => {
    
  }

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
              onClick={() => stockBought(name)}
            >
              Buy
            </button>
            <button 
              className="op-sell-button"
              onClick={() => stockSold(name)}
              
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
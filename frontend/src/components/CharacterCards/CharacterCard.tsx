import React, { useCallback } from 'react';
import { Eye, EyeOff, Crosshair } from 'lucide-react';
import { CharacterCardProps } from '../../types/Stocks';
import './CharacterCard.css';

const VISIBILITY_ICONS = {
  show: Eye,
  hide: EyeOff,
  only: Crosshair,
};

const CharacterCard: React.FC<CharacterCardProps> = React.memo(
  ({ stock, qty, maxQty, onBuy, onSell, onVisibilityChange, ownedQuantity }) => {
    const { id, name, image, currentPrice, visibility, tickerSymbol } = stock;
    const VisibilityIcon = VISIBILITY_ICONS[visibility] || Eye;

    // Toggle visibility state
    const handleVisibilityToggle = useCallback(() => {
      const nextVisibility =
        visibility === 'show' ? 'hide' : visibility === 'hide' ? 'only' : 'show';
      onVisibilityChange(id, nextVisibility);
    }, [visibility, id, onVisibilityChange]);

    // Calculate quantities and prices
    const buyQuantity = qty === 'max' ? maxQty || 0 : parseInt(qty);
    const sellQuantity =
      qty === 'max'
        ? ownedQuantity
        : parseInt(qty) > ownedQuantity
          ? ownedQuantity
          : parseInt(qty);
    const totalPrice = Math.floor(currentPrice) * buyQuantity;
    const formattedTotalPrice = `${totalPrice.toLocaleString()}฿`;
    const sellValue = Math.floor(currentPrice) * sellQuantity;
    const sellTooltip = sellQuantity > 0 ? `Earns ${sellValue.toLocaleString()}฿` : '';

    return (
      <div className="stock-card">
        {/* Image Section */}
        <div className="image-container">
          <img
            draggable="false"
            src={image}
            alt={name}
            className="character-image"
            loading="lazy"
          />
          <button
            className="visibility-toggle"
            onClick={handleVisibilityToggle}
            data-visibility={visibility}
          >
            <VisibilityIcon size={14} />
          </button>
        </div>

        <div className="divider" />

        {/* Card Content */}
        <div className="card-body">
          <div className="header">
            <div className="character-name">
              <span className="name-text" title={name}>
                {name}
              </span>
              <span className="ticker-symbol">{tickerSymbol}</span>
            </div>
          </div>
            <span className="character-price">{formattedTotalPrice}</span>
            {(qty === 'max' || buyQuantity > 1) && (
              <span className="base-price">
                ({Math.floor(currentPrice).toLocaleString()}฿ each)
              </span>
            )}


          <span className="owned-quantity">Owned: {ownedQuantity}</span>
          <div className="actions">
            <button
              className="buy-button"
              onClick={() => onBuy(name)}
              disabled={buyQuantity <= 0}
            >
              Buy
              {qty === 'max'
                ? buyQuantity > 0
                  ? ` ${buyQuantity}`
                  : ' 0'
                : buyQuantity > 1
                  ? ` ${buyQuantity}`
                  : ''}
            </button>
            <button
              className="sell-button"
              onClick={() => onSell(name)}
              disabled={sellQuantity <= 0}
              title={sellTooltip}
            >
              Sell{sellQuantity > 1 ? ` ${sellQuantity}` : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default CharacterCard;
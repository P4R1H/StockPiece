import React from 'react';
import './Portfolio.css';
import { BountyProfileCardProps } from '../../types/Components'

const BountyProfileCard: React.FC<BountyProfileCardProps> = ({
  userName,
  netWorth,
  profitLossOverall,
  profitLossLastChapter,
  profileImage,
}) => {
  return (
    <div className="bounty-card">
      <div className="bounty-image-container">
        <img
          src={profileImage || '/assets/placeholder-profile.png'}
          alt="User"
          className="bounty-image"
        />
      </div>
      <div className="bounty-details">
        <h1 className="bounty-name">{userName}</h1>
        <p className="bounty-status">Pirate Investor</p>
        <p className="bounty-net-worth">
          Net Worth: <span className="highlight">{netWorth} Bellies</span>
        </p>
        <p className="bounty-profit-loss">
          Profit/Loss Overall: <span className="highlight">{profitLossOverall}</span>{' '}
          <span className="profit-loss-last-chapter">
            (Last Chapter: <span className="highlight">{profitLossLastChapter}</span>)
          </span>
        </p>
      </div>
    </div>
  );
};

export default BountyProfileCard;

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BountyProfileCardProps } from '../../types/Components';
import './Portfolio.css'

import { server } from '../../App.tsx'

const formatWorth = (value: number): string => {  
  return isNaN(value) ? '0' : Math.floor(value).toLocaleString(undefined);
};

const formatPercentage = (value: number): string => {
  const truncated = Math.floor(value * 100) / 100;
  return truncated.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};


const BountyProfileCard: React.FC<BountyProfileCardProps> = ({
  userName,
  netWorth,
  cash,
  profitLossOverall,
  profitLossLastChapter,
  profileImage,
  isLoggedIn,
}) => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNavigateToLogin = useCallback(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate, isLoggedIn]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(`${server}/api/v1/user/profile/avatar`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      console.log('Profile image uploaded successfully');
      
    } catch (error) {
      console.error('Upload error:', error);
      setPreview(null);
    }
    setLoading(false);
  }, []);

  return (
    <div className="bounty-card">
      <div
        className="bounty-image-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {profileImage || preview ? (
          <>
            <img
              src={preview || profileImage!}
              alt="User"
              className="bounty-image"
            />
            {loading && (
              <div className="spinner-overlay">
                <div className="spinner"></div>
              </div>
            )}
            {isLoggedIn && !loading && (
              <div
                className={`overlay ${isHovering ? 'overlay-visible' : ''}`}
                onClick={handleUploadClick}
              >
                Change Profile Picture
              </div>
            )}
          </>
        ) : (
          <div
            className={`upload-area ${isLoggedIn ? 'clickable' : 'login-prompt'}`}
            onClick={isLoggedIn ? handleUploadClick : handleNavigateToLogin}
            style={{ cursor: isLoggedIn ? 'pointer' : 'pointer' }}
          >
            <span>
              {isLoggedIn
                ? 'Click to upload profile picture'
                : 'Login / Register to set a profile picture'}
            </span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={!isLoggedIn || loading}
        />
      </div>
      <div className="bounty-details">
        <p className="bounty-name">{userName}</p>
        <p className="bounty-net-worth">
          Net Worth: <span className="highlight">{formatWorth(netWorth)} Berries</span> &nbsp;
          Cash: <span className="highlight">{formatWorth(cash)} Berries</span>
        </p>
        <p className="bounty-profit-loss">
          Profit/Loss Overall: 
          <span className={`highlight ${profitLossOverall >= 0 ? 'profit' : 'loss'}`}>
            {formatPercentage(profitLossOverall)}%
          </span>
          <span className="profit-loss-last-chapter">
            {' '}
            (Last Chapter: 
            <span className={`highlight ${profitLossLastChapter >= 0 ? 'profit' : 'loss'}`}>
              {formatPercentage(profitLossLastChapter)}%
            </span>)
          </span>
        </p>
      </div>
    </div>
  );
};

export default BountyProfileCard;
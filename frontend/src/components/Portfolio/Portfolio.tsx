import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BountyProfileCardProps } from '../../types/Components';
import './Portfolio.css'

const formatNumber = (value: string | number): string => {
  const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
  const num = parseFloat(cleanValue);
  
  if (isNaN(num)) return '0';

  if (Math.abs(num) >= 1000000) {
    return num.toLocaleString(undefined, { 
      maximumFractionDigits: 0 
    });
  }
  
  if (Math.abs(num) >= 1000) {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 1 
    });
  }
  
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
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
      const response = await fetch('/api/v1/user/update-avatar', {
        method: 'POST',
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
          Net Worth: <span className="highlight">{formatNumber(netWorth)} Bellies</span> &nbsp;
          Cash: <span className="highlight">{formatNumber(cash)} Bellies</span>
        </p>
        <p className="bounty-profit-loss">
          Profit/Loss Overall: 
          <span className={`highlight ${parseFloat(String(profitLossOverall)) >= 0 ? 'profit' : 'loss'}`}>
            {formatNumber(profitLossOverall)}%
          </span>
          <span className="profit-loss-last-chapter">
            {' '}
            (Last Chapter: 
            <span className={`highlight ${parseFloat(String(profitLossLastChapter)) >= 0 ? 'profit' : 'loss'}`}>
              {formatNumber(profitLossLastChapter)}%
            </span>)
          </span>
        </p>
      </div>
    </div>
  );
};

export default BountyProfileCard;
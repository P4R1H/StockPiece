// Portfolio.tsx (or BountyProfileCard.tsx)
import React, { useState, useRef, useCallback } from 'react';
import './Portfolio.css';
import { BountyProfileCardProps } from '../../types/Components';

const BountyProfileCard: React.FC<BountyProfileCardProps> = ({
  userName,
  netWorth,
  cash,
  profitLossOverall,
  profitLossLastChapter,
  profileImage,
  isLoggedIn,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file selection and upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // Create a preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Prepare form data and upload
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
      // Remove the preview if upload fails
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

            {/* Show spinner overlay while loading */}
            {loading && (
              <div className="spinner-overlay">
                <div className="spinner"></div>
              </div>
            )}

            {/* Only show the "Change Profile Picture" overlay if not loading */}
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
            className={`upload-area ${isLoggedIn ? 'clickable' : 'disabled'}`}
            onClick={isLoggedIn ? handleUploadClick : undefined}
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
          disabled={!isLoggedIn || loading}  // disable input during upload
        />
      </div>
      <div className="bounty-details">
        <p className="bounty-name">{userName}</p>
        <p className="bounty-net-worth">
          Net Worth: <span className="highlight">{netWorth} Bellies</span> &nbsp;
          Cash: <span className="highlight">{cash} Bellies</span>
        </p>
        <p className="bounty-profit-loss">
          Profit/Loss Overall: <span className="highlight">{profitLossOverall}</span>
          <span className="profit-loss-last-chapter">
            {' '}
            (Last Chapter: <span className="highlight">{profitLossLastChapter}</span>)
          </span>
        </p>
      </div>
    </div>
  );
};

export default BountyProfileCard;

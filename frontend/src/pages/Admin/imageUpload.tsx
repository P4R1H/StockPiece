import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Stock } from '../../types/Pages'; 

// Interface for ImageUploadComponentProps
interface ImageUploadComponentProps {
  initialImageUrl?: string;
  onFileSelected?: (file: File) => void;
  onFileProcessed: (optimizedFile: File) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  defaultQuality?: number;
}

// ImageUploadComponent
export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  initialImageUrl,
  onFileSelected,
  onFileProcessed,
  onProcessingChange,
  defaultQuality = 25,
}) => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl || '');
  const [quality, setQuality] = useState<number>(defaultQuality);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      if (onFileSelected) onFileSelected(file);
      processImage(file, quality);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const processImage = async (file: File, qualityValue: number) => {
    setIsProcessing(true);
    onProcessingChange?.(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const origWidth = img.width;
        const origHeight = img.height;
        const newWidth = 300;
        const newHeight = Math.floor(origHeight * (newWidth / origWidth));

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setOptimizedSize(blob.size);
              const optimizedUrl = URL.createObjectURL(blob);
              setPreviewUrl(optimizedUrl);
              const optimizedFile = new File([blob], 'optimized.webp', { type: 'image/webp' });
              onFileProcessed(optimizedFile);
              setIsProcessing(false);
              onProcessingChange?.(false);
            }
          },
          'image/webp',
          qualityValue / 100
        );
        URL.revokeObjectURL(img.src);
      };
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      onProcessingChange?.(false);
    }
  };

  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseInt(e.target.value);
    setQuality(newQuality);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (originalImage) processImage(originalImage, newQuality);
    }, 300) as unknown as number;
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="imagePreviewContainer" onClick={triggerFileInput}>
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="imagePreview" />
            <div className="previewOverlay">
              <span>{isProcessing ? 'Processing...' : 'Click to change'}</span>
            </div>
          </>
        ) : (
          <div className="emptyPreview">
            <span>Click to upload image</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {optimizedSize !== null && (
        <div className="sizeInfo">
          Size: {(optimizedSize / 1024).toFixed(2)} KB
        </div>
      )}
      <div className="qualitySliderContainer">
        <div className="sliderLabel">
          <span>Quality</span>
          <span className="qualityValue">{quality}%</span>
        </div>
        <input
          type="range"
          min="2"
          max="100"
          value={quality}
          onChange={handleQualityChange}
          className="qualitySlider"
          disabled={isProcessing || !originalImage}
        />
      </div>
    </div>
  );
};

export interface ImageUpdateModalProps {
  stock: Stock;
  onClose: () => void;
  onSubmit: (imageFile: File) => void;
}

export const ImageUpdateModal: React.FC<ImageUpdateModalProps> = ({ stock, onClose, onSubmit }) => {
  const [optimizedFile, setOptimizedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!optimizedFile) {
      setStatusMessage({ text: 'Please select and process an image first', type: 'error' });
      return;
    }
    try {
      onSubmit(optimizedFile);
    } catch (error) {
      setStatusMessage({ text: 'Failed to update image. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">Update Image for {stock.name}</h2>
        {statusMessage.text && (
          <div className={`statusMessage ${statusMessage.type}Message`}>{statusMessage.text}</div>
        )}
        <ImageUploadComponent
          initialImageUrl={stock.image}
          onFileProcessed={setOptimizedFile}
          onProcessingChange={setIsProcessing}
        />
        <form onSubmit={handleSubmit}>
          <div className="modalButtons">
            <button type="button" onClick={onClose} className="cancelButton">
              Cancel
            </button>
            <button type="submit" className="submitButton" disabled={isProcessing || !optimizedFile}>
              {isProcessing ? 'Processing...' : 'Update Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
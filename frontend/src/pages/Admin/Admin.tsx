import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { ErrorLog, Stock, LatestChapter, Stats, StockStats, AdminStockCardProps} from '../../types/Pages';
import {
  adminLogin,
  adminLogout,
  getMarketStatus,
  openMarket,
  closeMarket,
  getStocks,
  addCharacterStock,
  removeCharacterStock,
  manualPriceUpdate,
  getMarketStatistics,
  getLatestChapter,
  releaseNewChapter,
  forcePriceUpdates,
  callCustomEndpoint,
  fetchErrors,
  changeCharacterImage,
  toggleNextRelease,
  getNextReleaseStatus
} from './AdminServices';
import './Admin.css'



const AdminStockCard: React.FC<AdminStockCardProps> = ({
  stock,
  stats,
  onRemove,
  onPriceUpdate,
  onImageClick
}) => {
  const [manualPrice, setManualPrice] = useState<string>('');
  const newPrice = stats[stock.name]?.newValue;

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPrice) return;
    await onPriceUpdate(stock.name, Number(manualPrice));
    setManualPrice('');
  };

  const nextPriceClass = newPrice !== undefined
    ? newPrice > stock.currentPrice ? 'nextPriceUp'
      : newPrice < stock.currentPrice ? 'nextPriceDown'
      : 'nextPriceNeutral'
    : 'nextPriceNeutral';

  return (
    <div className="adminStockCard">
      <div className="cardHeader">
        <div className="imageContainer" onClick={() => onImageClick(stock)}>
          <img
            src={stock.image}
            alt={stock.name}
            className="stockImage"
          />
          <div className="imageOverlay">
            <span>Change?</span>
          </div>
        </div>
        <h3 className="stockName">
          {stock.name}
          <span className="tickerSymbol">{stock.tickerSymbol}</span>
        </h3>
      </div>
      
      <div className="cardBody">
        <div className="priceRow">
          <div className="priceGroup">
            <span className="priceLabel">Current Price:</span>
            <span className="currentPrice">${stock.currentPrice.toFixed(2)}</span>
          </div>
          <div className="priceGroup">
            <span className="priceLabel">Next Value:</span>
            <span className={nextPriceClass}>
              {newPrice !== undefined ? `$${newPrice.toFixed(2)}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="statsRow">
          <div className="statItem">
            <span className="statLabel">Bought</span>
            <span className="statValue">{stats[stock.name]?.buys || 0}</span>
          </div>
          <div className="statItem">
            <span className="statLabel">Sold</span>
            <span className="statValue">{stats[stock.name]?.sells || 0}</span>
          </div>
          <div className="statItem">
            <span className="statLabel">Total</span>
            <span className="statValue">{stats[stock.name]?.totalQuantity || 0}</span>
          </div>
        </div>

        <form onSubmit={handleManualUpdate} className="manualPriceForm">
          <input
            type="number"
            step="0.01"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            placeholder="Set price"
            className="priceInput"
          />
          <button type="submit" className="updateButton">
            Update
          </button>
        </form>
      </div>

      <button
        onClick={() => onRemove(stock.name)}
        className="removeButton"
      >
        Remove Stock
      </button>
    </div>
  );
};

// New component for error modal
const ErrorModal: React.FC<{
  errors: ErrorLog[];
  onClose: () => void;
}> = ({ errors, onClose }) => {
  return (
    <div className="errorModalOverlay">
      <div className="errorModal">
        <div className="errorModalHeader">
          <h2>System Errors</h2>
          <button onClick={onClose} className="closeButton">×</button>
        </div>
        <div className="errorModalContent">
          {errors.length === 0 ? (
            <p className="noErrors">No errors to display</p>
          ) : (
            <div className="errorsList">
              {errors.map((error) => (
                <div key={error._id} className={`errorItem ${error.isHighPriority ? 'highPriority' : ''}`}>
                  <div className="errorHeader">
                    <span className="errorType">{error.name}</span>
                    <span className="errorTimestamp">
                      {new Date(error.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="errorMessage">{error.message}</div>
                  <div className="errorDetails">
                    <div className="errorSource">
                      <span className="sourceLabel">Source:</span>
                      <span className="sourceValue">
                        {error.isInternalServerError ? 'Backend' : 'Frontend'}
                      </span>
                    </div>
                    <div className="errorEndpoint">
                      <span className="endpointLabel">Endpoint:</span>
                      <span className="endpointValue">
                        {error.additionalInfo?.method} {error.additionalInfo?.path}
                      </span>
                    </div>
                  </div>
                  <div className="errorStack">
                    <pre>{error.stack}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [marketStatus, setMarketStatus] = useState('');
  const [stats, setStats] = useState<Stats>({});
  const [latestChapter, setLatestChapter] = useState<LatestChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [requestMethod, setRequestMethod] = useState('GET');
  const [jsonBody, setJsonBody] = useState('');
  const [showImageUpdateModal, setShowImageUpdateModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  
  // New state for error handling
  const [backendErrors, setBackendErrors] = useState<ErrorLog[]>([]);
  const [frontendErrors, setFrontendErrors] = useState<ErrorLog[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hasFrontendErrors, setHasFrontendErrors] = useState(false);
  
  // Using a refreshCounter instead of a string-based triggerRefresh
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // New state for next release status
  const [nextReleaseStatus, setNextReleaseStatus] = useState<boolean>(false);
  
  // Function to trigger a refresh by incrementing the counter
  const refreshData = () => setRefreshCounter(prev => prev + 1);

  // Set up global error handler
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Only capture actual Error objects
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg && !args[0].includes('fetchErrors')) {
        const error = errorArg as Error;
        const errorLog: ErrorLog = {
          _id: Date.now().toString(),
          message: error.message,
          stack: error.stack || 'No stack trace available',
          name: error.name,
          statusCode: 500,
          isInternalServerError: false,
          isHighPriority: false,
          additionalInfo: {
            path: window.location.pathname,
            method: 'CLIENT',
            timestamp: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        };
        
        setFrontendErrors(prev => [...prev, errorLog]);
        setHasFrontendErrors(true);
      }
      
      // Still call original console.error
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Load backend errors when error modal is opened
  const handleOpenErrorModal = async () => {
    try {
      const errors = await fetchErrors();
      setBackendErrors(errors);
      // Clear the error indicator when errors are viewed
      setHasFrontendErrors(false);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    } finally {
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          const [status, stocksData, statistics, chapter, autoReleaseStatus] = await Promise.all([
            getMarketStatus(),
            getStocks(),
            getMarketStatistics(),
            getLatestChapter(),
            getNextReleaseStatus()
          ]);
          setMarketStatus(status);
          setStocks(stocksData);
          
          // Process statistics data to create combined stats object
          const processedStats: Stats = {};
          statistics.forEach((stat: StockStats) => {
            processedStats[stat.name] = {
              buys: stat.totalBuys,
              sells: stat.totalSells,
              totalQuantity: stat.totalQuantity,
              newValue: stat.newValue
            };
          });
          setStats(processedStats);
          setLatestChapter(chapter);
          setNextReleaseStatus(autoReleaseStatus);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
    }
  }, [isLoggedIn, refreshCounter]); // Using refreshCounter as dependency

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
   
    try {
      await adminLogin(username, password);
      setIsLoggedIn(true);
      setAdmin(username);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      setIsLoggedIn(false);
      setAdmin('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMarketAction = async (action: 'open' | 'close') => {
    try {
      if (action === 'open') {
        await openMarket();
      } else {
        await closeMarket();
      }
      refreshData(); // Refresh data after action
    } catch (error) {
      console.error(`Failed to ${action} market:`, error);
    }
  };

  const handleReleaseChapter = async () => {
    try {
      await releaseNewChapter();
      refreshData();
    } catch (error) {
      console.error('Failed to release chapter:', error);
    }
  };

  const handleAddStock = async (formData: FormData) => {
    try {
      await addCharacterStock(
        formData.name,
        Number(formData.initialValue),
        formData.tickerSymbol,
        formData.imageFile
      );
      refreshData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const handleRemoveStock = async (name: string) => {
    try {
      await removeCharacterStock(name);
      refreshData();
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  const handleManualPriceUpdate = async (stockName: string, price: number) => {
    try {
      await manualPriceUpdate({ name: stockName, value: price.toString() });
      refreshData();
    } catch (error) {
      console.error('Price update failed:', error);
    }
  };

  const handleCustomRequest = async () => {
    try {
      await callCustomEndpoint(customEndpoint, requestMethod, jsonBody);
      refreshData();
    } catch (error) {
      console.error('Custom API request failed:', error);
    }
  };

  const handleImageClick = (stock: Stock) => {
    setSelectedStock(stock);
    setShowImageUpdateModal(true);
  };

  const handleImageUpdate = async (imageFile: File) => {
    if (selectedStock) {
      try {
        await changeCharacterImage(selectedStock.id, imageFile);
        refreshData();
        setShowImageUpdateModal(false);
        setSelectedStock(null);
      } catch (error) {
        console.error('Failed to update image:', error);
      }
    }
  };

  const handleToggleNextRelease = async () => {
    try {
      await toggleNextRelease();
      const newStatus = await getNextReleaseStatus();
      setNextReleaseStatus(newStatus);
    } catch (error) {
      console.error('Failed to toggle next release:', error);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="loginContainer">
        <div className="loginCard">
          <img
            src="/assets/skull-flag.webp"
            alt="Login"
            className="loginImage"
          />
          <form onSubmit={handleLogin}>
            <input
              name="username"
              type="text"
              className="loginInput"
            />
            <input
              name="password"
              type="password"
              className="loginInput"
            />
            <button type="submit" className="loginButton">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="adminContainer">
      <div className="topBar">
        <div className="leftSide">
          <img
            src="/assets/stockpiecelogo.png"
            alt="Logo"
            className="logo"
          />
          <button 
            onClick={handleOpenErrorModal} 
            className={`errorButton ${hasFrontendErrors ? 'hasErrors' : ''}`}
          >
            Errors
            {hasFrontendErrors && <span className="errorIndicator"></span>}
          </button>
        </div>
        <div className="adminInfo">
          <span>Welcome {admin}</span>
          <button onClick={handleLogout} className="logoutButton">
            Logout
          </button>
        </div>
      </div>

      <div className="controlsRow">
        <div className="controlCard">
          <h3>Market Control</h3>
          <div className="buttonGroup">
            <button 
              onClick={() => handleMarketAction('open')} 
              className="controlButton"
            >
              Open Market
            </button>
            <button 
              onClick={() => handleMarketAction('close')} 
              className="controlButton"
            >
              Close Market
            </button>
            <button 
              onClick={handleReleaseChapter} 
              className="controlButton"
            >
              Release Chapter
            </button>
            <button 
              onClick={handleToggleNextRelease} 
              className="controlButton"
            >
              Toggle Release
            </button>
            <button 
              onClick={async () => {
                await forcePriceUpdates();
                refreshData();
              }}
              className="controlButton forceUpdateButton"
            >
              Force Price Update
            </button>
          </div>
        </div>

        <div className="controlCard">
          <h3>Market Status</h3>
          <div className="statusInfo">
            <p>
              Status: {' '}
              <span className={marketStatus.toLowerCase() === 'open' ? 'marketStatusOpen' : 'marketStatusClosed'}>
              {marketStatus}
              </span>
            </p>
            <p>Current Chapter: {latestChapter?.chapter}</p>
            <p>Released: {latestChapter ? new Date(latestChapter.releaseDate).toLocaleDateString() : 'N/A'}</p>
            <p>Closes: {latestChapter ? new Date(latestChapter.windowEndDate).toLocaleDateString() : 'N/A'}</p>
            <p>Auto Release: <span className={nextReleaseStatus ? 'marketStatusOpen' : 'marketStatusClosed'}>
              {nextReleaseStatus ? 'Enabled' : 'Disabled'}
            </span></p>
          </div>
        </div>

        <div className="controlCard">
          <h3>Custom API</h3>
          <div className="customApiGroup">
            <select
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value)}
              className="apiInput"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="/api/v1/..."
              className="apiInput"
            />
            <textarea
              value={jsonBody}
              onChange={(e) => setJsonBody(e.target.value)}
              placeholder="JSON body (optional)"
              className="apiJsonInput"
            />
            <button
              onClick={handleCustomRequest}
              className="apiButton"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="stocksSection">
        <div className="stocksHeader">
          <h2 className="stocksHeading">Stock Management</h2>
          <div className="stocksHeaderRight">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="addButton"
            >
              Add stock
            </button>
          </div>
        </div>

        <div className="stocksGrid">
          {filteredStocks.map(stock => (
            <AdminStockCard
              key={stock.id}
              stock={stock}
              stats={stats}
              onRemove={handleRemoveStock}
              onPriceUpdate={handleManualPriceUpdate}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStock}
        />
      )}

      {showImageUpdateModal && selectedStock && (
        <ImageUpdateModal
          stock={selectedStock}
          onClose={() => {
            setShowImageUpdateModal(false);
            setSelectedStock(null);
          }}
          onSubmit={handleImageUpdate}
        />
      )}

      {showErrorModal && (
        <ErrorModal 
          errors={[...backendErrors, ...frontendErrors]} 
          onClose={() => setShowErrorModal(false)} 
        />
      )}
    </div>
  );
};

interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  name: string;
  initialValue: number;
  tickerSymbol: string;
  imageFile: File;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    initialValue: 0,
    tickerSymbol: '',
    imageFile: null as unknown as File
  });
  
  // Image optimization states
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(25);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | ''}>(
    {text: '', type: ''}
  );
  
  // Refs
  const timeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Trigger file input click when preview area is clicked
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset status message
      setStatusMessage({text: '', type: ''});
      
      // Auto-fill name field based on filename
      const fileName = file.name.split('.')[0];
      const formattedName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      
      setFormData({
        ...formData,
        name: formattedName || '',
      });
      
      setOriginalImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Process with current quality
      processImage(file, quality);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  // Process image with WebP conversion and quality adjustment
  const processImage = async (file: File, qualityValue: number) => {
    setIsProcessing(true);
    
    try {
      // Create an image element to load the file
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Calculate dimensions (similar to Python resize logic)
        const origWidth = img.width;
        const origHeight = img.height;
        const newWidth = 300;
        const newHeight = Math.floor(origHeight * (newWidth / origWidth));
        
        // Draw to canvas for processing
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to WebP with quality adjustment
        canvas.toBlob((blob) => {
          if (blob) {
            // Update the optimized blob and size
            setOptimizedBlob(blob);
            setOptimizedSize(blob.size);
            
            // Update the preview
            const optimizedUrl = URL.createObjectURL(blob);
            setPreviewUrl(optimizedUrl);
            
            // Update formData with the optimized image
            const optimizedFile = new File([blob], 'optimized.webp', { 
              type: 'image/webp' 
            });
            setFormData(prev => ({ ...prev, imageFile: optimizedFile }));
            
            setIsProcessing(false);
          }
        }, 'image/webp', qualityValue / 100);
        
        // Cleanup
        URL.revokeObjectURL(img.src);
      };
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      setStatusMessage({
        text: 'Error processing image. Please try again.',
        type: 'error'
      });
    }
  };
  
  // Debounce quality slider changes
  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseInt(e.target.value);
    setQuality(newQuality);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = window.setTimeout(() => {
      if (originalImage) {
        processImage(originalImage, newQuality);
      }
    }, 300) as unknown as number;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!optimizedBlob) {
      setStatusMessage({
        text: 'Please wait for image processing to complete',
        type: 'error'
      });
      return;
    }
    
    try {
      onSubmit(formData);
      setStatusMessage({
        text: 'Stock added successfully!',
        type: 'success'
      });
      
      setFormData({
        name: '',
        initialValue: 0,
        tickerSymbol: '',
        imageFile: null as unknown as File
      });
      setPreviewUrl('');
      setOptimizedBlob(null);
      setOptimizedSize(null);
      setOriginalImage(null);
      
      setTimeout(() => {
        setStatusMessage({text: '', type: ''});
      }, 2000);
    } catch (error) {
      setStatusMessage({
        text: 'Failed to add stock. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">Add New Stock</h2>
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        
        {/* Status message */}
        {statusMessage.text && (
          <div className={`statusMessage ${statusMessage.type}Message`}>
            {statusMessage.text}
          </div>
        )}
        
        {/* Image preview / upload area */}
        <div 
          className="imagePreviewContainer" 
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="imagePreview" 
              />
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
            id="imageFile"
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="fileInput"
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
            id="qualitySlider"
            type="range"
            min="2"
            max="100"
            value={quality}
            onChange={handleQualityChange}
            className="qualitySlider"
            disabled={isProcessing || !originalImage}
          />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="formFields">
            <div className="formRow">
              <input
                id="name"
                type="text"
                placeholder="Character Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="modalInput"
              />
            </div>
            
            <div className="formRow">
              <input
                id="initialValue"
                type="number"
                step="0.01"
                placeholder="Initial Value"
                required
                value={formData.initialValue || ''}
                onChange={(e) => setFormData({ ...formData, initialValue: Number(e.target.value) })}
                className="modalInput"
              />
            </div>
            
            <div className="formRow">
              <input
                id="tickerSymbol"
                type="text"
                placeholder="Ticker Symbol"
                required
                value={formData.tickerSymbol}
                onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
                className="modalInput"
              />
            </div>
          </div>
          
          <div className="modalButtons">
            <button type="button" onClick={onClose} className="cancelButton">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submitButton" 
              disabled={isProcessing || !optimizedBlob}
            >
              {isProcessing ? 'Processing...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ImageUpdateModalProps {
  stock: Stock;
  onClose: () => void;
  onSubmit: (imageFile: File) => void;
}

const ImageUpdateModal: React.FC<ImageUpdateModalProps> = ({ stock, onClose, onSubmit }) => {
  // Image optimization states
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(stock.image || '');
  const [quality, setQuality] = useState<number>(25);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | ''}>(
    {text: '', type: ''}
  );
  const [optimizedFile, setOptimizedFile] = useState<File | null>(null);
  
  // Refs
  const timeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Trigger file input click when preview area is clicked
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset status message
      setStatusMessage({text: '', type: ''});
      
      setOriginalImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Process with current quality
      processImage(file, quality);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  // Process image with WebP conversion and quality adjustment
  const processImage = async (file: File, qualityValue: number) => {
    setIsProcessing(true);
    
    try {
      // Create an image element to load the file
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Calculate dimensions (similar to Python resize logic)
        const origWidth = img.width;
        const origHeight = img.height;
        const newWidth = 300;
        const newHeight = Math.floor(origHeight * (newWidth / origWidth));
        
        // Draw to canvas for processing
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to WebP with quality adjustment
        canvas.toBlob((blob) => {
          if (blob) {
            // Update the optimized blob and size
            setOptimizedBlob(blob);
            setOptimizedSize(blob.size);
            
            // Update the preview
            const optimizedUrl = URL.createObjectURL(blob);
            setPreviewUrl(optimizedUrl);
            
            // Create optimized file
            const optimizedFile = new File([blob], `${stock.name.replace(/\s+/g, '_')}.webp`, { 
              type: 'image/webp' 
            });
            setOptimizedFile(optimizedFile);
            
            setIsProcessing(false);
          }
        }, 'image/webp', qualityValue / 100);
        
        // Cleanup
        URL.revokeObjectURL(img.src);
      };
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      setStatusMessage({
        text: 'Error processing image. Please try again.',
        type: 'error'
      });
    }
  };
  
  // Debounce quality slider changes
  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseInt(e.target.value);
    setQuality(newQuality);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = window.setTimeout(() => {
      if (originalImage) {
        processImage(originalImage, newQuality);
      }
    }, 300) as unknown as number;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!optimizedFile) {
      setStatusMessage({
        text: 'Please select and process an image first',
        type: 'error'
      });
      return;
    }
    
    try {
      onSubmit(optimizedFile);
    } catch (error) {
      setStatusMessage({
        text: 'Failed to update image. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">Update Image for {stock.name}</h2>
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        
        {/* Status message */}
        {statusMessage.text && (
          <div className={`statusMessage ${statusMessage.type}Message`}>
            {statusMessage.text}
          </div>
        )}
        
        {/* Image preview / upload area */}
        <div 
          className="imagePreviewContainer" 
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="imagePreview" 
              />
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
            id="imageFile"
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="fileInput"
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
            id="qualitySlider"
            type="range"
            min="2"
            max="100"
            value={quality}
            onChange={handleQualityChange}
            className="qualitySlider"
            disabled={isProcessing || !originalImage}
          />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modalButtons">
            <button type="button" onClick={onClose} className="cancelButton">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submitButton" 
              disabled={isProcessing || !optimizedBlob}
            >
              {isProcessing ? 'Processing...' : 'Update Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
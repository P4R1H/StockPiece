import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  FormEvent,
} from 'react';
import {
  ErrorLog,
  Stock,
  LatestChapter,
  Stats,
  StockStats,
  AdminStockCardProps,
} from '../../types/Pages';
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
  fetchErrors,
  changeCharacterImage,
  toggleNextRelease,
  getChapterStatistics,
  getNextReleaseStatus,
  createCoupon,
  deleteCoupon,
  getUserDetails,
} from './AdminServices';
import { ImageUploadComponent, ImageUpdateModal } from './imageUpload';
import { FolderSearch } from 'lucide-react';
import './Admin.css';

const AdminStockCard: React.FC<AdminStockCardProps> = ({
  stock,
  stats,
  onRemove,
  onPriceUpdate,
  onImageClick,
}) => {
  const [manualPrice, setManualPrice] = useState<string>('');
  const newPrice = stats[stock.name]?.newValue;

  const handleManualUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualPrice) return;
      try {
        await onPriceUpdate(stock.name, Number(manualPrice));
      } catch (error) {
        console.error('Manual price update failed:', error);
      }
      setManualPrice('');
    },
    [manualPrice, onPriceUpdate, stock.name]
  );

  const nextPriceClass =
    newPrice !== undefined
      ? newPrice > stock.currentPrice
        ? 'nextPriceUp'
        : newPrice < stock.currentPrice
        ? 'nextPriceDown'
        : 'nextPriceNeutral'
      : 'nextPriceNeutral';

  return (
    <div className="adminStockCard">
      <div className="cardHeader">
        <div className="imageContainer" onClick={() => onImageClick(stock)}>
          <img src={stock.image} alt={stock.name} className="stockImage" />
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
            <span className="currentPrice">
              ${stock.currentPrice.toFixed(2)}
            </span>
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
            <span className="statValue">
              {stats[stock.name]?.buys || 0}
            </span>
          </div>
          <div className="statItem">
            <span className="statLabel">Sold</span>
            <span className="statValue">
              {stats[stock.name]?.sells || 0}
            </span>
          </div>
          <div className="statItem">
            <span className="statLabel">Total</span>
            <span className="statValue">
              {stats[stock.name]?.totalQuantity || 0}
            </span>
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

      <button onClick={() => onRemove(stock.name)} className="removeButton">
        Remove Stock
      </button>
    </div>
  );
};

const ErrorModal: React.FC<{ errors: ErrorLog[]; onClose: () => void }> = ({
  errors,
  onClose,
}) => {
  const sortedErrors = useMemo(
    () =>
      [...errors].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [errors]
  );

  return (
    <div className="errorModalOverlay">
      <div className="errorModal">
        <div className="errorModalHeader">
          <h2>System Errors</h2>
          <button onClick={onClose} className="closeButton">
            ×
          </button>
        </div>
        <div className="errorModalContent">
          {sortedErrors.length === 0 ? (
            <p className="noErrors">No errors to display</p>
          ) : (
            <div className="errorsList">
              {sortedErrors.map((error) => (
                <div
                  key={error._id}
                  className={`errorItem ${
                    error.isHighPriority ? 'highPriority' : ''
                  }`}
                >
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
                        {error.additionalInfo?.method}{' '}
                        {error.additionalInfo?.path}
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

interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    initialValue: number;
    tickerSymbol: string;
    imageFile: File;
  }) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    initialValue: 0,
    tickerSymbol: '',
    imageFile: null as File | null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | '';
  }>({ text: '', type: '' });

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!formData.imageFile) {
        setStatusMessage({ text: 'Please upload an image', type: 'error' });
        return;
      }
      try {
        onSubmit(formData as {
          name: string;
          initialValue: number;
          tickerSymbol: string;
          imageFile: File;
        });
        setStatusMessage({ text: 'Stock added successfully!', type: 'success' });
        setFormData({
          name: '',
          initialValue: 0,
          tickerSymbol: '',
          imageFile: null,
        });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 2000);
      } catch (error) {
        console.error('Failed to add stock:', error);
        setStatusMessage({
          text: 'Failed to add stock. Please try again.',
          type: 'error',
        });
      }
    },
    [formData, onSubmit]
  );

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">Add New Stock</h2>
        {statusMessage.text && (
          <div className={`statusMessage ${statusMessage.type}Message`}>
            {statusMessage.text}
          </div>
        )}
        <ImageUploadComponent
          onFileSelected={(file) => {
            const fileName = file.name.split('.')[0];
            const formattedName =
              fileName.charAt(0).toUpperCase() + fileName.slice(1);
            setFormData((prev) => ({ ...prev, name: formattedName }));
          }}
          onFileProcessed={(optimizedFile) =>
            setFormData((prev) => ({ ...prev, imageFile: optimizedFile }))
          }
          onProcessingChange={setIsProcessing}
        />
        <form onSubmit={handleSubmit}>
          <div className="formFields">
            <div className="formRow">
              <input
                id="name"
                type="text"
                placeholder="Character Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialValue: Number(e.target.value),
                  })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, tickerSymbol: e.target.value })
                }
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
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Add Stock'}
            </button>
          </div>
        </form>
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
  const [latestChapter, setLatestChapter] = useState<LatestChapter | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageUpdateModal, setShowImageUpdateModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [backendErrors, setBackendErrors] = useState<ErrorLog[]>([]);
  const [frontendErrors, setFrontendErrors] = useState<ErrorLog[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hasFrontendErrors, setHasFrontendErrors] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [nextReleaseStatus, setNextReleaseStatus] = useState<boolean>(false);
  const [chapterStats, setChapterStats] = useState<any>(null);
  const [selectedChapterForStats, setSelectedChapterForStats] =
  useState<number | null>(null);
  const [selectedChapterForStocks, setSelectedChapterForStocks] =
  useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'delete'>('create');
  const [couponCode, setCouponCode] = useState('');
  const [couponAmount, setCouponAmount] = useState<number | ''>('');
  const [couponMaxUsers, setCouponMaxUsers] = useState<number | ''>('');
  const [couponIsFirstTimeOnly, setCouponIsFirstTimeOnly] = useState(false);
  const [deleteCouponCode, setDeleteCouponCode] = useState('');
  const [usernameForDetails, setUsernameForDetails] = useState('');
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [showUserStocksModal, setShowUserStocksModal] = useState(false);
  const [chapterStatsInput, setChapterStatsInput] = useState<string>('');
  const [stockStatsInput, setStockStatsInput] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Global error override to catch frontend errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorArg = args.find((arg) => arg instanceof Error);
      if (
        errorArg &&
        typeof args[0] === 'string' &&
        !args[0].includes('fetchErrors')
      ) {
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
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
        };
        setFrontendErrors((prev) => [...prev, errorLog]);
        setHasFrontendErrors(true);
      }
      originalConsoleError.apply(console, args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const refreshData = useCallback(
    () => setRefreshCounter((prev) => prev + 1),
    []
  );

  // New: Fetch backend errors when opening the error modal.
  const handleOpenErrorModal = useCallback(async () => {
    try {
      const errors = await fetchErrors();
      setBackendErrors(errors);
      setHasFrontendErrors(false);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    } finally {
      setShowErrorModal(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          const status = await getMarketStatus();
          setMarketStatus(status);
          const stocksData = await getStocks();
          setStocks(stocksData);
          const chapter = await getLatestChapter();
          setLatestChapter(chapter);
          const autoReleaseStatus = await getNextReleaseStatus();
          setNextReleaseStatus(autoReleaseStatus);
        } catch (error) {
          console.error('Failed to load initial data:', error);
        }
      };
      loadData();
    }
  }, [isLoggedIn, refreshCounter]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchChapterStats = async () => {
        try {
          const stats = await getChapterStatistics(selectedChapterForStats);
          setChapterStats(stats);
        } catch (error) {
          console.error('Failed to load chapter statistics:', error);
        }
      };
      fetchChapterStats();
    }
  }, [isLoggedIn, selectedChapterForStats, refreshCounter]);

  // Fetch market statistics automatically.
  useEffect(() => {
    if (isLoggedIn) {
      const fetchMarketStats = async () => {
        try {
          const statistics = await getMarketStatistics();
          const processedStats: Stats = {};
          statistics.forEach((stat: StockStats) => {
            processedStats[stat.name] = {
              buys: stat.totalBuys,
              sells: stat.totalSells,
              totalQuantity: stat.totalQuantity,
              newValue: stat.newValue,
            };
          });
          setStats(processedStats);
        } catch (error) {
          console.error('Failed to load market statistics:', error);
          setStats({});
        }
      };
      fetchMarketStats();
    }
  }, [isLoggedIn, selectedChapterForStocks, refreshCounter, latestChapter]);

  const filteredStocks = useMemo(
    () =>
      stocks.filter((stock) =>
        stock.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ),
    [stocks, debouncedSearchQuery]
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      try {
        await adminLogin(username, password);
        setIsLoggedIn(true);
        setAdmin(username);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      await adminLogout();
      setIsLoggedIn(false);
      setAdmin('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const handleMarketAction = useCallback(
    async (action: 'open' | 'close') => {
      try {
        if (action === 'open') await openMarket();
        else await closeMarket();
        refreshData();
      } catch (error) {
        console.error(`Failed to ${action} market:`, error);
      }
    },
    [refreshData]
  );

  const handleReleaseChapter = useCallback(async () => {
    try {
      await releaseNewChapter();
      refreshData();
    } catch (error) {
      console.error('Failed to release chapter:', error);
    }
  }, [refreshData]);

  const handleAddStock = useCallback(
    async (formData: {
      name: string;
      initialValue: number;
      tickerSymbol: string;
      imageFile: File;
    }) => {
      try {
        await addCharacterStock(
          formData.name,
          formData.initialValue,
          formData.tickerSymbol,
          formData.imageFile
        );
        refreshData();
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to add stock:', error);
      }
    },
    [refreshData]
  );

  const handleRemoveStock = useCallback(
    async (name: string) => {
      try {
        await removeCharacterStock(name);
        refreshData();
      } catch (error) {
        console.error('Failed to remove stock:', error);
      }
    },
    [refreshData]
  );

  const handleManualPriceUpdate = useCallback(
    async (stockName: string, price: number) => {
      try {
        await manualPriceUpdate({ name: stockName, value: price.toString() });
        refreshData();
      } catch (error) {
        console.error('Price update failed:', error);
      }
    },
    [refreshData]
  );

  const handleImageClick = useCallback((stock: Stock) => {
    setSelectedStock(stock);
    setShowImageUpdateModal(true);
  }, []);

  const handleImageUpdate = useCallback(
    async (imageFile: File) => {
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
    },
    [selectedStock, refreshData]
  );

  const handleToggleNextRelease = useCallback(async () => {
    try {
      await toggleNextRelease();
      const newStatus = await getNextReleaseStatus();
      setNextReleaseStatus(newStatus);
    } catch (error) {
      console.error('Failed to toggle next release:', error);
    }
  }, []);

  const handleCreateCoupon = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createCoupon({
          code: couponCode,
          amount: typeof couponAmount === 'number' ? couponAmount : 0,
          maxUsers: typeof couponMaxUsers === 'number' ? couponMaxUsers : 0,
          isFirstTimeOnly: couponIsFirstTimeOnly,
        });
        setCouponCode('');
        setCouponAmount('');
        setCouponMaxUsers('');
        setCouponIsFirstTimeOnly(false);
      } catch (error) {
        console.error('Failed to create coupon:', error);
      }
    },
    [couponCode, couponAmount, couponMaxUsers, couponIsFirstTimeOnly]
  );

  const handleDeleteCoupon = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await deleteCoupon(deleteCouponCode);
        setDeleteCouponCode('');
      } catch (error) {
        console.error('Failed to delete coupon:', error);
      }
    },
    [deleteCouponCode]
  );

  const handleFetchUserDetails = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const data = await getUserDetails(usernameForDetails);
        setUserDetails(data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    },
    [usernameForDetails]
  );

  const handleChapterStatsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSelectedChapterForStats(chapterStatsInput ? Number(chapterStatsInput) : null);
      refreshData();
    },
    [chapterStatsInput, refreshData]
  );

  const handleStockStatsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSelectedChapterForStocks(stockStatsInput ? Number(stockStatsInput) : null);
      refreshData();
    },
    [stockStatsInput, refreshData]
  );

  return !isLoggedIn ? (
    <div className="loginContainer">
      <div className="loginCard">
        <img src="/assets/skull-flag.webp" alt="Login" className="loginImage" />
        <form onSubmit={handleLogin}>
          <input
            name="username"
            type="text"
            className="loginInput"
            placeholder="Username"
          />
          <input
            name="password"
            type="password"
            className="loginInput"
            placeholder="Password"
          />
          <button type="submit" className="loginButton">
            Login
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className="adminContainer">
      <div className="topBar">
        <div className="leftSide">
          <img src="/assets/stockpiecelogo.png" alt="Logo" className="logo" />
          <button
            onClick={handleOpenErrorModal}
            className={`errorButton ${hasFrontendErrors ? 'hasErrors' : ''}`}
          >
            Errors {hasFrontendErrors && <span className="errorIndicator"></span>}
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
            <button onClick={handleReleaseChapter} className="controlButton">
              Release Chapter
            </button>
            <button onClick={handleToggleNextRelease} className="controlButton">
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
              Status:{' '}
              <span
                className={
                  marketStatus.toLowerCase() === 'open'
                    ? 'marketStatusOpen'
                    : 'marketStatusClosed'
                }
              >
                {marketStatus}
              </span>
            </p>
            <p>Current Chapter: {latestChapter?.chapter}</p>
            <p>
              Released:{' '}
              {latestChapter
                ? new Date(latestChapter.releaseDate).toLocaleDateString()
                : 'N/A'}
            </p>
            <p>
              Closes:{' '}
              {latestChapter
                ? new Date(latestChapter.windowEndDate).toLocaleDateString()
                : 'N/A'}
            </p>
            <p>
              Auto Release:{' '}
              <span
                className={
                  nextReleaseStatus ? 'marketStatusOpen' : 'marketStatusClosed'
                }
              >
                {nextReleaseStatus ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
        </div>

        <div className="controlCard">
          <div className="headerWithSearch">
            <h3>Chapter Statistics</h3>
            <form onSubmit={handleChapterStatsSubmit} className="inlineForm">
              <input
                type="number"
                placeholder="Chapter Number"
                value={chapterStatsInput}
                onChange={(e) => setChapterStatsInput(e.target.value)}
                className="chapterInput"
              />
              <button type="submit" className="searchButton">
                <FolderSearch size={20} />
              </button>
            </form>
          </div>
          <div className="statusInfo">
            {chapterStats ? (
              <>
                <p>Chapter: {chapterStats.chapter || 'Overall'}</p>
                <p>
                  New Users: <b>{chapterStats.newUsers}</b>/
                  {chapterStats.totalUsers}
                </p>
                <p>
                  Market Value: $
                  {chapterStats.marketStats?.totalMarketValue?.toLocaleString()}
                </p>
                <p>
                  Volume: $
                  {chapterStats.chapterTransactions?.totalVolume.toLocaleString()}
                </p>
                <p>
                  Transactions:{' '}
                  {chapterStats.chapterTransactions?.totalTransactions}
                </p>
                <p>
                  Active Stocks: {chapterStats.marketStats?.activeStocks}/ {chapterStats.marketStats?.totalStocks}
                </p>
              </>
            ) : (
              <p>No chapter statistics available</p>
            )}
          </div>
        </div>

        <div className="controlCard">
          <div className="couponHeader">
            <h3>Coupon Management</h3>
            <div className="tabContainer">
              <button
                className={`tabButton ${
                  activeTab === 'create' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('create')}
              >
                Create
              </button>
              <button
                className={`tabButton ${
                  activeTab === 'delete' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('delete')}
              >
                Delete
              </button>
            </div>
          </div>

          {activeTab === 'create' && (
            <form onSubmit={handleCreateCoupon} className="couponForm">
              <div className="couponFormRow">
                <input
                  type="text"
                  placeholder="Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required
                />
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    checked={couponIsFirstTimeOnly}
                    onChange={(e) =>
                      setCouponIsFirstTimeOnly(e.target.checked)
                    }
                  />
                  First Time Only
                </label>
              </div>
              <div className="couponFormRow">
  <input
    type="number"
    placeholder="Amount"
    value={couponAmount}
    onChange={(e) => setCouponAmount(e.target.value === '' ? '' : Number(e.target.value))}
    required
  />
  <input
    type="number"
    placeholder="Maximum Uses"
    value={couponMaxUsers}
    onChange={(e) => setCouponMaxUsers(e.target.value === '' ? '' : Number(e.target.value))}
    required
  />
</div>              <button type="submit" className="couponButton">
                Create Coupon
              </button>
            </form>
          )}

          {activeTab === 'delete' && (
            <form onSubmit={handleDeleteCoupon} className="couponForm">
              <input
                type="text"
                placeholder="Coupon Code to Delete"
                value={deleteCouponCode}
                onChange={(e) => setDeleteCouponCode(e.target.value)}
                required
                className="couponInput"
              />
              <button type="submit" className="couponButton">
                Delete Coupon
              </button>
            </form>
          )}
        </div>

        <div className="controlCard">
          <h3>User Details</h3>
          <form onSubmit={handleFetchUserDetails} className="userForm">
            <input
              type="text"
              placeholder="Username"
              value={usernameForDetails}
              onChange={(e) => setUsernameForDetails(e.target.value)}
              required
              className="userInput"
            />
            <button type="submit" className="userButton">
              Fetch
            </button>
          </form>
          {userDetails && (
            <div className="userDetails">
              <p>Username: {userDetails.username}</p>
              <p>Account Value: ${userDetails.accountValue}</p>
              <p>Net Worth: ${userDetails.netWorth}</p>
              <button
                onClick={() => setShowUserStocksModal(true)}
                className="stocksButton"
              >
                View Stocks
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="stocksSection">
        <div className="stocksHeader">
          <h2 className="stocksHeading">Stock Management</h2>
          <div className="stocksHeaderRight">
            <form onSubmit={handleStockStatsSubmit} className="chapterSearchForm">
              <input
                type="number"
                placeholder="Chapter"
                value={stockStatsInput}
                onChange={(e) => setStockStatsInput(e.target.value)}
                className="smallInput"
              />
              <button type="submit" className="searchButton">
                <FolderSearch size={20} />
              </button>
            </form>
            <div className="searchStocks">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="smallInput"
              />
            </div>
            <button onClick={() => setShowAddModal(true)} className="addButton">
              Add stock
            </button>
          </div>
        </div>

        <div className="stocksGrid">
          {filteredStocks.map((stock) => (
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
        <AddStockModal onClose={() => setShowAddModal(false)} onSubmit={handleAddStock} />
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
      {showUserStocksModal && userDetails && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>{userDetails.username}'s Stocks</h2>
            <ul className="stocksList">
              {userDetails.ownedStocks.map((stock: any) => (
                <li key={stock.stock._id}>
                  {stock.stock.name}: {stock.quantity}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowUserStocksModal(false)}
              className="closeModalButton"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

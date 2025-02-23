import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { 
  adminLogin,
  adminLogout,
  getMarketStatus,
  openMarket,
  closeMarket,
  getStocks,
  addCharacterStock,
  removeCharacterStock,
  getPriceUpdatesAlgorithm,
  manualPriceUpdate,
  getMarketStatistics,
  getLatestChapter,
  releaseNewChapter,
  callCustomEndpoint
} from './AdminServices';

interface Stock {
  id: string;
  name: string;
  tickerSymbol: string;
  currentPrice: number;
  image: string;
}

interface Stats {
  [key: string]: {
    buys?: number;
    sells?: number;
    totalQuantity?: number;
  };
}

interface AlgorithmUpdates {
  [key: string]: {
    newValue?: number;
  };
}

interface LatestChapter {
  chapter: number;
  releaseDate: string;
  windowEndDate: string;
  isWindowClosed: boolean;
}

interface AdminStockCardProps {
  stock: Stock;
  stats: Stats;
  algorithmUpdates: AlgorithmUpdates;
  onRemove: (name: string) => void;
  onPriceUpdate: (name: string, price: number) => void;
}

const AdminStockCard: React.FC<AdminStockCardProps> = ({ 
  stock, 
  stats, 
  algorithmUpdates, 
  onRemove, 
  onPriceUpdate 
}) => {
  const [manualPrice, setManualPrice] = useState<string>('');

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPrice) return;
    await onPriceUpdate(stock.name, Number(manualPrice));
    setManualPrice('');
  };

  return (
    <div className={styles.adminStockCard}>
      <div className={styles.cardHeader}>
        <img 
          src={stock.image} 
          alt={stock.name} 
          className={styles.stockImage}
        />
        <h3 className={styles.stockName}>
          {stock.name}
          <span className={styles.tickerSymbol}>{stock.tickerSymbol}</span>
        </h3>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.priceLabel}>Current Price:</span>
            <span className={styles.currentPrice}>${stock.currentPrice.toFixed(2)}</span>
          </div>
          <div className={styles.priceGroup}>
            <span className={styles.priceLabel}>Next Value:</span>
            <span className={styles.nextPrice}>
              ${algorithmUpdates[stock.name]?.newValue?.toFixed(2) || 'N/A'}
            </span>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Bought</span>
            <span className={styles.statValue}>{stats[stock.name]?.buys || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Sold</span>
            <span className={styles.statValue}>{stats[stock.name]?.sells || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{stats[stock.name]?.totalQuantity || 0}</span>
          </div>
        </div>

        <form onSubmit={handleManualUpdate} className={styles.manualPriceForm}>
          <input
            type="number"
            step="0.01"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            placeholder="Set price"
            className={styles.priceInput}
          />
          <button type="submit" className={styles.updateButton}>
            Update
          </button>
        </form>
      </div>

      <button 
        onClick={() => onRemove(stock.name)}
        className={styles.removeButton}
      >
        Remove Stock
      </button>
    </div>
  );
};

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [marketStatus, setMarketStatus] = useState('');
  const [algorithmUpdates, setAlgorithmUpdates] = useState<AlgorithmUpdates>({});
  const [stats, setStats] = useState<Stats>({});
  const [latestChapter, setLatestChapter] = useState<LatestChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [requestMethod, setRequestMethod] = useState('GET');

  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          const [status, stocksData, updates, statistics, chapter] = await Promise.all([
            getMarketStatus(),
            getStocks(),
            getPriceUpdatesAlgorithm(),
            getMarketStatistics(),
            getLatestChapter()
          ]);
          setMarketStatus(status);
          setStocks(stocksData);
          setAlgorithmUpdates(updates);
          setStats(statistics);
          setLatestChapter(chapter);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
    }
  }, [isLoggedIn]);

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

  const handleAddStock = async (formData: FormData) => {
    try {
      await addCharacterStock(
        formData.name,
        Number(formData.initialValue),
        formData.tickerSymbol,
        formData.imageFile
      );
      setStocks(await getStocks());
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const handleRemoveStock = async (name: string) => {
    try {
      await removeCharacterStock(name);
      setStocks(await getStocks());
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  const handleManualPriceUpdate = async (stockName: string, price: number) => {
    try {
      await manualPriceUpdate({ [stockName]: price });
      setStocks(await getStocks());
    } catch (error) {
      console.error('Price update failed:', error);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <img 
            src="/assets/skull-flag.webp" 
            alt="Login" 
            className={styles.loginImage} 
          />
          <form onSubmit={handleLogin}>
            <input
              name="username"
              type="text"
              className={styles.loginInput}
            />
            <input
              name="password"
              type="password"
              className={styles.loginInput}
            />
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.topBar}>
        <img 
          src="/assets/stockpiecelogo.png" 
          alt="Logo" 
          className={styles.logo} 
        />
        <div className={styles.adminInfo}>
          <span>Welcome {admin}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.controlCard}>
          <h3>Market Control</h3>
          <div className={styles.buttonGroup}>
            <button onClick={openMarket} className={styles.controlButton}>
              Open Market
            </button>
            <button onClick={closeMarket} className={styles.controlButton}>
              Close Market
            </button>
            <button onClick={releaseNewChapter} className={styles.controlButton}>
              Release Chapter
            </button>
          </div>
        </div>

        <div className={styles.controlCard}>
          <h3>Market Status</h3>
          <div className={styles.statusInfo}>
            <p>Status: {marketStatus}</p>
            <p>Current Chapter: {latestChapter?.chapter}</p>
            <p>Released: {latestChapter ? new Date(latestChapter.releaseDate).toLocaleDateString() : 'N/A'}</p>
            <p>Closes: {latestChapter ? new Date(latestChapter.windowEndDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className={styles.controlCard}>
          <h3>Custom API</h3>
          <div className={styles.customApiGroup}>
            <select 
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value)}
              className={styles.apiInput}
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
              className={styles.apiInput}
            />
            <button 
              onClick={() => callCustomEndpoint(customEndpoint, requestMethod)}
              className={styles.apiButton}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className={styles.stocksSection}>
        <div className={styles.stocksHeader}>
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className={styles.addButton}
          >
            +
          </button>
        </div>

        <div className={styles.stocksGrid}>
          {filteredStocks.map(stock => (
            <AdminStockCard
              key={stock.id}
              stock={stock}
              stats={stats}
              algorithmUpdates={algorithmUpdates}
              onRemove={handleRemoveStock}
              onPriceUpdate={handleManualPriceUpdate}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Stock</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Character Name"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Initial Value"
            required
            onChange={(e) => setFormData({ ...formData, initialValue: Number(e.target.value) })}
          />
          <input
            type="text"
            placeholder="Ticker Symbol"
            required
            onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] as File })}
          />
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add Stock</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
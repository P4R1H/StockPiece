import { useState, useEffect } from 'react';
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
import './Admin.css'
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
  const newPrice = algorithmUpdates[stock.name]?.newValue;

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
        <img
          src={stock.image}
          alt={stock.name}
          className="stockImage"
        />
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
  const [jsonBody, setJsonBody] = useState('');

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
        <img
          src="/assets/stockpiecelogo.png"
          alt="Logo"
          className="logo"
        />
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
            <button onClick={openMarket} className="controlButton">
              Open Market
            </button>
            <button onClick={closeMarket} className="controlButton">
              Close Market
            </button>
            <button onClick={releaseNewChapter} className="controlButton">
              Release Chapter
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
              onClick={() => callCustomEndpoint(customEndpoint, requestMethod, jsonBody)}
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
    <div className="modalOverlay">
      <div className="modalContent">
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
          <div className="modalButtons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add Stock</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
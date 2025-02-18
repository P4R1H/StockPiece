import React, { useState, useEffect } from 'react';
import {
    add_character_stock,
    remove_character_stock,
    admin_login,
    admin_logout
} from './AdminServices';
import { CharacterStock } from '../../types/Stocks';
import { getStockMarketData } from '../Home/HomeServices';
import './Admin.css';

const AdminPanel: React.FC = () => {
    const [currentStocks, setCurrentStocks] = useState<CharacterStock[]>([]);
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [stockName, setStockName] = useState('');
    const [initialValue, setInitialValue] = useState(0);
    const [tickerSymbol, setTickerSymbol] = useState('');
    const [imageURL, setImageURL] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await getStockMarketData();
        setCurrentStocks(data);
    };

    const handleLogin = async () => {
        const success = await admin_login(username, password);
        if (success) setLoggedIn(true);
    };

    const handleLogout = async () => {
        await admin_logout();
        setLoggedIn(false);
    };

    const handleAddStock = async () => {
        if (!imageURL) return;
        await add_character_stock(stockName, initialValue, imageURL, tickerSymbol);
        fetchData();
    };

    const handleRemoveStock = async (name: string) => {
        await remove_character_stock(name);
        fetchData();
    };

    return (
        <div className="admin-container">
            <div className="admin-login-form">
                {isLoggedIn ? (
                    <>
                        Welcome {username},
                        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <label>
                            Username:
                            <input 
                                className="adminUser" 
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                        <label>
                            Password:
                            <input 
                                type="password"
                                className="adminPassword" 
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                        <button type="submit" className="adminLoginSubmit">Login</button>
                    </form>
                )}
            </div>

            {isLoggedIn && (
                <>
                <form className="admin-controls-form" onSubmit={(e) => { e.preventDefault(); handleAddStock(); }}>
                    Add new stocks:
                    <input 
                        className="stockName"
                        placeholder="Stock Name"
                        value={stockName}
                        onChange={(e) => setStockName(e.target.value)}
                        required
                    />
                    <input 
                        className="stockTicker"
                        placeholder="Stock ticker"
                        value={tickerSymbol}
                        onChange={(e) => setTickerSymbol(e.target.value)}
                        required
                    />                    
                    <input 
                        className="stockValue"
                        type="number"
                        placeholder="Initial Value"
                        value={initialValue}
                        onChange={(e) => setInitialValue(Number(e.target.value))}
                        required
                    />
                    <input 
                        type="file"
                        className="stockImage"
                        onChange={(e) => setImageURL(e.target.files ? e.target.files[0] : null)}
                        required
                    />
                    <button type="submit">Add Stock</button>
                </form>

                <div className="stock-list">
                {currentStocks.map((stock) => (
                    <div key={stock.name} className="stock-item">
                        <span>{stock.name}</span>
                        <img src={stock.image} alt={stock.name} style={{ width: '50px', height: '50px' }} />
                        <span>Price: ${stock.currentPrice}</span>
                        <span>Ticker: ${stock.tickerSymbol}</span>
                        <span>Popularity: {stock.popularity}</span>
                        <button onClick={() => handleRemoveStock(stock.name)}>Remove</button>
                    </div>
                ))}
                </div>
                </>
            )}

        </div>
    );
};

export default AdminPanel;

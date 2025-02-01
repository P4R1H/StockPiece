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
        await add_character_stock(stockName, initialValue, imageURL);
        fetchData();
    };

    const handleRemoveStock = async (name: string) => {
        await remove_character_stock(name);
        fetchData();
    };

    return (
        <div className="AdminContainer">
            <div className="AdminLogin">
                {isLoggedIn ? (
                    <button className="adminLogout" onClick={handleLogout}>Logout</button>
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
                <div className="AdminControls">
                    <input 
                        className="stockName"
                        placeholder="Stock Name"
                        value={stockName}
                        onChange={(e) => setStockName(e.target.value)}
                    />
                    <input 
                        className="stockValue"
                        placeholder="Initial Value"
                        value={initialValue}
                        onChange={(e) => setInitialValue(Number(e.target.value))}
                    />
                    <input 
                        type="file"
                        className="stockImage"
                        onChange={(e) => setImageURL(e.target.files ? e.target.files[0] : null)}
                    />
                    <button onClick={handleAddStock}>Add Stock</button>
                </div>

                <div className="StockList">
                {currentStocks.map((stock) => (
                    <div key={stock.name} className="StockItem">
                        <span>{stock.name}</span>
                        <img src={stock.image} alt={stock.name} style={{ width: '50px', height: '50px' }} />
                        <span>Price: ${stock.currentPrice}</span>
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

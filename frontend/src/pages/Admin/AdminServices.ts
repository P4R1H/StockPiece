import { ErrorLog } from "../../types/Pages";

export const adminLogin = async (username: string, password: string): Promise<boolean> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/admin/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return true;
};

export const adminLogout = async (): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Logout failed');
};

export const getMarketStatus = async (): Promise<string> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/status', { method: 'GET', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch market status');
  return data.data;
};

export const openMarket = async (): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/open', { method: 'PATCH', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to open market');
};

export const closeMarket = async (): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/close', { method: 'PATCH', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to close market');
};

export const getStocks = async (): Promise<any[]> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/stock/stocks', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch stocks');
  return data.data.map((stock: any) => ({
    id: stock._id,
    name: stock.name,
    image: stock.imageURL,
    currentPrice: stock.currentValue,
    tickerSymbol: stock.tickerSymbol ? '$' + stock.tickerSymbol : '',
    popularity: stock.popularityCount || 0,
  }));
};

export const addCharacterStock = async (
  name: string,
  initialValue: number,
  tickerSymbol: string,
  imageFile: File
): Promise<void> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('initialValue', initialValue.toString());
  formData.append('tickerSymbol', tickerSymbol);
  formData.append('imageURL', imageFile);
  const response = await fetch('https://backend.stockpiece.fun/api/v1/admin/character-stocks', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add character stock');
};

export const changeCharacterImage = async (stockID: string, imageFile: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append('stockId', stockID);
  formData.append('imageURL', imageFile);
  const response = await fetch('https://backend.stockpiece.fun/api/v1/admin/character-stocks/image', {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update character image');
  return data.success;
};

export const removeCharacterStock = async (name: string): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/admin/character-stocks', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove character stock');
};

export const manualPriceUpdate = async (update: { name: string; value: string }): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/stock/value', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update prices manually');
};

export const getMarketStatistics = async (chapter?: number): Promise<any> => {
  const url = chapter
    ? `https://backend.stockpiece.fun/api/v1/market/statistics?chapter=${chapter}`
    : 'https://backend.stockpiece.fun/api/v1/market/statistics';
  const response = await fetch(url, { method: 'GET', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch market statistics');
  return data.data;
};

export const getChapterStatistics = async (chapter: number | null): Promise<any> => {
  const url = chapter
    ? `https://backend.stockpiece.fun/api/v1/admin/statistics?chapterNumber=${chapter}`
    : 'https://backend.stockpiece.fun/api/v1/admin/statistics';
  const response = await fetch(url, { method: 'GET', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch chapter statistics');
  return data.data;
};

export const getLatestChapter = async (): Promise<any> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/chapters/latest', { method: 'GET' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch latest chapter');
  return data.data;
};

export const releaseNewChapter = async (): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/chapters/release', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to release new chapter');
};

export const forcePriceUpdates = async (): Promise<boolean> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/update-price', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to force price updates');
  return data.success;
};

export const fetchErrors = async (type: string = 'all'): Promise<ErrorLog[]> => {
  try {
    const response = await fetch(`https://backend.stockpiece.fun/api/v1/admin/errors?type=${type}`);
    const data = await response.json();
    if (data.success) return data.data.errors;
    throw new Error(data.message || 'Failed to fetch errors');
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return [];
  }
};

export const toggleNextRelease = async (): Promise<boolean> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/chapters/next-release', {
    method: 'PATCH',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to toggle next release');
  return data.success;
};

export const getNextReleaseStatus = async (): Promise<boolean> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/chapters/next-release', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to get next release status');
  return data.data.canReleaseNext;
};

export const createCoupon = async (couponData: {
  code: string;
  amount: number;
  maxUsers: number;
  isFirstTimeOnly: boolean;
}): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/coupon/coupons', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couponData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create coupon');
};

export const deleteCoupon = async (code: string): Promise<void> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/coupon/coupons', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete coupon');
};

export const getUserDetails = async (username: string): Promise<any> => {
  const response = await fetch(`https://backend.stockpiece.fun/api/v1/admin/users?username=${encodeURIComponent(username)}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch user details');
  return data.data;
};
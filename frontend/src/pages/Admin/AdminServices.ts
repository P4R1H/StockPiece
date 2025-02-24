export const adminLogin = async (
  username: string,
  password: string
): Promise<boolean> => {
  const response = await fetch('/api/v1/admin/auth/login', {
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
  const response = await fetch('/api/v1/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Logout failed');
  }
};

export const getMarketStatus = async (): Promise<string> => {
  const response = await fetch('/api/v1/market/status', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to fetch market status');
  return data.data;
};

export const openMarket = async (): Promise<void> => {
  const response = await fetch('/api/v1/market/open', {
    method: 'PATCH',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to open market');
};

export const closeMarket = async (): Promise<void> => {
  const response = await fetch('/api/v1/market/close', {
    method: 'PATCH',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to close market');
};

export const getStocks = async (): Promise<any[]> => {
  const response = await fetch('/api/v1/stock/stocks', {
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
  const response = await fetch('/api/v1/admin/character-stocks', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to add character stock');
};

export const removeCharacterStock = async (name: string): Promise<void> => {
  const response = await fetch('/api/v1/admin/character-stocks', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to remove character stock');
};

export const manualPriceUpdate = async (
  update: { name: string; value: string }
): Promise<void> => {
  const response = await fetch('/api/v1/stock/value', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to update prices manually');
};

export const getMarketStatistics = async (): Promise<any> => {
  const response = await fetch('/api/v1/market/statistics', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to fetch market statistics');
  return data.data;
};

export const getLatestChapter = async (): Promise<any> => {
  const response = await fetch('/api/v1/market/chapters/latest', {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to fetch latest chapter');
  return data.data;
};

export const releaseNewChapter = async (): Promise<void> => {
  const response = await fetch('/api/v1/market/chapters/release', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to release new chapter');
};

export const forcePriceUpdates = async(): Promise<boolean> => {
  const response = await fetch('/api/v1/market/update-price', {
    method: 'POST', 
    credentials: 'include',
  })
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Failed to force price updates');
  return data.success;
}
export const callCustomEndpoint = async (
  url: string,
  method: string = 'GET',
  body?: any
): Promise<any> => {
  const options: RequestInit = {
    method,
    credentials: 'include',
  };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || 'Custom endpoint call failed');
  return data;
};
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { server } from '../../App.tsx'

export const generateFingerprint = async (): Promise<string> => {
  try {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;

  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return "";
  }
};


export interface LoginResponse {
  success: boolean;
  data: {
    loginStatus: boolean;
    dailyLoginBonus: number;
    firstTimeLogin?: boolean;
  };
  message: string;
  statusCode: number;
}  

export const logoutUser = async (): Promise<void> => {
  try {
    const response = await fetch('https://backend.stockpiece.fun/api/v1/user/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Logout failed');
    }

    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  } catch (error) {
    console.error('Logout failed:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred during logout');
  }
};

export const loginUser = async (username: string, password: string, couponCode: string): Promise<LoginResponse> => {
    const response = await fetch('https://backend.stockpiece.fun/api/v1/user/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, couponCode }),
      credentials: 'include',
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }
  
    return data;
};
  
export const registerUser = async (username: string, password: string): Promise<LoginResponse> => {
    const fingerprint = await generateFingerprint();

    const response = await fetch('https://backend.stockpiece.fun/api/v1/user/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, fingerprint }),
    });

    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Username already exists.');
      }
      throw new Error(data.message || 'Registration failed. Please try again.');
    }
  
    return data;
};

export const loginExists = async(): Promise<LoginResponse> => {
  const response = await fetch('https://backend.stockpiece.fun/api/v1/user/profile/login-status', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(data.message || 'Failed to refresh token');
  }

  return data;
};


export const refreshToken = async(): Promise<LoginResponse> => {
  try {
    const response = await fetch('https://backend.stockpiece.fun/api/v1/user/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};
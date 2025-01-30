interface LoginResponse {
    data: {
      accessToken: string;
      refreshToken: string;
    };
    message: string;
  }
  
export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }
  
    return data;
};
  
export const registerUser = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('/api/v1/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Username already exists. Please choose a different username.');
      }
      throw new Error(data.message || 'Registration failed. Please try again.');
    }
  
    return data;
};
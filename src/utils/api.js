const BASE_URL = ''; // Same host (Express serves built files in production, proxy maps in development)

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Check if it's a file download (like JSON export)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      return data;
    } else {
      // For file download or empty responses
      if (!response.ok) {
        throw new Error('Request failed.');
      }
      return response;
    }
  } catch (err) {
    console.error(`API Request Error (${url}):`, err.message);
    throw err;
  }
}

export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body, ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body, ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),

  // Auth endpoints
  login: async (email, password) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  signup: async (name, email, password) => {
    const data = await request('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  resetPassword: (email) => {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: { email },
    });
  },

  getCurrentUser: () => {
    return request('/api/auth/me');
  }
};

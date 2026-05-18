const API_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchApi = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new Error(errorData.message || 'An error occurred');
  }

  return response.json();
};

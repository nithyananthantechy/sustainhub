import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create central Axios instance
export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
});

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  apiKey: string;
  logoUrl?: string | null;
  csrDataSource: 'manual' | 'api' | 'sharepoint';
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, user: User, company: Company) => void;
  logout: () => Promise<void>;
  updateCompany: (company: Company) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [company, setCompany] = useState<Company | null>(() => {
    const saved = localStorage.getItem('company');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Configure Axios Request interceptor to automatically attach authorization header
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const activeToken = localStorage.getItem('token');
        if (activeToken) {
          config.headers.Authorization = `Bearer ${activeToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Configure Axios Response interceptor to handle token refresh on 401 errors
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            try {
              console.log('[Auth] Attempting token refresh...');
              // Make call to refresh endpoint
              const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/refresh', {
                refreshToken,
              });
              
              const newAccessToken = res.data.accessToken;
              localStorage.setItem('token', newAccessToken);
              setToken(newAccessToken);
              
              // Retry original request with the new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              console.error('[Auth] Refresh token expired or invalid:', refreshError);
              // Silent logout
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              localStorage.removeItem('company');
              setToken(null);
              setUser(null);
              setCompany(null);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, loggedUser: User, loggedCompany: Company) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('company', JSON.stringify(loggedCompany));
    setToken(accessToken);
    setUser(loggedUser);
    setCompany(loggedCompany);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request failed on server, cleaning client state anyway.');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      setToken(null);
      setUser(null);
      setCompany(null);
    }
  };

  const updateCompany = (updatedCompany: Company) => {
    localStorage.setItem('company', JSON.stringify(updatedCompany));
    setCompany(updatedCompany);
  };

  return (
    <AuthContext.Provider value={{ token, user, company, loading, login, logout, updateCompany }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

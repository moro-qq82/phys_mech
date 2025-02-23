import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, display_name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // 開発環境用のモックレスポンス
          const mockUser = {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            display_name: 'Test User',
            roles: ['user']
          };
          setUser(mockUser);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // 開発環境用のモックログイン
      const mockUser = {
        id: '1',
        email,
        username: 'testuser',
        display_name: 'Test User',
        roles: ['user']
      };
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // 開発環境用のモックログアウト
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, display_name: string) => {
    try {
      setLoading(true);
      setError(null);

      // 開発環境用のモック登録
      const mockUser = {
        id: '1',
        email,
        username,
        display_name,
        roles: ['user']
      };
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        isAuthenticated: !!user,
        login, 
        logout, 
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

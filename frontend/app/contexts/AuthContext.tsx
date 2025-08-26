"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { User, SignInResult, ApiError } from '../../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  signin: (email: string, password: string) => Promise<SignInResult>;
  signup: (username: string, email: string, password: string) => Promise<SignInResult>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      // Set token for this request
      const response = await api.get('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      setUser(response.data.user);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching user:', apiError);
      // Token is invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      const response = await api.post('/api/user/signin', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      showToast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Login failed';
      showToast.error(`${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      const response = await api.post('/api/user/signup', { username, email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      showToast.success(`Welcome to Focusfy, ${user.name}! Let's start crafting your productivity!`);
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Registration failed';
      if (errorMessage.includes('email') && errorMessage.includes('already')) {
        showToast.error('That email is already taken! Choose a different one');
      } else {
        showToast.error(`${errorMessage}`);
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast.info('Logged out successfully. See you later, crafter! ');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      signin: signIn,
      signup: signUp,
      logout,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

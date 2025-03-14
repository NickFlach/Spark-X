import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
}

// Create a default context value to avoid undefined errors
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => {
    throw new Error('Auth context not initialized');
  },
  register: async () => {
    throw new Error('Auth context not initialized');
  },
  logout: async () => {
    throw new Error('Auth context not initialized');
  },
  refreshUser: async () => {
    throw new Error('Auth context not initialized');
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        console.log('User authenticated:', userData);
        setUser(userData);
      } else {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth status');
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login for:', username);
      setLoading(true);
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await res.json();
      console.log('Login successful:', userData);
      setUser(userData);
      toast({
        title: 'Welcome back!',
        description: `You've successfully logged in as ${userData.name}.`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('Attempting registration for:', userData.username);
      setLoading(true);
      const res = await apiRequest('POST', '/api/auth/register', userData);
      const newUser = await res.json();
      console.log('Registration successful:', newUser);
      setUser(newUser);
      toast({
        title: 'Registration successful!',
        description: `Welcome to Spark-X, ${newUser.name}!`,
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Could not create account',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      await apiRequest('POST', '/api/auth/logout', {});
      console.log('Logout successful');
      setUser(null);
      toast({
        title: 'Logged out',
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'An error occurred during logout.',
      });
    }
  };

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data');
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        console.log('User refresh successful:', userData);
        setUser(userData);
      } else {
        console.log('User refresh failed, not authenticated');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

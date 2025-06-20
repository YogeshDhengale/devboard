// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Try to get token from localStorage first
      const storedToken = localStorage.getItem('auth-token');
      
      if (!storedToken) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
        return;
      }

      // Validate token by fetching user profile
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth-token');
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth-token');
      setAuthState(prev => ({
        ...prev,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication check failed',
      }));
    }
  }, []);

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('auth-token', data.token);
        
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        return { success: true, message: data.message };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message,
        }));
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = 'Login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (
    userData: RegisterData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('auth-token', data.token);
        
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        return { success: true, message: data.message };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message,
        }));
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.' + error;
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('auth-token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [authState.token]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!authState.token) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [authState.token]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page or show login form
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
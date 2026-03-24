import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'INIT_AUTH'; payload: { user: User; token: string } | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'INIT_AUTH':
      if (action.payload) {
        return {
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          isLoading: false,
        };
      }
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const user = authService.getStoredUser();

      if (token && user) {
        try {
          // Verify token is still valid
          await authService.getMe();
          dispatch({ type: 'INIT_AUTH', payload: { user, token } });
        } catch (error) {
          // Token is invalid, clear storage
          authService.logout();
          dispatch({ type: 'INIT_AUTH', payload: null });
        }
      } else {
        dispatch({ type: 'INIT_AUTH', payload: null });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(credentials);
      console.log('✅ Login response received:', response);
      
      authService.storeAuth(response.data.token, response.data.user);
      dispatch({ 
        type: 'SET_USER', 
        payload: { 
          user: response.data.user, 
          token: response.data.token 
        } 
      });
      
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response);
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.register(credentials);
      
      authService.storeAuth(response.data.token, response.data.user);
      dispatch({ 
        type: 'SET_USER', 
        payload: { 
          user: response.data.user, 
          token: response.data.token 
        } 
      });
      
      toast.success('Registration successful!');
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    dispatch({ type: 'CLEAR_USER' });
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';
import { ErrorHandler } from '../utils/errorHandler';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      ErrorHandler.handleAuthError(error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error) {
      ErrorHandler.handleAuthError(error);
      throw error;
    }
  },

  async getMe(): Promise<{ data: { user: User } }> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      ErrorHandler.logError(error, 'Failed to parse stored user data');
      return null;
    }
  },

  storeAuth(token: string, user: User): void {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      ErrorHandler.logError(error, 'Failed to store auth data');
      throw new Error('Failed to save authentication data');
    }
  }
};
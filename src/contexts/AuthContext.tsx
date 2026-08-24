'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginPayload, SignupPayload } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { generateId } from '@/lib/utils';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredAuth(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem('boi-lagbe-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user, token: parsed.token };
    }
  } catch {
    // ignore parse errors
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load stored auth on mount
  useEffect(() => {
    const { user, token } = getStoredAuth();
    setState({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading: false,
    });
  }, []);

  const persistAuth = useCallback((user: User, token: string) => {
    localStorage.setItem('boi-lagbe-auth', JSON.stringify({ user, token }));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    // Check default admin credentials: mahadi379377@gmail.com / idahamsm@
    if (payload.email === 'mahadi379377@gmail.com') {
      if (payload.password !== 'idahamsm@') {
        return false;
      }
      const adminUser: User = {
        id: 'user-admin-mahadi',
        name: 'Mahadi (Admin)',
        email: 'mahadi379377@gmail.com',
        phone: '01712345678',
        role: 'admin',
        rating_avg: 5.0,
        rating_count: 99,
        created_at: new Date().toISOString(),
      };
      const token = `mock-admin-jwt-${generateId()}`;
      setState({ user: adminUser, token, isAuthenticated: true, isLoading: false });
      persistAuth(adminUser, token);
      return true;
    }

    // Standard user login
    const foundUser = mockUsers.find((u) => u.email === payload.email);
    if (foundUser) {
      if (foundUser.is_blocked) {
        throw new Error('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে।');
      }
      const token = `mock-jwt-${generateId()}`;
      setState({ user: foundUser, token, isAuthenticated: true, isLoading: false });
      persistAuth(foundUser, token);
      return true;
    }
    return false;
  }, [persistAuth]);

  const signup = useCallback(async (payload: SignupPayload & { institute_id?: string }): Promise<boolean> => {
    const newUser: User = {
      id: `user-${generateId()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      institute_id: payload.institute_id,
      rating_avg: 0,
      rating_count: 0,
      created_at: new Date().toISOString(),
    };
    const token = `mock-jwt-${generateId()}`;
    setState({ user: newUser, token, isAuthenticated: true, isLoading: false });
    persistAuth(newUser, token);
    return true;
  }, [persistAuth]);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('boi-lagbe-auth');
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      if (prev.token) persistAuth(updatedUser, prev.token);
      return { ...prev, user: updatedUser };
    });
  }, [persistAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };

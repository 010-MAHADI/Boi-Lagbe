'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginPayload, SignupPayload } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'boi-lagbe-auth';

function getStoredAuth(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user ?? null, token: parsed.token ?? null };
    }
  } catch {
    // ignore
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { token: string | null }>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Rehydrate from localStorage on mount, then verify with backend
  useEffect(() => {
    const { user, token } = getStoredAuth();
    if (user && token) {
      setState({ user, token, isAuthenticated: true, isLoading: false });
      // Background verify — if token is expired the next API call will 401 and logout
      authApi.me(token).then((freshUser) => {
        setState((prev) => ({ ...prev, user: freshUser }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: freshUser, token }));
      }).catch(() => {
        // Token expired — clear auth
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        localStorage.removeItem(STORAGE_KEY);
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const persistAuth = useCallback((user: User, token: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    const { user, access_token } = await authApi.login(payload);
    setState({ user, token: access_token, isAuthenticated: true, isLoading: false });
    persistAuth(user, access_token);
    return true;
  }, [persistAuth]);

  const signup = useCallback(async (payload: SignupPayload): Promise<boolean> => {
    const { user, access_token } = await authApi.signup(payload);
    setState({ user, token: access_token, isAuthenticated: true, isLoading: false });
    persistAuth(user, access_token);
    return true;
  }, [persistAuth]);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      if (prev.token) persistAuth(updatedUser, prev.token);
      return { ...prev, user: updatedUser };
    });
    // Persist to backend (best-effort — local state is already updated)
    const currentToken = getStoredAuth().token;
    if (currentToken) {
      try {
        const fresh = await authApi.updateMe(currentToken, {
          name: updates.name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          institute_id: updates.institute_id,
        });
        setState((prev) => {
          const updatedUser = { ...prev.user!, ...fresh };
          if (prev.token) persistAuth(updatedUser, prev.token);
          return { ...prev, user: updatedUser };
        });
      } catch {
        // Ignore — local update already applied
      }
    }
  }, [persistAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export { AuthContext };

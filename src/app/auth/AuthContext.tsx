"use client";
import { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin PIN - In production, this should be stored securely
const ADMIN_PIN = "12345"; // You can change this to any 5-digit number

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only access sessionStorage on the client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('ceh-admin-auth');
      setIsAuthenticated(authStatus === 'true');
    }
    setIsLoading(false);
  }, []);

  const login = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ceh-admin-auth', 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ceh-admin-auth');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

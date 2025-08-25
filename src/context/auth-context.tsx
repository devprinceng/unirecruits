"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user in session storage
    try {
      const storedUser = sessionStorage.getItem('unirecruits_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from sessionStorage", error);
      sessionStorage.removeItem('unirecruits_user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
          const userToStore = { ...foundUser };
          delete userToStore.password;
          setUser(userToStore);
          sessionStorage.setItem('unirecruits_user', JSON.stringify(userToStore));
          resolve(userToStore);
        } else {
          resolve(null);
        }
        setLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('unirecruits_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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

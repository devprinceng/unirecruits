"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { login as apiLogin } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (user: User) => void;
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
    try {
      const loggedInUser = await apiLogin(email, password);
      if (loggedInUser) {
        const userToStore: Partial<User> = { ...loggedInUser };
        delete userToStore.password;
        setUser(userToStore as User);
        sessionStorage.setItem('unirecruits_user', JSON.stringify(userToStore));
        return userToStore as User;
      }
      return null;
    } catch (error) {
        console.error("Login failed", error);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('unirecruits_user');
  };
  
  const updateUser = (updatedUser: User) => {
    const userToStore: Partial<User> = { ...updatedUser };
    delete userToStore.password;
    setUser(userToStore as User);
    sessionStorage.setItem('unirecruits_user', JSON.stringify(userToStore));
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
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

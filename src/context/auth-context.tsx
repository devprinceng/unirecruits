"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { login as apiLogin, registerUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: string;
  }) => Promise<{ user: User; token: string } | null>;
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

  const login = async (
    email: string,
    password: string
  ): Promise<any> => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password); 
  
      if (response?.user && response?.token) {
        const userToStore: Partial<User> = { ...response.user };
        // Remove password from stored user data if it exists
        if ('password' in userToStore) {
          delete (userToStore as any).password;
        }
  
        setUser(userToStore as User);
        sessionStorage.setItem("unirecruits_user", JSON.stringify(userToStore));
        sessionStorage.setItem("unirecruits_token", response.token);
  
        return { user: userToStore, token: response.token };
      }
  
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: string;
  }): Promise<{ user: User; token: string } | null> => {
    setLoading(true);
    try {
      const response = await registerUser({
        ...userData,
        role: userData.role || 'user'
      });

      if (response?.user && response?.token) {
        const userToStore: Partial<User> = { ...response.user };
        // Remove password from stored user data if it exists
        if ('password' in userToStore) {
          delete (userToStore as any).password;
        }

        setUser(userToStore as User);
        sessionStorage.setItem("unirecruits_user", JSON.stringify(userToStore));
        sessionStorage.setItem("unirecruits_token", response.token);

        return { user: userToStore as User, token: response.token };
      }

      return null;
    } catch (error) {
      console.error("Registration failed", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('unirecruits_user');
    sessionStorage.removeItem('unirecruits_token');
  };
  
  const updateUser = (updatedUser: User) => {
    const userToStore: Partial<User> = { ...updatedUser };
    // Remove password from stored user data if it exists
    if ('password' in userToStore) {
      delete (userToStore as any).password;
    }
    setUser(userToStore as User);
    sessionStorage.setItem('unirecruits_user', JSON.stringify(userToStore));
  };


  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
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

// components/context/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
  streak?: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId, isLoading: isAuthLoading } = useAuth();

  const refetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const userRes = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refetch user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refetchUser();
    }
  }, [userId, refetchUser]);

  return (
    <UserContext.Provider value={{ user, isLoading: isLoading || isAuthLoading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
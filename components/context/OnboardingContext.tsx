'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface OnboardingContextType {
  updateStatus: (step: string, status: string) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();

  const updateStatus = useCallback(async (step: string, status: string) => {
    if (!userId) return;

    try {
      await fetch('http://127.0.0.1:5000/api/onboarding/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, step, status }),
      });
    } catch (error) {
      console.error(`Failed to update onboarding step ${step}:`, error);
    }
  }, [userId]);

  return (
    <OnboardingContext.Provider value={{ updateStatus }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface OnboardingContextType {
  updateStatus: (step: string, status: string) => Promise<void>;
}

// Define the context that will be provided by the layout
export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// The hook to consume the context remains the same
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    // I've updated the error message to be more specific for easier debugging in the future
    throw new Error('useOnboarding must be used within the OnboardingLayout');
  }
  return context;
};
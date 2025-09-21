'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
// 1. Import the provider
import { OnboardingProvider } from '@/components/context/OnboardingContext';

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(console.error);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <video ref={videoRef} className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover">
        <source src="/2882620-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    </div>
  );
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userId) {
      router.push('/login');
    }
  }, [userId, isLoading, router]);

  if (isLoading) {
    return (
      <main className="h-[100dvh] w-full relative">
        <VideoBackground />
        <div className="relative z-10 h-full flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] w-full overflow-hidden relative">
      <VideoBackground />
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sm:p-8 w-full max-w-4xl h-[90vh] flex flex-col"
        >
          {/* 2. Wrap the children with the provider */}
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </motion.div>
      </div>
    </main>
  );
}
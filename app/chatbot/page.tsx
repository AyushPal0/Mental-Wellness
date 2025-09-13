'use client'
import React, { useRef, useEffect, useState } from "react";
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import ProfileTaskPanel from "@/components/ProfileTaskPanel";

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
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/5692315-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  );
};


export default function ChatbotPage() {
  const [isPanelOpen, setPanelOpen] = useState(false);

  return (
    <div className="h-screen w-full relative font-sans overflow-hidden">
      <VideoBackground />
      <main className="relative z-10 flex h-full w-full items-center justify-center p-4 gap-4">
        {/* Main content container */}
        <div className="hidden md:flex md:flex-shrink-0 h-[95vh] max-h-[900px]">
          <Sidebar />
        </div>
        <div className="flex-1 h-[95vh] max-h-[900px]">
          <ChatArea onProfileClick={() => setPanelOpen(true)} />
        </div>
      </main>
      <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
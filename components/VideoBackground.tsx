// components/VideoBackground.tsx
'use client';
import { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc?: string;
  overlayOpacity?: number;
}

export const VideoBackground = ({ 
  videoSrc = "/2882620-hd_1920_1080_30fps.mp4", 
  overlayOpacity = 40 
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setLoaded(true);
      video.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    const playVideo = () => {
      video.play().catch(error => {
        console.log("Video play failed:", error);
      });
    };
    
    playVideo();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={videoSrc} type="video/mp4" />
        <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
          Your browser does not support the video tag.
        </div>
      </video>
      <div className={`absolute inset-0 bg-black bg-opacity-${overlayOpacity}`}></div>
    </div>
  );
};
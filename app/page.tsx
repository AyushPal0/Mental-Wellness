'use client';
import { useEffect, useRef, useState } from 'react';
import { Footer } from "@/components/footer";
import Link from 'next/link';

const VideoBackground = () => {
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
    
    // Set video properties for background behavior
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    // Attempt to play the video (may require user interaction on some browsers)
    const playVideo = () => {
      video.play().catch(error => {
        console.log("Video play failed, may require user interaction:", error);
      });
    };
    
    playVideo();

    // Clean up
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
        style={{ minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <source src="/5692315-hd_1920_1080_30fps.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
          Your browser does not support the video tag.
        </div>
      </video>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl border border-white border-opacity-30 w-11/12 max-w-6xl mx-auto">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-white text-2xl font-bold hover:scale-105 transition-transform duration-300 cursor-pointer">Eunoia</div>
          
          {/* Navigation Links - Centered */}
          <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="#" className="text-white hover:text-purple-200 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-110">
              Home
            </a>
            <a href="#" className="text-white hover:text-purple-200 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-110">
              Features
            </a>
            <a href="#" className="text-white hover:text-purple-200 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-110">
              About
            </a>
            <a href="#" className="text-white hover:text-purple-200 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-110">
              Contact
            </a>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex space-x-3">
            <Link href="/login" className="text-white px-4 py-2 rounded-full font-medium text-sm bg-white bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-30 transform hover:-translate-y-1 hover:scale-105">
  Login
</Link>
            <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-opacity-95 transition-all duration-300 shadow-sm transform hover:-translate-y-1 hover:scale-105">
  Sign up
</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function Home() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden relative">
      {/* Navbar */}
      <Navbar />
      
      {/* Video Background */}
      <VideoBackground />
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 pt-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 hover:scale-105 transition-transform duration-500 cursor-pointer">Eunoia</h1>
        <h2 className="text-xl md:text-2xl mb-8 max-w-3xl font-light">
          Youth Mental Wellness AI
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-2xl px-4 leading-relaxed">
          A responsible and empathetic AI companion designed to support wellbeing through personalized conversations, wellness games, and community connections.
        </p>
        
        <div className="w-24 h-1 bg-white bg-opacity-50 mb-10"></div>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-16">
          
        </div>
        
        {/* Get Started Button at bottom */}
        <div className="absolute bottom-32 transform hover:-translate-y-1 transition-transform duration-300">
          <Link 
            href="/personality-test" 
            className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse block transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
// app/login/page.tsx
'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

// VideoBackground component included directly to avoid import issues
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
    
    // Attempt to play the video
    const playVideo = () => {
      video.play().catch(error => {
        console.log("Video play failed:", error);
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Logging in with:', email);
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden relative">
      <VideoBackground />
      
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl border border-white border-opacity-30 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Log In</h1>
            <p className="text-white text-opacity-80">Welcome back to your mental wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-purple-700 py-3 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white text-opacity-80">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
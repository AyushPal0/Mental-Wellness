// app/community/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import CommunityPost from '@/components/CommunityPost';
import UserProfile from '@/components/UserProfile';
import { Loader2, Plus, Search } from 'lucide-react';
// Import Avatar components from your UI library (e.g., @radix-ui/react-avatar or your own component path)
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Interfaces for type safety
interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
}

interface Post {
  _id: string;
  user_id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: any[];
  user?: User;
}

const VideoBackground = () => {
    // Re-using the video background for consistent UI
    const videoRef = React.useRef<HTMLVideoElement>(null);
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
          <source src="/5692315-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
    );
};

function CommunityPageComponent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/community/posts');
        if (!response.ok) throw new Error('Could not fetch community posts.');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPosts();
    } else {
      setError("Please log in to join the community.");
      setIsLoading(false);
    }
  }, [userId]);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !userId) return;

    setIsPosting(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content: newPostContent }),
      });
      if (!response.ok) throw new Error("Failed to create post.");

      const newPostData = await response.json();
      setPosts(prev => [newPostData.post, ...prev]);
      setNewPostContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="h-screen w-full relative font-sans overflow-hidden">
        <VideoBackground />
        <LoggedInNavbar />
        
        <main className="relative z-10 container mx-auto pt-24 px-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Community of Eunoia</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="bg-black/20 border border-white/20 rounded-full h-10 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                    </div>
                    <Avatar className="cursor-pointer" onClick={() => setSelectedUser({ _id: userId || '', username: 'You' })}>
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>YOU</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {isLoading && <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400"/><p className="mt-2 text-white/60">Loading feed...</p></div>}
                {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
                <AnimatePresence>
                    {!isLoading && posts.map(post => (
                        <CommunityPost key={post._id} post={post} onProfileClick={setSelectedUser} />
                    ))}
                </AnimatePresence>
            </div>
            
            {/* Create Post Input */}
            <motion.div 
                className="flex-shrink-0 mt-4 pb-4"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
            >
                <form onSubmit={handleCreatePost} className="relative">
                    <input
                        type="text"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full bg-black/50 border border-white/20 rounded-full h-14 pl-6 pr-16 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button type="submit" disabled={isPosting} className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:bg-purple-800">
                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-6 h-6" />}
                    </button>
                </form>
            </motion.div>
        </main>

        <AnimatePresence>
            {selectedUser && <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </AnimatePresence>
    </div>
  );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="bg-gray-900 min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
            <CommunityPageComponent />
        </Suspense>
    )
}
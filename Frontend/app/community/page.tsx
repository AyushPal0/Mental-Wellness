'use client';

import React, { useState, useEffect, FormEvent, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import CommunityPost from '@/components/CommunityPost';
import UserProfile from '@/components/UserProfile';
import { Loader2, Plus, Search, Paperclip, SendHorizonal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import io from 'socket.io-client';
import Link from 'next/link';
import ProfileTaskPanel from '@/components/ProfileTaskPanel';

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
  likes: string[];
  comments: any[];
  user?: User;
}

const VideoBackground = () => {
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const socket = io('http://127.0.0.1:5000');

    socket.on('new_post', (newPost) => {
      setPosts(prev => [newPost, ...prev]);
    });

    socket.on('post_update', (updatedPost) => {
      setPosts(prev => prev.map(p => p._id === updatedPost.post_id ? { ...p, likes: updatedPost.likes } : p));
    });

    socket.on('comment_update', ({ post_id, comment }) => {
        setPosts(prev => prev.map(p => p._id === post_id ? { ...p, comments: [...p.comments, comment] } : p));
    });

    socket.on('post_deleted', ({ post_id }) => {
        setPosts(prev => prev.filter(p => p._id !== post_id));
    });

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

    return () => {
        socket.disconnect();
    }
  }, [userId]);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if ((!newPostContent.trim() && !selectedFile) || !userId) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('content', newPostContent);
    if (selectedFile) {
        formData.append('media', selectedFile);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/community/posts', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create post.");

      setNewPostContent('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!userId) return;
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/community/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        if (!response.ok) {
            throw new Error("Failed to delete post.");
        }
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="h-screen w-full relative font-sans overflow-hidden">
        <VideoBackground />
        <LoggedInNavbar onProfileClick={() => setPanelOpen(true)} />
        
        <main className="relative z-10 container mx-auto pt-24 px-4 h-full flex flex-col">
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
                    <Link href={`/friends?userId=${userId}`}>
                        <button className="bg-white/10 text-white px-4 py-2 rounded-full font-medium text-sm">Friends</button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {isLoading && <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400"/><p className="mt-2 text-white/60">Loading feed...</p></div>}
                {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
                <AnimatePresence>
                    {!isLoading && posts.map(post => (
                        <CommunityPost 
                            key={post._id} 
                            post={post} 
                            currentUserId={userId || ''}
                            onProfileClick={setSelectedUser}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </AnimatePresence>
            </div>
            
            <motion.div 
                className="flex-shrink-0 mt-4 pb-4"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
            >
                {selectedFile && (
                    <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-full h-8 px-3 text-white text-sm mb-2 w-fit">
                        <Paperclip size={14}/>
                        <span>{selectedFile.name}</span>
                    </div>
                )}
                <form onSubmit={handleCreatePost} className="relative">
                    <input
                        type="text"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full bg-black/50 border border-white/20 rounded-full h-14 pl-6 pr-28 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input ref={fileInputRef} type="file" id="file-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                    <label htmlFor="file-upload" className="absolute right-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                        <Paperclip className="w-5 h-5"/>
                    </label>
                    <button type="submit" disabled={isPosting} className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:bg-purple-800">
                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin"/> : <SendHorizonal className="w-5 h-5" />}
                    </button>
                </form>
            </motion.div>
        </main>

        <AnimatePresence>
            {selectedUser && <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} currentUserId={userId || ''} />}
        </AnimatePresence>
        <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
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
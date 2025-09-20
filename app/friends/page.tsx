'use client';

import React, { useState, useEffect, Suspense, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import { UserPlus, Check, X, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserProfile from '@/components/UserProfile';
import ProfileTaskPanel from '@/components/ProfileTaskPanel';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
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


const FriendsPageComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [userId]);

  const fetchFriends = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/friends/friends/${userId}`);
    if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
    }
  };

  const fetchFriendRequests = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/friends/friend-requests/${userId}`);
    if (res.ok) {
        const data = await res.json();
        setFriendRequests(data.requests || []);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !userId) return;
    setIsLoading(true);
    const res = await fetch(`http://127.0.0.1:5000/api/friends/search?q=${searchTerm}&userId=${userId}`);
    const data = await res.json();
    setSearchResults(data.users || []);
    setIsLoading(false);
  };
  
  const handleSendRequest = async (toUserId: string) => {
    await fetch('http://127.0.0.1:5000/api/friends/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user_id: userId, to_user_id: toUserId }),
    });
    // Optimistically remove from search results
    setSearchResults(prev => prev.filter(user => user._id !== toUserId));
  };

  const handleRespondRequest = async (senderId: string, action: 'accept' | 'decline') => {
    await fetch(`http://127.0.0.1:5000/api/friends/friend-request/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: userId, sender_id: senderId, action }),
    });
    fetchFriendRequests();
    if (action === 'accept') {
        fetchFriends(); // Refresh friends list if accepted
    }
  };

  return (
    <div className="h-screen w-full relative font-sans overflow-hidden">
      <VideoBackground />
      <LoggedInNavbar onProfileClick={() => setPanelOpen(true)} />
      <main className="relative z-10 container mx-auto pt-24 px-4 h-full flex flex-col">
        <motion.h1 
          className="text-3xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
            Connections
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Friends List (Main Column) */}
          <motion.div 
            className="md:col-span-2 bg-black/50 backdrop-blur-l rounded-2xl p-6 flex flex-col h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Your Friends ({friends.length})</h2>
            <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
              {friends.length > 0 ? friends.map(user => (
                <motion.div 
                    key={user._id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-white">{user.full_name || user.username}</p>
                        <p className="text-sm text-white/60">@{user.username}</p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center text-white/60 py-10">
                    <p>Your friends list is empty.</p>
                    <p className="text-sm">Use the search to find and add friends!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Search and Friend Requests (Side Column) */}
          <motion.div 
            className="md:col-span-1 flex flex-col gap-6 h-full overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-black/50 backdrop-blur-l rounded-2xl p-6 flex flex-col flex-shrink-0">
              <h2 className="text-xl font-bold text-white mb-4">Find Friends</h2>
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full bg-black/20 border border-white/20 rounded-full h-10 pl-10 pr-4 text-white focus:ring-1 focus:ring-purple-400 focus:outline-none transition"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {isLoading ? <Loader2 className="animate-spin mx-auto text-white/70" /> : searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between text-white p-2 rounded hover:bg-white/10">
                    <span onClick={() => setSelectedUser(user)} className="cursor-pointer text-sm">{user.username}</span>
                    <button onClick={() => handleSendRequest(user._id)} className="p-1 hover:bg-purple-500/50 rounded-full transition-colors"><UserPlus size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-l rounded-2xl p-6 flex flex-col flex-grow overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Friend Requests ({friendRequests.length})</h2>
              <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
                {friendRequests.length > 0 ? friendRequests.map(user => (
                  <div key={user._id} className="flex items-center justify-between text-white p-2 rounded hover:bg-white/10">
                    <span onClick={() => setSelectedUser(user)} className="cursor-pointer text-sm">{user.username}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRespondRequest(user._id, 'accept')} className="p-1.5 bg-green-500/20 hover:bg-green-500/40 rounded-full transition-colors"><Check size={14} className="text-green-400" /></button>
                      <button onClick={() => handleRespondRequest(user._id, 'decline')} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"><X size={14} className="text-red-400" /></button>
                    </div>
                  </div>
                )) : (
                    <div className="text-center text-white/60 pt-8">
                        <p className="text-sm">No new requests.</p>
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {selectedUser && <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} currentUserId={userId || ''} />}
      </AnimatePresence>

      <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}

export default function FriendsPage() {
    return (
        <Suspense fallback={<div className="bg-gray-900 min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
            <FriendsPageComponent />
        </Suspense>
    )
}
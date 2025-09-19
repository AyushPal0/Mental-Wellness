// app/friends/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import { UserPlus, Check, X, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserProfile from '@/components/UserProfile';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
}

const FriendsPageComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    const data = await res.json();
    setFriends(data.friends || []);
  };

  const fetchFriendRequests = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/friends/friend-requests/${userId}`);
    const data = await res.json();
    setFriendRequests(data.requests || []);
  };

  const handleSearch = async (e: React.FormEvent) => {
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
  };

  const handleRespondRequest = async (senderId: string, action: 'accept' | 'decline') => {
    await fetch(`http://127.0.0.1:5000/api/friends/friend-request/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: userId, sender_id: senderId, action }),
    });
    fetchFriendRequests();
    fetchFriends();
  };

  return (
    <div className="h-screen w-full relative font-sans overflow-hidden">
      <LoggedInNavbar />
      <main className="relative z-10 container mx-auto pt-24 px-4 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
          {/* Search and Friend Requests */}
          <div className="md:col-span-1 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-2xl rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Find Friends</h2>
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full bg-black/20 border border-white/20 rounded-full h-10 pl-10 pr-4 text-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              </form>
              <div className="space-y-2">
                {isLoading ? <Loader2 className="animate-spin" /> : searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between">
                    <span onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.username}</span>
                    <button onClick={() => handleSendRequest(user._id)}><UserPlus size={18} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-2xl rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Friend Requests</h2>
              <div className="space-y-2">
                {friendRequests.map(user => (
                  <div key={user._id} className="flex items-center justify-between">
                    <span onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.username}</span>
                    <div>
                      <button onClick={() => handleRespondRequest(user._id, 'accept')}><Check size={18} className="text-green-500" /></button>
                      <button onClick={() => handleRespondRequest(user._id, 'decline')}><X size={18} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Friends List */}
          <div className="md:col-span-2 bg-black/40 backdrop-blur-2xl rounded-2xl p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Your Friends</h2>
            <div className="space-y-2">
              {friends.map(user => (
                <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar onClick={() => setSelectedUser(user)} className="cursor-pointer">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <AnimatePresence>
        {selectedUser && <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} currentUserId={userId || ''} />}
      </AnimatePresence>
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
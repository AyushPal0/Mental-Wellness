// components/UserProfile.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

// Define a specific type for the user prop for better type safety
interface UserProfileProps {
  user: {
    _id: string;
    username: string;
    full_name?: string;
    avatar?: string;
  } | null;
  onClose: () => void;
  currentUserId: string; // Add currentUserId to know who is sending the request
}

export default function UserProfile({ user, onClose, currentUserId }: UserProfileProps) {
  // Add a check to ensure user is not null before rendering
  if (!user) {
    return null;
  }

  const handleSendRequest = async () => {
    if (!currentUserId || !user) return;

    try {
      await fetch('http://127.0.0.1:5000/api/friends/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user_id: currentUserId, to_user_id: user._id }),
      });
      // You can add a success message here if you like
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-black/40 border border-white/20 w-full max-w-md mx-auto rounded-2xl shadow-2xl p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10">
          <X size={24} />
        </Button>
        <div className="flex flex-col items-center">
          <Avatar className="w-28 h-28 mb-4 border-4 border-purple-500/50">
            <AvatarImage src={user.avatar || '/placeholder-user.jpg'} alt={user.username} />
            <AvatarFallback className="text-4xl">{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold text-white">{user.full_name || user.username}</h2>
          <p className="text-white/60 mt-1">Mental Wellness Advocate</p>
          <Button
            onClick={handleSendRequest}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            Send Friend Request
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
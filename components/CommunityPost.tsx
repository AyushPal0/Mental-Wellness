// components/CommunityPost.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from 'lucide-react';

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

interface CommunityPostProps {
  post: Post;
  onProfileClick: (user: User) => void;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
};

export default function CommunityPost({ post, onProfileClick }: CommunityPostProps) {
  const user = post.user || { _id: post.user_id, username: "Unknown", avatar: '/placeholder-user.jpg' };
  
  return (
    <motion.div 
      className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Avatar className="w-12 h-12 cursor-pointer" onClick={() => onProfileClick(user)}>
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <p className="font-semibold text-white cursor-pointer hover:underline" onClick={() => onProfileClick(user)}>
            {user.full_name || user.username}
          </p>
          <p className="text-white/60 text-sm">{formatTimeAgo(post.createdAt)}</p>
        </div>
      </div>

      <p className="text-white/90 mb-4 whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden">
            <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between text-white/60 border-t border-white/10 pt-3">
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 hover:text-white">
          <Heart size={18} />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 hover:text-white">
          <MessageCircle size={18} />
          <span>{post.comments.length}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 hover:text-white">
          <Share2 size={18} />
          <span>Share</span>
        </Button>
      </div>
    </motion.div>
  );
}
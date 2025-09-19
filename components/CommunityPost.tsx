// components/CommunityPost.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
}

interface Comment {
    _id: string;
    user_id: string;
    text: string;
    created_at: string;
    user?: User;
}

interface Post {
  _id: string;
  user_id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  user?: User;
}

interface CommunityPostProps {
  post: Post;
  currentUserId: string;
  onProfileClick: (user: User) => void;
  onDelete: (postId: string) => void;
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

export default function CommunityPost({ post, currentUserId, onProfileClick, onDelete }: CommunityPostProps) {
  const user = post.user || { _id: post.user_id, username: "Unknown", avatar: '/placeholder-user.jpg' };
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isOwner = post.user_id === currentUserId;
  const isLiked = post.likes.includes(currentUserId);

  const handleLike = async () => {
      try {
          await fetch(`http://127.0.0.1:5000/api/community/posts/${post._id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
          });
      } catch (error) {
          console.error("Failed to like post:", error);
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
        await fetch(`http://127.0.0.1:5000/api/community/posts/${post._id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText, user_id: currentUserId })
        });
        setCommentText("");
        setShowCommentInput(false);
    } catch (error) {
        console.error("Failed to add comment:", error);
    }
  }

  return (
    <motion.div
      layout
      className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start mb-4">
        <div className="flex items-center flex-1">
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
        {isOwner && (
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-red-500 w-8 h-8" onClick={() => onDelete(post._id)}>
              <Trash2 size={18} />
            </Button>
        )}
      </div>

      <p className="text-white/90 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* This is the new section to display the uploaded image */}
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden">
            <img src={`http://127.0.0.1:5000${post.imageUrl}`} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between text-white/60 border-t border-white/10 pt-3">
        <Button variant="ghost" className={cn("flex items-center gap-2 hover:bg-white/10 hover:text-white", isLiked && "text-red-500")} onClick={handleLike}>
          <Heart size={18} />
          <span>{post.likes.length}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 hover:text-white" onClick={() => setShowCommentInput(!showCommentInput)}>
          <MessageCircle size={18} />
          <span>{post.comments.length}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 hover:text-white">
          <Share2 size={18} />
          <span>Share</span>
        </Button>
      </div>

      <AnimatePresence>
        {showCommentInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-black/50 border border-white/20 rounded-full h-10 px-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 flex-shrink-0">
                  <Send size={18} />
                </Button>
            </form>
            <div className="mt-4 space-y-3">
                {post.comments.map(comment => (
                    <div key={comment._id} className="flex items-start gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user?.avatar} />
                            <AvatarFallback>{comment.user?.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{comment.user?.username}</p>
                            <p className="text-sm">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquarePlus } from 'lucide-react';

function OnboardingCommunityContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { updateStatus } = useOnboarding();
    
    const [postContent, setPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!postContent.trim() || !userId) return;
        
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('content', postContent);
        
        try {
            await fetch('http://127.0.0.1:5000/api/community/posts', {
                method: 'POST',
                body: formData,
            });
            await updateStatus('community_post', 'completed');
            await updateStatus('onboarding_complete', 'true');
            router.push(`/home?userId=${userId}`);
        } catch (error) {
            console.error("Failed to create post:", error);
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        await updateStatus('onboarding_complete', 'true');
        router.push(`/home?userId=${userId}`);
    };

    if (authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="flex flex-col h-full items-center justify-center text-center text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <MessageSquarePlus size={64} className="mx-auto text-green-400" />
            </motion.div>
            <motion.h1 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold mt-6"
            >
                Introduce Yourself
            </motion.h1>
            <motion.p 
                variants={itemVariants}
                className="text-white/70 mt-2 max-w-md"
            >
                Sharing a little about yourself is a great way to connect. What's one thing you'd like others to know?
            </motion.p>
            
            <motion.form 
                onSubmit={handleSubmit}
                variants={itemVariants}
                className="mt-8 w-full max-w-md"
            >
                <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="e.g., Hi everyone! I'm here to learn more about mindfulness..."
                    className="w-full bg-black/20 border border-white/20 rounded-2xl h-32 p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    rows={4}
                />
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !postContent.trim()}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 w-full shadow-lg shadow-purple-500/30"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Post & Finish Onboarding"}
                </Button>
            </motion.form>
            <motion.div variants={itemVariants}>
                <Button onClick={handleSkip} variant="ghost" className="text-white/60 hover:text-white mt-4">
                    Skip and go to Home
                </Button>
            </motion.div>
        </motion.div>
    );
}

export default function OnboardingCommunityPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <OnboardingCommunityContent />
        </Suspense>
    )
}
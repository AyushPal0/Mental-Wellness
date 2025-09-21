'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import ChatArea from '@/components/ChatArea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function OnboardingChatbotContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { updateStatus } = useOnboarding();

    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [isComplete, setIsComplete] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (userId && !isComplete) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleCompletion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [userId, isComplete]);

    const handleCompletion = async () => {
        if (isComplete || !userId) return;
        setIsComplete(true);
        if (timerRef.current) clearInterval(timerRef.current);

        await updateStatus('chatbot_interaction', 'completed');
        
        // Call backend to assign a game
        await fetch(`http://127.0.0.1:5000/api/onboarding/assign-game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });

        router.push(`/onboarding/game?userId=${userId}`);
    };
    
    if (authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 text-center mb-4">
                <h1 className="text-2xl font-bold text-white">Let's Talk</h1>
                <p className="text-white/70">Chat with MindfulAI for a few minutes to help us understand you better.</p>
                <div className="mt-2 text-lg font-mono bg-white/10 rounded-full px-4 py-1 inline-block">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>
            
            <div className="flex-grow min-h-0">
                <ChatArea 
                    userId={userId!} 
                    conversationId={conversationId}
                    onConversationStarted={setConversationId}
                />
            </div>
            
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5}} className="flex-shrink-0 text-center mt-4">
                 <Button variant="ghost" onClick={handleCompletion} className="text-white/60 hover:text-white">
                    Skip for now
                </Button>
            </motion.div>
        </div>
    );
}

export default function OnboardingChatbotPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <OnboardingChatbotContent />
        </Suspense>
    )
}

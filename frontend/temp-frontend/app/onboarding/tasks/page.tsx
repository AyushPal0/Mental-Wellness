'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Sparkles } from 'lucide-react';

function OnboardingTaskContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { updateStatus } = useOnboarding();
    
    const [taskTitle, setTaskTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim() || !userId) return;
        
        setIsSubmitting(true);
        try {
            await fetch('http://127.0.0.1:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: taskTitle, user_id: userId, category: 'General' }),
            });
            await updateStatus('task_creation', 'completed');
            router.push(`/onboarding/community?userId=${userId}`);
        } catch (error) {
            console.error("Failed to create task:", error);
            setIsSubmitting(false);
        }
    };
    
    if (authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    return (
        <div className="flex flex-col h-full items-center justify-center text-center text-white">
            <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.2, type: 'spring'}}>
                <Sparkles size={64} className="mx-auto text-yellow-300" />
            </motion.div>
            <motion.h1 
                initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}}
                className="text-3xl font-bold mt-6"
            >
                Set Your First Wellness Goal
            </motion.h1>
            <motion.p 
                initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.5}}
                className="text-white/70 mt-2 max-w-md"
            >
                What is one small step you can take for your well-being today?
            </motion.p>
            
            <motion.form 
                onSubmit={handleSubmit}
                initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.6}}
                className="mt-8 w-full max-w-md"
            >
                <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Go for a 15-minute walk"
                    className="w-full bg-black/20 border border-white/20 rounded-full h-12 px-6 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !taskTitle.trim()}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 w-full"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Task & Continue"}
                </Button>
            </motion.form>
             <Button onClick={() => router.push(`/onboarding/community?userId=${userId}`)} variant="ghost" className="text-white/60 hover:text-white mt-4">
                    Skip
             </Button>
        </div>
    );
}

export default function OnboardingTaskPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <OnboardingTaskContent />
        </Suspense>
    )
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Gamepad2, Play, SkipForward } from 'lucide-react';
import Link from 'next/link';

function OnboardingGameContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { updateStatus } = useOnboarding();
    
    const [assignedGame, setAssignedGame] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedGame = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/onboarding/status/${userId}`);
                if(response.ok) {
                    const data = await response.json();
                    if (data.game) {
                        setAssignedGame(data.game);
                    } else {
                        const assignResponse = await fetch(`http://127.0.0.1:5000/api/onboarding/assign-game`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId }),
                        });
                        const assignData = await assignResponse.json();
                        setAssignedGame(assignData.game);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch assigned game:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if(userId) fetchAssignedGame();
    }, [userId]);

    const handleSkip = async () => {
        if (!userId) return;
        setIsLoading(true);
        await updateStatus('game', 'completed');
        router.push(`/onboarding/tasks?userId=${userId}`);
    };

    const getGameInfo = (game: string | null) => {
        switch (game) {
            case 'ocd_pattern':
                return { name: 'Pattern Recognition', description: 'A game to test your attention to detail and organizational skills.' };
            case 'memory_game':
                return { name: 'Memory Lane', description: 'Challenge your short-term memory and focus with this classic game.' };
            case 'focus_game':
                return { name: 'Mindful Focus', description: 'A game designed to help you improve concentration and stay present.' };
            default:
                return { name: 'Wellness Game', description: 'Engage in an activity designed to support your well-being.' };
        }
    }

    if (isLoading || authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white"/></div>;
    }

    const gameInfo = getGameInfo(assignedGame);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
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
            <motion.div variants={itemVariants} className="mb-4">
                <Gamepad2 size={64} className="mx-auto text-purple-400" />
            </motion.div>
            <motion.h1 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold mt-4"
            >
                Your Recommended Game
            </motion.h1>
            <motion.p 
                variants={itemVariants}
                className="text-2xl font-semibold text-purple-300 mt-2"
            >
                {gameInfo.name}
            </motion.p>
            <motion.p 
                variants={itemVariants}
                className="text-white/70 mt-4 max-w-md"
            >
                {gameInfo.description} Based on our chat, we think this will be a great activity for you.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href={`/game/play?game=${assignedGame}&userId=${userId}&onboarding=true`} passHref>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 w-full sm:w-auto shadow-lg shadow-purple-500/30">
                        <Play className="mr-2 h-5 w-5"/>
                        Play Now
                    </Button>
                </Link>
                <Button size="lg" onClick={handleSkip} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 h-12 px-8 w-full sm:w-auto">
                     <SkipForward className="mr-2 h-5 w-5" />
                    Skip
                </Button>
            </motion.div>
        </motion.div>
    );
}

export default function OnboardingGamePage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <OnboardingGameContent />
        </Suspense>
    )
}
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Gamepad2, Play } from 'lucide-react';
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
                        // Handle case where game is not assigned, maybe assign it now
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
        fetchAssignedGame();
    }, [userId]);

    const handleGameComplete = async () => {
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

    return (
        <div className="flex flex-col h-full items-center justify-center text-center text-white">
            <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.2, type: 'spring'}}>
                <Gamepad2 size={64} className="mx-auto text-purple-400" />
            </motion.div>
            <motion.h1 
                initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}}
                className="text-3xl font-bold mt-6"
            >
                Your Recommended Game: {gameInfo.name}
            </motion.h1>
            <motion.p 
                initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.5}}
                className="text-white/70 mt-2 max-w-md"
            >
                {gameInfo.description} Based on our chat, we think this will be a great activity for you.
            </motion.p>
            <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.7}} className="mt-8 flex flex-col sm:flex-row gap-4">
                {/* --- THIS IS THE FIX --- */}
                {/* We add `&onboarding=true` to the URL to signal that this is part of the onboarding flow. */}
                <Link href={`/game/play?game=${assignedGame}&userId=${userId}&onboarding=true`} passHref>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8">
                        <Play className="mr-2 h-5 w-5"/>
                        Play Now
                    </Button>
                </Link>
                <Button size="lg" onClick={handleGameComplete} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 h-12 px-8">
                    Skip
                </Button>
            </motion.div>
        </div>
    );
}


export default function OnboardingGamePage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <OnboardingGameContent />
        </Suspense>
    )
}
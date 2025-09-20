// ayushpal0/mental-wellness/Mental-Wellness-frontend/app/home/page.tsx
'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { MessageSquare, ClipboardCheck, Globe, Loader2, Check, ArrowRight, Flame } from 'lucide-react';
import ProfileTaskPanel from '@/components/ProfileTaskPanel';
import { useAuth } from '@/hooks/use-auth';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
  streak?: number;
}


interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
}

const VideoBackground = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
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

const FeatureCard = ({ title, icon, href, description }: { title: string, icon: React.ReactNode, href: string, description: string }) => (
    <Link href={href}>
        <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl h-full flex flex-col justify-between hover:bg-white/10 transition-colors"
            whileHover={{ y: -5 }}
        >
            <div>
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">{icon}</div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-white/70 text-sm">{description}</p>
            </div>
            <div className="text-right text-white mt-4">
                <ArrowRight size={20} />
            </div>
        </motion.div>
    </Link>
)

function HomePageContent() {
    const { userId, isLoading: isAuthLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPanelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/home/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setPendingTasks(data.pendingTasks || []);
                } else {
                    console.error("Failed to fetch home page data:", await res.text());
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return <div className="flex h-screen w-full items-center justify-center text-white bg-black"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /></div>;
    }
    
    if (!userId || !user) {
        return (
             <div className="h-screen w-full relative flex flex-col items-center justify-center text-white">
                <VideoBackground />
                <h2 className="text-2xl font-bold mb-4 z-10">Please log in</h2>
                <p className="mb-6 z-10">You need to be logged in to access your dashboard.</p>
                <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full z-10">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative font-sans overflow-hidden">
            <VideoBackground />
            <LoggedInNavbar onProfileClick={() => setPanelOpen(true)} />
            <main className="relative z-10 container mx-auto pt-24 px-4 h-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-4 mb-8">
                        <Avatar className="w-16 h-16 border-2 border-white/50">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Welcome, {user.full_name || user.username}</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-white/70">Ready to continue your wellness journey?</p>
                                {/** 👇 FIX: Check for user.streak before comparing it **/}
                                {user.streak && user.streak > 0 && (
                                    <div className="flex items-center gap-1 text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full">
                                        <Flame size={16} />
                                        <span>{user.streak}-day streak!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <FeatureCard title="MindfulAI Chat" icon={<MessageSquare />} href={`/chatbot?userId=${userId}`} description="Talk through your thoughts with an empathetic AI companion." />
                    </motion.div>
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <FeatureCard title="Community" icon={<Globe />} href={`/community?userId=${userId}`} description="Connect with peers in a safe, supportive, and anonymous space." />
                    </motion.div>

                    <motion.div className="md:col-span-2 lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl h-full">
                            <div className="flex justify-between items-center mb-4">
                               <h3 className="text-xl font-bold text-white">Today's Tasks</h3>
                               <Link href={`/tasks?userId=${userId}`} className="text-sm text-purple-300 hover:underline">View All</Link>
                            </div>
                            {pendingTasks.length > 0 ? (
                                <ul className="space-y-3">
                                    {pendingTasks.slice(0, 3).map(task => ( // Show max 3 tasks
                                        <li key={task.id} className="flex items-center gap-3 text-white/90">
                                            <div className="w-5 h-5 border-2 border-white/50 rounded-md"></div>
                                            <span>{task.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white/60 text-sm">You have no pending tasks today. Great job!</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
            <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /></div>}>
            <HomePageContent />
        </Suspense>
    );
}
'use client';

import React, { useState, useEffect, Suspense, FormEvent, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoggedInNavbar } from '@/components/LoggedInNavbar';
import ProfileTaskPanel from '@/components/ProfileTaskPanel';
import { Loader2, Plus, Trash2, Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
// A simple confetti animation component
import Confetti from 'react-confetti';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    user_id: string;
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
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/5692315-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  );
};


function TasksPageContent() {
    const { userId, isLoading: isAuthLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchTasks = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/tasks/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks || []);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [userId]);

    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !userId) return;

        const response = await fetch('http://127.0.0.1:5000/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTaskTitle, user_id: userId }),
        });
        if (response.ok) {
            setNewTaskTitle('');
            fetchTasks(); // Refetch all tasks
        }
    };

    const handleUpdateTask = async (task: Task, updates: Partial<Task>) => {
        if (!userId) return;
        
        const response = await fetch(`http://127.0.0.1:5000/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updates, user_id: userId }),
        });

        if (response.ok) {
            if (updates.status === 'completed') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
            }
            fetchTasks(); // Refetch all tasks
            setEditingTask(null);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!userId) return;
        const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
            fetchTasks(); // Refetch all tasks
        }
    };
    
    const handleGetSuggestion = async () => {
        if(!userId) return;
        const response = await fetch(`http://127.0.0.1:5000/api/tasks/ai-suggestion/${userId}`);
        if (response.ok) {
            const data = await response.json();
            setNewTaskTitle(data.title); // Pre-fill the input with the AI suggestion
        }
    };

    if (isAuthLoading || isLoading) {
        return <div className="flex h-screen w-full items-center justify-center text-white bg-black"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /></div>;
    }
    
    if (!userId) {
         return (
             <div className="h-screen w-full relative flex flex-col items-center justify-center text-white">
                <VideoBackground />
                <h2 className="text-2xl font-bold mb-4 z-10">Please log in</h2>
                <p className="mb-6 z-10">You need to be logged in to manage your tasks.</p>
                <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full z-10">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative font-sans overflow-hidden">
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
            <VideoBackground />
            <LoggedInNavbar onProfileClick={() => setPanelOpen(true)} />
            <main className="relative z-10 container mx-auto pt-24 px-4 h-full flex flex-col">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Your Wellness Tasks</h1>
                    <p className="text-white/70">Stay mindful, one task at a time.</p>
                </motion.div>
                
                <div className="bg-black/40 backdrop-blur-2xl rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <form onSubmit={handleAddTask} className="flex-1 flex gap-2 items-center">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Add a new task..."
                                className="w-full bg-black/20 border border-white/20 rounded-full h-10 px-4 text-white focus:ring-1 focus:ring-purple-400 focus:outline-none transition"
                            />
                            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Plus size={20} />
                            </button>
                        </form>
                         <button onClick={handleGetSuggestion} className="bg-white/10 hover:bg-white/20 text-white h-10 px-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2 gap-2">
                            <Sparkles size={16} className="text-yellow-300"/>
                            <span>Suggest</span>
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                        <AnimatePresence>
                            {tasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                    className="bg-white/5 p-3 rounded-lg flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 flex-1" onClick={() => handleUpdateTask(task, { status: task.status === 'completed' ? 'pending' : 'completed' })}>
                                        <div className={cn('w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 cursor-pointer', task.status === 'completed' ? 'border-green-400 bg-green-400' : 'border-white/50 hover:border-white')}>
                                            {task.status === 'completed' && <Check className="w-4 h-4 text-black" />}
                                        </div>
                                        <p className={cn('text-white', task.status === 'completed' && 'line-through text-white/50')}>
                                            {task.title}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-white/50 hover:text-red-400 transition-colors p-1 rounded-full">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
        </div>
    );
}

export default function TasksPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
            <TasksPageContent />
        </Suspense>
    )
}
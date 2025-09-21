// ayushpal0/mental-wellness/Mental-Wellness-frontend/components/TaskList.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';

interface Task {
    id: string;
    title: string;
    description?: string;
    category?: string;
    status: 'pending' | 'completed';
}

const categoryColors: { [key: string]: string } = {
    Mindfulness: 'bg-blue-500/20 text-blue-300',
    'Self-Care': 'bg-green-500/20 text-green-300',
    Productivity: 'bg-purple-500/20 text-purple-300',
    General: 'bg-gray-500/20 text-gray-300',
};

const TaskCard = ({ task, onUpdate, onDelete }: { task: Task; onUpdate: (id: string, updates: Partial<Task>) => void; onDelete: (id: string) => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4"
        >
            <div className="flex items-center gap-4 flex-1">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onUpdate(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className={cn(
                        'w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300',
                        task.status === 'completed' ? 'border-green-400 bg-green-400' : 'border-white/50 hover:border-white'
                    )}
                >
                    <AnimatePresence>
                        {task.status === 'completed' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Check className="w-4 h-4 text-black" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
                <div className="flex-1">
                    <p className={cn('text-white', task.status === 'completed' && 'line-through text-white/50 transition-all')}>
                        {task.title}
                    </p>
                    {task.category && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full mt-1 inline-block', categoryColors[task.category] || categoryColors.General)}>
                            {task.category}
                        </span>
                    )}
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(task.id)}
                className="text-white/50 hover:text-red-400 transition-colors p-1 rounded-full"
            >
                <Trash2 className="w-4 h-4" />
            </motion.button>
        </motion.div>
    );
};

export default function TaskList({ userId }: { userId: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [suggestion, setSuggestion] = useState<string>('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/tasks/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data.tasks || []);
            setSuggestion(data.suggestion || '');
        } catch (error) {
            console.error("Fetch tasks error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchTasks();
    }, [userId]);

    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const response = await fetch('http://127.0.0.1:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTaskTitle, user_id: userId, category: 'General' }),
            });
            if (!response.ok) throw new Error('Failed to add task');
            const newTask = await response.json();
            setTasks(prev => [newTask, ...prev]);
            setNewTaskTitle('');
            fetchTasks(); // Refetch to get new suggestion
        } catch (error) {
            console.error("Add task error:", error);
        }
    };

    const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
        const originalTasks = tasks;
        const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        setTasks(updatedTasks);
        try {
            await fetch(`http://127.0.0.1:5000/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error("Update task error:", error);
            setTasks(originalTasks); // Revert on error
        }
    };

    const handleDeleteTask = async (id: string) => {
        const originalTasks = tasks;
        setTasks(tasks.filter(task => task.id !== id));
        try {
            await fetch(`http://127.0.0.1:5000/api/tasks/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Delete task error:", error);
            setTasks(originalTasks); // Revert on error
        }
    };

    return (
        <div className="bg-black/40 backdrop-blur-2xl h-full rounded-2xl border border-white/20 shadow-2xl flex flex-col p-6 text-white">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-1">Your Wellness Tasks</h1>
                <p className="text-white/70 mb-4">Stay mindful, one task at a time.</p>
            </motion.div>

            {isLoading && <div className="text-center p-4">Loading tasks...</div>}
            
            {!isLoading && suggestion && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 text-white/90 p-3 rounded-lg mb-4 text-sm border border-white/20 italic"
                >
                    <span className="font-bold not-italic">AI Suggestion:</span> {suggestion}
                </motion.div>
            )}

            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                <AnimatePresence>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
                    ))}
                </AnimatePresence>
            </div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <PlaceholdersAndVanishInput
                    placeholders={["Add a new wellness task...", "e.g., Meditate for 10 minutes", "e.g., Drink a glass of water"]}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onSubmit={handleAddTask}
                />
            </motion.div>
        </div>
    );
}
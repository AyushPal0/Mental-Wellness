// components/ProfileTaskPanel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, LogOut } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// --- MOCK DATA ---
const initialTasks = [
    { id: 1, text: "Drink 8 glasses of water", category: "HEALTH", completed: true },
    { id: 2, text: "Write in a gratitude journal", category: "MENTAL HEALTH", completed: true },
    { id: 3, text: "Stretch for 15 mins", category: "HEALTH", completed: false },
    { id: 4, text: "Follow the YouTube tutorial", category: "OTHERS", completed: false },
    { id: 5, text: "Edit the PDF for work", category: "WORK", completed: false },
];

const categoryColors = {
    HEALTH: 'text-blue-300 bg-blue-500/20',
    WORK: 'text-teal-300 bg-teal-500/20',
    'MENTAL HEALTH': 'text-pink-300 bg-pink-500/20',
    OTHERS: 'text-green-300 bg-green-500/20',
};

// --- PANEL COMPONENT ---
interface ProfileTaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileTaskPanel({ isOpen, onClose }: ProfileTaskPanelProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const handleTaskToggle = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const completedTasksCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'tasks', label: 'Tasks' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-1/2 max-w-lg z-50 bg-black/40 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-white/10">
                <h2 className="text-white text-lg font-semibold">Your Space</h2>
                <button 
                  onClick={onClose} 
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X size={24} />
                </button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col p-6">
              <TabsList className="bg-white/10 p-1 rounded-full w-full flex-shrink-0 relative">
                  {tabs.map((tab) => (
                       <TabsTrigger 
                          key={tab.id} 
                          value={tab.id}
                          className={cn("w-1/2 relative text-white/70 transition-colors data-[state=active]:text-white")}
                      >
                          <span className="relative z-10">{tab.label}</span>
                      </TabsTrigger>
                  ))}
                  {/* The animated indicator is now a sibling to the triggers, positioned by the active tab */}
                  <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-white/20 rounded-full z-0"
                      style={{ 
                        width: `calc(50% - 0.25rem)`,
                        left: activeTab === 'profile' ? '0.25rem' : '50%'
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
              </TabsList>
              
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="flex-grow mt-6 overflow-y-auto"
                >
                    <TabsContent value="profile" className="m-0 p-0 border-none">
                        <div className="flex flex-col items-center text-center">
                            <Image 
                                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80" 
                                alt="Goutam" 
                                width={120} 
                                height={120}
                                className="rounded-full border-4 border-white/50 mb-4 shadow-lg"
                            />
                            <h2 className="text-white text-3xl font-bold">Gouti</h2>
                            <p className="text-white/70">Student</p>

                            <div className="bg-white/10 rounded-xl p-4 w-full mt-8">
                                <h3 className="text-lg font-semibold text-white">Task Progress</h3>
                                <p className="text-white/80 text-sm mb-2">{completedTasksCount} of {totalTasksCount} tasks completed</p>
                                <div className="w-full bg-white/20 rounded-full h-2.5">
                                    <motion.div 
                                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2.5 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-8 flex items-center gap-2 text-white bg-red-500/80 hover:bg-red-500/100 transition-colors px-6 py-2 rounded-full"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="m-0 p-0 border-none">
                         <div className="space-y-3">
                            {tasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    className="flex items-center bg-white/10 p-3 rounded-lg cursor-pointer transition-all hover:bg-white/20"
                                    onClick={() => handleTaskToggle(task.id)}
                                >
                                    <div className="w-6 h-6 border-2 border-white/50 rounded-md mr-4 flex items-center justify-center flex-shrink-0">
                                        {task.completed && <Check className="text-green-400" size={18} />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={cn("text-white", task.completed && "line-through text-white/50")}>{task.text}</p>
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", categoryColors[task.category as keyof typeof categoryColors])}>
                                            {task.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
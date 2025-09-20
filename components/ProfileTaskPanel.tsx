// ayushpal0/mental-wellness/Mental-Wellness-frontend/components/ProfileTaskPanel.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, LogOut, Loader2, TrendingUp, ListTodo, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// --- INTERFACES ---
interface Task {
    id: string;
    title: string;
    category: string;
    status: 'pending' | 'completed';
    user_id: string;
}

interface User {
    _id: string;
    username: string;
    full_name?: string;
    avatar?: string;
    streak?: number;
}

const categoryColors: { [key: string]: string } = {
    HEALTH: 'text-blue-300 bg-blue-500/20 border border-blue-500/30',
    WORK: 'text-teal-300 bg-teal-500/20 border border-teal-500/30',
    'MENTAL HEALTH': 'text-pink-300 bg-pink-500/20 border border-pink-500/30',
    PRODUCTIVITY: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    GENERAL: 'text-green-300 bg-green-500/20 border border-green-500/30',
    OTHERS: 'text-gray-300 bg-gray-500/20 border border-gray-500/30',
};

// --- New Stat Card Component ---
const StatCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string | number, colorClass: string }) => (
    <motion.div 
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
                {icon}
            </div>
            <div>
                <p className="text-white/70 text-sm">{label}</p>
                <p className="text-white text-lg font-bold">{value}</p>
            </div>
        </div>
    </motion.div>
);


export default function ProfileTaskPanel({ isOpen, onClose }: ProfileTaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    if (isOpen && userId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const userRes = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
          if (userRes.ok) setUser(await userRes.json());

          const tasksRes = await fetch(`http://127.0.0.1:5000/api/tasks/user/${userId}`);
          if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || []);
        } catch (error) {
          console.error("Failed to fetch panel data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, userId]);

  const handleTaskToggle = async (taskToToggle: Task) => {
    const newStatus = taskToToggle.status === 'completed' ? 'pending' : 'completed';
    const originalTasks = tasks;
    setTasks(tasks.map(task => 
      task.id === taskToToggle.id ? { ...task, status: newStatus } : task
    ));
    try {
        await fetch(`http://127.0.0.1:5000/api/tasks/${taskToToggle.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, user_id: userId }),
        });
        // Refetch user data to update streak if a task was completed
        if (newStatus === 'completed') {
            const userRes = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
            if (userRes.ok) setUser(await userRes.json());
        }
    } catch (error) {
        console.error("Failed to update task:", error);
        setTasks(originalTasks); 
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    router.push('/login');
    onClose();
  };

  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
  
  const filteredTasks = useMemo(() => {
      if (taskFilter === 'all') return tasks;
      return tasks.filter(task => task.status === taskFilter);
  }, [tasks, taskFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full md:w-1/2 max-w-lg z-50 bg-black/40 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col"
          >
            <motion.div 
              className="flex flex-col h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-white/10">
                  <h2 className="text-white text-lg font-semibold">Your Space</h2>
                  <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"><X size={24} /></button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col p-6">
                <TabsList className="bg-white/10 p-1 rounded-full w-full flex-shrink-0 relative">
                    <TabsTrigger value="profile" className={cn("w-1/2 relative text-white/70 transition-colors data-[state=active]:text-white z-10")}>Profile</TabsTrigger>
                    <TabsTrigger value="tasks" className={cn("w-1/2 relative text-white/70 transition-colors data-[state=active]:text-white z-10")}>Tasks</TabsTrigger>
                    <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute inset-y-1 bg-white/20 rounded-full z-0"
                        style={{ width: `calc(50% - 4px)`, left: activeTab === 'profile' ? '4px' : 'calc(50% + 2px)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                </TabsList>
                
                <AnimatePresence mode="wait">
                  <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="flex-grow mt-6 overflow-y-auto"
                  >
                      {isLoading ? (
                          <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-white"/></div>
                      ) : (
                          <>
                              <TabsContent value="profile" className="m-0 p-0 border-none">
                                  <div className="flex flex-col items-center text-center space-y-6">
                                      <div className="text-center">
                                        <Image src={user?.avatar || "/placeholder-user.jpg"} alt={user?.username || "User"} width={120} height={120} className="rounded-full border-4 border-white/50 mb-4 shadow-lg mx-auto"/>
                                        <h2 className="text-white text-3xl font-bold">{user?.full_name || user?.username}</h2>
                                        <p className="text-white/70">@{user?.username}</p>
                                      </div>
                                      
                                      <motion.div layout className="w-full space-y-4">
                                          <h3 className="text-lg font-semibold text-white text-left">Your Stats</h3>
                                          <div className="flex gap-4">
                                            <StatCard icon={<TrendingUp size={16}/>} label="Current Streak" value={`${user?.streak || 0} Days`} colorClass="bg-orange-500/20 text-orange-400" />
                                            <StatCard icon={<CheckCircle2 size={16}/>} label="Tasks Done" value={completedTasksCount} colorClass="bg-green-500/20 text-green-400" />
                                          </div>
                                          <StatCard icon={<ListTodo size={16}/>} label="Completion Rate" value={`${progressPercentage.toFixed(0)}%`} colorClass="bg-blue-500/20 text-blue-400" />
                                      </motion.div>

                                      <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-white/80 border border-white/20 hover:bg-white/10 transition-colors px-6 py-2 rounded-full">
                                          <LogOut size={18} /> Logout
                                      </button>
                                  </div>
                              </TabsContent>

                              <TabsContent value="tasks" className="m-0 p-0 border-none h-full flex flex-col">
                                <div className="flex-shrink-0 mb-4">
                                  <Tabs defaultValue="all" onValueChange={(value) => setTaskFilter(value as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-white/5">
                                      <TabsTrigger value="all">All</TabsTrigger>
                                      <TabsTrigger value="pending">Pending</TabsTrigger>
                                      <TabsTrigger value="completed">Completed</TabsTrigger>
                                    </TabsList>
                                  </Tabs>
                                </div>
                                <div className="space-y-3 overflow-y-auto flex-grow">
                                  <AnimatePresence>
                                    {filteredTasks.map((task, i) => (
                                        <motion.div 
                                          key={task.id} 
                                          layout
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                          exit={{ opacity: 0, x: -20 }}
                                          className="flex items-center bg-white/10 p-3 rounded-lg cursor-pointer transition-all hover:bg-white/20" 
                                          onClick={() => handleTaskToggle(task)}
                                        >
                                            <div className={cn("w-6 h-6 border-2 rounded-md mr-4 flex items-center justify-center flex-shrink-0", task.status === 'completed' ? 'border-green-400 bg-green-400' : 'border-white/50')}>
                                                {task.status === 'completed' && <Check className="text-black" size={18} />}
                                            </div>
                                            <div className="flex-grow">
                                                <p className={cn("text-white", task.status === 'completed' && "line-through text-white/50")}>{task.title}</p>
                                                {task.category && (<span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", categoryColors[task.category as keyof typeof categoryColors] || categoryColors.OTHERS)}>{task.category}</span>)}
                                            </div>
                                        </motion.div>
                                    ))}
                                  </AnimatePresence>
                                  {filteredTasks.length === 0 && <p className="text-center text-white/60 pt-10">No {taskFilter} tasks found.</p>}
                                </div>
                              </TabsContent>
                          </>
                      )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
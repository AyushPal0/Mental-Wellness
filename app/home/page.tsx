// app/home/page.tsx
'use client'
import React, { useRef, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Plus, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ExpandableChatbot } from "@/components/ExpandableChatbot";
import ProfileTaskPanel from "@/components/ProfileTaskPanel";

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
    <div className="fixed inset-0 w-full h-screen z-[-1] overflow-hidden">
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/5692315-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
};

// Mock interfaces
interface UserProfile {
    name: string;
    personalityType: string;
    streak: number;
    profilePicUrl: string;
}

interface Task {
    id: string;
    title: string;
    status: 'pending' | 'completed';
}

function HomePageContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    
    const [isPanelOpen, setPanelOpen] = useState(false);
    
    // State for managing chat functionality
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [refreshHistoryKey, setRefreshHistoryKey] = useState(Date.now());

    // Mock data
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "Gouti",
        personalityType: "Advocate",
        streak: 5,
        profilePicUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80"
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [aiSuggestion, setAiSuggestion] = useState("Loading suggestion...");
    const [newTask, setNewTask] = useState("");

    // Handlers for chat state
    const handleNewChat = () => {
        setConversationId(null);
    };

    const handleSelectConversation = (id: string) => {
        setConversationId(id);
    };

    const handleConversationStarted = (newConversationId: string) => {
        setConversationId(newConversationId);
        setRefreshHistoryKey(Date.now());
    };

    useEffect(() => {
        if (userId) {
            // Fetch tasks and AI suggestion
            fetch(`http://127.0.0.1:5000/api/tasks/user/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setTasks(data.tasks || []);
                    setAiSuggestion(data.suggestion || "Take a moment for yourself.");
                }).catch(console.error);
        }
    }, [userId]);
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim() || !userId) return;
        const tempTask = {id: Date.now().toString(), title: newTask, status: 'pending' as 'pending'};
        setTasks(prev => [...prev, tempTask]);
        setNewTask("");
        // Here you would also POST to your backend to save the task
    };

    if (!userId) {
        return (
            <div className="h-screen w-full relative font-sans">
                <VideoBackground />
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
                    <h1 className="text-3xl font-bold">Error</h1>
                    <p>User ID is missing. Please log in or sign up to continue.</p>
                </div>
            </div>
        );
    }

    return (
      <div className="w-full min-h-screen relative font-sans">
        <VideoBackground />
        <main className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 text-white">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {userProfile.name}</h1>
              <p className="text-white/70">Here's your wellness dashboard.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                    <p className="font-semibold">{userProfile.personalityType}</p>
                    <p className="text-sm text-white/70">Personality</p>
               </div>
               <div className="relative group">
                    <Image src={userProfile.profilePicUrl} width={56} height={56} alt="Profile" className="rounded-full border-2 border-white/50 cursor-pointer"/>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">Edit</div>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-2xl border border-white/20">
                    <h2 className="text-2xl font-semibold mb-4">Daily Tasks</h2>
                    <div className="bg-purple-500/20 border border-purple-400 p-4 rounded-lg flex items-center gap-4 mb-4">
                        <Zap className="text-purple-300 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white">AI Suggestion</p>
                            <p className="text-white/90">{aiSuggestion}</p>
                        </div>
                        <button className="ml-auto bg-white/20 hover:bg-white/30 p-2 rounded-full"><Plus size={18}/></button>
                    </div>
                    <div className="space-y-3 mb-4">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-md">
                               <button className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-400' : 'border-white/50'}`}>
                                 {task.status === 'completed' && <Check size={16}/>}
                               </button>
                               <p className={`${task.status === 'completed' ? 'line-through text-white/50' : ''}`}>{task.title}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a custom task..."
                            className="flex-grow bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <button type="submit" className="bg-white text-black rounded-full h-10 w-10 flex items-center justify-center">
                            <Plus/>
                        </button>
                    </form>
                </div>
              
              <ExpandableChatbot 
                userId={userId}
                conversationId={conversationId}
                refreshTrigger={refreshHistoryKey}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
                onConversationStarted={handleConversationStarted}
              />
            </div>
            
            <div className="space-y-6">
                {/* --- LAYOUT FIX: Streak is now at the top --- */}
                <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-2xl border border-white/20">
                    <h2 className="text-2xl font-semibold mb-2">Day Streak</h2>
                    <p className="text-5xl font-bold text-amber-400">{userProfile.streak}</p>
                    <p className="text-white/70">days of consistent wellness</p>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-2xl border border-white/20 h-64">
                    <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
                    <p className="text-white/70">Coming soon...</p>
                </div>
                {/* --- LAYOUT FIX: Community Feed is now at the bottom --- */}
                <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-2xl border border-white/20 h-64">
                    <h2 className="text-2xl font-semibold mb-4">Community Feed</h2>
                    <p className="text-white/70">Coming soon...</p>
                </div>
            </div>

          </div>
        </main>
        <ProfileTaskPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
      </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading Your Dashboard...</div>}>
            <HomePageContent />
        </Suspense>
    )
}
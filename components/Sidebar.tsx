// components/Sidebar.tsx
'use client';

import { MessageSquare, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HistoryItem {
    conversation_id: string;
    title: string;
}

interface SidebarProps {
    userId: string;
    onNewChat: () => void;
    onSelectConversation: (id: string) => void;
}

export default function Sidebar({ userId, onNewChat, onSelectConversation }: SidebarProps) {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/chat/history/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch chat history');
                }
                const data = await response.json();
                setHistoryItems(data.history || []);
            } catch (error) {
                console.error("Error fetching history:", error);
                setHistoryItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    return (
        <aside className="w-64 bg-white/10 backdrop-blur-3xl text-white p-4 flex flex-col h-full rounded-2xl border border-white/20 shadow-lg">
            <button
                onClick={onNewChat}
                className="flex items-center justify-between p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200"
            >
                <span className="text-lg font-semibold ml-2">MindfulAI</span>
                <Plus size={20} />
            </button>

            <div className="mt-8 flex-grow overflow-y-auto">
                <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 px-2">History</h2>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2 p-2 h-8">
                                <div className="w-4 h-4 bg-white/20 rounded animate-pulse"></div>
                                <div className="w-4/5 h-4 bg-white/20 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {historyItems.length > 0 ? (
                            historyItems.map((item) => (
                                <li 
                                  key={item.conversation_id} 
                                  onClick={() => onSelectConversation(item.conversation_id)}
                                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/15 cursor-pointer transition-colors duration-200"
                                >
                                    <MessageSquare size={16} className="text-white/70 flex-shrink-0" />
                                    <span className="truncate text-sm text-white">{item.title}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-white/60 p-2">No chat history yet.</p>
                        )}
                    </ul>
                )}
            </div>
            
            <div className="border-t border-white/20 pt-4">
                 <ul className="space-y-1">
                    <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/15 cursor-pointer transition-colors duration-200">
                        <Settings size={18} />
                        <span className="text-sm text-white">Settings</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
'use client';

import { MessageSquare, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

const historyItems = [
    { id: 1, title: "Strategies for managing anxiety" },
    { id: 2, title: "How to practice mindfulness" },
    { id: 3, title: "Understanding cognitive behavioral..." },
    { id: 4, title: "Tips for better sleep" },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white/10 backdrop-blur-3xl text-white p-4 flex flex-col h-full rounded-2xl border border-white/20 shadow-lg">
            <button className="flex items-center justify-between p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200">
                <span className="text-lg font-semibold ml-2">MindfulAI</span>
                <Plus size={20} />
            </button>

            <div className="mt-8 flex-grow overflow-y-auto">
                <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 px-2">History</h2>
                <ul className="space-y-1">
                    {historyItems.map((item) => (
                        <li key={item.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/15 cursor-pointer transition-colors duration-200">
                            <MessageSquare size={16} className="text-white/70" />
                            <span className="truncate text-sm text-white">{item.title}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="border-t border-white/20 pt-4">
                 <ul className="space-y-1">
                    {/* The Profile/Task links are removed as they are now in the panel */}
                    <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/15 cursor-pointer transition-colors duration-200">
                        <Settings size={18} />
                        <span className="text-sm text-white">Settings</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
// components/Sidebar.tsx
"use client";

import { MessageSquare, Plus, Settings, User, HelpCircle } from 'lucide-react';

// Mock data for chat history. You'll replace this with real data later.
const historyItems = [
    { id: 1, title: "Strategies for managing anxiety" },
    { id: 2, title: "How to practice mindfulness" },
    { id: 3, title: "Understanding cognitive behavioral..." },
    { id: 4, title: "Tips for better sleep" },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[#1e1f20] text-white p-4 flex flex-col h-screen">
            <button className="flex items-center justify-between p-2 rounded-full bg-[#343541] hover:bg-[#40414f] transition-colors duration-200">
                <span className="text-lg font-semibold">MindfulAI</span>
                <Plus size={20} />
            </button>

            <div className="mt-8 flex-grow">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</h2>
                <ul className="space-y-2">
                    {historyItems.map((item) => (
                        <li key={item.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#343541] cursor-pointer transition-colors duration-200">
                            <MessageSquare size={16} className="text-gray-400" />
                            <span className="truncate text-sm">{item.title}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
                 <ul className="space-y-2">
                    <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#343541] cursor-pointer transition-colors duration-200">
                        <HelpCircle size={18} />
                        <span className="text-sm">Help & FAQ</span>
                    </li>
                     <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#343541] cursor-pointer transition-colors duration-200">
                        <Settings size={18} />
                        <span className="text-sm">Settings</span>
                    </li>
                    <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#343541] cursor-pointer transition-colors duration-200">
                        <User size={18} />
                        <span className="text-sm">Your Profile</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
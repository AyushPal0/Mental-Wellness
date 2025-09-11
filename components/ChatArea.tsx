"use client";

import { useState, useRef, useEffect } from 'react';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { Lightbulb, Menu, User } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

export default function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const placeholders = [
        "How can I practice mindfulness during a busy day?",
        "What are some techniques to manage social anxiety?",
        "Explain the benefits of journaling for mental health.",
        "How do I set healthy boundaries with people?",
        "What's a simple breathing exercise for stress relief?",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(e.target.value);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentInput.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: currentInput,
            sender: 'user',
        };
        setMessages((prev) => [...prev, userMessage]);

        // --- Mock AI Response ---
        setTimeout(() => {
            const aiResponse: Message = {
                id: Date.now() + 1,
                text: `This is a simulated response to: "${currentInput}". The backend is not connected yet, but this demonstrates how the UI will look when a response is received. We can integrate the actual logic here later.`,
                sender: 'ai',
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1500);

        setCurrentInput("");
    };

    return (
        <main className="flex-1 flex flex-col bg-[#131314] h-screen">
            {/* Top Header */}
            <header className="flex justify-between items-center p-4 text-white">
                <div className="flex items-center space-x-2">
                    <button className="md:hidden"> {/* Hamburger for mobile */}
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg">MindfulAI</h1>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 max-w-4xl mx-auto`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-slate-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                                {msg.sender === 'user' ? <User size={20} className="text-white" /> : <img src="/gemini-icon.svg" alt="AI" style={{width: 20, height: 20}} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-white mb-1">{msg.sender === 'user' ? 'You' : 'MindfulAI'}</p>
                                <p className="text-gray-300 whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="w-full p-4 md:p-6 pt-2 md:pt-4 max-w-4xl mx-auto">
                <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                />
                <p className="text-xs text-center text-gray-500 mt-2">
                    MindfulAI may display inaccurate info. Always consult a professional for mental health advice.
                </p>
            </div>
        </main>
    );
}


// A component for the initial screen when no messages are present
const WelcomeScreen = () => {
    const suggestionCards = [
        "Create a guided meditation script for focus",
        "Help me write a gratitude journal entry",
        "Suggest ways to build self-confidence",
        "Give me ideas for a relaxing evening routine"
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="text-center">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                    Hello, I'm MindfulAI
                </h1>
                <p className="mt-4 text-2xl text-gray-400">How can I help you on your wellness journey today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 w-full max-w-2xl">
                {suggestionCards.map((text, i) => (
                    <div key={i} className="bg-[#1e1f20] p-4 rounded-xl hover:bg-[#343541] cursor-pointer transition-colors duration-200 flex items-start space-x-3">
                        <Lightbulb className="text-gray-400 mt-1" size={20}/>
                        <p>{text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { Lightbulb, Menu, User } from 'lucide-react';
import Image from 'next/image';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

interface ChatAreaProps {
  userId: string;
  onProfileClick: () => void;
}

// Moved WelcomeScreen component to the top of the file
const WelcomeScreen = () => {
    const suggestionCards = [
        "Create a guided meditation script for focus",
        "Help me write a gratitude journal entry",
        "Suggest ways to build self-confidence",
        "Give me ideas for a relaxing evening routine"
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full text-white px-4">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                    Hello, I'm MindfulAI
                </h1>
                <p className="mt-4 text-xl md:text-2xl text-white/80">How can I help you on your wellness journey today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                {suggestionCards.map((text, i) => (
                    <div key={i} className="bg-white/10 p-4 rounded-xl hover:bg-white/20 cursor-pointer transition-colors duration-200 flex items-start space-x-3">
                        <Lightbulb className="text-white/80 mt-1 flex-shrink-0" size={20}/>
                        <p className="text-white">{text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ChatArea({ userId, onProfileClick }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const placeholders = [
        "How can I practice mindfulness during a busy day?",
        "What are some techniques to manage social anxiety?",
        "Explain the benefits of journaling for mental health.",
    ];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(e.target.value);
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentInput.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: currentInput, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        
        const messageToSend = currentInput;
        setCurrentInput("");
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    message: messageToSend,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse: Message = { id: Date.now() + 1, text: data.response, sender: 'ai' };
            setMessages((prev) => [...prev, aiResponse]);

        } catch (error) {
            console.error("Failed to fetch chat response:", error);
            const errorResponse: Message = { id: Date.now() + 1, text: "Sorry, something went wrong. Please try again.", sender: 'ai' };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col bg-white/10 backdrop-blur-3xl h-full rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <header className="flex justify-between items-center p-4 text-white border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <button className="md:hidden">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-white">MindfulAI</h1>
                </div>
                <button 
                  onClick={onProfileClick}
                  className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                    <User size={20} className="text-white" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 && !isLoading ? (
                    <WelcomeScreen />
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 max-w-4xl mx-auto`}>
                             <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                                 {msg.sender === 'user' ? <User size={20} className="text-white" /> : <Image src="/gemini-icon.svg" alt="AI" width={20} height={20} />}
                            </div>
                            <div className="flex-1 bg-white/10 p-4 rounded-xl shadow-md">
                                <p className="font-semibold text-white mb-1">{msg.sender === 'user' ? 'You' : 'MindfulAI'}</p>
                                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                
                {isLoading && (
                    <div className="flex items-start gap-4 max-w-4xl mx-auto">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                           <Image src="/gemini-icon.svg" alt="AI" width={20} height={20} className="animate-spin" />
                        </div>
                        <div className="flex-1 bg-white/10 p-4 rounded-xl shadow-md">
                            <p className="font-semibold text-white mb-1">MindfulAI</p>
                            <div className="h-2 bg-gray-500 rounded-full w-1/4 animate-pulse"></div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="w-full p-4 md:p-6 pt-2 md:pt-4 max-w-4xl mx-auto border-t border-white/10 flex-shrink-0">
                <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                    value={currentInput}
                />
                <p className="text-xs text-center text-white/70 mt-2 px-2">
                    MindfulAI may display inaccurate info. Always consult a professional for mental health advice.
                </p>
            </div>
        </main>
    );
}
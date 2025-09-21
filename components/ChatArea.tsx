"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { Lightbulb, User } from 'lucide-react';
import Image from 'next/image';

interface Message {
    id: number | string;
    text: string;
    sender: 'user' | 'ai';
}

interface ChatAreaProps {
    userId: string;
    conversationId: string | null;
    onConversationStarted: (newConversationId: string) => void;
}

// --- NEW: A more engaging welcome screen for when the chat is empty ---
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
                <h1 className="text-4xl md:text-5xl font-bold bg-white text-transparent bg-clip-text">
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

export default function ChatArea({ userId, conversationId, onConversationStarted }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const currentConversationId = useRef(conversationId);

    useEffect(() => {
        currentConversationId.current = conversationId;
        if (conversationId) {
            const fetchConversation = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`http://127.0.0.1:5000/api/conversation/${conversationId}`);
                    const data = await res.json();
                    if (data.messages) {
                        const fetchedMessages: Message[] = data.messages.flatMap((msg: any) => [
                            { id: `${msg._id.$oid}-user`, text: msg.user_message, sender: 'user' },
                            { id: `${msg._id.$oid}-ai`, text: msg.bot_response, sender: 'ai' },
                        ]);
                        setMessages(fetchedMessages);
                    } else {
                         setMessages([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch conversation:", error);
                    setMessages([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchConversation();
        } else {
            setMessages([]);
        }
    }, [conversationId]);

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

        const userMessageText = currentInput;
        const userMessage: Message = { id: Date.now(), text: userMessageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setCurrentInput("");
        setIsLoading(true);

        const aiResponseId = Date.now() + 1;
        const aiPlaceholder: Message = { id: aiResponseId, text: "", sender: 'ai' };
        setMessages(prev => [...prev, aiPlaceholder]);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    message: userMessageText,
                    conversation_id: currentConversationId.current,
                }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            if (data.end) {
                                if (!currentConversationId.current) {
                                    currentConversationId.current = data.conversation_id;
                                    onConversationStarted(data.conversation_id);
                                }
                                setIsLoading(false);
                            } else if (data.content) {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === aiResponseId
                                        ? { ...msg, text: msg.text + data.content }
                                        : msg
                                ));
                            }
                        } catch (e) {
                            console.error("Error parsing stream data:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch chat response:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === aiResponseId
                    ? { ...msg, text: "Sorry, something went wrong. Please try again." }
                    : msg
            ));
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col bg-white/10 backdrop-blur-3xl h-full rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 && !isLoading ? (
                    <WelcomeScreen />
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 max-w-4xl mx-auto`}>
                             {/* --- ENHANCEMENT: Swapped out generic icons for better avatars --- */}
                             <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                                 {msg.sender === 'user' ? <User size={20} className="text-white" /> : <Image src="/image.jpg" alt="MindfulAI Logo" width={20} height={20} />}
                             </div>
                            {/* --- ENHANCEMENT: Better styling for message bubbles --- */}
                            <div className="flex-1 bg-white/10 p-4 rounded-xl shadow-md min-h-[70px]">
                                <p className="font-semibold text-white mb-1">{msg.sender === 'user' ? 'You' : 'MindfulAI'}</p>
                                <p className="text-white whitespace-pre-wrap">
                                    {msg.text}
                                    {isLoading && msg.sender === 'ai' && msg.id === messages[messages.length - 1].id && (
                                        <span className="animate-pulse">_</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
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
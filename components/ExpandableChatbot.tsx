// components/ExpandableChatbot.tsx
"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";
import { X } from "lucide-react";

interface ExpandableCardProps {
  userId: string;
  conversationId: string | null;
  refreshTrigger: number;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onConversationStarted: (newConversationId: string) => void;
}

export function ExpandableChatbot({
  userId,
  conversationId,
  refreshTrigger,
  onNewChat,
  onSelectConversation,
  onConversationStarted
}: ExpandableCardProps) {
  const [active, setActive] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(false));

  const cardData = {
    title: "MindfulAI Chat",
    description: "Your personal guide to mental wellness.",
    src: "/618be4145724460b73d410a1b7a58523.jpg",
    ctaText: "Start Chatting",
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md h-full w-full z-40"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-50 p-4">
            <motion.div
              layoutId={`card-${cardData.title}-${id}`}
              ref={ref}
              // --- ANIMATION FIX: Added spring transition and background ---
              transition={{ type: "spring", duration: 0.8, bounce: 0.2 }}
              className="w-full max-w-7xl h-full md:h-[95vh] md:max-h-[900px] flex flex-col bg-transparent sm:rounded-3xl overflow-hidden"
            >
              {/* --- FUNCTIONALITY FIX: Render Sidebar and ChatArea together --- */}
              <div className="flex h-full w-full items-center justify-center gap-4">
                  <div className="hidden md:flex md:flex-shrink-0 h-full">
                      <Sidebar
                          userId={userId}
                          onNewChat={onNewChat}
                          onSelectConversation={onSelectConversation}
                          refreshTrigger={refreshTrigger}
                      />
                  </div>
                  <div className="flex-1 h-full">
                      <ChatArea
                          key={conversationId || 'new-chat-expanded'}
                          userId={userId}
                          conversationId={conversationId}
                          onConversationStarted={onConversationStarted}
                          // This prop is removed from ChatArea itself, so we don't need it here.
                          onProfileClick={() => {}}
                      />
                  </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layoutId={`card-${cardData.title}-${id}`}
        key={`card-${cardData.title}-${id}`}
        onClick={() => setActive(true)}
        // --- ANIMATION FIX: Added spring transition ---
        transition={{ type: "spring", duration: 0.8, bounce: 0.2 }}
        className="p-4 flex flex-col justify-between items-start bg-white/10 backdrop-blur-3xl border border-white/20 hover:border-white/30 transition-all rounded-2xl cursor-pointer w-full h-full shadow-lg"
      >
        <div className="w-full">
          <motion.div layoutId={`image-${cardData.title}-${id}`} className="mb-4">
            <img
              width={200}
              height={200}
              src={cardData.src}
              alt={cardData.title}
              className="w-full h-40 md:h-48 rounded-lg object-cover"
            />
          </motion.div>
          <div>
            <motion.h3
              layoutId={`title-${cardData.title}-${id}`}
              className="font-bold text-white text-xl"
            >
              {cardData.title}
            </motion.h3>
            <motion.p
              layoutId={`description-${cardData.description}-${id}`}
              className="text-white/70"
            >
              {cardData.description}
            </motion.p>
          </div>
        </div>
        <motion.button
          layoutId={`button-${cardData.title}-${id}`}
          className="px-6 py-2 text-sm rounded-full font-semibold bg-white/20 hover:bg-white/30 text-white mt-4"
        >
          {cardData.ctaText}
        </motion.button>
      </motion.div>
    </>
  );
}
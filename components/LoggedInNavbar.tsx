"use client";

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { motion } from "framer-motion";
import { User, MessageSquare, ClipboardCheck, Home, Globe } from "lucide-react";

export function LoggedInNavbar({ onProfileClick }: { onProfileClick?: () => void; }) {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const navLinks = [
    { name: "Home", href: `/home?userId=${userId}`, icon: <Home size={20} /> },
    { name: "Chat", href: `/chatbot?userId=${userId}`, icon: <MessageSquare size={20} /> },
    { name: "Tasks", href: `/tasks?userId=${userId}`, icon: <ClipboardCheck size={20} /> },
    { name: "Community", href: `/community?userId=${userId}`, icon: <Globe size={20} /> },
  ];

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="w-auto bg-black/40 backdrop-blur-lg rounded-full border border-white/20 shadow-lg p-2 flex items-center justify-between pointer-events-auto"
      >
        <Link href={`/home?userId=${userId}`} className="text-white text-lg font-bold pl-3 pr-2">
          Eunoia
        </Link>
        
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} passHref>
              <motion.div
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-white px-3 py-1.5 rounded-full cursor-pointer"
              >
                {link.icon}
                <span className="text-sm font-medium">{link.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {onProfileClick &&
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onProfileClick}
              // This margin-left adds the necessary gap
              className="h-9 w-9 ml-2 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <User size={20} className="text-white" />
            </motion.button>
        }
      </motion.nav>
    </div>
  );
}
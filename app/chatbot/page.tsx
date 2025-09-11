import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';

export default function ChatbotPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-base-end font-sans">
      {/* --- Sidebar --- 
          - Consistently visible on medium screens and up.
          - Can be toggled on smaller screens (logic for this would be in a layout component).
      */}
      <div className="hidden md:flex md:flex-shrink-0">
         <Sidebar />
      </div>
      
      {/* --- Main Chat Area --- 
          - Takes the remaining space and handles its own scrolling.
      */}
      <ChatArea />
    </div>
  );
}

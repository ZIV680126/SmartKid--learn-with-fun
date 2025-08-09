
import React, { useState } from 'react';
import AiChat from './AiChat';
import { Bot } from 'lucide-react';

const FloatingChatButton: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 left-6 bg-primary text-white p-4 rounded-full shadow-lg z-40 hover:scale-110 transition-transform animate-pulse"
                aria-label="פתח צ'אט עם סמארטי"
            >
                <Bot className="w-8 h-8" />
            </button>
            <AiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default FloatingChatButton;

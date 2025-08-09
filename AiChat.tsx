
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, Bot, X } from 'lucide-react';
import Spinner from './ui/Spinner';
import { getAiChatResponse } from '../services/geminiService';
import { UserContext } from '../context/UserContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'היי! אני סמארטי. איך אני יכול לעזור לך היום? אפשר לשאול אותי על שיעורי בית או על האפליקציה.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const historyForApi = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
      const responseText = await getAiChatResponse(historyForApi, input, `כיתה ${userContext?.user.grade}`);
      const modelMessage: Message = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { role: 'model', text: 'אוי, הייתה לי שגיאה. אפשר לנסות שוב?' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full w-full max-h-[95vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                    <Bot className="text-primary w-8 h-8 mr-3" />
                    <h2 className="text-xl font-bold text-textPrimary">עזרה מבינה מלאכותית</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-textPrimary'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 text-textPrimary px-4 py-3 rounded-2xl flex items-center">
                        <Spinner size="sm" />
                        <span className="mr-2">סמארטי חושב...</span>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex items-center">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="כתוב כאן את שאלתך..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary transition"
                disabled={isLoading}
                />
                <button
                type="submit"
                className="mr-3 bg-primary text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 transition"
                disabled={isLoading || !input.trim()}
                >
                <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  );
};

export default AiChat;

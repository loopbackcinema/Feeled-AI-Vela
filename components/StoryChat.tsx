
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Story } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface StoryChatProps {
    story: Story;
}

const StoryChat: React.FC<StoryChatProps> = ({ story }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await sendChatMessage(userMessage.text, messages, story);
            const aiMessage: ChatMessage = { role: 'model', text: result.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errMsg: ChatMessage = { role: 'model', text: "I'm sorry, I'm having a bit of trouble answering right now. Could you ask again?" };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-100 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-indigo-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-inner">👨‍🏫</div>
                    <div>
                        <h3 className="text-white font-black text-lg tracking-tight">Ask the Narrator</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Socratic AI Assistant</p>
                    </div>
                </div>
                <span className="text-indigo-100 text-[10px] font-black bg-indigo-700/50 px-3 py-1 rounded-full uppercase tracking-tighter">BETA</span>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 px-10 text-center">
                        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-4xl">💬</div>
                        <p className="text-lg font-bold text-slate-500 leading-tight">Have doubts or want to dive deeper? Ask me anything about the story!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-base shadow-sm leading-relaxed font-medium ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-grow px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-[2rem] outline-none transition-all font-bold text-slate-700"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 shrink-0"
                >
                    <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                </button>
            </form>
        </div>
    );
};

export default StoryChat;

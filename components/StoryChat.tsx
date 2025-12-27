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

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text };
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

    const suggestions = [
        "Explain the core concept again simply.",
        "How does this lesson apply to real life?",
        "Tell me more about the main character's feeling.",
        "Give me another example of this concept.",
        "What was the moral of this story?",
        "Ask me a tricky question!"
    ];

    return (
        <div className="bg-white rounded-[4rem] shadow-2xl border-4 border-white ring-8 ring-indigo-50/50 overflow-hidden flex flex-col h-[750px] transform transition-transform duration-500 hover:scale-[1.01]">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 p-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/20">👨‍🏫</div>
                    <div>
                        <h3 className="text-white font-black text-3xl tracking-tighter">Ask the Narrator</h3>
                        <p className="text-indigo-100 text-sm font-black uppercase tracking-[0.3em]">Socratic AI Assistant</p>
                    </div>
                </div>
                <span className="text-white text-xs font-black bg-indigo-900/50 px-5 py-2 rounded-full uppercase tracking-widest backdrop-blur-md border border-white/10 relative z-10">BETA V2.5</span>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-grow overflow-y-auto p-10 bg-slate-50/50 space-y-8">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-8 px-12 text-center">
                        <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-7xl animate-float">💬</div>
                        <div className="space-y-3">
                             <p className="text-3xl font-black text-slate-800 tracking-tight">Have doubts about the journey?</p>
                             <p className="text-xl font-bold text-slate-400">I'm here to help you dive deeper. Pick a suggestion or type your own!</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-[2.5rem] px-10 py-6 text-xl shadow-xl leading-relaxed font-bold transition-all duration-300 ${
                                msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 border-4 border-slate-50 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                        {/* Suggestion Bubbles - Only shown below AI messages */}
                        {msg.role === 'model' && idx === messages.length - 1 && !isLoading && (
                            <div className="flex flex-wrap gap-3 mt-4 animate-fade-in delay-500">
                                {suggestions.slice(0, 3).map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSend(s)}
                                        className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-full text-sm font-black hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                                    >
                                        💡 {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white border-4 border-slate-50 rounded-[2rem] rounded-tl-none px-8 py-5 flex items-center gap-3 shadow-xl">
                            <span className="w-4 h-4 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-4 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-4 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Global Static Suggestions Row (Always at bottom above input) */}
            <div className="bg-white px-10 py-6 border-t-4 border-slate-50">
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(s)}
                            disabled={isLoading}
                            className="shrink-0 px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-base font-black border-2 border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                        >
                            ✨ {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Input Component */}
            <div className="p-8 bg-white border-t-4 border-slate-50 relative z-10">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-6 p-3 bg-slate-50 rounded-[3rem] border-4 border-transparent focus-within:border-indigo-200 transition-all shadow-inner">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a magical question..."
                        className="flex-grow px-10 py-6 bg-transparent rounded-full outline-none font-black text-slate-700 placeholder-slate-300 text-2xl"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="bg-indigo-600 text-white w-20 h-20 rounded-[2rem] flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-2xl group active:scale-90"
                    >
                        <svg className="w-10 h-10 group-hover:rotate-45 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoryChat;
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Story } from '../types';
import { sendChatMessage } from '../services/geminiService';

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface StoryChatProps {
    story: Story;
    language: string;
}

const StoryChat: React.FC<StoryChatProps> = ({ story, language }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSttLoading, setIsSttLoading] = useState(false);
    const [isTtsLoading, setIsTtsLoading] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const playTts = async (text: string) => {
        if (!ttsEnabled) return;
        setIsTtsLoading(true);
        try {
            const res = await fetch('/api/sarvam-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language }),
            });
            const data = await res.json();
            if (!data.base64Audio) return;

            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
                audioCtxRef.current = new AudioContext();
            }
            const audioCtx = audioCtxRef.current;
            const raw = atob(data.base64Audio);
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
            const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        } catch (err) {
            console.error('TTS error:', err);
        } finally {
            setIsTtsLoading(false);
        }
    };

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
            playTts(result.text);
        } catch (error) {
            console.error('Chat error:', error);
            const errMsg: ChatMessage = { role: 'model', text: "I'm sorry, I'm finding it hard to reflect right now. Could you ask again?" };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const startListening = async () => {
        if (isListening) {
            mediaRecorderRef.current?.stop();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setIsListening(false);
                setIsSttLoading(true);
                try {
                    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    const audioBase64 = await blobToBase64(blob);
                    const res = await fetch('/api/sarvam-stt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            audioBase64,
                            mimeType: blob.type,
                            languageCode: language === 'Tamil' ? 'ta-IN' : 'en-IN',
                        }),
                    });
                    const data = await res.json();
                    if (data.transcript) setInput(data.transcript);
                } catch (err) {
                    console.error('STT error:', err);
                } finally {
                    setIsSttLoading(false);
                }
            };

            mediaRecorderRef.current = recorder;
            setIsListening(true);
            recorder.start();
            setTimeout(() => {
                if (recorder.state === 'recording') recorder.stop();
            }, 8000);
        } catch {
            alert('Could not access microphone. Please allow microphone permissions.');
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
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border-4 border-white dark:border-slate-800 ring-8 ring-indigo-50/50 dark:ring-indigo-900/20 overflow-hidden flex flex-col min-h-[500px] max-h-[700px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 p-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/20">👨‍🏫</div>
                    <div>
                        <h3 className="text-white font-black text-3xl tracking-tighter leading-none">Interactive Narrator</h3>
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Socratic Pedagogical Support</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={() => setTtsEnabled(v => !v)}
                        title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                        className={`p-2 rounded-full transition-all border border-white/20 ${ttsEnabled ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}
                    >
                        {isTtsLoading
                            ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            : ttsEnabled
                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M9 12H4.5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.07 4.93a10 10 0 010 14.14"/></svg>
                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                        }
                    </button>
                    <span className="text-white text-[10px] font-black bg-indigo-900/50 px-4 py-2 rounded-full uppercase tracking-widest border border-white/10">BETA V3.0</span>
                </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-10 bg-slate-50/50 dark:bg-slate-950/50 space-y-8">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-8 px-12 text-center">
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl flex items-center justify-center text-5xl">💭</div>
                        <div className="space-y-4">
                             <p className="text-3xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Have doubts about the journey?</p>
                             <p className="text-xl font-bold text-slate-400 dark:text-slate-500 leading-relaxed">I'm here to help you dive deeper into the story and the concept. Choose a reflection or type your own.</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] rounded-[2.5rem] px-8 py-6 text-lg shadow-xl leading-relaxed font-bold transition-all ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-4 border-slate-50 dark:border-slate-700 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 rounded-[2rem] rounded-tl-none px-8 py-5 flex items-center gap-3 shadow-xl">
                            <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggesions */}
            <div className="bg-white dark:bg-slate-900 px-10 py-6 border-t-4 border-slate-50 dark:border-slate-800 overflow-x-auto">
                <div className="flex gap-4 pb-2 no-scrollbar">
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSend(s)} disabled={isLoading} className="shrink-0 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-black border-2 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm">
                            ✨ {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-8 bg-white dark:bg-slate-900 border-t-4 border-slate-50 dark:border-slate-800 relative z-10">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-4 border-transparent focus-within:border-indigo-200 dark:focus-within:border-indigo-500 transition-all shadow-inner items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a magical question..."
                        className="flex-grow px-8 py-5 bg-transparent rounded-full outline-none font-black text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 text-xl"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={startListening}
                        disabled={isSttLoading}
                        title={isListening ? 'Tap to stop' : 'Voice input (Sarvam AI)'}
                        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-lg ${
                            isListening
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                                : isSttLoading
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400'
                                : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        {isSttLoading
                            ? <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        }
                    </button>
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="bg-indigo-600 dark:bg-indigo-500 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-2xl active:scale-90"
                    >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoryChat;
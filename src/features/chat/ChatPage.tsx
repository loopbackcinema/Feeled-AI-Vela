import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    ArrowLeft, Send, Mic, Loader2, Volume2, VolumeX,
    RotateCcw, Save, BookOpen, MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStudentStore } from '../../stores/studentStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import TypewriterMarkdown from '../../components/TypewriterMarkdown';
import { StudyChatMessage } from '../../types';

// Converts Gemini TTS raw L16 PCM base64 to a playable WAV data URL
function buildWAVDataURL(base64PCM: string, sampleRate = 24000): string {
    const pcm = Uint8Array.from(atob(base64PCM), c => c.charCodeAt(0));
    const dataLen = pcm.byteLength;
    const buf = new ArrayBuffer(44 + dataLen);
    const v = new DataView(buf);
    const s = (o: number, str: string) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    s(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true); s(8, 'WAVE');
    s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    s(36, 'data'); v.setUint32(40, dataLen, true);
    new Uint8Array(buf).set(pcm, 44);
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return `data:audio/wav;base64,${btoa(bin)}`;
}

const SUGGESTIONS = [
    "Explain Newton's laws of motion",
    "What is osmosis?",
    "Help me revise for tomorrow's exam",
    "Explain photosynthesis simply",
    "What are the types of chemical reactions?",
    "Summarise the French Revolution",
];

const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { board, standard, subject, language } = useStudentStore();
    const chatMessages = useSessionStore(s => s.chatMessages);
    const setSession = useSessionStore(s => s.set);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSttLoading, setIsSttLoading] = useState(false);
    const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const grade = standard.replace(/\D/g, '') || standard;
    const medium = language === 'Tamil' ? 'Tamil' : 'English';

    // Auto-scroll on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isLoading]);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg: StudyChatMessage = {
            id: `${Date.now()}-u`,
            role: 'user',
            text: trimmed,
            timestamp: Date.now(),
        };

        const updated = [...chatMessages, userMsg];
        setSession({ chatMessages: updated });
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    history: updated.slice(-12).map(m => ({ role: m.role, text: m.text })),
                    context: { board, grade, subject, language, medium },
                }),
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const aiMsg: StudyChatMessage = {
                id: `${Date.now()}-a`,
                role: 'model',
                text: data.reply,
                ragUsed: data.ragUsed,
                timestamp: Date.now(),
            };
            setSession({ chatMessages: [...updated, aiMsg] });
        } catch {
            setSession({
                chatMessages: [
                    ...updated,
                    { id: `${Date.now()}-e`, role: 'model', text: "Sorry, something went wrong. Please try again.", timestamp: Date.now() },
                ],
            });
        } finally {
            setIsLoading(false);
        }
    }, [chatMessages, isLoading, board, grade, subject, language, medium, setSession]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleVoice = async () => {
        if (isListening) {
            mediaRecorderRef.current?.stop();
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setIsListening(false);
                setIsSttLoading(true);
                try {
                    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    const audioBase64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    const r = await fetch('/api/sarvam-stt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audioBase64, mimeType: blob.type, languageCode: language === 'Tamil' ? 'ta-IN' : 'en-IN' }),
                    });
                    const d = await r.json();
                    if (d.transcript) {
                        setInput(d.transcript);
                        inputRef.current?.focus();
                    }
                } catch (err) {
                    console.error('STT error:', err);
                } finally {
                    setIsSttLoading(false);
                }
            };
            mediaRecorderRef.current = recorder;
            setIsListening(true);
            recorder.start();
            setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 8000);
        } catch {
            alert('Could not access microphone. Please allow microphone permissions and try again.');
        }
    };

    const handleTTS = async (msg: StudyChatMessage) => {
        if (playingMsgId === msg.id) {
            audioRef.current?.pause();
            setPlayingMsgId(null);
            return;
        }
        try {
            setPlayingMsgId(msg.id);
            const res = await fetch('/api/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullStoryText: msg.text.slice(0, 600),
                    language,
                    narratorVoice: 'Female',
                    emotionTone: 'warm',
                }),
            });
            if (!res.ok) throw new Error('TTS failed');
            const { base64Audio } = await res.json();
            const audio = new Audio(buildWAVDataURL(base64Audio));
            audioRef.current = audio;
            audio.onended = () => setPlayingMsgId(null);
            audio.onerror = () => setPlayingMsgId(null);
            audio.play().catch(() => setPlayingMsgId(null));
        } catch {
            setPlayingMsgId(null);
        }
    };

    const handleNewChat = () => {
        audioRef.current?.pause();
        setPlayingMsgId(null);
        setSession({ chatMessages: [] });
        setInput('');
        setSavedOk(false);
    };

    const handleSave = async () => {
        if (!user || chatMessages.length === 0 || isSaving) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'study_chats'), {
                userId: user.uid,
                board, standard, subject, language,
                messages: chatMessages.map(m => ({ role: m.role, text: m.text })),
                createdAt: serverTimestamp(),
            });
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
        } catch (err) {
            console.error('Save chat failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Index of the last model message (gets typewriter animation)
    const lastAiIndex = chatMessages.reduceRight(
        (acc, msg, i) => (acc === -1 && msg.role === 'model' ? i : acc), -1
    );

    return (
        <div
            className="-mx-4 -my-8 md:-my-16 flex flex-col bg-slate-50 dark:bg-slate-950"
            style={{ height: 'calc(100dvh - 64px)' }}
        >
            {/* Top bar: context + actions */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => navigate('/')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    aria-label="Back to home"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap">
                        {subject}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                        Grade {grade}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {language}
                    </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {user && chatMessages.length > 0 && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving || savedOk}
                            title={savedOk ? 'Saved!' : 'Save conversation'}
                            className={`p-1.5 rounded-lg transition-colors ${
                                savedOk
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    )}
                    <button
                        onClick={handleNewChat}
                        title="New conversation"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5" style={{ minHeight: 0 }}>
                {chatMessages.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-full pb-8 animate-fade-in">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                            <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                            Chat with FeelEd AI
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-xs">
                            Ask anything about {subject} — I'll answer straight from the Samacheer textbook.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    chatMessages.map((msg, i) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* AI avatar */}
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-1 text-base select-none">
                                    🤖
                                </div>
                            )}

                            <div className={`max-w-[80%] md:max-w-[68%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                {/* RAG badge */}
                                {msg.role === 'model' && msg.ragUsed && (
                                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                                        <BookOpen className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                            From Samacheer Textbook
                                        </span>
                                    </div>
                                )}

                                {/* Bubble */}
                                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-100 dark:border-slate-700'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <div className="text-sm leading-relaxed prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-900 dark:text-white">
                                            {i === lastAiIndex ? (
                                                <TypewriterMarkdown text={msg.text} />
                                            ) : (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Listen button (AI messages only) */}
                                {msg.role === 'model' && (
                                    <div className="mt-1 ml-1">
                                        <button
                                            onClick={() => handleTTS(msg)}
                                            title={playingMsgId === msg.id ? 'Stop' : 'Listen'}
                                            className={`p-1 rounded-md transition-colors ${
                                                playingMsgId === msg.id
                                                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {playingMsgId === msg.id
                                                ? <VolumeX className="w-3.5 h-3.5" />
                                                : <Volume2 className="w-3.5 h-3.5" />
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User avatar */}
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-black select-none">
                                    {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex gap-3 justify-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-1 text-base select-none">
                            🤖
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5 items-center">
                                {[0, 150, 300].map(delay => (
                                    <span
                                        key={delay}
                                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${delay}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 max-w-3xl mx-auto"
                >
                    <button
                        type="button"
                        onClick={handleVoice}
                        disabled={isSttLoading}
                        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                        className={`flex-shrink-0 p-2.5 rounded-full transition-all ${
                            isListening
                                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200 dark:shadow-red-900/30'
                                : isSttLoading
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600'
                        }`}
                    >
                        {isSttLoading
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Mic className="w-5 h-5" />
                        }
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`Ask about ${subject}...`}
                        disabled={isLoading}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all disabled:opacity-60"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 text-white rounded-full transition-colors shadow-sm"
                        aria-label="Send message"
                    >
                        {isLoading
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Send className="w-5 h-5" />
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;

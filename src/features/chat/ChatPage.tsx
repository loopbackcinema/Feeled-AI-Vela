import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Mic, Loader2, Volume2, VolumeX,
    RotateCcw, Save, BookOpen, MessageSquare, Settings,
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

const ALL_GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const ALL_BOARDS = ['Tamil Nadu State Board (Samacheer)', 'CBSE', 'ICSE'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'];

const STT_LANG: Record<string, string> = {
    English: 'en-IN', Tamil: 'ta-IN', Hindi: 'hi-IN',
    Telugu: 'te-IN', Kannada: 'kn-IN', Malayalam: 'ml-IN',
};

function getSubjectsForGrade(grade: string): string[] {
    const num = parseInt(grade);
    if (num <= 7) return ['Maths', 'English', 'Tamil', 'EVS', 'General Knowledge'];
    if (num <= 10) return ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];
    return ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
}

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
    Maths: ['How do I solve quadratic equations?', 'Explain algebra with an example', 'What are prime numbers?', 'Help me understand fractions', 'What is the Pythagorean theorem?'],
    Science: ["Explain Newton's laws of motion", 'What is photosynthesis?', 'How does osmosis work?', 'What are the types of chemical reactions?', 'Explain the structure of an atom'],
    'Social Science': ['Summarise the French Revolution', 'What is democracy?', 'Key features of the Indian Constitution', 'Explain the causes of World War II', 'What are the branches of government?'],
    Physics: ['Explain electromagnetic induction', "What is Ohm's law?", 'Derive the equations of motion', 'What is the photoelectric effect?', 'Explain waves and sound'],
    Chemistry: ['Explain periodic table trends', 'What is a chemical bond?', 'How does electrolysis work?', 'Explain organic chemistry basics', 'What is the mole concept?'],
    Biology: ['Explain cell division: mitosis vs meiosis', 'How does the immune system work?', 'Explain genetics and heredity', 'What is the central dogma?', 'Describe the human digestive system'],
    Tamil: ['தமிழ் இலக்கணம் விளக்கு', 'சங்க இலக்கியம் பற்றி கூறு', 'கவிதை எழுத உதவு', 'தமிழ் எழுத்துகள் என்ன?', 'திருக்குறள் பற்றி விளக்கு'],
    English: ['Help me improve my essay writing', 'Explain active vs passive voice', 'What are literary devices?', 'Help with comprehension skills', 'Explain tenses in English'],
    EVS: ['What are natural resources?', 'Explain the water cycle', 'What causes pollution?', 'How can we protect the environment?', 'What is the food chain?'],
    'General Knowledge': ['What are the continents?', 'Name the planets in our solar system', 'Who was the first President of India?', "What is India's national animal?", 'What is the capital of France?'],
    'Computer Science': ['What is an algorithm?', 'Explain object-oriented programming', 'What is the difference between RAM and ROM?', 'How does the internet work?', 'What are data structures?'],
};

function getSuggestions(subject: string): string[] {
    return SUBJECT_SUGGESTIONS[subject] ?? [
        'Help me revise for tomorrow\'s exam',
        'Explain this concept in simple terms',
        'Give me practice questions',
        'Summarise the key points',
    ];
}

const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { board, standard, subject, language, setContext } = useStudentStore();
    const chatMessages = useSessionStore(s => s.chatMessages);
    const chatReady = useSessionStore(s => s.chatReady);
    const setSession = useSessionStore(s => s.set);

    // Setup panel local state (pre-filled from existing context)
    const [setupBoard, setSetupBoard] = useState(board || ALL_BOARDS[0]);
    const [setupGrade, setSetupGrade] = useState(standard || '10th');
    const [setupSubject, setSetupSubject] = useState(subject || 'Science');
    const [setupLanguage, setSetupLanguage] = useState(language || 'English');

    // Derived: ensure subject is valid for chosen grade when grade changes
    const subjectsForGrade = getSubjectsForGrade(setupGrade);
    const effectiveSubject = subjectsForGrade.includes(setupSubject) ? setupSubject : subjectsForGrade[0];

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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isLoading]);

    // Sync setup fields when returning to setup panel
    useEffect(() => {
        if (!chatReady) {
            setSetupBoard(board || ALL_BOARDS[0]);
            setSetupGrade(standard || '10th');
            setSetupSubject(subject || 'Science');
            setSetupLanguage(language || 'English');
        }
    }, [chatReady]);

    const handleStartLearning = () => {
        const finalSubject = subjectsForGrade.includes(effectiveSubject) ? effectiveSubject : subjectsForGrade[0];
        const learningMode = parseInt(setupGrade) <= 7 ? 'Junior' : 'Senior';
        setContext({
            board: setupBoard,
            standard: setupGrade,
            subject: finalSubject,
            language: setupLanguage,
            learningMode,
        });
        setSession({ chatReady: true });
    };

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
                    { id: `${Date.now()}-e`, role: 'model', text: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() },
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
                        body: JSON.stringify({
                            audioBase64,
                            mimeType: blob.type,
                            languageCode: STT_LANG[language] ?? 'en-IN',
                        }),
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
        setSession({ chatReady: false, chatMessages: [] });
        setInput('');
        setSavedOk(false);
    };

    const handleChange = () => {
        audioRef.current?.pause();
        setPlayingMsgId(null);
        setSession({ chatReady: false });
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

    const lastAiIndex = chatMessages.reduceRight(
        (acc, msg, i) => (acc === -1 && msg.role === 'model' ? i : acc), -1
    );

    // ─── SETUP PANEL ────────────────────────────────────────────────────────────
    if (!chatReady) {
        return (
            <div
                className="-mx-4 -my-8 md:-my-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 overflow-y-auto"
                style={{ height: 'calc(100dvh - 64px)' }}
            >
                <div className="w-full max-w-md animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                            <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">
                            Study with FeelEd AI
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                            Set your context and start a personalised chat session
                        </p>
                    </div>

                    {/* Setup Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 space-y-5">

                        {/* Board */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Syllabus / Board
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_BOARDS.map(b => (
                                    <button
                                        key={b}
                                        type="button"
                                        onClick={() => setSetupBoard(b)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            setupBoard === b
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        {b === 'Tamil Nadu State Board (Samacheer)' ? 'TN Samacheer' : b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grade */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Grade
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_GRADES.map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => {
                                            setSetupGrade(g);
                                            const newSubjects = getSubjectsForGrade(g);
                                            if (!newSubjects.includes(setupSubject)) {
                                                setSetupSubject(newSubjects[0]);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            setupGrade === g
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Subject
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {subjectsForGrade.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSetupSubject(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            effectiveSubject === s
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Language
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setSetupLanguage(l)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            setupLanguage === l
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start button */}
                        <button
                            onClick={handleStartLearning}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl shadow-lg transition-all"
                        >
                            Start Learning →
                        </button>
                    </div>

                    {/* Back link */}
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // ─── CHAT PANEL ─────────────────────────────────────────────────────────────
    return (
        <div
            className="-mx-4 -my-8 md:-my-16 flex flex-col bg-slate-50 dark:bg-slate-950"
            style={{ height: 'calc(100dvh - 64px)' }}
        >
            {/* Context bar */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap">
                        {subject}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold whitespace-nowrap">
                        Grade {grade}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold whitespace-nowrap">
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
                        onClick={handleChange}
                        title="Change subject or grade"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Change</span>
                    </button>
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
                    <div className="flex flex-col items-center justify-center h-full pb-8 animate-fade-in">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                            <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">
                            Let's study {subject}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-xs">
                            Ask anything — I'll answer straight from the Samacheer textbook in {language}.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                            {getSuggestions(subject).map(s => (
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
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-1 text-base select-none">
                                    🤖
                                </div>
                            )}

                            <div className={`max-w-[80%] md:max-w-[68%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                {msg.role === 'model' && msg.ragUsed && (
                                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                                        <BookOpen className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                            From Samacheer Textbook
                                        </span>
                                    </div>
                                )}

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

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-black select-none">
                                    {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                            )}
                        </div>
                    ))
                )}

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
                <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-3xl mx-auto">
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

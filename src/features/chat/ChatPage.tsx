import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, Plus, Mic, Send, Loader2, BookOpen, Volume2,
    LogIn, LogOut, SquarePen, Image as ImageIcon, Settings2, ChevronRight,
    LayoutDashboard, BookMarked, FlaskConical, User, Lock, Globe, ArrowLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStudentStore } from '../../stores/studentStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, logOut, db } from '../../firebase';
import {
    collection, query, where, orderBy, limit, getDocs,
    doc, setDoc, serverTimestamp, Timestamp, startAfter,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import TypewriterMarkdown from '../../components/TypewriterMarkdown';
import { StudyChatMessage, RagCitation } from '../../types';

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_GRADES = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
const ALL_BOARDS = ['Tamil Nadu State Board (Samacheer)', 'CBSE', 'ICSE'];
const LANGUAGES  = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'];
const STT_LANG: Record<string, string> = {
    English: 'en-IN', Tamil: 'ta-IN', Hindi: 'hi-IN',
    Telugu: 'te-IN', Kannada: 'kn-IN', Malayalam: 'ml-IN',
};
const CONTEXT_QUESTION =
    'Which grade and subject are you studying? 🎓\n\nநீங்கள் எந்த வகுப்பு படிக்கிறீர்கள்? எந்த பாடம்?';
const HISTORY_PAGE_SIZE = 15;

function getSubjectsForGrade(grade: string): string[] {
    const n = parseInt(grade);
    if (n <= 7)  return ['Maths', 'English', 'Tamil', 'EVS', 'General Knowledge'];
    if (n <= 10) return ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];
    return ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
}

function parseContextFromText(text: string): { standard: string; subject: string } | null {
    const lc = text.toLowerCase();
    const gradeMatch = text.match(/(\d+)(?:st|nd|rd|th)?/);
    const grade = gradeMatch ? `${gradeMatch[1]}th` : null;
    const subjectOrder = ['computer science','social science','biology','chemistry','physics','science','maths','math','english','tamil','evs'];
    let foundSubject: string | null = null;
    for (const s of subjectOrder) {
        if (lc.includes(s)) {
            foundSubject = s === 'math' ? 'Maths' : s === 'social science' ? 'Social Science' : s === 'computer science' ? 'Computer Science' : s.charAt(0).toUpperCase() + s.slice(1);
            break;
        }
    }
    if (!grade && !foundSubject) return null;
    return { standard: grade || '10th', subject: foundSubject || 'Science' };
}

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface ChatHistoryItem {
    id: string;
    title: string;
    subject: string;
    grade: string;
    board: string;
    language: string;
    updatedAt: any;
    messages: Array<{ id: string; role: string; text: string; timestamp: number; ragUsed?: boolean }>;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
    open: boolean;
    onClose: () => void;
    user: any;
    chatHistory: ChatHistoryItem[];
    hasMoreHistory: boolean;
    isLoadingHistory: boolean;
    onLoadMore: () => void;
    onNewChat: () => void;
    onAuth: () => void;
    onNavigate: (path: string) => void;
    onSelectSession: (item: ChatHistoryItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    open, onClose, user, chatHistory, hasMoreHistory, isLoadingHistory,
    onLoadMore, onNewChat, onAuth, onNavigate, onSelectSession,
}) => {
    const historyRef = useRef<HTMLDivElement>(null);

    const handleHistoryScroll = () => {
        const el = historyRef.current;
        if (!el || isLoadingHistory || !hasMoreHistory) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) onLoadMore();
    };

    const navMain = [
        { label: 'For Teachers',       path: '/teachers' },
        { label: 'For Parents',        path: '/parents' },
        { label: 'Pilot Program',      path: '/pilot' },
        { label: 'Contact',            path: '/contact' },
    ];
    const navSecondary = [
        { label: 'Scientific Portfolio', path: '/research',  icon: <FlaskConical className="w-3.5 h-3.5" /> },
        { label: 'Philosophy',           path: '/about',     icon: <Globe className="w-3.5 h-3.5" /> },
        { label: 'Founder',              path: '/founder',   icon: <User className="w-3.5 h-3.5" /> },
        { label: 'Inclusive Learning',   path: '/inclusive', icon: <BookMarked className="w-3.5 h-3.5" /> },
        { label: 'Privacy & Data Policy',path: '/privacy',  icon: <Lock className="w-3.5 h-3.5" /> },
    ];

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
            )}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#111111] z-50 flex flex-col border-r border-gray-200 dark:border-[#222] transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo row */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-[#222]">
                    <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <img src="https://i.postimg.cc/g0tRDD6q/A-logo-for-Feel-Ed-AI-is-displayed-on-a-transparent-(1).png" alt="FeelEd AI" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    <span className="font-black text-gray-900 dark:text-white text-base tracking-tight">FeelEd AI</span>
                </div>

                {/* User profile */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#222]">
                    {user && (
                        <div className="flex items-center gap-3 mb-3">
                            {user.photoURL
                                ? <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40" />
                                : <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">{user.displayName?.[0]?.toUpperCase() ?? 'U'}</div>
                            }
                            <div className="min-w-0">
                                <p className="text-gray-900 dark:text-white font-bold text-sm truncate">{user.displayName || 'Student'}</p>
                                <p className="text-gray-500 dark:text-[#666] text-xs truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={onAuth} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-sm font-semibold text-gray-700 dark:text-[#CCCCCC] transition-colors">
                        {user ? <LogOut className="w-4 h-4 flex-shrink-0" /> : <LogIn className="w-4 h-4 flex-shrink-0" />}
                        {user ? 'Sign Out' : 'Student Login'}
                    </button>
                </div>

                {/* New Chat */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#222]">
                    <button onClick={onNewChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
                        <SquarePen className="w-4 h-4" /> New Chat
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto" ref={historyRef} onScroll={handleHistoryScroll}>

                    {/* Logged-in nav */}
                    {user && (
                        <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-[#222]">
                            <button onClick={() => onNavigate('/dashboard')} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 dark:text-[#999] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-sm transition-colors">
                                <LayoutDashboard className="w-4 h-4 flex-shrink-0" /> Dashboard
                            </button>
                            <button onClick={() => onNavigate('/my-stories')} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 dark:text-[#999] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-sm transition-colors">
                                <BookMarked className="w-4 h-4 flex-shrink-0" /> My Stories
                            </button>
                        </div>
                    )}

                    {/* Chat History */}
                    {chatHistory.length > 0 && (
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#222]">
                            <p className="text-gray-400 dark:text-[#444] text-[10px] font-black uppercase tracking-widest mb-2 px-1">Recent Chats</p>
                            <div className="space-y-0.5">
                                {chatHistory.map(item => (
                                    <button key={item.id} onClick={() => onSelectSession(item)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors group">
                                        <p className="text-gray-700 dark:text-[#CCCCCC] text-xs font-medium truncate group-hover:text-gray-900 dark:group-hover:text-white">{item.title}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{item.subject}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-[#555]">· {item.grade}</span>
                                        </div>
                                    </button>
                                ))}
                                {hasMoreHistory && (
                                    <button onClick={onLoadMore} disabled={isLoadingHistory} className="w-full text-center text-xs text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] py-2 transition-colors">
                                        {isLoadingHistory ? 'Loading...' : 'Load more'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main nav */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#222]">
                        <div className="space-y-0.5">
                            {navMain.map(item => (
                                <button key={item.path} onClick={() => onNavigate(item.path)} className="w-full text-left px-3 py-2.5 rounded-lg text-gray-600 dark:text-[#999] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-sm transition-colors flex items-center justify-between group">
                                    {item.label}
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-[#444] group-hover:text-gray-500 dark:group-hover:text-[#888]" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary nav */}
                    <div className="px-4 py-3">
                        <p className="text-gray-400 dark:text-[#444] text-[10px] font-black uppercase tracking-widest mb-2 px-1">About</p>
                        <div className="space-y-0.5">
                            {navSecondary.map(item => (
                                <button key={item.path} onClick={() => onNavigate(item.path)} className="w-full text-left px-3 py-2 rounded-lg text-gray-500 dark:text-[#777] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-xs transition-colors flex items-center gap-2">
                                    <span className="text-gray-400 dark:text-[#555]">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Social icons */}
                        <div className="flex items-center gap-4 pt-4 mt-3 border-t border-gray-100 dark:border-[#222] px-1">
                            <a href="https://www.facebook.com/profile.php?id=61584338379138" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-gray-400 dark:text-[#555] hover:text-[#1877F2] transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="https://www.instagram.com/feeledai/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-gray-400 dark:text-[#555] hover:text-[#E4405F] transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                            <a href="https://x.com/FeelEdAI" target="_blank" rel="noopener noreferrer" title="X / Twitter" className="text-gray-400 dark:text-[#555] hover:text-gray-900 dark:hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="https://www.linkedin.com/company/feeled-ai/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-400 dark:text-[#555] hover:text-[#0A66C2] transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                            </a>
                            <a href="https://www.youtube.com/@FeelEdAI" target="_blank" rel="noopener noreferrer" title="YouTube" className="text-gray-400 dark:text-[#555] hover:text-[#FF0000] transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-[#222]">
                    <p className="text-gray-400 dark:text-[#444] text-xs text-center">Powered by Sarvam</p>
                </div>
            </div>
        </>
    );
};

// ── Plus Popup ────────────────────────────────────────────────────────────────
interface PlusMenuProps {
    board: string; setBoard: (v: string) => void;
    grade: string; setGrade: (v: string) => void;
    subject: string; setSubject: (v: string) => void;
    language: string; setLanguage: (v: string) => void;
    onApply: () => void;
    onClose: () => void;
    onImageClick: () => void;
}

const PlusMenu: React.FC<PlusMenuProps> = ({ board, setBoard, grade, setGrade, subject, setSubject, language, setLanguage, onApply, onClose, onImageClick }) => {
    const subs = getSubjectsForGrade(grade);
    const eff = subs.includes(subject) ? subject : subs[0];
    return (
        <div className="absolute bottom-full left-0 mb-3 w-80 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#222]">
                <span className="text-gray-900 dark:text-white font-bold text-sm">Personalise Your Learning</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <button onClick={onImageClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors border-b border-gray-100 dark:border-[#222]">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-gray-900 dark:text-white text-sm font-semibold">Upload Textbook Photo</p>
                    <p className="text-gray-500 dark:text-[#666] text-xs">Send an image to the AI</p>
                </div>
            </button>
            <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Settings2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 dark:text-[#888] text-[11px] font-bold uppercase tracking-widest">Choose Your Learning Context</span>
                </div>
                <div>
                    <label className="text-gray-400 dark:text-[#666] text-[10px] uppercase tracking-wider mb-1 block">Curriculum</label>
                    <select value={board} onChange={e => setBoard(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                        {ALL_BOARDS.map(b => <option key={b} value={b}>{b === 'Tamil Nadu State Board (Samacheer)' ? 'TN Samacheer' : b}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-gray-400 dark:text-[#666] text-[10px] uppercase tracking-wider mb-1 block">Grade</label>
                        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                            {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 dark:text-[#666] text-[10px] uppercase tracking-wider mb-1 block">Subject</label>
                        <select value={eff} onChange={e => setSubject(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                            {subs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-gray-400 dark:text-[#666] text-[10px] uppercase tracking-wider mb-1 block">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <button onClick={onApply} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded-lg transition-colors">Apply & Start Learning</button>
            </div>
        </div>
    );
};

// ── Main ChatPage ─────────────────────────────────────────────────────────────
const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { board, standard, subject, language, setContext } = useStudentStore();
    const chatMessages = useSessionStore(s => s.chatMessages);
    const setSession = useSessionStore(s => s.set);

    // Session tracking
    const sessionRef = useRef({ id: crypto.randomUUID(), createdAt: Date.now() });

    // UI state
    const [input, setInput]               = useState('');
    const [isLoading, setIsLoading]       = useState(false);
    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [plusOpen, setPlusOpen]         = useState(false);
    const [isListening, setIsListening]   = useState(false);
    const [isSttLoading, setIsSttLoading] = useState(false);
    const [awaitingContext, setAwaitingContext] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState('');
    const [uploadedImage, setUploadedImage] = useState<{ base64: string; mime: string } | null>(null);

    // Chat history
    const [chatHistory, setChatHistory]           = useState<ChatHistoryItem[]>([]);
    const [hasMoreHistory, setHasMoreHistory]     = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const lastHistoryDoc = useRef<QueryDocumentSnapshot | null>(null);

    // Plus panel context state
    const [setupBoard, setSetupBoard]       = useState(board || ALL_BOARDS[0]);
    const [setupGrade, setSetupGrade]       = useState(standard || '10th');
    const [setupSubject, setSetupSubject]   = useState(subject || 'Science');
    const [setupLanguage, setSetupLanguage] = useState(language || 'English');

    const bottomRef    = useRef<HTMLDivElement>(null);
    const inputRef     = useRef<HTMLInputElement>(null);
    const mediaRef     = useRef<MediaRecorder | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const plusRef      = useRef<HTMLDivElement>(null);

    const grade  = (standard || '10').replace(/\D/g, '') || '10';
    const medium = language === 'Tamil' ? 'Tamil' : 'English';
    const contextReady = !!(standard && subject && board);
    const hasMessages  = chatMessages.length > 0;
    const lastAiIndex  = chatMessages.reduceRight((acc, m, i) => (acc === -1 && m.role === 'model' ? i : acc), -1);

    const suggestionChips = [
        { emoji: '⚡', label: 'Electricity' },
        { emoji: '🌍', label: 'Geography' },
        { emoji: '➗', label: 'Algebra' },
        { emoji: '🧪', label: 'Acids & Bases' },
        { emoji: '🧬', label: 'Cell Biology' },
        { emoji: '🏛️', label: 'History' },
    ];

    // Responsive theme: dark on mobile, light on desktop
    useEffect(() => {
        const applyTheme = () => {
            if (window.innerWidth < 768) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        applyTheme();
        window.addEventListener('resize', applyTheme);
        return () => window.removeEventListener('resize', applyTheme);
    }, []);

    // Handle pre-filled messages from navigation state (e.g. from ExamMode chip on AnswerScreen)
    useEffect(() => {
        const state = location.state as any;
        if (state?.prefilledMessage && !hasMessages) {
            sendMessage(state.prefilledMessage);
            window.history.replaceState({}, '');
        }
    }, []);

    // Scroll to bottom
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isLoading]);

    // Close plus menu on outside click
    useEffect(() => {
        if (!plusOpen) return;
        const handle = (e: MouseEvent) => {
            if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [plusOpen]);

    // Load initial chat history
    useEffect(() => {
        if (!user) { setChatHistory([]); return; }
        loadHistory(false);
    }, [user]);

    const loadHistory = async (loadMore: boolean) => {
        if (!user || isLoadingHistory) return;
        setIsLoadingHistory(true);
        try {
            let q = query(
                collection(db, 'chat_sessions'),
                where('userId', '==', user.uid),
                orderBy('updatedAt', 'desc'),
                limit(HISTORY_PAGE_SIZE)
            );
            if (loadMore && lastHistoryDoc.current) {
                q = query(
                    collection(db, 'chat_sessions'),
                    where('userId', '==', user.uid),
                    orderBy('updatedAt', 'desc'),
                    limit(HISTORY_PAGE_SIZE),
                    startAfter(lastHistoryDoc.current)
                );
            }
            const snap = await getDocs(q);
            const items: ChatHistoryItem[] = snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    title:    data.title    || 'Chat',
                    subject:  data.subject  || '',
                    grade:    data.grade    || '',
                    board:    data.board    || '',
                    language: data.language || 'English',
                    updatedAt: data.updatedAt,
                    messages:  data.messages || [],
                };
            });
            lastHistoryDoc.current = snap.docs[snap.docs.length - 1] || null;
            setChatHistory(prev => loadMore ? [...prev, ...items] : items);
            setHasMoreHistory(snap.docs.length === HISTORY_PAGE_SIZE);
        } catch { /* ignore */ } finally {
            setIsLoadingHistory(false);
        }
    };

    // Save session to Firestore
    const saveSession = useCallback(async (messages: StudyChatMessage[]) => {
        if (!user || messages.length < 2) return;
        const title = messages.find(m => m.role === 'user')?.text.slice(0, 40) || 'Chat';
        const sessionDocRef = doc(db, 'chat_sessions', sessionRef.current.id);
        await setDoc(sessionDocRef, {
            userId:    user.uid,
            sessionId: sessionRef.current.id,
            title,
            messages:  messages.map(m => ({ id: m.id, role: m.role, text: m.text, timestamp: m.timestamp, ragUsed: m.ragUsed || false })),
            subject:   subject || 'General',
            grade:     grade   || '10',
            board:     board   || 'TN Samacheer',
            language:  language || 'English',
            createdAt: Timestamp.fromMillis(sessionRef.current.createdAt),
            updatedAt: serverTimestamp(),
        });
        // Refresh history
        loadHistory(false);
    }, [user, subject, grade, board, language]);

    // Apply context from plus panel
    const applyContext = useCallback(() => {
        const subs = getSubjectsForGrade(setupGrade);
        const finalSubject = subs.includes(setupSubject) ? setupSubject : subs[0];
        setContext({
            board: setupBoard,
            standard: setupGrade,
            subject: finalSubject,
            language: setupLanguage,
            learningMode: parseInt(setupGrade) <= 7 ? 'Junior' : 'Senior',
        });
        setPlusOpen(false);
    }, [setupBoard, setupGrade, setupSubject, setupLanguage, setContext]);

    // API call helper
const callAPI = useCallback(async (
    text: string,
    history: StudyChatMessage[],
    ctx: { board: string; grade: string; subject: string; language: string; medium: string },
    imgBase64?: string,
    imgMime?: string,
) => {
    const res = await fetch('/api/chat-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: text,
            history: history.slice(-12).map(m => ({ role: m.role, text: m.text })),
            context: ctx,
            imageBase64: imgBase64 || undefined,
            imageMimeType: imgMime || undefined,
        }),
    });
    if (!res.ok) throw new Error('API error');
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let finalData: any = {};
    const streamingId = `${Date.now()}-streaming`;
    setSession(prev => ({ chatMessages: [...(prev.chatMessages || []), { id: streamingId, role: 'model', text: '', timestamp: Date.now() }] }));
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                    fullText += data.chunk;
                    const cleanText = fullText.replace(/\nFOLLOWUP:[^\n]*/g, '').replace(/FOLLOWUP:[^\n]*/g, '');
                    setSession(prev => ({
                        chatMessages: (prev.chatMessages || []).map(m =>
                            m.id === streamingId ? { ...m, text: cleanText } : m
                        )
                    }));
                }
                if (data.done) finalData = data;
            } catch {}
        }
    }
    return { reply: fullText.replace(/\nFOLLOWUP:[^\n]*/g, '').replace(/FOLLOWUP:[^\n]*/g, ''), ragUsed: finalData.ragUsed || false, suggestions: finalData.suggestions || [], ragCitations: finalData.ragCitations || [], streamingId };
}, [setSession]);

    // Core send function
    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;
        setInput('');

        const userMsg: StudyChatMessage = { id: `${Date.now()}-u`, role: 'user', text: trimmed, timestamp: Date.now() };

        // No context: inject scripted question
        if (!contextReady && !awaitingContext) {
            const aiMsg: StudyChatMessage = { id: `${Date.now()}-q`, role: 'model', text: CONTEXT_QUESTION, timestamp: Date.now() };
            setSession({ chatMessages: [userMsg, aiMsg] });
            setPendingQuestion(trimmed);
            setAwaitingContext(true);
            setUploadedImage(null);
            return;
        }

        // Awaiting context response from user
        if (awaitingContext) {
            const parsed = parseContextFromText(trimmed);
            const actualGrade   = parsed?.standard || standard || '10th';
            const actualSubject = parsed?.subject  || subject  || 'Science';
            const actualLang    = language || 'English';
            const actualBoard   = board   || ALL_BOARDS[0];

            if (parsed) {
                setContext({ standard: actualGrade, subject: actualSubject, learningMode: parseInt(actualGrade) <= 7 ? 'Junior' : 'Senior' });
            }

            const newMessages = [...chatMessages, userMsg];
            setSession({ chatMessages: newMessages });
            setAwaitingContext(false);
            setIsLoading(true);

            try {
                const questionToAsk = pendingQuestion
                    ? `The student is in grade ${actualGrade} studying ${actualSubject}. They originally asked: "${pendingQuestion}". Please answer that question now.`
                    : trimmed;
                const data = await callAPI(questionToAsk, newMessages, {
                    board: actualBoard,
                    grade: actualGrade.replace(/\D/g, '') || '10',
                    subject: actualSubject,
                    language: actualLang,
                    medium: actualLang === 'Tamil' ? 'Tamil' : 'English',
                });
                const aiMsg: StudyChatMessage = { id: `${Date.now()}-a`, role: 'model', text: data.reply, ragUsed: data.ragUsed, suggestions: data.suggestions, ragCitations: data.ragCitations, timestamp: Date.now() };
                const finalMsgs = [...newMessages, aiMsg];
                setSession({ chatMessages: finalMsgs });
                setPendingQuestion('');
                saveSession(finalMsgs).catch(() => {});
            } catch {
                setSession({ chatMessages: [...chatMessages, userMsg, { id: `${Date.now()}-e`, role: 'model', text: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() }] });
            } finally {
                setIsLoading(false);
                setUploadedImage(null);
            }
            return;
        }

        // Normal message with context
        const updated = [...chatMessages, userMsg];
        setSession({ chatMessages: updated });
        setIsLoading(true);

        try {
            const data = await callAPI(trimmed, updated, { board, grade, subject, language, medium }, uploadedImage?.base64, uploadedImage?.mime);
            const aiMsg: StudyChatMessage = { id: `${Date.now()}-a`, role: 'model', text: data.reply, ragUsed: data.ragUsed, suggestions: data.suggestions, ragCitations: data.ragCitations, timestamp: Date.now() };
            const finalMsgs = [...updated, aiMsg];
            setSession({ chatMessages: finalMsgs });
            saveSession(finalMsgs).catch(() => {});
        } catch {
            setSession({ chatMessages: [...updated, { id: `${Date.now()}-e`, role: 'model', text: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() }] });
        } finally {
            setIsLoading(false);
            setUploadedImage(null);
        }
    }, [chatMessages, isLoading, contextReady, awaitingContext, pendingQuestion, board, standard, subject, language, grade, medium, uploadedImage, setSession, setContext, callAPI, saveSession]);

    // TTS
    const playTts = async (text: string) => {
        try {
            const r = await fetch("/api/sarvam-tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.slice(0, 500), language: STT_LANG[language] ?? "en-IN" }),
            });
            const d = await r.json();
            if (d.base64Audio) {
                const audio = new Audio(`data:audio/wav;base64,${d.base64Audio}`);
                audio.play();
            }
        } catch {}
    };

    // STT
    const handleVoice = async () => {
        if (isListening) { mediaRef.current?.stop(); return; }
        try {
            const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setIsListening(false);
                setIsSttLoading(true);
                try {
                    const blob  = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    const audio = await blobToBase64(blob);
                    const r     = await fetch('/api/sarvam-stt', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audioBase64: audio, mimeType: blob.type, languageCode: STT_LANG[language] ?? 'en-IN' }),
                    });
                    const d = await r.json();
                    if (d.transcript) { setInput(d.transcript); inputRef.current?.focus(); }
                } catch { } finally { setIsSttLoading(false); }
            };
            mediaRef.current = recorder;
            setIsListening(true);
            recorder.start();
            setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 8000);
        } catch { alert('Could not access microphone.'); }
    };

    // Image upload
    const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const b64 = await blobToBase64(file);
        setUploadedImage({ base64: b64, mime: file.type });
        setPlusOpen(false);
        e.target.value = '';
    };

    // New chat
    const handleNewChat = () => {
        sessionRef.current = { id: crypto.randomUUID(), createdAt: Date.now() };
        setSession({ chatMessages: [] });
        setAwaitingContext(false);
        setPendingQuestion('');
        setInput('');
        setUploadedImage(null);
        setSidebarOpen(false);
    };

    // Select session from history
    const handleSelectSession = (item: ChatHistoryItem) => {
        sessionRef.current = { id: item.id, createdAt: item.updatedAt?.toMillis?.() || Date.now() };
        const msgs: StudyChatMessage[] = item.messages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'model',
            text: m.text,
            timestamp: m.timestamp,
            ragUsed: m.ragUsed,
        }));
        setSession({ chatMessages: msgs });
        if (item.subject || item.grade) {
            setContext({
                subject: item.subject,
                standard: item.grade,
                board: item.board,
                language: item.language,
                learningMode: parseInt(item.grade) <= 7 ? 'Junior' : 'Senior',
            });
        }
        setSidebarOpen(false);
    };

    // Auth
    const handleAuth = async () => {
        if (user) { await logOut(); }
        else { try { await signInWithGoogle(); } catch (e: any) { alert(e.message || 'Login failed'); } }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-white flex flex-col overflow-hidden">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                chatHistory={chatHistory}
                hasMoreHistory={hasMoreHistory}
                isLoadingHistory={isLoadingHistory}
                onLoadMore={() => loadHistory(true)}
                onNewChat={handleNewChat}
                onAuth={handleAuth}
                onNavigate={path => { navigate(path); setSidebarOpen(false); }}
                onSelectSession={handleSelectSession}
            />

            {/* Top bar */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#1A1A1A]">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors" aria-label="Open sidebar">
                    <Menu className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">FeelEd AI</span>
                <button onClick={handleNewChat} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors" aria-label="New chat">
                    <SquarePen className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            {!hasMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingBottom: '4vh' }}>
                    <img src="https://i.postimg.cc/g0tRDD6q/A-logo-for-Feel-Ed-AI-is-displayed-on-a-transparent-(1).png" alt="FeelEd AI" className="w-14 h-14 object-contain mx-auto mb-4 opacity-70" referrerPolicy="no-referrer" />
                    <h1 className="text-3xl md:text-[2.6rem] font-bold text-gray-900 dark:text-white text-center leading-tight tracking-tight">
                        What are you learning today?
                    </h1>
                    <p className="text-gray-400 dark:text-[#555] text-sm md:text-base text-center mt-3 max-w-sm">
                        Ask me anything about your Samacheer syllabus! 🎓
                    </p>
                    {/* Topic suggestion chips */}
                    <div className="flex gap-2 mt-6 w-full -mx-6 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                        <span className="flex-shrink-0 w-4" />
                        {suggestionChips.map(chip => (
                            <button
                                key={chip.label}
                                onClick={() => { setInput(chip.label); inputRef.current?.focus(); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] text-gray-600 dark:text-[#999] text-xs font-medium whitespace-nowrap flex-shrink-0 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                            >
                                <span>{chip.emoji}</span>
                                <span>{chip.label}</span>
                            </button>
                        ))}
                        <span className="flex-shrink-0 w-4" />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-6" style={{ minHeight: 0 }}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {chatMessages.map((msg, i) => (
                            <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm select-none">🤖</div>
                                )}
                                <div className="max-w-[80%] md:max-w-[70%]">
                                    {msg.role === 'model' && msg.ragUsed && (
                                        <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                                            <BookOpen className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">From Samacheer Textbook</span>
                                        </div>
                                    )}
                                    <div className={`px-4 py-3 rounded-2xl ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-[#E8E8E8] rounded-bl-sm border border-gray-200 dark:border-[#2A2A2A]'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        ) : (
                                            <div className="text-sm leading-relaxed">
                                                {i === lastAiIndex
                                                    ? <TypewriterMarkdown text={msg.text} />
                                                    : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === 'model' && (
                                        <button onClick={() => playTts(msg.text)} className="ml-1 mt-1 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all" title="Listen">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {/* Suggestion chips below AI messages */}
                                    {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                                            {msg.suggestions.map((s, si) => (
                                                <button
                                                    key={si}
                                                    onClick={() => sendMessage(s)}
                                                    disabled={isLoading}
                                                    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-[#AAAAAA] text-xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-40"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Citation card */}
                                    {msg.role === 'model' && msg.ragCitations && msg.ragCitations.length > 0 && (() => {
                                        const best = msg.ragCitations[0];
                                        const parts: string[] = ['TN Samacheer'];
                                        if (best.chapter) parts.push(best.chapter);
                                        if (best.page > 0) parts.push(`p. ${best.page}`);
                                        if (best.chunkType && best.chunkType !== 'text') parts.push(best.chunkType);
                                        return (
                                            <div className="flex items-center gap-1.5 mt-2 ml-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 w-fit max-w-full">
                                                <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                                    📚 {parts.join(' · ')}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-black select-none">
                                        {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 animate-fade-in">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-sm select-none">🤖</div>
                                <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex gap-1.5 items-center">
                                        {[0,150,300].map(d => (
                                            <span key={d} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                </div>
            )}

            {/* Bottom area — fixed at bottom, safe-area aware */}
            <div className="flex-shrink-0 px-4 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}>
                {/* Uploaded image preview */}
                {uploadedImage && (
                    <div className="max-w-3xl mx-auto mb-2 flex items-center gap-3 px-1">
                        <img src={`data:${uploadedImage.mime};base64,${uploadedImage.base64}`} alt="Uploaded" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-[#333]" />
                        <span className="text-gray-400 dark:text-[#777] text-xs flex-1">Image queued — ask your question</span>
                        <button onClick={() => setUploadedImage(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Input bar */}
                <div className="max-w-3xl mx-auto relative" ref={plusRef}>
                    {plusOpen && (
                        <PlusMenu
                            board={setupBoard}     setBoard={setSetupBoard}
                            grade={setupGrade}     setGrade={setSetupGrade}
                            subject={setupSubject} setSubject={setSetupSubject}
                            language={setupLanguage} setLanguage={setSetupLanguage}
                            onApply={applyContext}
                            onClose={() => setPlusOpen(false)}
                            onImageClick={() => fileInputRef.current?.click()}
                        />
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />

                    <form
                        onSubmit={e => { e.preventDefault(); sendMessage(input); }}
                        className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl px-2 py-2 focus-within:border-gray-400 dark:focus-within:border-[#444] transition-colors"
                    >
                        <button type="button" onClick={() => setPlusOpen(!plusOpen)} className={`flex-shrink-0 p-2 rounded-xl transition-all ${plusOpen ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2A2A2A]'}`} aria-label="Upload or set context">
                            <Plus className="w-5 h-5" />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask anything..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#555] text-sm focus:outline-none px-2 disabled:opacity-60 min-w-0"
                        />
                        <button type="button" onClick={handleVoice} disabled={isSttLoading} aria-label={isListening ? 'Stop' : 'Voice input'} className={`flex-shrink-0 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : isSttLoading ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2A2A2A]'}`}>
                            {isSttLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send" className="flex-shrink-0 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white transition-all">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>

                {/* Mode chips — below input */}
                {!hasMessages && (
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                        {[
                            { icon: '📖', label: 'Story Mode',  color: 'hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-300', action: () => navigate('/generator') },
                            { icon: '🎮', label: 'Game Mode',   color: 'hover:border-green-400 hover:text-green-700 dark:hover:border-green-500 dark:hover:text-green-300',   action: () => window.location.href = '/game' },
                            { icon: '📝', label: 'Exam Mode',   color: 'hover:border-rose-400 hover:text-rose-700 dark:hover:border-rose-500 dark:hover:text-rose-300',       action: () => window.location.href = '/exam-mock' },
                        ].map(chip => (
                            <button key={chip.label} onClick={chip.action} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] text-gray-600 dark:text-[#AAAAAA] text-sm transition-all ${chip.color}`}>
                                <span>{chip.icon}</span><span>{chip.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {!hasMessages && (
                    <p className="text-center text-xs mt-3" style={{ color: '#888888' }}>
                        Powered by Sarvam • © 2026 FeelEd AI
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatPage;

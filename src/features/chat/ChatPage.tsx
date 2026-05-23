import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, Plus, Mic, Send, Loader2, BookOpen, Volume2,
    LogIn, LogOut, SquarePen, Image as ImageIcon, Settings2, ChevronRight, ChevronLeft,
    LayoutDashboard, BookMarked, FlaskConical, User, Lock, Globe, ArrowLeft, Sun, Moon,
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
import {
    getStudentProfile, upsertStudentProfile,
    updateStudiedTopic, incrementQuestionCount,
    StudentProfile,
} from '../../lib/studentMemory';
import TypewriterMarkdown from '../../components/TypewriterMarkdown';
import { StudyChatMessage, RagCitation } from '../../types';
import PushNotificationSetup from '../../components/PushNotificationSetup';
import { useTranslation } from 'react-i18next';

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
    desktopOpen: boolean;
    onToggle: () => void;
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
    open, onClose, desktopOpen, onToggle, user, chatHistory, hasMoreHistory, isLoadingHistory,
    onLoadMore, onNewChat, onAuth, onNavigate, onSelectSession,
}) => {
    const { t } = useTranslation();
    const historyRef = useRef<HTMLDivElement>(null);
    const [researchOpen, setResearchOpen] = useState(false);
    const [socialOpen, setSocialOpen] = useState(false);

    const handleHistoryScroll = () => {
        const el = historyRef.current;
        if (!el || isLoadingHistory || !hasMoreHistory) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) onLoadMore();
    };

    const activePath = window.location.pathname;
    const navBtn = (path: string) =>
        `w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
            activePath === path
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-gray-600 dark:text-[#999] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E]'
        }`;

    const groupLabel = 'text-gray-400 dark:text-[#444] text-[10px] font-black uppercase tracking-widest mb-1.5 px-1 block';
    const groupWrap  = 'px-4 py-3 border-b border-gray-100 dark:border-[#222]';

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden" onClick={onClose} />
            )}
            <div
                className={`dark fixed top-0 left-0 h-full w-[200px] z-50 flex flex-col border-r transition-all duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    ${desktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
                style={{ background: '#07070f', borderColor: '#12122a' }}
            >
                {/* Logo row */}
                <div className="flex items-center gap-2 px-3 py-4" style={{ borderBottom: '0.5px solid #12122a' }}>
                    <button onClick={onClose} className="md:hidden p-1 rounded-md transition-colors" style={{ color: '#3a3a5a' }}>
                        <X className="w-5 h-5" />
                    </button>
                    <img src="/feeled-logo.webp" alt="FeelEd AI" className="w-10 h-10 object-contain" />
                    <span className="font-black text-base tracking-tight flex-1" style={{ color: '#9090b8' }}>FeelEd AI</span>
                    {/* Desktop collapse toggle */}
                    <button
                        onClick={onToggle}
                        className="hidden md:flex"
                        style={{ background: '#1a1a2e', border: '1px solid #4f46e5', color: '#818cf8', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px #4f46e540', cursor: 'pointer', flexShrink: 0 }}
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
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
                        {user ? t('nav.signOut') : 'Student Login'}
                    </button>
                </div>

                {/* New Chat */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#222]">
                    <button onClick={onNewChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
                        <SquarePen className="w-4 h-4" /> {t('nav.newChat')}
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto" ref={historyRef} onScroll={handleHistoryScroll}>

                    {/* Chat History */}
                    {chatHistory.length > 0 && (
                        <div className={groupWrap}>
                            <span className={groupLabel}>Recent Chats</span>
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

                    {/* GROUP 1: LEARN */}
                    <div className={groupWrap}>
                        <span className={groupLabel}>Learn</span>
                        <div className="space-y-0.5">
                            <button onClick={() => onNavigate('/dashboard')}  className={navBtn('/dashboard')}><span>📊</span> {t('nav.dashboard')}</button>
                            <button onClick={() => onNavigate('/')}            className={navBtn('/')}><span>💬</span> Chat Tutor</button>
                            <button onClick={() => onNavigate('/story')}       className={navBtn('/story')}><span>✨</span> Story Mode</button>
                            <button onClick={() => onNavigate('/game')}        className={navBtn('/game')}><span>🎮</span> Game Mode</button>
                            <button onClick={() => onNavigate('/exam-mock')}   className={navBtn('/exam-mock')}><span>📝</span> Exam Mode</button>
                            <button onClick={() => onNavigate('/my-stories')}  className={navBtn('/my-stories')}><span>📖</span> {t('nav.myStories')}</button>
                        </div>
                    </div>

                    {/* GROUP 2: SUPPORT */}
                    <div className={groupWrap}>
                        <span className={groupLabel}>Support</span>
                        <div className="space-y-0.5">
                            <button onClick={() => onNavigate('/parents')}  className={navBtn('/parents')}><span>👨‍👩‍👧</span> {t('nav.forParents')}</button>
                            <button onClick={() => onNavigate('/teachers')} className={navBtn('/teachers')}><span>👨‍🏫</span> {t('nav.forTeachers')}</button>
                            <button onClick={() => onNavigate('/pilot')}    className={navBtn('/pilot')}><span>🚀</span> Pilot Program</button>
                            <button onClick={() => onNavigate('/faq')}      className={navBtn('/faq')}><span>❓</span> FAQ</button>
                        </div>
                    </div>

                    {/* GROUP 3: RESEARCH (collapsible) */}
                    <div className={groupWrap}>
                        <button
                            onClick={() => setResearchOpen(o => !o)}
                            className="w-full flex items-center justify-between px-1 mb-1.5 group"
                        >
                            <span className="text-gray-400 dark:text-[#444] text-[10px] font-black uppercase tracking-widest group-hover:text-gray-600 dark:group-hover:text-[#666] transition-colors">Research</span>
                            <svg
                                className={`w-3 h-3 text-gray-400 dark:text-[#444] transition-transform duration-200 ${researchOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div style={{ maxHeight: researchOpen ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
                            <div className="space-y-0.5">
                                <button onClick={() => onNavigate('/founder')}   className={navBtn('/founder')}><span>👤</span> Founder</button>
                                <button onClick={() => onNavigate('/research')}  className={navBtn('/research')}><span>📋</span> Scientific Portfolio</button>
                                <button onClick={() => onNavigate('/inclusive')} className={navBtn('/inclusive')}><span>♿</span> Accessibility Research</button>
                            </div>
                        </div>
                    </div>

                    {/* GROUP 4: COMPANY */}
                    <div className="px-4 py-3">
                        <span className={groupLabel}>Company</span>
                        <div className="space-y-0.5">
                            <button onClick={() => onNavigate('/about')}   className={navBtn('/about')}><span>ℹ️</span> About FeelEd AI</button>
                            <button onClick={() => onNavigate('/contact')} className={navBtn('/contact')}><span>📧</span> Contact</button>
                            <button onClick={() => onNavigate('/privacy')} className={navBtn('/privacy')}><span>🔒</span> Privacy Policy</button>
                            <button onClick={() => onNavigate('/terms')}   className={navBtn('/terms')}><span>📄</span> Terms of Use</button>
                        </div>
                    </div>
                </div>

                {/* Social fan-out — outside scroll area so it can overflow upward freely */}
                <div style={{ position: 'relative', overflow: 'visible', flexShrink: 0 }}>
                    {/* Fan icons — positioned relative to toggle button */}
                    {([
                        { label: 'Facebook',  icon: 'f',   svgIcon: null, bg: '#1877f2', url: 'https://www.facebook.com/profile.php?id=61584338379138' },
                        { label: 'Instagram', icon: '✦',  svgIcon: null, bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', url: 'https://www.instagram.com/feeledai/' },
                        { label: 'X',         icon: '𝕏',   svgIcon: null, bg: '#000',    url: 'https://x.com/FeelEdAI' },
                        { label: 'LinkedIn',  icon: 'in',  svgIcon: null, bg: '#0077b5', url: 'https://www.linkedin.com/company/feeled-ai/' },
                        { label: 'YouTube',   icon: '▶',   svgIcon: null, bg: '#ff0000', url: 'https://www.youtube.com/@FeelEdAI' },
                        { label: 'Scholar',   icon: '🎓',  svgIcon: null, bg: '#4285f4', url: 'https://scholar.google.com/citations?view_op=list_works&hl=en&user=pvT3c7UAAAAJ' },
                        { label: 'GitHub',    icon: null,  svgIcon: '<svg viewBox="0 0 16 16" width="14" height="14" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>', bg: '#24292e', url: 'https://github.com/loopbackcinema/Velayutham-S' },
                        { label: 'ORCID',     icon: 'iD',  svgIcon: null, bg: '#a6ce39', url: 'https://orcid.org/0009-0005-6518-9291' },
                    ] as { label: string; icon: string | null; svgIcon: string | null; bg: string; url: string }[]).map((item, i, arr) => {
                        const angle = 180 - (i * (180 / (arr.length - 1)));
                        const rad = angle * Math.PI / 180;
                        const x = Math.cos(rad) * 65;
                        const y = -Math.sin(rad) * 65;
                        return (
                            <a
                                key={item.label}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={item.label}
                                style={{ position: 'absolute', bottom: 44, left: '50%', width: 30, height: 30, borderRadius: '50%', background: item.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: item.label === 'ORCID' ? 9 : 10, fontWeight: 800, textDecoration: 'none', transform: socialOpen ? `translate(calc(-50% + ${x}px), ${y}px) scale(1)` : 'translate(-50%, 0) scale(0)', opacity: socialOpen ? 1 : 0, transition: `all 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.04}s`, boxShadow: '0 3px 10px rgba(0,0,0,0.4)', zIndex: 20, pointerEvents: socialOpen ? 'auto' : 'none' }}
                            >
                                {item.svgIcon
                                    ? <span dangerouslySetInnerHTML={{ __html: item.svgIcon }} />
                                    : item.icon}
                            </a>
                        );
                    })}
                    {/* Toggle button */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px', borderTop: '0.5px solid #1a1a2e' }}>
                        <button
                            onClick={() => setSocialOpen(o => !o)}
                            style={{ width: 36, height: 36, borderRadius: '50%', background: socialOpen ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#0d0d1c', border: `1px solid ${socialOpen ? '#818cf8' : '#2a2a4a'}`, color: socialOpen ? '#fff' : '#5a5a8a', fontSize: 14, cursor: 'pointer', transition: 'all 0.3s ease', transform: socialOpen ? 'rotate(45deg)' : 'rotate(0deg)', boxShadow: socialOpen ? '0 0 16px #4f46e560' : 'none', zIndex: 21, position: 'relative', flexShrink: 0 }}
                            title="Follow us"
                        >
                            {socialOpen ? '×' : '🔗'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-[#222]">
                    <p className="text-gray-400 dark:text-[#444] text-xs text-center">© 2026 FeelEd AI · Alteridea Web Services Pvt. Ltd.</p>
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
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const next = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(next);
        localStorage.setItem('feeled-lang', next);
    };

    // Session tracking
    const sessionRef = useRef({ id: crypto.randomUUID(), createdAt: Date.now() });

    // UI state
    const [input, setInput]               = useState('');
    const [inputFocused, setInputFocused] = useState(false);
    const [isLoading, setIsLoading]       = useState(false);
    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode]     = useState(() => localStorage.getItem('feeled-theme') === 'dark');
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

    // Student mentor profile (cached for the session)
    const studentProfileRef = useRef<StudentProfile | null>(null);

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
        { emoji: '⚡', label: t('chips.electricity') },
        { emoji: '🌍', label: t('chips.geography') },
        { emoji: '➗', label: t('chips.algebra') },
        { emoji: '🧪', label: t('chips.acids') },
        { emoji: '🧬', label: t('chips.biology') },
        { emoji: '🏛️', label: t('chips.history') },
    ];

    const PLACEHOLDERS = [
        t('input.placeholder1'),
        t('input.placeholder2'),
        t('input.placeholder3'),
        t('input.placeholder4'),
    ];
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

    // Offline/online detection
    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline  = () => setIsOffline(false);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online',  handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online',  handleOnline);
        };
    }, []);
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('feeled-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('feeled-theme', 'light');
        }
        return () => document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    // Rotate placeholder text when empty state is showing
    useEffect(() => {
        if (hasMessages) return;
        const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3000);
        return () => clearInterval(id);
    }, [hasMessages]);

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

    // Load initial chat history + bootstrap student profile
    useEffect(() => {
        if (!user) { setChatHistory([]); studentProfileRef.current = null; return; }
        loadHistory(false);
        // Bootstrap profile (create if new user, fetch if returning)
        (async () => {
            await upsertStudentProfile(user.uid, user.displayName || 'Student', language || 'English');
            studentProfileRef.current = await getStudentProfile(user.uid);
        })();
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
    const profile = studentProfileRef.current;
    const res = await fetch('/api/chat-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: text,
            history: history.slice(-12).map(m => ({ role: m.role, text: m.text })),
            context: ctx,
            imageBase64: imgBase64 || undefined,
            imageMimeType: imgMime || undefined,
            // Mentor context — only sent when profile is loaded
            ...(profile && {
                studentName:   profile.name,
                studiedTopics: profile.studied_topics ?? [],
                weakTopics:    profile.weak_topics    ?? [],
                examTarget:    profile.exam_target    ?? null,
            }),
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
            // Update student memory — fire-and-forget, never blocks the UI
            if (user) {
                const topicLabel = `${subject}: ${trimmed.slice(0, 60)}`;
                updateStudiedTopic(user.uid, topicLabel).catch(() => {});
                incrementQuestionCount(user.uid).catch(() => {});
                // Refresh cached profile in background
                getStudentProfile(user.uid).then(p => { if (p) studentProfileRef.current = p; }).catch(() => {});
            }
        } catch {
            setSession({ chatMessages: [...updated, { id: `${Date.now()}-e`, role: 'model', text: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() }] });
        } finally {
            setIsLoading(false);
            setUploadedImage(null);
        }
    }, [chatMessages, isLoading, contextReady, awaitingContext, pendingQuestion, board, standard, subject, language, grade, medium, uploadedImage, setSession, setContext, callAPI, saveSession, user]);

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
        <div className={`fixed inset-0 flex flex-col overflow-hidden transition-all duration-300 ${desktopSidebarOpen ? 'md:pl-[200px]' : ''}`}
            style={{ background: isDarkMode ? '#060610' : '#ffffff', color: isDarkMode ? '#eeeef8' : '#111111' }}>

            {/* Push notification subscription (renders nothing) */}
            <PushNotificationSetup />

            {/* Offline banner */}
            {isOffline && (
                <div style={{ background: '#7c2d12', color: '#fed7aa', textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: 500, flexShrink: 0, zIndex: 60 }}>
                    📡 {t('offline.banner')}
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                desktopOpen={desktopSidebarOpen}
                onToggle={() => setDesktopSidebarOpen(o => !o)}
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

            {/* Desktop sidebar reopen tab — visible only when sidebar is collapsed */}
            {!desktopSidebarOpen && (
                <button
                    onClick={() => setDesktopSidebarOpen(true)}
                    className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 flex-col items-center justify-center"
                    style={{ background: '#1a1a2e', border: '1px solid #4f46e5', borderLeft: 'none', borderRadius: '0 8px 8px 0', padding: '10px 6px', color: '#818cf8', boxShadow: '0 0 8px #4f46e540' }}
                    title="Open sidebar"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* Top bar */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${isDarkMode ? '#1a1a30' : '#e5e7eb'}`, background: isDarkMode ? '#060610' : '#ffffff' }}>
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl transition-colors"
                    style={{ color: isDarkMode ? '#6060a0' : '#6b7280' }} aria-label="Open sidebar">
                    <Menu className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm tracking-tight" style={{ color: isDarkMode ? '#9090b8' : '#374151' }}>FeelEd AI</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleLanguage}
                        style={{ background: isDarkMode ? '#0d0d1c' : '#f3f4f6', border: `0.5px solid ${isDarkMode ? '#1e1e35' : '#e5e7eb'}`, borderRadius: 8, padding: '5px 10px', color: isDarkMode ? '#9090b8' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        aria-label="Toggle language"
                    >
                        {i18n.language === 'en' ? '🌐 தமிழ்' : '🌐 English'}
                    </button>
                    <button
                        onClick={() => setIsDarkMode(d => !d)}
                        className="p-2 rounded-xl transition-colors"
                        style={{ color: isDarkMode ? '#6060a0' : '#6b7280', background: isDarkMode ? '#12122a' : '#f3f4f6' }}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleNewChat} className="p-2 rounded-xl transition-colors"
                        style={{ color: isDarkMode ? '#6060a0' : '#6b7280' }} aria-label="New chat">
                        <SquarePen className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!hasMessages ? (
                <div className="flex-1 overflow-y-auto" style={{ background: isDarkMode ? '#060610' : '#ffffff' }}>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
                        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
                        @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
                        @keyframes logoFloat{0%,100%{transform:translateY(0px);filter:drop-shadow(0 0 15px #4f46e540)}50%{transform:translateY(-8px);filter:drop-shadow(0 0 25px #4f46e570)}}
                        .fc-card{transition:transform 0.2s ease,box-shadow 0.2s ease;cursor:pointer}
                        .fc-card:hover{transform:translateY(-2px) scale(1.04)!important}
                        .fc-chip{transition:border-color 0.15s,background 0.15s;cursor:pointer}
                        .fs-noscroll{scrollbar-width:none}
                        .fs-noscroll::-webkit-scrollbar{display:none}
                    ` }} />

                    <div style={{ maxWidth: 680, margin: '0 auto', padding: '5vh 20px 24px', textAlign: 'center' }}>
                        {/* Animated logo */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                            <img
                                src="/feeled-logo.webp"
                                alt="FeelEd AI"
                                style={{ width: 120, height: 120, objectFit: 'contain', animation: 'logoFloat 3s ease-in-out infinite' }}
                            />
                        </div>

                        {/* Hero */}
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 4, color: isDarkMode ? '#eeeef8' : '#111111' }}>
                            {t('home.title')}
                        </h1>
                        <p style={{ fontSize: 14, color: isDarkMode ? '#4a4a6a' : '#6b7280', marginBottom: 16 }}>
                            {t('home.subtitle')}
                        </p>

                        {/* 3 Mode Cards */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                            <div className="fc-card" onClick={() => navigate('/story')}
                                style={{ width: 160, background: 'linear-gradient(135deg, #1a0b40, #2d1b69)', border: '1px solid #4c3a99', borderRadius: 16, padding: 16, animation: 'floatA 4s ease-in-out infinite', textAlign: 'left' }}>
                                <div style={{ fontSize: 22, marginBottom: 8 }}>✨</div>
                                <div style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t('modes.story')}</div>
                                <div style={{ color: '#7c6aad', fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>Turn lessons into stories</div>
                                <span style={{ background: '#2d1b69', borderRadius: 4, color: '#a78bfa', fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>✦ POPULAR</span>
                            </div>
                            <div className="fc-card" onClick={() => navigate('/game')}
                                style={{ width: 160, background: 'linear-gradient(135deg, #052010, #0a3520)', border: '1px solid #1a6b45', borderRadius: 16, padding: 16, animation: 'floatB 4.8s ease-in-out infinite', textAlign: 'left' }}>
                                <div style={{ fontSize: 22, marginBottom: 8 }}>🎮</div>
                                <div style={{ color: '#6ee7b7', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t('modes.game')}</div>
                                <div style={{ color: '#2d7a56', fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>Practice through play</div>
                                <span style={{ background: '#0a3520', borderRadius: 4, color: '#34d399', fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>🔥 FUN</span>
                            </div>
                            <div className="fc-card" onClick={() => navigate('/exam-mock')}
                                style={{ width: 160, background: 'linear-gradient(135deg, #1c0e04, #3d2010)', border: '1px solid #7a4a1a', borderRadius: 16, padding: 16, animation: 'floatC 3.8s ease-in-out infinite', textAlign: 'left' }}>
                                <div style={{ fontSize: 22, marginBottom: 8 }}>📝</div>
                                <div style={{ color: '#fcd34d', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t('modes.exam')}</div>
                                <div style={{ color: '#a07030', fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>Mock tests & revision</div>
                                <span style={{ background: '#3d2010', borderRadius: 4, color: '#f59e0b', fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>🎯 REAL PAPERS</span>
                            </div>
                        </div>

                        {/* Topic Chips */}
                        <div className="fs-noscroll" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                            {suggestionChips.map(chip => (
                                <button key={chip.label} className="fc-chip"
                                    onClick={() => { setInput(chip.label); inputRef.current?.focus(); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 20, padding: '6px 13px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                                        background: isDarkMode ? '#0d0d1c' : '#f3f4f6',
                                        border: `1px solid ${isDarkMode ? '#1e1e35' : '#e5e7eb'}`,
                                        color: isDarkMode ? '#9090b8' : '#374151',
                                    }}>
                                    <span>{chip.emoji}</span><span>{chip.label}</span>
                                </button>
                            ))}
                        </div>
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

            {/* Bottom area — clears mobile bottom nav via mb-[70px] on mobile only */}
            <div className="flex-shrink-0 px-4 pt-2 mb-[70px] md:mb-0"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
                    background: isDarkMode ? '#060610' : '#ffffff',
                    borderTop: `1px solid ${isDarkMode ? '#1a1a30' : '#e5e7eb'}` }}>
                {/* Uploaded image preview */}
                {uploadedImage && (
                    <div className="max-w-3xl mx-auto mb-2 flex items-center gap-3 px-1">
                        <img src={`data:${uploadedImage.mime};base64,${uploadedImage.base64}`} alt="Uploaded" className="w-12 h-12 rounded-xl object-cover" style={{ border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}` }} />
                        <span className="text-xs flex-1" style={{ color: isDarkMode ? '#777' : '#9ca3af' }}>Image queued — ask your question</span>
                        <button onClick={() => setUploadedImage(null)} style={{ color: isDarkMode ? '#6060a0' : '#9ca3af' }}><X className="w-4 h-4" /></button>
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
                        className={`flex items-center gap-1.5 rounded-2xl px-2 py-2 transition-all ${inputFocused ? 'feeled-input-focused' : ''}`}
                        style={{
                            background: isDarkMode ? '#0c0c1c' : '#f0f0ff',
                            border: `1.5px solid ${
                                inputFocused
                                    ? '#4f46e5'
                                    : isDarkMode ? '#3b3b6a' : '#4f46e5'
                            }`,
                            boxShadow: inputFocused
                                ? (isDarkMode ? '0 0 20px #4f46e540' : '0 0 0 3px #4f46e525')
                                : (isDarkMode ? '0 0 16px #4f46e520' : '0 0 0 3px #4f46e515'),
                        }}
                    >
                        <button type="button" onClick={() => setPlusOpen(!plusOpen)}
                            className={`flex-shrink-0 p-2 rounded-xl transition-all ${plusOpen ? 'bg-indigo-600 text-white' : ''}`}
                            style={{ color: plusOpen ? undefined : (isDarkMode ? '#6060a0' : '#6b7280') }}
                            aria-label="Upload or set context">
                            <Plus className="w-5 h-5" />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            placeholder={PLACEHOLDERS[placeholderIdx]}
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-sm focus:outline-none px-2 disabled:opacity-60 min-w-0"
                            style={{ color: isDarkMode ? '#eeeef8' : '#111111' }}
                        />
                        <button type="button" onClick={handleVoice} disabled={isSttLoading} aria-label={isListening ? 'Stop' : 'Voice input'}
                            className={`flex-shrink-0 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : isSttLoading ? 'text-indigo-500' : ''}`}
                            style={isListening || isSttLoading ? undefined : { color: isDarkMode ? '#6060a0' : '#6b7280' }}>
                            {isSttLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send" className="flex-shrink-0 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white transition-all">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>

                {!hasMessages && (
                    <p className="text-center text-xs mt-3" style={{ color: isDarkMode ? '#888888' : '#9ca3af' }}>
                        © 2026 FeelEd AI · Alteridea Web Services Pvt. Ltd.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatPage;

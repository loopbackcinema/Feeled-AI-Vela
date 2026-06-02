import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, Plus, Mic, Send, Loader2, BookOpen,
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
    QueryDocumentSnapshot, addDoc,
} from 'firebase/firestore';
import {
    getPersonalizedContext,
    getStudentMemory,
    updateRecentTopic,
    updateRecentMode,
    updateLearningStreak,
    markWelcomeShown,
} from '../../services/memoryService';
import type { StudentMemory } from '../../services/memoryService';
import { generateStudyInsights, generateNextTopicSuggestions, generateWeaknessRecommendations } from '../../services/intelligenceEngine';
import { generateFuturePathSuggestions, generateExamPriorityRecommendations, generateLearningHabitInsights, generateCrossModeContext, generateInsightCards } from '../../services/mentorEngine';
import type { InsightCard } from '../../services/mentorEngine';
import TypewriterMarkdown from '../../components/TypewriterMarkdown';
import { StudyChatMessage, RagCitation } from '../../types';
import PushNotificationSetup from '../../components/PushNotificationSetup';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../context/SubscriptionContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_GRADES = ['6','7','8','9','10','11','12'];

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
    '6':  ['Science', 'Mathematics', 'Social Science', 'Tamil', 'English'],
    '7':  ['Science', 'Mathematics', 'Social Science', 'Tamil', 'English'],
    '8':  ['Science', 'Mathematics', 'Social Science', 'Tamil', 'English'],
    '9':  ['Science', 'Mathematics', 'Social Science', 'Tamil', 'English'],
    '10': ['Science', 'Mathematics', 'Social Science', 'Tamil', 'English', 'Physical Education'],
    '11': [
        'Physics', 'Chemistry', 'Mathematics', 'Biology',
        'Botany', 'Zoology', 'Bio-Botany', 'Bio-Zoology',
        'Bio-Chemistry', 'History', 'Geography', 'Economics',
        'Computer Science', 'Commerce', 'Accountancy',
        'Business Maths', 'Tamil', 'English',
    ],
    '12': [
        'Physics', 'Chemistry', 'Mathematics', 'Biology',
        'Botany', 'Zoology', 'Bio-Botany', 'Bio-Zoology',
        'Bio-Chemistry', 'History', 'Geography', 'Economics',
        'Computer Science', 'Commerce', 'Accountancy',
        'Business Maths', 'Tamil', 'English',
    ],
};
const ALL_BOARDS = ['Tamil Nadu State Board (Samacheer)', 'CBSE', 'ICSE'];
const LANGUAGES  = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'];
const STT_LANG: Record<string, string> = {
    English: 'en-IN', Tamil: 'ta-IN', Hindi: 'hi-IN',
    Telugu: 'te-IN', Kannada: 'kn-IN', Malayalam: 'ml-IN',
};
const CONTEXT_QUESTION =
    'Which grade and subject are you studying? 🎓\n\nநீங்கள் எந்த வகுப்பு படிக்கிறீர்கள்? எந்த பாடம்?';
const HISTORY_PAGE_SIZE = 15;

// Goal-aware welcome sets (selected based on learningGoal, with fallback to random general sets)
const WELCOME_BY_GOAL: Record<string, { text: string }[][]> = {
    'NEET': [
        [
            { text: `வணக்கம் {name} 🩺\nNEET preparation-க்கு FeelEd AI உங்களுடன் இருக்கும்.` },
            { text: `Biology fundamentals-ஐ NCERT level-ல் master பண்ணுவதுதான் NEET-க்கு strongest foundation 🧬\nChemistry mechanisms, Physics numericals — step by step நாம் cover பண்ணலாம்.` },
            { text: `இன்று Biology-ல் எந்த chapter-ல் தொடங்கலாம்? 🔬` },
        ],
        [
            { text: `ஹாய் {name} ⚕️\nNEET ஒரு marathon — daily consistent revision wins it.` },
            { text: `Biology conceptual clarity + Chemistry organic reactions + Physics numericals — இந்த மூன்றும் NEET score-ஐ decide பண்ணும் 📊\nReal NEET questions என்னிடம் இருக்கின்றன.` },
            { text: `எந்த subject-ல் இப்போது focus செய்கிறீர்கள்? 🎯` },
        ],
    ],
    'JEE': [
        [
            { text: `வணக்கம் {name} ⚙️\nJEE preparation-க்கு problem-solving speed மிக முக்கியம்.` },
            { text: `Mathematics daily practice + Physics numericals + Chemistry mechanisms — இந்த pattern-ல் JEE crack ஆகும் 📐\nTimed practice-க்கு நான் உதவுவேன்.` },
            { text: `இன்று Maths-ல் எந்த topic practice பண்ணலாம்? 🔢` },
        ],
    ],
    '10th Board': [
        [
            { text: `வணக்கம் {name} 📘\nTN Board 10th exams-க்கு high-weightage topics-ஐ target பண்ணலாம்.` },
            { text: `Electricity, Algebra, Democracy — இந்த chapters public exams-ல் repeatedly வருகின்றன 📝\nReal exam questions + structured answers என்னிடம் இருக்கிறது.` },
            { text: `இன்று எந்த subject-ல் revision தொடங்கலாம்? 🎯` },
        ],
        [
            { text: `ஹாய் {name} ✏️\nBoard exams-ல் definition + formula + conclusion structure முக்கியம்.` },
            { text: `5-mark answers-ல் right structure follow பண்ணினால் full marks possible 📋\nPast 5 years repeated questions நான் track பண்ணி வைத்திருக்கிறேன்.` },
            { text: `எந்த chapter preparation-ல் தொடங்கலாம்? 📚` },
        ],
    ],
    '12th Board': [
        [
            { text: `வணக்கம் {name} 📗\n12th Board-க்கு conceptual depth மிக முக்கியம்.` },
            { text: `Derivations, proof-based questions, diagram labelling — இவை 12th exams-ல் high marks வாங்கி தருகின்றன 🧪\nPhysics Electrostatics, Chemistry Coordination Compounds — let's cover these well.` },
            { text: `இன்று எந்த subject-ல் deep dive பண்ணலாம்? 🔭` },
        ],
    ],
};

// General welcome sets (used when no goal is set, or as fallback)
const WELCOME_SETS = [
    [
        { text: `வணக்கம் {name} 👋\nநான் FeelEd AI — உங்கள் personal learning companion.` },
        { text: `கதைகள், mock tests, games, மற்றும் AI tutoring மூலம் நாம் சேர்ந்து கற்றுக்கொள்ளலாம் 📚\nTN Samacheer syllabus முழுவதும் நான் உங்களுக்கு உதவுவேன்.` },
        { text: `இன்று என்ன topic-ல் தொடங்கலாம்? ✨` },
    ],
    [
        { text: `ஹாய் {name} ✨\nBoard exams-க்கு smart-ஆக prepare செய்ய FeelEd AI உங்களுடன் இருக்கும்.` },
        { text: `Important questions, revision tricks, மற்றும் practice tests மூலம் step-by-step முன்னேறலாம் 📝\nReal TN Board questions (2021-2026) என்னிடம் இருக்கின்றன!` },
        { text: `இப்போது எந்த subject பார்க்க விரும்புகிறீர்கள்? 🎯` },
    ],
    [
        { text: `வணக்கம் {name} 🚀\nஒரு topic-ஐ story-ஆகவும், game-ஆகவும், exam practice-ஆகவும் கற்றுக்கொள்ள முடியும்!` },
        { text: `கேள்விகள் கேளுங்கள், stories கேளுங்கள், mock tests எழுதுங்கள் — எல்லாம் ஒரே இடத்தில் 🌟` },
        { text: `இன்று என்ன explore செய்யலாம்? 💡` },
    ],
    [
        { text: `ஹாய் {name} 🌱\nஒவ்வொருவரும் வெவ்வேறு விதமாக கற்கிறார்கள் — அது சரிதான்.` },
        { text: `FeelEd AI உங்கள் pace-க்கு ஏற்ற மாதிரி explanations, stories, மற்றும் practice வழங்கும் 📖` },
        { text: `Ready to start learning today? 😊` },
    ],
    [
        { text: `வணக்கம் {name} ⚡\nநீங்கள் இன்று கற்கும் concepts தான் உங்கள் future exams-க்கான அடித்தளம்.` },
        { text: `FeelEd AI மூலம் NEET, JEE, Board exams — எதற்கும் smart-ஆக prepare செய்யலாம் 🎓` },
        { text: `முதலில் எந்த பாடத்தில் தொடங்கலாம்? 📚` },
    ],
];

function getSubjectsForGrade(grade: string): string[] {
    const key = grade.replace(/\D/g, '') || '10';
    return SUBJECTS_BY_GRADE[key] ?? SUBJECTS_BY_GRADE['10'];
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

// Singleton AudioContext — reused across all mode-card sounds. Created on first
// user interaction to satisfy browser autoplay policy.
const getSharedAC = (() => {
    let ac: AudioContext | null = null;
    return () => {
        if (!ac) ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        return ac;
    };
})();

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
    mode?: 'chat' | 'story' | 'exam';
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
    const { isPlus, showUpgrade } = useSubscription();
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
                    <img src="/feeled-logo.webp" alt="FeelEd AI" style={{ width: 52, height: 52, objectFit: 'contain' }} />
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
                                {isPlus ? <span style={{fontSize:'10px',color:'#818cf8'}}>⭐ FeelEd Plus</span> : <button onClick={() => showUpgrade()} style={{fontSize:'10px',color:'#6366f1',background:'none',border:'none',cursor:'pointer'}}>Upgrade to Plus ✨</button>}
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
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] flex-shrink-0">{item.mode === 'story' ? '📖' : item.mode === 'exam' ? '📝' : '💬'}</span>
                                            <p className="text-gray-700 dark:text-[#CCCCCC] text-xs font-medium truncate group-hover:text-gray-900 dark:group-hover:text-white">{item.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 pl-5">
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
    const gradeKey = grade.replace(/\D/g, '') || '10';
    const subs = SUBJECTS_BY_GRADE[gradeKey] ?? SUBJECTS_BY_GRADE['10'];
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
                        <select value={gradeKey} onChange={e => { setGrade(e.target.value); setSubject((SUBJECTS_BY_GRADE[e.target.value] ?? SUBJECTS_BY_GRADE['10'])[0]); }} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                            {ALL_GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
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
    const contextIsDefault = (
        (!board || board === 'Tamil Nadu State Board (Samacheer)') &&
        (!standard || standard === '10th') &&
        (!subject || subject === 'Science') &&
        (!language || language === 'English')
    );
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

    // Message ratings (thumbs up/down)
    const [messageRatings, setMessageRatings]       = useState<Record<string, 'up' | 'down' | null>>({});
    const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);
    const [feedbackText, setFeedbackText]           = useState('');
    const [toastMsg, setToastMsg]                   = useState('');

    // Chat history
    const [chatHistory, setChatHistory]           = useState<ChatHistoryItem[]>([]);
    const [hasMoreHistory, setHasMoreHistory]     = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const lastHistoryDoc = useRef<QueryDocumentSnapshot | null>(null);

    // Plus panel context state
    const [setupBoard, setSetupBoard]       = useState(board || ALL_BOARDS[0]);
    const [setupGrade, setSetupGrade]       = useState(() => (standard || '10').replace(/\D/g, '') || '10');
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
    const [studentMemory, setStudentMemory] = useState<StudentMemory | null>(null);
    const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
    const [welcomeStep, setWelcomeStep] = useState(0);
    const [welcomeMessages, setWelcomeMessages] = useState<{ text: string }[]>([]);
    const [showingWelcome, setShowingWelcome] = useState(false);
    const [storyAwake, setStoryAwake] = useState(false);
    const [gameAwake, setGameAwake]   = useState(false);
    const [examAwake, setExamAwake]   = useState(false);

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

    // Load initial chat history + fire mode/streak tracking
    useEffect(() => {
        if (!user) { setChatHistory([]); return; }
        loadHistory(false);
        // Fire-and-forget — never blocks UI
        updateRecentMode({ uid: user.uid, mode: 'chat' });
        updateLearningStreak(user.uid);
        // Load memory for personalized empty state (2s timeout)
        Promise.race([
            getStudentMemory(user.uid),
            new Promise<null>(resolve => setTimeout(() => resolve(null), 2000)),
        ]).then(mem => {
            if (!mem) return;
            setStudentMemory(mem);
            if (!mem.welcomeShown && chatMessages.length === 0) {
                triggerWelcome(mem, user.uid, user.displayName);
            }
        });
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
                    mode:     data.mode     || 'chat',
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

    // First-time welcome message sequence — goal-aware
    const triggerWelcome = async (memory: StudentMemory, uid: string, displayName: string | null) => {
        const firstName = (displayName || 'Student').split(' ')[0];
        // Pick goal-specific set if available, otherwise fall back to general sets
        const goalSets = memory.learningGoal ? WELCOME_BY_GOAL[memory.learningGoal] : null;
        const pool = goalSets && goalSets.length > 0 ? goalSets : WELCOME_SETS;
        const variant = Math.floor(Math.random() * pool.length);
        const selectedSet = pool[variant].map(msg => ({
            text: msg.text.replace('{name}', firstName),
        }));
        setWelcomeMessages(selectedSet);
        setShowingWelcome(true);
        setWelcomeStep(0);
        // Mark shown immediately — fire-and-forget
        markWelcomeShown(uid, variant + 1);
        // Reveal messages one by one
        for (let i = 0; i < selectedSet.length; i++) {
            await new Promise<void>(resolve => setTimeout(resolve, 900));
            setWelcomeStep(i + 1);
        }
        await new Promise<void>(resolve => setTimeout(resolve, 500));
        setShowingWelcome(false);
    };

    // Save session to Firestore
    const saveSession = useCallback(async (messages: StudyChatMessage[]) => {
        if (!user || messages.length < 2) return;
        const title = messages.find(m => m.role === 'user')?.text.slice(0, 50) || 'Chat';
        const preview = messages.find(m => m.role === 'model')?.text.slice(0, 120) || '';
        const lastMessage = messages[messages.length - 1]?.text.slice(0, 80) || '';
        const sessionDocRef = doc(db, 'chat_sessions', sessionRef.current.id);
        await setDoc(sessionDocRef, {
            userId:       user.uid,
            sessionId:    sessionRef.current.id,
            title,
            preview,
            lastMessage,
            mode:         'chat',
            messageCount: messages.length,
            messages:     messages.map(m => ({ id: m.id, role: m.role, text: m.text, timestamp: m.timestamp, ragUsed: m.ragUsed || false })),
            subject:      subject || 'General',
            grade:        grade   || '10',
            board:        board   || 'TN Samacheer',
            language:     language || 'English',
            createdAt:    Timestamp.fromMillis(sessionRef.current.createdAt),
            updatedAt:    serverTimestamp(),
        });
        // Refresh history
        loadHistory(false);
    }, [user, subject, grade, board, language]);

    // Apply context from plus panel
    const applyContext = useCallback(() => {
        const subs = getSubjectsForGrade(setupGrade);
        const finalSubject = subs.includes(setupSubject) ? setupSubject : subs[0];
        const numericGrade = setupGrade.replace(/\D/g, '') || '10';
        setContext({
            board: setupBoard,
            standard: numericGrade,
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
    studentCtx?: string,
) => {
    if (import.meta.env.DEV && imgBase64) console.log('[Image Upload] Sending to API with image, mime:', imgMime);
    const res = await fetch('/api/chat-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message:       text,
            history:       history.slice(-12).map(m => ({ role: m.role, text: m.text })),
            context:       ctx,
            imageBase64:   imgBase64  || undefined,
            imageMimeType: imgMime    || undefined,
            studentContext: studentCtx || undefined,
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
    return { reply: fullText.replace(/\nFOLLOWUP:[^\n]*/g, '').replace(/FOLLOWUP:[^\n]*/g, ''), ragUsed: finalData.ragUsed || false, suggestions: finalData.suggestions || [], ragCitations: finalData.ragCitations || [], textbookImages: finalData.textbookImages || [], streamingId };
}, [setSession]);

    // Message rating handlers
    const handleRating = async (msgId: string, rating: 'up' | 'down') => {
        if (messageRatings[msgId]) return; // prevent re-rating
        setMessageRatings(prev => ({ ...prev, [msgId]: rating }));
        if (rating === 'down') setShowFeedbackInput(msgId);
        const msg = chatMessages.find(m => m.id === msgId);
        addDoc(collection(db, 'message_feedback'), {
            uid:            user?.uid ?? null,
            msgId,
            rating,
            messagePreview: msg?.text?.substring(0, 100) ?? '',
            url:            window.location.href,
            timestamp:      serverTimestamp(),
            feedbackText:   '',
            resolved:       false,
        }).catch(() => {});
    };

    const submitFeedback = async (msgId: string) => {
        setShowFeedbackInput(null);
        if (!feedbackText.trim()) { setFeedbackText(''); return; }
        addDoc(collection(db, 'message_feedback'), {
            uid:          user?.uid ?? null,
            msgId,
            rating:       messageRatings[msgId] ?? 'down',
            feedbackText: feedbackText.trim(),
            url:          window.location.href,
            timestamp:    serverTimestamp(),
            resolved:     false,
        }).catch(() => {});
        setFeedbackText('');
    };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const handleShare = async (msg: StudyChatMessage) => {
        const shareText = `📚 FeelEd AI — Learning Note\n\n${msg.text}\n\n🔗 Learn more at feeledai.com`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'FeelEd AI — Study Note', text: shareText });
                return;
            } catch { /* user cancelled or unsupported */ }
        }
        try {
            await navigator.clipboard.writeText(shareText);
            showToast('Copied to clipboard! Paste in WhatsApp or any app 📋');
        } catch {
            prompt('Copy this text:', shareText);
        }
    };

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
                const baseCtx = user ? await Promise.race([
                    getPersonalizedContext(user.uid, trimmed),
                    new Promise<string>(resolve => setTimeout(() => resolve(''), 2000)),
                ]) : '';
                const studentCtx = studentMemory
                    ? [
                        baseCtx,
                        generateFuturePathSuggestions(studentMemory).slice(0, 2).join(' '),
                        `Exam priorities: ${generateExamPriorityRecommendations(studentMemory).slice(0, 2).join(', ')}`,
                        generateCrossModeContext(studentMemory),
                    ].filter(Boolean).join('\n')
                    : baseCtx;
                const data = await callAPI(questionToAsk, newMessages, {
                    board: actualBoard,
                    grade: actualGrade.replace(/\D/g, '') || '10',
                    subject: actualSubject,
                    language: actualLang,
                    medium: actualLang === 'Tamil' ? 'Tamil' : 'English',
                }, undefined, undefined, studentCtx);
                const aiMsg: StudyChatMessage = { id: `${Date.now()}-a`, role: 'model', text: data.reply, ragUsed: data.ragUsed, suggestions: data.suggestions, ragCitations: data.ragCitations, textbookImages: data.textbookImages, timestamp: Date.now() };
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
            const baseCtx = user ? await Promise.race([
                getPersonalizedContext(user.uid, trimmed),
                new Promise<string>(resolve => setTimeout(() => resolve(''), 2000)),
            ]) : '';
            const studentCtx = studentMemory
                ? [
                    baseCtx,
                    generateFuturePathSuggestions(studentMemory).slice(0, 2).join(' '),
                    `Exam priorities: ${generateExamPriorityRecommendations(studentMemory).slice(0, 2).join(', ')}`,
                ].filter(Boolean).join('\n')
                : baseCtx;
            const data = await callAPI(trimmed, updated, { board, grade, subject, language, medium }, uploadedImage?.base64, uploadedImage?.mime, studentCtx);
            const aiMsg: StudyChatMessage = { id: `${Date.now()}-a`, role: 'model', text: data.reply, ragUsed: data.ragUsed, suggestions: data.suggestions, ragCitations: data.ragCitations, timestamp: Date.now() };
            const finalMsgs = [...updated, aiMsg];
            setSession({ chatMessages: finalMsgs });
            saveSession(finalMsgs).catch(() => {});
            // Update memory — fire-and-forget, never blocks UI
            if (user) {
                updateRecentTopic({ uid: user.uid, topic: trimmed.slice(0, 60), subject: subject || 'General', source: 'chat' });
            }
        } catch {
            setSession({ chatMessages: [...updated, { id: `${Date.now()}-e`, role: 'model', text: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() }] });
        } finally {
            setIsLoading(false);
            setUploadedImage(null);
        }
    }, [chatMessages, isLoading, contextReady, awaitingContext, pendingQuestion, board, standard, subject, language, grade, medium, uploadedImage, setSession, setContext, callAPI, saveSession, user]);

    // TTS
    const playTts = async (text: string, msgId: string) => {
        if (speakingMsgId === msgId) {
            ttsAudioRef.current?.pause();
            setSpeakingMsgId(null);
            return;
        }
        ttsAudioRef.current?.pause();
        setSpeakingMsgId(msgId);
        try {
            const r = await fetch("/api/sarvam-tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.slice(0, 500), language: STT_LANG[language] ?? "en-IN" }),
            });
            const d = await r.json();
            if (d.base64Audio) {
                const audio = new Audio(`data:audio/wav;base64,${d.base64Audio}`);
                ttsAudioRef.current = audio;
                audio.onended = () => setSpeakingMsgId(null);
                audio.play();
            }
        } catch { setSpeakingMsgId(null); }
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
        if (import.meta.env.DEV) console.log('[Image Upload] File selected:', file.name, file.size, file.type);
        const b64 = await blobToBase64(file);
        setUploadedImage({ base64: b64, mime: file.type });
        if (import.meta.env.DEV) console.log('[Image Upload] Image ready, queued for next message send');
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
            style={{ background: isDarkMode ? '#060610' : '#ffffff', color: isDarkMode ? '#eeeef8' : '#111111' }}
            onClick={() => { try { getSharedAC(); } catch(e) {} }}>

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
                        @keyframes twinkA{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
                        @keyframes zzz1{0%{opacity:0;transform:translate(0,0) scale(0.5)}50%{opacity:1}100%{opacity:0;transform:translate(12px,-26px) scale(1.2)}}
                        @keyframes zzz2{0%{opacity:0;transform:translate(0,0) scale(0.5)}50%{opacity:1}100%{opacity:0;transform:translate(-12px,-24px) scale(1.2)}}
                        @keyframes dreamPop{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
                        @keyframes logoFloat{0%,100%{transform:translateY(0px);filter:drop-shadow(0 0 15px #4f46e540)}50%{transform:translateY(-8px);filter:drop-shadow(0 0 25px #4f46e570)}}
                        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
                        .fc-card{transition:transform 0.2s ease,box-shadow 0.2s ease;cursor:pointer}
                        .fc-card:hover{transform:translateY(-2px) scale(1.04)!important}
                        .fc-chip{transition:border-color 0.15s,background 0.15s;cursor:pointer}
                        .fs-noscroll{scrollbar-width:none}
                        .fs-noscroll::-webkit-scrollbar{display:none}
                    ` }} />

                    {/* Welcome message sequence */}
                    {welcomeStep > 0 && (
                        <div style={{ maxWidth: 480, margin: '24px auto 0', padding: '0 20px' }}>
                            {welcomeMessages.slice(0, welcomeStep).map((msg, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12,
                                    animation: 'fadeSlide 0.4s ease-out both',
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                        background: '#1a1040', border: '0.5px solid #4c3a99',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                                    }}>🤖</div>
                                    <div style={{
                                        background: isDarkMode ? '#0d0d1c' : '#f5f3ff',
                                        border: `0.5px solid ${isDarkMode ? '#1e1e35' : '#ddd6fe'}`,
                                        borderRadius: 16, borderTopLeftRadius: 4,
                                        padding: '10px 14px',
                                        color: isDarkMode ? '#eeeef8' : '#1e1b4b',
                                        fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line',
                                        textAlign: 'left',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Quick-action chips after all messages are shown */}
                            {!showingWelcome && welcomeStep >= 3 && (
                                <div style={{
                                    display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
                                    marginTop: 4, marginBottom: 20,
                                    animation: 'fadeSlide 0.4s ease-out both',
                                }}>
                                    {([
                                        { icon: '📖', label: 'Create a Story', path: '/story' },
                                        { icon: '📝', label: 'Start Mock Test', path: '/exam-mock' },
                                        { icon: '🎮', label: 'Play & Practice', path: '/game' },
                                        { icon: '💬', label: 'Ask a Doubt',     path: null },
                                    ] as { icon: string; label: string; path: string | null }[]).map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => item.path ? navigate(item.path) : inputRef.current?.focus()}
                                            style={{
                                                background: isDarkMode ? '#0d0d1c' : '#f5f3ff',
                                                border: `0.5px solid ${isDarkMode ? '#2a2a4a' : '#ddd6fe'}`,
                                                borderRadius: 20, padding: '7px 13px',
                                                color: isDarkMode ? '#9090b8' : '#5b21b6',
                                                fontSize: 12, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5';
                                                (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#c4b5fd' : '#4338ca';
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#2a2a4a' : '#ddd6fe';
                                                (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#9090b8' : '#5b21b6';
                                            }}
                                        >
                                            {item.icon} {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ maxWidth: 800, margin: '0 auto', padding: '5vh 20px 24px', textAlign: 'center' }}>
                        {/* Animated logo */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                            <img
                                src="/feeled-logo.webp"
                                alt="FeelEd AI"
                                style={{ width: 160, height: 160, objectFit: 'contain', animation: 'logoFloat 3s ease-in-out infinite' }}
                            />
                        </div>

                        {/* Hero */}
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 4, color: isDarkMode ? '#eeeef8' : '#111111' }}>
                            {t('home.title')}
                        </h1>
                        <p style={{ fontSize: 14, color: isDarkMode ? '#4a4a6a' : '#6b7280', marginBottom: 16 }}>
                            {t('home.subtitle')}
                        </p>

                        {/* Context setup prompt — show when defaults unchanged and user is logged in */}

                        {/* 3 Mode Cards — Sleeping Characters */}
                        {(() => {
                          const getAC = getSharedAC;

                          const playMagicSparkle = () => {
                            try {
                              const AC = getAC();
                              [0, 80, 160, 240].forEach((delay, i) => {
                                setTimeout(() => {
                                  const o = AC.createOscillator();
                                  const g = AC.createGain();
                                  o.connect(g); g.connect(AC.destination);
                                  o.type = 'sine';
                                  const freq = 600 + i * 220;
                                  o.frequency.setValueAtTime(freq, AC.currentTime);
                                  o.frequency.exponentialRampToValueAtTime(freq * 1.5, AC.currentTime + 0.18);
                                  g.gain.setValueAtTime(0, AC.currentTime);
                                  g.gain.linearRampToValueAtTime(0.18, AC.currentTime + 0.03);
                                  g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.22);
                                  o.start(AC.currentTime);
                                  o.stop(AC.currentTime + 0.22);
                                }, delay);
                              });
                              setTimeout(() => {
                                const AC2 = getAC();
                                const n = AC2.createOscillator();
                                const ng = AC2.createGain();
                                n.connect(ng); ng.connect(AC2.destination);
                                n.type = 'triangle';
                                n.frequency.setValueAtTime(1800, AC2.currentTime);
                                n.frequency.exponentialRampToValueAtTime(2400, AC2.currentTime + 0.3);
                                ng.gain.setValueAtTime(0.08, AC2.currentTime);
                                ng.gain.exponentialRampToValueAtTime(0.001, AC2.currentTime + 0.3);
                                n.start(AC2.currentTime);
                                n.stop(AC2.currentTime + 0.3);
                              }, 100);
                            } catch(e) { console.log('sound error', e); }
                          };

                          const playGameBeep = () => {
                            try {
                              const AC = getAC();
                              const notes = [261, 329, 392, 523, 659, 784];
                              notes.forEach((freq, i) => {
                                setTimeout(() => {
                                  const o = AC.createOscillator();
                                  const g = AC.createGain();
                                  o.connect(g); g.connect(AC.destination);
                                  o.type = i % 2 === 0 ? 'square' : 'triangle';
                                  o.frequency.setValueAtTime(freq, AC.currentTime);
                                  g.gain.setValueAtTime(0.12, AC.currentTime);
                                  g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.12);
                                  o.start(AC.currentTime);
                                  o.stop(AC.currentTime + 0.12);
                                }, i * 60);
                              });
                            } catch(e) { console.log('sound error', e); }
                          };

                          const playExamBell = () => {
                            try {
                              const AC = getAC();
                              const o = AC.createOscillator();
                              const g = AC.createGain();
                              o.connect(g); g.connect(AC.destination);
                              o.type = 'sine';
                              o.frequency.setValueAtTime(880, AC.currentTime);
                              o.frequency.setValueAtTime(1046, AC.currentTime + 0.05);
                              o.frequency.setValueAtTime(880, AC.currentTime + 0.1);
                              g.gain.setValueAtTime(0, AC.currentTime);
                              g.gain.linearRampToValueAtTime(0.2, AC.currentTime + 0.02);
                              g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.6);
                              o.start(AC.currentTime);
                              o.stop(AC.currentTime + 0.65);
                              setTimeout(() => {
                                const AC2 = getAC();
                                const buf = AC2.createBuffer(1, AC2.sampleRate * 0.08, AC2.sampleRate);
                                const d = buf.getChannelData(0);
                                for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
                                const s = AC2.createBufferSource();
                                const ng = AC2.createGain();
                                const f = AC2.createBiquadFilter();
                                f.type = 'bandpass'; f.frequency.value = 4000; f.Q.value = 0.5;
                                s.buffer = buf;
                                s.connect(f); f.connect(ng); ng.connect(AC2.destination);
                                ng.gain.setValueAtTime(0.4, AC2.currentTime);
                                ng.gain.exponentialRampToValueAtTime(0.001, AC2.currentTime + 0.08);
                                s.start(AC2.currentTime);
                              }, 100);
                            } catch(e) { console.log('sound error', e); }
                          };

                          const cardStyle = (anim: string): React.CSSProperties => ({
                            width: 160,
                            cursor: 'pointer',
                            animation: anim,
                            flexShrink: 0,
                            borderRadius: 28,
                            transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            position: 'relative',
                          });

                          return (
                            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>

                              {/* ── STORY ── */}
                              <div
                                style={cardStyle('floatA 4.8s ease-in-out infinite')}
                                onClick={() => navigate('/story')}
                                onMouseEnter={() => { setStoryAwake(true); playMagicSparkle(); }}
                                onMouseLeave={() => setStoryAwake(false)}
                              >
                                <svg width="160" height="220" viewBox="0 0 168 230" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <radialGradient id="sgBg" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#3b1a7a"/><stop offset="60%" stopColor="#1a0b45"/><stop offset="100%" stopColor="#08041e"/></radialGradient>
                                    <radialGradient id="bookFace" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4c1d95"/></radialGradient>
                                    <radialGradient id="bookSpine" cx="30%" cy="30%" r="80%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#6d28d9"/></radialGradient>
                                    <radialGradient id="moonGl" cx="35%" cy="35%" r="55%"><stop offset="0%" stopColor="#f0e6ff"/><stop offset="100%" stopColor="#b48df5"/></radialGradient>
                                  </defs>
                                  <rect width="168" height="230" rx="28" fill="url(#sgBg)"/>
                                  <ellipse cx="84" cy="0" rx="70" ry="30" fill="#6d28d9" opacity=".2"/>
                                  <circle cx="20" cy="22" r="2.5" fill="#e9d5ff" style={{animation:'twinkA 2.1s infinite'}}/>
                                  <circle cx="140" cy="16" r="1.8" fill="#ddd6fe" style={{animation:'twinkA 2.9s infinite .5s'}}/>
                                  <circle cx="152" cy="52" r="2.2" fill="#c4b5fd" style={{animation:'twinkA 2.4s infinite 1s'}}/>
                                  <circle cx="14" cy="68" r="1.5" fill="#a78bfa" style={{animation:'twinkA 3.1s infinite .3s'}}/>
                                  <circle cx="156" cy="88" r="2" fill="#ddd6fe" style={{animation:'twinkA 2.7s infinite .8s'}}/>
                                  <circle cx="40" cy="44" r="24" fill="url(#moonGl)"/>
                                  <circle cx="48" cy="37" r="17" fill="#08041e"/>
                                  {!storyAwake && (<g>
                                    <circle cx="122" cy="55" r="35" fill="#2d1069" opacity=".95" style={{animation:'dreamPop 3s ease-in-out infinite'}}/>
                                    <circle cx="122" cy="55" r="34" fill="none" stroke="#7c3aed" strokeWidth="2.5" opacity=".6"/>
                                    <circle cx="122" cy="55" r="34" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity=".3" strokeDasharray="3 4"/>
                                    <ellipse cx="112" cy="42" rx="8" ry="5" fill="#c4b5fd" opacity=".2" transform="rotate(-30 112 42)"/>
                                    <circle cx="111" cy="91" r="4" fill="#2d1069" opacity=".8"/>
                                    <circle cx="116" cy="99" r="2.5" fill="#2d1069" opacity=".6"/>
                                    <rect x="104" y="42" width="36" height="26" rx="5" fill="#6d28d9"/>
                                    <rect x="104" y="42" width="6" height="26" rx="3" fill="#a78bfa"/>
                                    <rect x="120" y="46" width="2" height="18" fill="#4c1d95"/>
                                    <text x="108" y="78" fontSize="11" fill="#fef08a">★</text>
                                    <text x="122" y="80" fontSize="8" fill="#c4b5fd">★</text>
                                    <text x="131" y="73" fontSize="9" fill="#fbbf24">★</text>
                                  </g>)}
                                  <rect x="32" y="104" width="106" height="80" rx="13" fill="#2d1069"/>
                                  <rect x="30" y="100" width="106" height="80" rx="13" fill="url(#bookFace)"/>
                                  <rect x="30" y="100" width="18" height="80" rx="10" fill="url(#bookSpine)"/>
                                  <rect x="32" y="103" width="6" height="74" rx="3" fill="#c4b5fd" opacity=".2"/>
                                  <rect x="130" y="104" width="4" height="72" rx="2" fill="#ede9fe" opacity=".15"/>
                                  <rect x="54" y="113" width="52" height="4.5" rx="2.2" fill="#7c3aed" opacity=".55"/>
                                  <rect x="54" y="122" width="42" height="3.5" rx="1.7" fill="#7c3aed" opacity=".38"/>
                                  <rect x="54" y="130" width="48" height="3.5" rx="1.7" fill="#7c3aed" opacity=".38"/>
                                  <ellipse cx="80" cy="108" rx="28" ry="5" fill="#c4b5fd" opacity=".12"/>
                                  {!storyAwake ? (<g>
                                    <path d="M57 152 Q65 145 73 152" stroke="#ddd6fe" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                    <path d="M85 152 Q93 145 101 152" stroke="#ddd6fe" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                  </g>) : (<g>
                                    <circle cx="65" cy="148" r="9" fill="#fff" opacity=".95"/>
                                    <circle cx="93" cy="148" r="9" fill="#fff" opacity=".95"/>
                                    <circle cx="66" cy="148" r="5.5" fill="#5b21b6"/>
                                    <circle cx="94" cy="148" r="5.5" fill="#5b21b6"/>
                                    <circle cx="68" cy="146" r="2" fill="#fff"/>
                                    <circle cx="96" cy="146" r="2" fill="#fff"/>
                                    <text x="44" y="138" fontSize="12" fill="#fbbf24">✦</text>
                                    <text x="108" y="138" fontSize="10" fill="#c4b5fd">✦</text>
                                    <path d="M54 138 Q65 132 75 138" stroke="#c4b5fd" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                    <path d="M83 138 Q93 132 103 138" stroke="#c4b5fd" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  </g>)}
                                  <path d="M70 163 Q79 169 88 163" stroke="#c4b5fd" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  <ellipse cx="57" cy="160" rx="8" ry="5" fill="#a78bfa" opacity=".3"/>
                                  <ellipse cx="101" cy="160" rx="8" ry="5" fill="#a78bfa" opacity=".3"/>
                                  {!storyAwake && (<g>
                                    <text x="28" y="95" fontSize="13" fill="#c4b5fd" fontWeight="800" style={{animation:'zzz1 2.8s ease-out infinite'}}>z</text>
                                    <text x="15" y="80" fontSize="16" fill="#a78bfa" fontWeight="800" style={{animation:'zzz1 2.8s ease-out infinite .9s'}}>z</text>
                                    <text x="5" y="64" fontSize="11" fill="#ddd6fe" fontWeight="800" style={{animation:'zzz1 2.8s ease-out infinite .45s'}}>z</text>
                                  </g>)}
                                  <rect x="18" y="192" width="132" height="30" rx="15" fill="#2d1069"/>
                                  <rect x="19" y="193" width="130" height="14" rx="10" fill="#4c1d95" opacity=".5"/>
                                  <text x="84" y="213" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#e9d5ff">✨ Story Mode</text>
                                </svg>
                              </div>

                              {/* ── GAME ── */}
                              <div
                                style={cardStyle('floatB 5.2s ease-in-out infinite')}
                                onClick={() => navigate('/game')}
                                onMouseEnter={() => { setGameAwake(true); playGameBeep(); }}
                                onMouseLeave={() => setGameAwake(false)}
                              >
                                <svg width="160" height="220" viewBox="0 0 168 230" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <radialGradient id="ggBg" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#064e29"/><stop offset="60%" stopColor="#022b14"/><stop offset="100%" stopColor="#010d06"/></radialGradient>
                                    <radialGradient id="ctrl" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#16a34a"/><stop offset="100%" stopColor="#14532d"/></radialGradient>
                                    <radialGradient id="ctrlGrip" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#15803d"/><stop offset="100%" stopColor="#166534"/></radialGradient>
                                  </defs>
                                  <rect width="168" height="230" rx="28" fill="url(#ggBg)"/>
                                  <ellipse cx="84" cy="0" rx="70" ry="30" fill="#15803d" opacity=".18"/>
                                  <circle cx="18" cy="20" r="2.5" fill="#a7f3d0" style={{animation:'twinkA 2.3s infinite'}}/>
                                  <circle cx="144" cy="18" r="1.8" fill="#6ee7b7" style={{animation:'twinkA 3s infinite .4s'}}/>
                                  <circle cx="154" cy="54" r="2.2" fill="#a7f3d0" style={{animation:'twinkA 2.6s infinite .9s'}}/>
                                  <circle cx="10" cy="66" r="1.5" fill="#34d399" style={{animation:'twinkA 2.9s infinite .2s'}}/>
                                  <circle cx="154" cy="90" r="2" fill="#a7f3d0" style={{animation:'twinkA 2.4s infinite .7s'}}/>
                                  {!gameAwake && (<g>
                                    <circle cx="44" cy="52" r="35" fill="#021f0e" opacity=".95" style={{animation:'dreamPop 3.5s ease-in-out infinite'}}/>
                                    <circle cx="44" cy="52" r="34" fill="none" stroke="#16a34a" strokeWidth="2.5" opacity=".6"/>
                                    <circle cx="44" cy="52" r="34" fill="none" stroke="#4ade80" strokeWidth="1" opacity=".25" strokeDasharray="3 4"/>
                                    <circle cx="56" cy="88" r="4" fill="#021f0e" opacity=".8"/>
                                    <circle cx="52" cy="96" r="2.5" fill="#021f0e" opacity=".6"/>
                                    <polygon points="44,30 49,45 62,45 51,54 55,69 44,61 33,69 37,54 26,45 39,45" fill="#fbbf24"/>
                                    <circle cx="28" cy="42" r="5" fill="#4ade80" opacity=".85"/>
                                    <circle cx="60" cy="66" r="4" fill="#60a5fa" opacity=".85"/>
                                    <circle cx="58" cy="38" r="3.5" fill="#f87171" opacity=".85"/>
                                  </g>)}
                                  <rect x="26" y="110" width="116" height="68" rx="34" fill="#01140a"/>
                                  <rect x="24" y="106" width="120" height="68" rx="34" fill="url(#ctrl)"/>
                                  <rect x="28" y="109" width="112" height="18" rx="20" fill="#22c55e" opacity=".3"/>
                                  <ellipse cx="40" cy="165" rx="21" ry="19" fill="#01140a"/>
                                  <ellipse cx="38" cy="162" rx="20" ry="18" fill="url(#ctrlGrip)"/>
                                  <ellipse cx="128" cy="165" rx="21" ry="19" fill="#01140a"/>
                                  <ellipse cx="126" cy="162" rx="20" ry="18" fill="url(#ctrlGrip)"/>
                                  <rect x="36" y="124" width="22" height="8" rx="4" fill="#15803d"/>
                                  <rect x="43" y="117" width="8" height="22" rx="4" fill="#15803d"/>
                                  <rect x="37" y="125" width="20" height="4" rx="3" fill="#22c55e" opacity=".4"/>
                                  <circle cx="106" cy="116" r="7" fill="#15803d"/><circle cx="106" cy="114" r="6" fill="#4ade80"/>
                                  <circle cx="119" cy="127" r="7" fill="#6b3a00"/><circle cx="119" cy="125" r="6" fill="#fbbf24"/>
                                  <circle cx="106" cy="138" r="7" fill="#7f1d1d"/><circle cx="106" cy="136" r="6" fill="#f87171"/>
                                  <circle cx="93" cy="127" r="7" fill="#1e3a6e"/><circle cx="93" cy="125" r="6" fill="#60a5fa"/>
                                  <circle cx="58" cy="134" r="10" fill="#0f5a28"/><circle cx="58" cy="132" r="9" fill="#15803d"/>
                                  <circle cx="98" cy="134" r="10" fill="#0f5a28"/><circle cx="98" cy="132" r="9" fill="#15803d"/>
                                  {!gameAwake ? (<g>
                                    <path d="M50 150 Q59 143 68 150" stroke="#a7f3d0" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                    <path d="M98 150 Q107 143 116 150" stroke="#a7f3d0" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                  </g>) : (<g>
                                    <circle cx="59" cy="145" r="10" fill="#dcfce7" opacity=".95"/>
                                    <circle cx="107" cy="145" r="10" fill="#dcfce7" opacity=".95"/>
                                    <circle cx="60" cy="145" r="6" fill="#15803d"/>
                                    <circle cx="108" cy="145" r="6" fill="#15803d"/>
                                    <circle cx="62" cy="143" r="2.5" fill="#fff"/>
                                    <circle cx="110" cy="143" r="2.5" fill="#fff"/>
                                    <text x="36" y="136" fontSize="12" fill="#4ade80">✦</text>
                                    <text x="120" y="136" fontSize="10" fill="#fbbf24">✦</text>
                                    <path d="M48 135 Q59 129 69 135" stroke="#6ee7b7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                    <path d="M97 135 Q107 129 117 135" stroke="#6ee7b7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  </g>)}
                                  <path d="M72 162 Q83 169 94 162" stroke="#6ee7b7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  <ellipse cx="50" cy="158" rx="7" ry="4.5" fill="#22c55e" opacity=".25"/>
                                  <ellipse cx="116" cy="158" rx="7" ry="4.5" fill="#22c55e" opacity=".25"/>
                                  {!gameAwake && (<g>
                                    <text x="126" y="95" fontSize="13" fill="#6ee7b7" fontWeight="800" style={{animation:'zzz2 3s ease-out infinite'}}>z</text>
                                    <text x="138" y="80" fontSize="16" fill="#34d399" fontWeight="800" style={{animation:'zzz2 3s ease-out infinite 1s'}}>z</text>
                                    <text x="150" y="65" fontSize="11" fill="#a7f3d0" fontWeight="800" style={{animation:'zzz2 3s ease-out infinite .5s'}}>z</text>
                                  </g>)}
                                  <rect x="18" y="192" width="132" height="30" rx="15" fill="#021f0e"/>
                                  <rect x="19" y="193" width="130" height="14" rx="10" fill="#14532d" opacity=".6"/>
                                  <text x="84" y="213" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#a7f3d0">🎮 Game Mode</text>
                                </svg>
                              </div>

                              {/* ── EXAM ── */}
                              <div
                                style={cardStyle('floatC 4.5s ease-in-out infinite')}
                                onClick={() => navigate('/exam-mock')}
                                onMouseEnter={() => { setExamAwake(true); playExamBell(); }}
                                onMouseLeave={() => setExamAwake(false)}
                              >
                                <svg width="160" height="220" viewBox="0 0 168 230" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <radialGradient id="egBg" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#2c1a04"/><stop offset="60%" stopColor="#140e02"/><stop offset="100%" stopColor="#060400"/></radialGradient>
                                    <linearGradient id="pBody" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="18%" stopColor="#fde047"/><stop offset="50%" stopColor="#fef08a"/><stop offset="80%" stopColor="#fde047"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
                                    <linearGradient id="pWood" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a16207"/><stop offset="30%" stopColor="#ca8a04"/><stop offset="60%" stopColor="#d4a520"/><stop offset="100%" stopColor="#a16207"/></linearGradient>
                                  </defs>
                                  <rect width="168" height="230" rx="28" fill="url(#egBg)"/>
                                  <ellipse cx="84" cy="0" rx="70" ry="30" fill="#92400e" opacity=".18"/>
                                  <circle cx="20" cy="20" r="2.5" fill="#fef08a" style={{animation:'twinkA 2.2s infinite'}}/>
                                  <circle cx="142" cy="16" r="1.8" fill="#fde047" style={{animation:'twinkA 2.9s infinite .5s'}}/>
                                  <circle cx="152" cy="52" r="2.2" fill="#fef08a" style={{animation:'twinkA 2.5s infinite 1s'}}/>
                                  <circle cx="12" cy="66" r="1.5" fill="#fbbf24" style={{animation:'twinkA 3.1s infinite .3s'}}/>
                                  <circle cx="154" cy="88" r="2" fill="#fef08a" style={{animation:'twinkA 2.7s infinite .8s'}}/>
                                  {!examAwake && (<g>
                                    <circle cx="122" cy="50" r="34" fill="#1c1004" opacity=".95" style={{animation:'dreamPop 3.2s ease-in-out infinite'}}/>
                                    <circle cx="122" cy="50" r="33" fill="none" stroke="#d97706" strokeWidth="2.5" opacity=".6"/>
                                    <circle cx="122" cy="50" r="33" fill="none" stroke="#fbbf24" strokeWidth="1" opacity=".25" strokeDasharray="3 4"/>
                                    <circle cx="110" cy="85" r="4" fill="#1c1004" opacity=".8"/>
                                    <circle cx="114" cy="93" r="2.5" fill="#1c1004" opacity=".6"/>
                                    <text x="122" y="44" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fef08a">100</text>
                                    <text x="122" y="60" textAnchor="middle" fontSize="12" fill="#fbbf24">★★★★★</text>
                                    <text x="122" y="74" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#f59e0b">PERFECT!</text>
                                  </g>)}
                                  <rect x="60" y="70" width="48" height="14" rx="7" fill="#fecdd3"/>
                                  <rect x="63" y="72" width="28" height="5" rx="2.5" fill="#fda4af" opacity=".6"/>
                                  <rect x="60" y="82" width="48" height="9" fill="#d97706"/>
                                  <rect x="60" y="83" width="48" height="3" fill="#fbbf24" opacity=".25"/>
                                  <rect x="60" y="91" width="10" height="84" fill="#f59e0b"/>
                                  <rect x="70" y="91" width="28" height="84" fill="url(#pBody)"/>
                                  <rect x="98" y="91" width="10" height="84" fill="#d97706"/>
                                  <rect x="80" y="94" width="4" height="78" rx="2" fill="#fef9c3" opacity=".35"/>
                                  <line x1="62" y1="108" x2="106" y2="108" stroke="#d97706" strokeWidth=".8" opacity=".25"/>
                                  <line x1="62" y1="121" x2="106" y2="121" stroke="#d97706" strokeWidth=".8" opacity=".25"/>
                                  <line x1="62" y1="134" x2="106" y2="134" stroke="#d97706" strokeWidth=".8" opacity=".25"/>
                                  <line x1="62" y1="147" x2="106" y2="147" stroke="#d97706" strokeWidth=".8" opacity=".25"/>
                                  <line x1="62" y1="160" x2="106" y2="160" stroke="#d97706" strokeWidth=".8" opacity=".25"/>
                                  <polygon points="60,175 70,175 70,204 68,204" fill="#a16207"/>
                                  <polygon points="70,175 98,175 84,204" fill="url(#pWood)"/>
                                  <polygon points="98,175 108,175 84,204" fill="#854d0e"/>
                                  <polygon points="68,204 100,204 84,214" fill="#374151"/>
                                  <polygon points="68,204 76,204 84,214" fill="#1f2937"/>
                                  <polygon points="74,206 79,206 78,212" fill="#6b7280" opacity=".5"/>
                                  <polygon points="84,56 114,68 84,80 54,68" fill="#1c1004"/>
                                  <polygon points="84,56 114,68 84,64" fill="#374151" opacity=".4"/>
                                  <rect x="80" y="56" width="8" height="10" rx="3" fill="#292524"/>
                                  <circle cx="112" cy="68" r="4" fill="#fbbf24"/>
                                  <line x1="112" y1="70" x2="112" y2="84" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
                                  <line x1="109" y1="84" x2="115" y2="84" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
                                  {!examAwake ? (<g>
                                    <path d="M66 136 Q74 129 82 136" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                    <path d="M86 136 Q94 129 102 136" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                                  </g>) : (<g>
                                    <circle cx="74" cy="131" r="10" fill="#fef9c3" opacity=".95"/>
                                    <circle cx="94" cy="131" r="10" fill="#fef9c3" opacity=".95"/>
                                    <circle cx="75" cy="131" r="6" fill="#92400e"/>
                                    <circle cx="95" cy="131" r="6" fill="#92400e"/>
                                    <circle cx="77" cy="129" r="2.5" fill="#fff"/>
                                    <circle cx="97" cy="129" r="2.5" fill="#fff"/>
                                    <text x="52" y="122" fontSize="12" fill="#fbbf24">✦</text>
                                    <text x="112" y="122" fontSize="10" fill="#fef08a">✦</text>
                                    <path d="M63 121 Q74 115 84 121" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                    <path d="M84 121 Q94 115 105 121" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  </g>)}
                                  <path d="M72 148 Q84 155 96 148" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                  <ellipse cx="66" cy="144" rx="7" ry="4.5" fill="#f97316" opacity=".2"/>
                                  <ellipse cx="102" cy="144" rx="7" ry="4.5" fill="#f97316" opacity=".2"/>
                                  {!examAwake && (<g>
                                    <text x="28" y="92" fontSize="13" fill="#fde047" fontWeight="800" style={{animation:'zzz1 3s ease-out infinite .2s'}}>z</text>
                                    <text x="14" y="77" fontSize="16" fill="#fbbf24" fontWeight="800" style={{animation:'zzz1 3s ease-out infinite 1.1s'}}>z</text>
                                    <text x="4" y="62" fontSize="11" fill="#fef08a" fontWeight="800" style={{animation:'zzz1 3s ease-out infinite .55s'}}>z</text>
                                  </g>)}
                                  <rect x="18" y="192" width="132" height="30" rx="15" fill="#1c1004"/>
                                  <rect x="19" y="193" width="130" height="14" rx="10" fill="#78350f" opacity=".5"/>
                                  <text x="84" y="213" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#fde047">📝 Exam Mode</text>
                                </svg>
                              </div>

                            </div>
                          );
                        })()}

                        {/* Compact context row — below mode cards */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:8, marginBottom:16, flexWrap:'wrap' }}>
                            <span style={{ fontSize:11, color: isDarkMode ? '#555' : '#999', opacity:0.8 }}>
                                {board === 'Tamil Nadu State Board (Samacheer)' ? 'TN Samacheer' : (board || 'TN Samacheer')} · Grade {grade} · {subject || 'Science'} · {language || 'English'}
                            </span>
                            <button
                                onClick={() => setPlusOpen(true)}
                                style={{ background:'none', border:'1px solid #333', borderRadius:20, padding:'2px 10px', fontSize:10, color:'#888', cursor:'pointer', display:'flex', alignItems:'center', gap:4, transition:'all 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#a78bfa'; (e.currentTarget as HTMLButtonElement).style.color='#a78bfa'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#333'; (e.currentTarget as HTMLButtonElement).style.color='#888'; }}
                            >
                                ✏️ Change
                            </button>
                        </div>

                        {/* AI-Powered Insight Cards */}
                        {studentMemory && (() => {
                            const cards: InsightCard[] = generateInsightCards(studentMemory);
                            if (!cards.length) return null;
                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12, maxWidth: 420, margin: '0 auto 12px' }}>
                                    {cards.map((card, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                if (card.mode === 'story') navigate('/story');
                                                else if (card.mode === 'exam') navigate('/exam-mock');
                                                else if (card.mode === 'game') navigate('/game');
                                                else if (card.actionTopic) { setInput(card.actionTopic); inputRef.current?.focus(); }
                                            }}
                                            style={{
                                                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                                                borderRadius: 14, padding: '10px 12px',
                                                textAlign: 'left', cursor: card.mode || card.actionTopic ? 'pointer' : 'default',
                                                transition: 'border-color 0.15s',
                                            }}
                                            onMouseEnter={e => card.actionTopic && ((e.currentTarget as HTMLElement).style.borderColor = card.color + '60')}
                                            onMouseLeave={e => card.actionTopic && ((e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)')}
                                        >
                                            <div style={{ fontSize: 18, marginBottom: 4 }}>{card.icon}</div>
                                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#4a4a6a' : '#9ca3af', marginBottom: 2 }}>{card.label}</div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: card.color, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Personalized insights + recommended topics */}
                        {studentMemory && (() => {
                            const insights = generateStudyInsights(studentMemory);
                            const nextTopics = generateNextTopicSuggestions(studentMemory);
                            const weakRec = generateWeaknessRecommendations(studentMemory);
                            const recommended = [...nextTopics, ...weakRec].slice(0, 4);
                            if (!insights.length && !recommended.length) return null;
                            return (
                                <div style={{ marginBottom: 12 }}>
                                    {insights.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                                            {insights.map((insight, i) => (
                                                <span key={i} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                    background: isDarkMode ? 'rgba(79,70,229,0.12)' : 'rgba(99,102,241,0.08)',
                                                    border: `1px solid ${isDarkMode ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
                                                    color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {insight}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {recommended.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: isDarkMode ? '#3a3a5a' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                                Recommended for you
                                            </p>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {recommended.map((topic, i) => (
                                                    <button key={i} className="fc-chip"
                                                        onClick={() => { setInput(topic); inputRef.current?.focus(); }}
                                                        style={{
                                                            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                            background: isDarkMode ? '#0d0d20' : '#f0f0ff',
                                                            border: `1px solid ${isDarkMode ? '#2a2a50' : '#c7d2fe'}`,
                                                            color: isDarkMode ? '#818cf8' : '#4338ca',
                                                            cursor: 'pointer',
                                                        }}>
                                                        ✦ {topic}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

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
                    <div className="max-w-4xl mx-auto space-y-6">
                        {chatMessages.map((msg, i) => (
                            <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm select-none">🤖</div>
                                )}
                                <div className="max-w-[85%] md:max-w-[75%]">
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

                                    {/* Textbook images */}
                                    {msg.role === 'model' && msg.textbookImages && msg.textbookImages.length > 0 && (
                                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#4a4a6a' : '#9ca3af', marginBottom: 4 }}>
                                                📚 From Your Textbook
                                            </div>
                                            {msg.textbookImages.map((img, idx) => (
                                                <div key={idx} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, maxWidth: 320 }}>
                                                    <img
                                                        src={img.url}
                                                        alt={`${img.subject} - Page ${img.page}`}
                                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                                        loading="lazy"
                                                    />
                                                    <div style={{ padding: '6px 10px', fontSize: 10, color: isDarkMode ? '#555' : '#9ca3af', background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)' }}>
                                                        Grade {img.grade} · {img.subject} · Page {img.page}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Unified action bar — only on completed AI messages */}
                                    {msg.role === 'model' && !(isLoading && i === lastAiIndex) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>

                                            {/* 🔊 Read aloud */}
                                            <button
                                                onClick={() => playTts(msg.text, msg.id)}
                                                data-tooltip={speakingMsgId === msg.id ? 'Stop' : 'Read aloud'}
                                                style={{ background: speakingMsgId === msg.id ? (isDarkMode ? '#1a1040' : '#ede9fe') : 'transparent', border: `0.5px solid ${speakingMsgId === msg.id ? '#4f46e5' : 'transparent'}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: speakingMsgId === msg.id ? '#818cf8' : (isDarkMode ? '#3a3a5a' : '#9ca3af'), transition: 'all 0.15s ease', display: 'flex', alignItems: 'center' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#818cf8'; (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#2a2a4a' : '#e5e7eb'; }}
                                                onMouseLeave={e => { if (speakingMsgId !== msg.id) { (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#3a3a5a' : '#9ca3af'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}
                                            >{speakingMsgId === msg.id ? '⏸' : '🔊'}</button>

                                            <div style={{ width: '0.5px', height: 14, background: isDarkMode ? '#1e1e35' : '#e5e7eb' }} />

                                            {/* 📤 Share */}
                                            <button
                                                onClick={() => handleShare(msg)}
                                                data-tooltip="Share"
                                                style={{ background: 'transparent', border: '0.5px solid transparent', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: isDarkMode ? '#3a3a5a' : '#9ca3af', transition: 'all 0.15s ease' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#34d399'; (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#2a2a4a' : '#e5e7eb'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#3a3a5a' : '#9ca3af'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                                            >📤</button>

                                            <div style={{ width: '0.5px', height: 14, background: isDarkMode ? '#1e1e35' : '#e5e7eb' }} />

                                            {/* 👍 Thumbs up */}
                                            <button
                                                onClick={() => handleRating(msg.id, 'up')}
                                                data-tooltip="Helpful"
                                                style={{ background: messageRatings[msg.id] === 'up' ? '#1a1040' : 'transparent', border: `0.5px solid ${messageRatings[msg.id] === 'up' ? '#4f46e5' : 'transparent'}`, borderRadius: 6, padding: '3px 7px', cursor: messageRatings[msg.id] ? 'default' : 'pointer', fontSize: 13, color: messageRatings[msg.id] === 'up' ? '#818cf8' : isDarkMode ? '#3a3a5a' : '#9ca3af', transition: 'all 0.15s ease' }}
                                                onMouseEnter={e => { if (!messageRatings[msg.id]) (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                                                onMouseLeave={e => { if (messageRatings[msg.id] !== 'up') (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#3a3a5a' : '#9ca3af'; }}
                                            >👍</button>

                                            {/* 👎 Thumbs down */}
                                            <button
                                                onClick={() => handleRating(msg.id, 'down')}
                                                data-tooltip="Not helpful"
                                                style={{ background: messageRatings[msg.id] === 'down' ? '#1a0010' : 'transparent', border: `0.5px solid ${messageRatings[msg.id] === 'down' ? '#dc2626' : 'transparent'}`, borderRadius: 6, padding: '3px 7px', cursor: messageRatings[msg.id] ? 'default' : 'pointer', fontSize: 13, color: messageRatings[msg.id] === 'down' ? '#ef4444' : isDarkMode ? '#3a3a5a' : '#9ca3af', transition: 'all 0.15s ease' }}
                                                onMouseEnter={e => { if (!messageRatings[msg.id]) (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                                                onMouseLeave={e => { if (messageRatings[msg.id] !== 'down') (e.currentTarget as HTMLElement).style.color = isDarkMode ? '#3a3a5a' : '#9ca3af'; }}
                                            >👎</button>

                                            {/* Inline feedback input after thumbs down */}
                                            {showFeedbackInput === msg.id && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <input
                                                        type="text"
                                                        value={feedbackText}
                                                        onChange={e => setFeedbackText(e.target.value)}
                                                        placeholder="What was wrong? (optional)"
                                                        autoFocus
                                                        style={{ background: '#0d0d1c', border: '0.5px solid #2a2a4a', borderRadius: 8, padding: '4px 10px', color: '#eeeef8', fontSize: 11, width: 160, outline: 'none' }}
                                                        onKeyDown={e => { if (e.key === 'Enter') submitFeedback(msg.id); }}
                                                    />
                                                    <button onClick={() => submitFeedback(msg.id)} style={{ background: '#4f46e5', border: 'none', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, cursor: 'pointer' }}>Send</button>
                                                    <button onClick={() => setShowFeedbackInput(null)} style={{ background: 'none', border: 'none', color: '#3a3a5a', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                                                </div>
                                            )}

                                            {/* Confirmation label */}
                                            {messageRatings[msg.id] && showFeedbackInput !== msg.id && (
                                                <span style={{ color: isDarkMode ? '#3a3a5a' : '#9ca3af', fontSize: 10, marginLeft: 2 }}>
                                                    {messageRatings[msg.id] === 'up' ? 'Thanks!' : 'Thanks for the feedback'}
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                    <div className="max-w-4xl mx-auto mb-2 flex items-center gap-3 px-1">
                        <img src={`data:${uploadedImage.mime};base64,${uploadedImage.base64}`} alt="Uploaded" className="w-12 h-12 rounded-xl object-cover" style={{ border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}` }} />
                        <span className="text-xs flex-1" style={{ color: isDarkMode ? '#777' : '#9ca3af' }}>Image queued — ask your question</span>
                        <button onClick={() => setUploadedImage(null)} style={{ color: isDarkMode ? '#6060a0' : '#9ca3af' }}><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Input bar */}
                <div className="max-w-4xl mx-auto relative" ref={plusRef}>
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

            {/* Clipboard toast */}
            {toastMsg && (
                <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1a1040', border: '0.5px solid #4f46e5', borderRadius: 10, padding: '8px 16px', color: '#c4b5fd', fontSize: 12, zIndex: 9999, boxShadow: '0 4px 16px #4f46e540', whiteSpace: 'nowrap' }}>
                    {toastMsg}
                </div>
            )}
        </div>
    );
};

export default ChatPage;

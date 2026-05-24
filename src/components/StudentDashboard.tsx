import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Book, School, GraduationCap, Heart, Save, Loader2, Award, Target, TrendingUp, Activity, Flame, BookOpen, MessageSquare, X, Zap, Brain } from 'lucide-react';
import { getStudentMemory, StudentMemory } from '../services/memoryService';
import { generateExamReadiness, generateCrossModeSuggestions, generateStudyInsights } from '../services/intelligenceEngine';
import {
    generateDailyLearningGoals, generateMotivationalGuidance, generateRevisionSchedule,
    generateSmartRevisionPlan, detectLearningPatterns,
    buildLearningJourney, generateProgressInsights,
} from '../services/mentorEngine';
import type { StudyTask, RevisionItem, RevisionPriority, LearningPattern, JourneyDay, ProgressInsight } from '../services/mentorEngine';

interface SavedStory {
    id: string;
    title: string;
    topic: string;
    content: string;
    language: string;
    createdAt: Timestamp;
}

interface ActivityLog {
    id: string;
    type: string;
    topic: string;
    subject: string;
    createdAt: any;
}

interface PracticeScore {
    id: string;
    topic: string;
    subject: string;
    score: number;
    total: number;
    createdAt: any;
}

function computeStreak(allActivities: ActivityLog[]): number {
    const activityDays = new Set<string>();
    allActivities.forEach(a => {
        const ms = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        if (ms) activityDays.add(new Date(ms).toISOString().slice(0, 10));
    });
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const startOffset = activityDays.has(todayKey) ? 0 : 1;
    let streak = 0;
    for (let i = startOffset; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (activityDays.has(d.toISOString().slice(0, 10))) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function findImprovingSubject(allScores: PracticeScore[]): string | null {
    const bySubject: Record<string, PracticeScore[]> = {};
    allScores.forEach(s => {
        if (!s.subject) return;
        if (!bySubject[s.subject]) bySubject[s.subject] = [];
        bySubject[s.subject].push(s);
    });
    for (const subject of Object.keys(bySubject)) {
        const sorted = bySubject[subject].sort((a, b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return tb - ta;
        });
        if (sorted.length >= 2) {
            const latest = sorted[0].score / sorted[0].total;
            const prev   = sorted[1].score / sorted[1].total;
            if (latest > prev) return subject;
        }
    }
    return null;
}

const StudentDashboard: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
    const { user, userProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [scores, setScores] = useState<PracticeScore[]>([]);
    const [storiesCount, setStoriesCount] = useState(0);
    const [chatSessionsCount, setChatSessionsCount] = useState(0);
    const [mockTestCount, setMockTestCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [improvingSubject, setImprovingSubject] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [recentStories, setRecentStories] = useState<SavedStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
    const [studentMemory, setStudentMemory] = useState<StudentMemory | null>(null);
    const [learningGoal, setLearningGoal] = useState<StudentMemory['learningGoal']>(null);
    const [savingGoal, setSavingGoal] = useState(false);
    const [dailyTasks, setDailyTasks] = useState<StudyTask[]>([]);
    const [revisionQueue, setRevisionQueue] = useState<RevisionItem[]>([]);
    const [mentorNote, setMentorNote] = useState('');
    const [smartRevision, setSmartRevision] = useState<RevisionPriority[]>([]);
    const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
    const [journeyDays, setJourneyDays] = useState<JourneyDay[]>([]);
    const [progressInsights, setProgressInsights] = useState<ProgressInsight[]>([]);

    useEffect(() => {
        if (!selectedStory) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedStory(null); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [selectedStory]);
    
    // Profile form state
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || '',
        standard: userProfile?.standard || '',
        school: userProfile?.school || '',
        interests: userProfile?.interests?.join(', ') || ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || '',
                standard: userProfile.standard || '',
                school: userProfile.school || '',
                interests: userProfile.interests?.join(', ') || ''
            });
        }
    }, [userProfile]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // Fetch recent activities
                const activityQ = query(collection(db, 'study_activity'), where('userId', '==', user.uid));
                const activitySnap = await getDocs(activityQ);
                const fetchedActivities: ActivityLog[] = [];
                activitySnap.forEach(doc => fetchedActivities.push({ id: doc.id, ...doc.data() } as ActivityLog));
                fetchedActivities.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA;
                });
                setStreak(computeStreak(fetchedActivities));
                setActivities(fetchedActivities.slice(0, 5));

                // Fetch recent scores
                const scoreQ = query(collection(db, 'practice_scores'), where('userId', '==', user.uid));
                const scoreSnap = await getDocs(scoreQ);
                const fetchedScores: PracticeScore[] = [];
                scoreSnap.forEach(doc => fetchedScores.push({ id: doc.id, ...doc.data() } as PracticeScore));
                fetchedScores.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA;
                });
                setImprovingSubject(findImprovingSubject(fetchedScores));
                setScores(fetchedScores.slice(0, 5));

                // Count + fetch recent stories
                const storiesQ = query(collection(db, 'stories'), where('userId', '==', user.uid));
                const storiesSnap = await getDocs(storiesQ);
                setStoriesCount(storiesSnap.size);

                try {
                    const recentQ = query(
                        collection(db, 'stories'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc'),
                        limit(3)
                    );
                    const recentSnap = await getDocs(recentQ);
                    const rs: SavedStory[] = [];
                    recentSnap.forEach(d => rs.push({ id: d.id, ...d.data() } as SavedStory));
                    setRecentStories(rs);
                } catch {
                    // index may not exist yet — fall back to in-memory sort of already-fetched snap
                    const fallback: SavedStory[] = [];
                    storiesSnap.forEach(d => fallback.push({ id: d.id, ...d.data() } as SavedStory));
                    fallback.sort((a, b) => {
                        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                        return tb - ta;
                    });
                    setRecentStories(fallback.slice(0, 3));
                }

                // Count chat sessions
                const chatsQ = query(collection(db, 'chat_sessions'), where('userId', '==', user.uid));
                const chatsSnap = await getDocs(chatsQ);
                setChatSessionsCount(chatsSnap.size);

                // Count mock tests
                const mockTestQ = query(collection(db, 'practice_scores'), where('userId', '==', user.uid), where('examType', '==', 'mock-test'));
                const mockTestSnap = await getDocs(mockTestQ);
                setMockTestCount(mockTestSnap.size);

                // Load student memory (2s timeout, non-blocking)
                Promise.race([
                    getStudentMemory(user.uid),
                    new Promise<null>(resolve => setTimeout(() => resolve(null), 2000)),
                ]).then(mem => {
                    if (mem) {
                        setStudentMemory(mem);
                        setLearningGoal(mem.learningGoal);
                        setDailyTasks(generateDailyLearningGoals(mem));
                        setRevisionQueue(generateRevisionSchedule(mem));
                        setMentorNote(generateMotivationalGuidance(mem));
                        setSmartRevision(generateSmartRevisionPlan(mem));
                        setLearningPatterns(detectLearningPatterns(mem));
                        setJourneyDays(buildLearningJourney(mem));
                        setProgressInsights(generateProgressInsights(mem));
                    }
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                standard: formData.standard,
                school: formData.school,
                interests: formData.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i !== '')
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveGoal = async (goal: StudentMemory['learningGoal']) => {
        if (!user || savingGoal) return;
        setSavingGoal(true);
        setLearningGoal(goal);
        try {
            await updateDoc(doc(db, 'students_memory', user.uid), { learningGoal: goal });
            setStudentMemory(prev => prev ? { ...prev, learningGoal: goal } : prev);
        } catch (e) {
            console.warn('handleSaveGoal error:', e);
        } finally {
            setSavingGoal(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress and manage your profile</p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('home')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg"
                >
                    Continue Learning →
                </button>
            </div>

            {/* Streak + Improvement Banner */}
            {!isLoadingData && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                        <span className="text-lg">{streak > 0 ? '🔥' : '🌱'}</span>
                        <span className="font-black text-orange-700 dark:text-orange-300 text-sm">
                            {streak > 0 ? `${streak} day learning streak` : 'Start your streak today!'}
                        </span>
                    </div>
                    {improvingSubject && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                            <span className="font-bold text-green-700 dark:text-green-400 text-sm">📈 You're improving in {improvingSubject}!</span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Topics Studied</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : activities.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chat Sessions</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : chatSessionsCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400 flex-shrink-0">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stories Made</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : storiesCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg. Score</p>
                        {isLoadingData ? (
                            <p className="text-2xl font-black text-slate-900 dark:text-white">…</p>
                        ) : scores.length > 0 ? (() => {
                            const pct = Math.round((scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / scores.length) * 100);
                            const label = pct >= 70 ? '🎯 Great!' : pct >= 40 ? '📈 Improving!' : '💪 Keep going!';
                            return (
                                <>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{pct}%</p>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{label}</p>
                                </>
                            );
                        })() : (
                            <p className="text-2xl font-black text-slate-900 dark:text-white">N/A</p>
                        )}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl text-orange-600 dark:text-orange-400 flex-shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mock Tests</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : mockTestCount}</p>
                    </div>
                </div>
            </div>

            {/* Motivational footer */}
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 font-medium mb-8 -mt-2">
                Every question brings you closer to mastery ✨
            </p>

            {/* Learning Goal Selector */}
            {studentMemory && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Learning Goal</h2>
                        {savingGoal && <Loader2 className="w-4 h-4 animate-spin text-indigo-400 ml-auto" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {([null, '10th Board', '12th Board', 'NEET', 'JEE'] as StudentMemory['learningGoal'][]).map(goal => (
                            <button
                                key={String(goal)}
                                onClick={() => handleSaveGoal(goal)}
                                disabled={savingGoal}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                    learningGoal === goal
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                                }`}
                            >
                                {goal === null ? '🌱 Explore' : goal === 'NEET' ? '🩺 NEET' : goal === 'JEE' ? '⚙️ JEE' : goal === '10th Board' ? '📘 10th Board' : '📗 12th Board'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Exam Readiness Score */}
            {studentMemory && (() => {
                const score = generateExamReadiness(studentMemory);
                const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
                const label = score >= 70 ? 'Exam Ready 🎯' : score >= 40 ? 'Getting There 📈' : 'Needs Practice 💪';
                const insights = generateStudyInsights(studentMemory);
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Exam Readiness</h2>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-100 dark:text-slate-800" />
                                    <circle
                                        cx="18" cy="18" r="15.9" fill="none"
                                        stroke={color} strokeWidth="2.5"
                                        strokeDasharray={`${score} 100`} strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-black" style={{ color }}>{score}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white mb-1" style={{ color }}>{label}</p>
                                {insights.length > 0 && (
                                    <ul className="space-y-1">
                                        {insights.map((ins, i) => (
                                            <li key={i} className="text-xs text-slate-500 dark:text-slate-400">{ins}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Today's Learning Plan */}
            {studentMemory && dailyTasks.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Learning Plan</h2>
                        </div>
                        {mentorNote && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium max-w-[200px] text-right hidden sm:block">
                                {mentorNote}
                            </span>
                        )}
                    </div>
                    <div className="space-y-2">
                        {dailyTasks.map((task, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (task.mode === 'story') onNavigate('story');
                                    else if (task.mode === 'exam') onNavigate('exam-mock');
                                    else if (task.mode === 'game') onNavigate('game');
                                    else onNavigate('home');
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all text-left group"
                            >
                                <span className="text-lg flex-shrink-0">{task.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{task.text}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-600 capitalize">{task.mode} mode</p>
                                </div>
                                <span className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors text-sm font-bold">→</span>
                            </button>
                        ))}
                    </div>
                    {revisionQueue.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Revision Queue</p>
                            <div className="flex flex-wrap gap-2">
                                {revisionQueue.map((item, i) => (
                                    <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                        item.priority === 'urgent'
                                            ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                                    }`}>
                                        {item.priority === 'urgent' ? '🔴' : '🟡'} {item.topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Cross-Mode: What to do next */}
            {studentMemory && (() => {
                const suggestions = generateCrossModeSuggestions(studentMemory);
                if (!suggestions.length) return null;
                const modeConfig: Record<string, { emoji: string; color: string; bg: string; route: string }> = {
                    chat:  { emoji: '💬', color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  route: '/' },
                    story: { emoji: '✨', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', route: '/story' },
                    exam:  { emoji: '📝', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', route: '/exam-mock' },
                    game:  { emoji: '🎮', color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  route: '/game' },
                };
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-purple-500" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">What to do next</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {suggestions.map((s, i) => {
                                const cfg = modeConfig[s.mode] || modeConfig.chat;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => onNavigate(s.route === '/' ? 'home' : s.mode === 'exam' ? 'exam-mock' : s.mode)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                                        style={{ background: cfg.bg }}
                                    >
                                        <span className="text-xl">{cfg.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: cfg.color }}>{s.action}</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{s.topic}</p>
                                        </div>
                                        <span className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 transition-colors text-lg">→</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Recent Stories */}
            {!isLoadingData && (recentStories.length > 0) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                            Recent Stories
                        </h2>
                        <button
                            onClick={() => onNavigate('my-stories')}
                            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            View All Stories →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {recentStories.map(story => (
                            <button
                                key={story.id}
                                type="button"
                                onClick={() => setSelectedStory(story)}
                                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-violet-400 dark:hover:border-violet-600 hover:scale-[1.02] transition-all group cursor-pointer"
                            >
                                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5">
                                    {story.language}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {story.title}
                                </p>
                                {story.content && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                        {story.content.slice(0, 80)}…
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 dark:text-slate-600">
                                    {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleDateString() : ''}
                                </p>
                                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-2 group-hover:translate-x-0.5 transition-transform">
                                    Read →
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Smart Revision Engine */}
            {smartRevision.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🔁</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Revision Plan</h2>
                    </div>
                    <div className="space-y-2">
                        {smartRevision.map((item, i) => {
                            const priorityStyle = item.priority === 'HIGH'
                                ? { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', badge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' }
                                : item.priority === 'MEDIUM'
                                ? { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' }
                                : { bg: 'bg-slate-50 dark:bg-slate-800/40', border: 'border-slate-200 dark:border-slate-800', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' };
                            return (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${priorityStyle.bg} ${priorityStyle.border}`}>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${priorityStyle.badge}`}>
                                        {item.priority}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.topic}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{item.reason}</p>
                                        {item.improvementNote && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">{item.improvementNote}</p>
                                        )}
                                        {item.daysSinceLastStudy && (
                                            <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{item.daysSinceLastStudy} days since last study</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onNavigate('exam-mock')}
                                        className="flex-shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Practice →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Learning Pattern Detection */}
            {learningPatterns.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🧠</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Learning Patterns</h2>
                    </div>
                    <div className="space-y-3">
                        {learningPatterns.map((p, i) => {
                            const typeConfig = {
                                strength:    { dot: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
                                opportunity: { dot: 'bg-amber-400',   text: 'text-amber-700 dark:text-amber-400' },
                                habit:       { dot: 'bg-blue-400',    text: 'text-blue-700 dark:text-blue-400' },
                                curiosity:   { dot: 'bg-purple-400',  text: 'text-purple-700 dark:text-purple-400' },
                            }[p.type];
                            return (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${typeConfig.dot}`} />
                                    <p className={`text-sm ${typeConfig.text} leading-snug`}>{p.observation}</p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                        Patterns are based on your recent activity and update as you learn.
                    </p>
                </div>
            )}

            {/* Learning Journey Timeline */}
            {journeyDays.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🗓️</span>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Learning Journey</h2>
                        </div>
                        {progressInsights.length > 0 && (
                            <div className="flex gap-2 flex-wrap justify-end">
                                {progressInsights.slice(0, 3).map((ins, i) => (
                                    <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        ins.trend === 'improving'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                            : ins.trend === 'needs-revision'
                                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {ins.trend === 'improving' ? '📈' : ins.trend === 'needs-revision' ? '⚡' : '→'} {ins.note}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-6">
                            {journeyDays.map((day, di) => (
                                <div key={day.dateKey} className="relative pl-10">
                                    {/* Day dot */}
                                    <div className="absolute left-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border-2 border-indigo-300 dark:border-indigo-800 flex items-center justify-center text-xs">
                                        {di === 0 ? '📍' : '·'}
                                    </div>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">{day.dateLabel}</p>
                                    <div className="space-y-1.5">
                                        {day.entries.map((entry, ei) => (
                                            <div key={ei} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <span className="text-base flex-shrink-0">{entry.icon}</span>
                                                <span>{entry.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-16 mb-4">
                                <img 
                                    src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover bg-white"
                                />
                                <div className="absolute bottom-2 right-2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></div>
                            </div>
                            
                            {!isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userProfile?.displayName || user?.displayName}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <GraduationCap className="w-5 h-5 text-indigo-500" />
                                            <span>Standard: {userProfile?.standard || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <School className="w-5 h-5 text-indigo-500" />
                                            <span>School: {userProfile?.school || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <Heart className="w-5 h-5 text-indigo-500" />
                                            <span className="line-clamp-1">Interests: {userProfile?.interests?.join(', ') || 'Not set'}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full mt-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-xl transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Standard / Grade</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 10th Standard"
                                            value={formData.standard}
                                            onChange={(e) => setFormData({...formData, standard: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">School Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. KV School"
                                            value={formData.school}
                                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Interests (comma separated)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Science, Space, History"
                                            value={formData.interests}
                                            onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Recent Practice Scores */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Award className="w-6 h-6 text-emerald-600" />
                            Recent Practice Scores
                        </h2>
                        {isLoadingData ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : scores.length > 0 ? (
                            <div className="space-y-4">
                                {scores.map((score) => (
                                    <div key={score.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{score.topic}</p>
                                            <p className="text-xs text-slate-500">{score.subject}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black rounded-full">
                                                {score.score} / {score.total}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p className="font-medium">Take your first mock test! 🎯</p>
                                <button onClick={() => onNavigate('exam-mock')} className="text-indigo-600 font-bold mt-2 hover:underline">Start a mock test</button>
                            </div>
                        )}
                    </div>

                    {/* Study History */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Activity className="w-6 h-6 text-blue-600" />
                            Recently Studied Topics
                        </h2>
                        {isLoadingData ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className={`p-2 rounded-lg ${activity.type === 'exam' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {activity.type === 'exam' ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{activity.topic}</p>
                                            <p className="text-xs text-slate-500">{activity.subject} • {activity.type === 'exam' ? 'Exam Prep' : 'Concept Learning'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p className="font-medium">Ask me anything about your Samacheer syllabus! 🎓</p>
                                <button onClick={() => onNavigate('home')} className="text-indigo-600 font-bold mt-2 hover:underline">Start learning</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Story modal */}
            {selectedStory && (
                <div
                    onClick={() => setSelectedStory(null)}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-[700px] max-h-[90vh] bg-white dark:bg-[#0d0d1c] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-indigo-900/40"
                    >
                        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
                                    <span>{selectedStory.language}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{selectedStory.createdAt?.toDate ? selectedStory.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedStory.title}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Topic: {selectedStory.topic}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStory(null)}
                                aria-label="Close"
                                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedStory.content ? (
                                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {selectedStory.content}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Story content unavailable for this entry.</p>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <button
                                onClick={() => onNavigate('my-stories')}
                                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
                            >
                                View All Stories →
                            </button>
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;

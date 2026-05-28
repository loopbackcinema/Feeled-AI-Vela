import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateRecentMode, updateExamPerformance } from '../services/memoryService';
import { canUseFeature, incrementUsage } from '../services/subscriptionService';
import { useSubscription } from '../context/SubscriptionContext';

interface QuestionOption {
    a: string;
    b: string;
    c: string;
    d: string;
}

interface ExamQuestion {
    id: string;
    questionNumber: number;
    part: string;
    questionType: 'MCQ' | 'Short Answer' | 'Long Answer';
    marks: number;
    question: string;
    options?: QuestionOption;
    correctAnswer?: string;
    sourceYear: string;
    subject: string;
    chapter: string;
}

interface ExamResult {
    questionId: string;
    userAnswer: string;
    correct: boolean;
    explanation?: string;
    loadingExplanation?: boolean;
}

type Phase = 'setup' | 'loading' | 'test' | 'results';

const SUBJECTS = ['Mathematics', 'Science', 'Social Science'];

const LOADING_STEPS = [
    '🔍 Searching question bank...',
    '📋 Selecting 10 questions...',
    '✅ Preparing your test...',
];

const SESSION_KEY = 'feeled_exam_session';

export default function ExamMock() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPlus, dailyUsage, showUpgrade } = useSubscription();

    // Setup state
    const [subject, setSubject] = useState('Mathematics');
    const [chapter, setChapter] = useState('');
    const [phase, setPhase] = useState<Phase>('setup');
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState('');

    // Test state
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [totalMarks, setTotalMarks] = useState(16);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [visited, setVisited] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(900);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Results state
    const [results, setResults] = useState<Record<string, ExamResult>>({});
    const [openQ, setOpenQ] = useState<string | null>(null);
    const [prevScore, setPrevScore] = useState<{pct:number;timestamp:number}|null>(null);
    const [showReview, setShowReview] = useState(false);

    // Restore session
    useEffect(() => {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
            try {
                const session = JSON.parse(saved);
                if (session.phase === 'test' && session.questions?.length) {
                    setQuestions(session.questions);
                    setAnswers(session.answers || {});
                    setVisited(new Set(session.visited || []));
                    setTimeLeft(session.timeLeft || 900);
                    setTotalMarks(session.totalMarks || 16);
                    setSubject(session.subject || 'Mathematics');
                    setChapter(session.chapter || '');
                    setPhase('test');
                }
            } catch { /* ignore */ }
        }
    }, []);

    // Save session
    useEffect(() => {
        if (phase === 'test') {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                phase, questions, answers, visited: [...visited], timeLeft, totalMarks, subject, chapter
            }));
        }
    }, [answers, visited, timeLeft, phase]);

    // Timer
    useEffect(() => {
        if (phase !== 'test') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [phase]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const startExam = async () => {
        if (!chapter.trim()) { setError('Please enter a chapter name'); return; }
        if (user) {
            const { allowed } = await canUseFeature(user.uid, 'exams');
            if (!allowed) { showUpgrade('exams'); return; }
            incrementUsage(user.uid, 'exams').catch(() => {});
        }
        setError('');
        setPhase('loading');
        // Fire-and-forget mode tracking
        if (user) updateRecentMode({ uid: user.uid, mode: 'exam' });
        setLoadingStep(0);

        const stepInterval = setInterval(() => {
            setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
        }, 1200);

        try {
            const res = await fetch('/api/exam-unified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mock', subject, chapter, grade: '10' }),
            });
            clearInterval(stepInterval);

            if (!res.ok) throw new Error('Failed to load questions');
            const data = await res.json();

            if (!data.questions?.length) throw new Error('No questions found for this chapter. Try a different chapter name.');

            setQuestions(data.questions);
            setTotalMarks(data.totalMarks || 16);
            setTimeLeft(900);
            setCurrentQ(0);
            setAnswers({});
            setVisited(new Set([0]));
            setPhase('test');
        } catch (err: any) {
            clearInterval(stepInterval);
            setError(err.message || 'Something went wrong. Please try again.');
            setPhase('setup');
        }
    };

    const handleAnswer = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const goToQuestion = (idx: number) => {
        setCurrentQ(idx);
        setVisited(prev => new Set([...prev, idx]));
    };

    const handleSubmit = async (auto = false) => {
        clearInterval(timerRef.current!);
        localStorage.removeItem(SESSION_KEY);
        // Save prev score before overwriting
        const scoreKey = `feeled_exam_${subject}_${chapter}`;
        const savedPrev = localStorage.getItem(scoreKey);
        setPrevScore(savedPrev ? JSON.parse(savedPrev) : null);

        const newResults: Record<string, ExamResult> = {};
        for (const q of questions) {
            const userAnswer = answers[q.id] || '';
            let correct = false;
            if (q.questionType === 'MCQ' && q.correctAnswer) {
                correct = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            }
            newResults[q.id] = { questionId: q.id, userAnswer, correct };
        }
        setResults(newResults);
        setPhase('results');
        setShowReview(false);
        const mcqTot = questions.filter(q => q.questionType === 'MCQ').length;
        const mcqC = questions.filter(q => q.questionType === 'MCQ' && newResults[q.id]?.correct).length;
        const newPct = Math.round((mcqC / Math.max(mcqTot, 1)) * 100);
        localStorage.setItem(`feeled_exam_${subject}_${chapter}`, JSON.stringify({ pct: newPct, timestamp: Date.now() }));

        console.log('[exam] user:', user?.uid, 'questions:', questions.length);
        if (user) {
            try {
                const mcqQuestions = questions.filter(q => q.questionType === 'MCQ');
                const mcqCorrect = mcqQuestions.filter(q => newResults[q.id]?.correct).length;
                await addDoc(collection(db, 'practice_scores'), {
                    userId: user.uid,
                    topic: chapter,
                    subject,
                    score: mcqCorrect,
                    total: mcqQuestions.length,
                    examType: 'mock-test',
                    grade: '10',
                    createdAt: serverTimestamp(),
                });
                await addDoc(collection(db, 'study_activity'), {
                    userId: user.uid,
                    type: 'exam',
                    topic: chapter,
                    subject,
                    createdAt: serverTimestamp(),
                });
                // Memory engine — fire-and-forget
                updateExamPerformance({
                    uid:     user.uid,
                    chapter,
                    subject,
                    score:   mcqCorrect,
                    total:   mcqQuestions.length || 1,
                });
            } catch (err) {
                console.error('Failed to save exam score:', err);
            }
        }
    };

    const loadExplanation = async (q: ExamQuestion) => {
        setResults(prev => ({ ...prev, [q.id]: { ...prev[q.id], loadingExplanation: true } }));
        try {
            const res = await fetch('/api/exam-unified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'explain',
                    question: q.question,
                    userAnswer: answers[q.id] || '',
                    correctAnswer: q.correctAnswer || '',
                    subject: q.subject,
                    questionType: q.questionType,
                }),
            });
            const data = await res.json();
            setResults(prev => ({
                ...prev,
                [q.id]: { ...prev[q.id], explanation: data.explanation, loadingExplanation: false }
            }));
        } catch {
            setResults(prev => ({
                ...prev,
                [q.id]: { ...prev[q.id], explanation: 'Could not load explanation.', loadingExplanation: false }
            }));
        }
    };

    const getScore = () => {
        const correct = Object.values(results).filter(r => r.correct).length;
        const mcqCorrect = questions.filter(q => q.questionType === 'MCQ' && results[q.id]?.correct).length;
        const marksEarned = questions
            .filter(q => results[q.id]?.correct)
            .reduce((s, q) => s + q.marks, 0);
        return { correct, mcqCorrect, marksEarned };
    };

    const getExamGrade = (pct: number) => {
        if (pct >= 90) return { grade:'A+', emoji:'🏆', color:'#22c55e', msg:'Outstanding! You have mastered this topic.' };
        if (pct >= 75) return { grade:'A',  emoji:'🌟', color:'#10b981', msg:"Excellent work! A little more practice and you'll be perfect." };
        if (pct >= 60) return { grade:'B',  emoji:'👍', color:'#3b82f6', msg:'Good effort! Focus on the questions you missed.' };
        if (pct >= 40) return { grade:'C',  emoji:'💪', color:'#f59e0b', msg:'Keep going! Review the concepts and try again.' };
        return              { grade:'D',  emoji:'🌱', color:'#ef4444', msg:'Every expert was once a beginner. Review and retry!' };
    };

    const getPerformanceBadge = (pct: number) => {
        if (pct >= 80) return { text: 'Excellent! 🌟', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200' };
        if (pct >= 60) return { text: 'Good Work! 👍', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200' };
        if (pct >= 40) return { text: 'Keep Practicing! 💪', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200' };
        return { text: 'Need Revision 📚', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200' };
    };

    const allVisited = visited.size >= questions.length;

    // ── SETUP ──────────────────────────────────────────────────────────────────
    if (phase === 'setup' || phase === 'loading') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Back */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-medium mb-8 transition-colors">
                        ← Back to Home
                    </button>

                    {/* Header */}
                    <div className="text-center mb-10 space-y-3">
                        <span className="px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-widest border border-orange-100 dark:border-orange-800">
                            📝 Exam Mode
                        </span>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Chapter Mock Test
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Real questions from TN Board 2021–2026 papers
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6">

                        {phase === 'loading' ? (
                            <div className="py-4 space-y-4">
                                <p className="text-center text-sm font-black text-indigo-600 dark:text-indigo-400 animate-pulse mb-2">
                                    {LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)]}
                                </p>
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="animate-pulse space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <div className="flex gap-2 mb-1">
                                            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <div className="h-5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        </div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                                        {i === 0 && (
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                {[0, 1, 2, 3].map(j => (
                                                    <div key={j} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm font-bold">
                                        ⚠️ {error}
                                    </div>
                                )}

                                {/* Subject */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject</label>
                                    <select
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all appearance-none"
                                    >
                                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Chapter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Chapter / Topic</label>
                                    <input
                                        type="text"
                                        value={chapter}
                                        onChange={e => setChapter(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && startExam()}
                                        placeholder="e.g., Algebra, Electricity, French Revolution..."
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all placeholder-slate-300 dark:placeholder-slate-600"
                                    />
                                </div>

                                {/* Grade badge */}
                                <div className="flex items-center gap-2">
                                    <span className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-100 dark:border-indigo-800">
                                        Grade 10 — TN Samacheer
                                    </span>
                                </div>

                                {/* Start button */}
                                <button
                                    onClick={startExam}
                                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg tracking-tight transition-all active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3"
                                >
                                    Start Mock Test →
                                </button>
                                {user && !isPlus && <p className="text-center text-xs text-slate-400 dark:text-slate-600">{Math.max(0, 2 - (dailyUsage?.exams || 0))} of 2 free mock tests remaining today</p>}
                            </>
                        )}
                    </div>

                    {/* Info cards */}
                    {phase === 'setup' && (
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[
                                { icon: '📚', title: 'Real Papers', desc: 'From actual TN Board exams' },
                                { icon: '⏱️', title: '15 Minutes', desc: 'Timed like a real exam' },
                                { icon: '💡', title: 'AI Explanations', desc: 'Understand every mistake' },
                            ].map((c, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center space-y-2">
                                    <div className="text-2xl">{c.icon}</div>
                                    <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-tight">{c.title}</p>
                                    <p className="text-slate-400 text-xs">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── TEST ──────────────────────────────────────────────────────────────────
    if (phase === 'test' && questions.length > 0) {
        const q = questions[currentQ];
        const isRed = timeLeft < 180;

        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
                {/* Sticky top bar */}
                <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                    <div className="max-w-2xl mx-auto flex items-center gap-3">
                        {/* Subject + Chapter */}
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-black text-slate-400 uppercase">{subject}</span>
                            <span className="text-slate-200 dark:text-slate-700">·</span>
                            <span className="text-xs font-bold text-slate-500 truncate max-w-[100px]">{chapter}</span>
                        </div>

                        {/* Question palette */}
                        <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToQuestion(i)}
                                    className={`w-7 h-7 rounded-full text-xs font-black transition-all ${i === currentQ ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : answers[questions[i].id] ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Timer */}
                        <div className={`flex-shrink-0 font-black text-sm px-3 py-1.5 rounded-xl border-2 ${isRed ? 'text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20 animate-pulse' : 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="flex-1 flex flex-col items-center px-4 py-8 pb-24 md:pb-8">
                    <div className="w-full max-w-2xl space-y-6">
                        {/* Question card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-100 dark:border-indigo-800">
                                    {q.part}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-black border border-slate-100 dark:border-slate-700">
                                    {q.marks} mark{q.marks > 1 ? 's' : ''}
                                </span>
                                {q.sourceYear && (
                                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-100 dark:border-amber-800">
                                        {q.sourceYear} Paper
                                    </span>
                                )}
                            </div>

                            {/* Question text */}
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                                {currentQ + 1}. {q.question}
                            </p>

                            {/* MCQ options */}
                            {q.questionType === 'MCQ' && q.options && (
                                <div className="grid gap-3">
                                    {(Object.entries(q.options) as [string, string][]).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleAnswer(q.id, key)}
                                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold text-sm transition-all ${answers[q.id] === key ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                        >
                                            <span className="font-black mr-2">({key})</span> {val}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Short / Long answer */}
                            {q.questionType !== 'MCQ' && (
                                <textarea
                                    value={answers[q.id] || ''}
                                    onChange={e => handleAnswer(q.id, e.target.value)}
                                    placeholder="Write your answer here..."
                                    rows={q.questionType === 'Long Answer' ? 6 : 3}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-300 dark:placeholder-slate-600"
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => goToQuestion(currentQ - 1)}
                                disabled={currentQ === 0}
                                className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-sm hover:border-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>

                            <span className="text-sm font-black text-slate-400">
                                {currentQ + 1} / {questions.length}
                            </span>

                            <button
                                onClick={() => goToQuestion(currentQ + 1)}
                                disabled={currentQ === questions.length - 1}
                                className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-sm hover:border-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>

                        {/* Submit */}
                        {allVisited && (
                            <button
                                onClick={() => handleSubmit(false)}
                                className="w-full py-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-lg tracking-tight transition-all active:scale-95 shadow-xl shadow-orange-200 dark:shadow-none animate-fade-in"
                            >
                                Submit Test 🎯
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── RESULTS ───────────────────────────────────────────────────────────────
    if (phase === 'results') {
        const { mcqCorrect, marksEarned } = getScore();
        const mcqTotal = questions.filter(q => q.questionType === 'MCQ').length;
        const pct = Math.round((mcqCorrect / Math.max(mcqTotal, 1)) * 100);
        const examGrade = getExamGrade(pct);
        const isFirstAttempt = !prevScore;
        const improved = prevScore && pct > prevScore.pct;
        const weakAreas = questions
            .filter(q => q.questionType === 'MCQ' && !results[q.id]?.correct)
            .map(q => q.chapter || subject)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 2);

        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 pb-24 pt-8">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* Score card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl shadow-slate-200/20 dark:shadow-none space-y-4">
                        {/* Encouragement banner */}
                        {(isFirstAttempt || improved) && (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                                {isFirstAttempt ? '🎯 Great first attempt!' : '📈 You improved from last time!'}
                            </div>
                        )}
                        {/* Grade badge */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-6xl animate-bounce">{examGrade.emoji}</div>
                            <div className="text-5xl font-black" style={{ color: examGrade.color }}>{examGrade.grade}</div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xs">{examGrade.msg}</p>
                        </div>
                        {/* Score bar */}
                        <div className="space-y-2">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{mcqCorrect} / {mcqTotal} correct</p>
                            <p className="text-sm text-slate-400">{marksEarned} / {totalMarks} marks · {pct}%</p>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: examGrade.color }} />
                            </div>
                        </div>
                        {/* Mentor tip */}
                        {weakAreas.length > 0 && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                💡 Focus on: <span className="font-bold text-amber-600 dark:text-amber-400">{weakAreas.join(', ')}</span>
                            </p>
                        )}
                        <p className="text-xs text-slate-400">{subject} · {chapter}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowReview(v => !v)}
                            className="py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm transition-all hover:border-indigo-300"
                        >
                            {showReview ? '▲ Hide Review' : '📖 Review Answers'}
                        </button>
                        <button
                            onClick={() => { setPhase('setup'); setChapter(''); setQuestions([]); setResults({}); setShowReview(false); }}
                            className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all active:scale-95"
                        >
                            🔄 Retry Test
                        </button>
                        <button
                            onClick={() => navigate('/generator', { state: { prefillTopic: chapter || subject } })}
                            className="py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm transition-all active:scale-95"
                        >
                            ✨ Story on This Topic
                        </button>
                        <button
                            onClick={() => navigate('/', { state: { prefilledMessage: `Explain ${chapter || subject} — I struggled with it in my mock test` } })}
                            className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all active:scale-95"
                        >
                            💬 Ask AI to Explain
                        </button>
                    </div>

                    {/* Question review (collapsible) */}
                    {showReview && <div className="space-y-4">
                        <h3 className="font-black text-slate-800 dark:text-white text-lg">Question Review</h3>
                        {questions.map(q => {
                            const r = results[q.id];
                            const isOpen = openQ === q.id;
                            return (
                                <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <button
                                        onClick={() => setOpenQ(isOpen ? null : q.id)}
                                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <span className="text-lg flex-shrink-0">{q.questionType === 'MCQ' ? (r?.correct ? '✅' : '❌') : '📝'}</span>
                                        <p className="flex-1 font-bold text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{q.questionNumber}. {q.question}</p>
                                        <span className="text-slate-400 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                            {q.questionType === 'MCQ' ? (
                                                <>
                                                    <p className="text-sm"><span className="font-black text-slate-500">Your answer:</span> <span className={r?.correct ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{r?.userAnswer || '(not answered)'}</span></p>
                                                    <p className="text-sm"><span className="font-black text-slate-500">Correct:</span> <span className="text-green-600 font-bold">{q.correctAnswer || 'See textbook'}</span></p>
                                                </>
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                                    <p className="text-xs font-black text-slate-400 mb-1">Your answer:</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{r?.userAnswer || '(not answered)'}</p>
                                                </div>
                                            )}

                                            {((!r?.correct && q.questionType === 'MCQ') || q.questionType !== 'MCQ') && (
                                                r?.explanation ? (
                                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                                        <p className="text-xs font-black text-indigo-600 mb-1">💡 Explanation</p>
                                                        <p className="text-sm text-indigo-800 dark:text-indigo-300">{r.explanation}</p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => loadExplanation(q)}
                                                        disabled={r?.loadingExplanation}
                                                        className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {r?.loadingExplanation ? (
                                                            <><span className="animate-spin">⏳</span> Loading...</>
                                                        ) : '💡 Load Explanation'}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>}

                </div>
            </div>
        );
    }

    return null;
}

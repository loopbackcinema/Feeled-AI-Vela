import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
        setError('');
        setPhase('loading');
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

    const handleSubmit = (auto = false) => {
        clearInterval(timerRef.current!);
        localStorage.removeItem(SESSION_KEY);

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
                            <div className="py-8 space-y-6">
                                {LOADING_STEPS.map((step, i) => (
                                    <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${i < loadingStep ? 'bg-green-100 dark:bg-green-900/30' : i === loadingStep ? 'bg-indigo-100 dark:bg-indigo-900/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            {i < loadingStep ? '✅' : i === loadingStep ? '⏳' : (i + 1)}
                                        </div>
                                        <p className={`font-bold text-sm ${i === loadingStep ? 'text-indigo-700 dark:text-indigo-300' : i < loadingStep ? 'text-slate-400 line-through' : 'text-slate-400'}`}>
                                            {step}
                                        </p>
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
                <div className="flex-1 flex flex-col items-center px-4 py-8">
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
        const pct = Math.round((mcqCorrect / Math.max(questions.filter(q => q.questionType === 'MCQ').length, 1)) * 100);
        const badge = getPerformanceBadge(pct);

        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Score card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xl shadow-slate-200/20 dark:shadow-none space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white">{marksEarned} / {totalMarks} marks</h2>
                        <span className={`inline-block px-6 py-2 rounded-full border-2 font-black text-lg ${badge.color}`}>
                            {badge.text}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 font-bold">
                            MCQ: {mcqCorrect} / {questions.filter(q => q.questionType === 'MCQ').length} correct
                        </p>
                        <p className="text-xs text-slate-400">{subject} · {chapter}</p>
                    </div>

                    {/* Question review */}
                    <div className="space-y-4">
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
                    </div>

                    {/* Weak area suggestion */}
                    {pct < 60 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 space-y-3">
                            <p className="font-black text-amber-800 dark:text-amber-300">💡 We suggest reviewing <span className="underline">{chapter}</span> in Story Mode</p>
                            <button
                                onClick={() => navigate('/generator')}
                                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm transition-all active:scale-95"
                            >
                                📖 Open Story Mode
                            </button>
                        </div>
                    )}

                    {/* Bottom buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setPhase('setup'); setChapter(''); setQuestions([]); setResults({}); }}
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all active:scale-95"
                        >
                            Try Another Chapter
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-sm transition-all active:scale-95"
                        >
                            🏠 Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

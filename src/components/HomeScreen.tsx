import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, BookOpen, Flame, Headphones, ChevronRight, Loader2, Target } from 'lucide-react';
import { StudentContext } from '../types';
import SkeletonLoader from './SkeletonLoader';

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface HomeScreenProps {
    onAskQuestion: (question: string, context: StudentContext) => void;
    onExamMode: (topic: string, context: StudentContext) => void;
    onLearnWithStory: () => void;
    isLoading: boolean;
    error?: string | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAskQuestion, onExamMode, onLearnWithStory, isLoading, error }) => {
    const [question, setQuestion] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSttLoading, setIsSttLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [context, setContext] = useState<StudentContext>({
        board: 'Tamil Nadu State Board (Samacheer)',
        standard: '10th',
        subject: 'Science',
        language: 'English',
        learningMode: 'Senior',
        goal: 'Exam'
    });

    // Dynamic Standards and Subjects Logic
    const isJunior = context.learningMode === 'Junior';
    const standards = isJunior 
        ? ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th']
        : ['8th', '9th', '10th', '11th', '12th'];

    const subjects = isJunior
        ? ['EVS', 'Maths', 'English', 'Tamil', 'GK']
        : (context.standard === '11th' || context.standard === '12th'
            ? ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology']
            : ['Tamil', 'English', 'Maths', 'Science', 'Social Science']);

    // Reset standard and subject if mode changes
    useEffect(() => {
        setContext(prev => ({ 
            ...prev, 
            standard: isJunior ? '1st' : '10th',
            subject: isJunior ? 'EVS' : (prev.standard === '11th' || prev.standard === '12th' ? 'Physics' : 'Science')
        }));
    }, [context.learningMode]);

    // Reset subject if standard changes and current subject is not in the new list
    useEffect(() => {
        if (!subjects.includes(context.subject)) {
            setContext(prev => ({ ...prev, subject: subjects[0] }));
        }
    }, [context.standard, subjects, context.subject]);

    const handleAsk = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim()) {
            onAskQuestion(question, context);
        }
    };

    const handleExamClick = () => {
        const topicToSearch = question.trim() ? question : context.subject;
        onExamMode(topicToSearch, context);
    };

    const handleVoiceInput = async () => {
        // If already recording, stop
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
                            languageCode: context.language === 'Tamil' ? 'ta-IN' : 'en-IN',
                        }),
                    });
                    const data = await res.json();
                    if (data.transcript) setQuestion(data.transcript);
                } catch (err) {
                    console.error('STT error:', err);
                } finally {
                    setIsSttLoading(false);
                }
            };

            mediaRecorderRef.current = recorder;
            setIsListening(true);
            recorder.start();
            // Auto-stop after 8 seconds
            setTimeout(() => {
                if (recorder.state === 'recording') recorder.stop();
            }, 8000);
        } catch {
            alert('Could not access microphone. Please allow microphone permissions and try again.');
        }
    };

    if (isLoading) {
        return <SkeletonLoader question={question || undefined} />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                    FeelEd <span className="text-indigo-600">AI</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                    Ask anything. Learn in your language. Understand with stories.
                </p>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                    <span className="text-xl">⚠️</span> {error}
                </div>
            )}

            {/* Mode Selectors */}
            <div className="flex flex-col items-center gap-6 mb-12">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
                    <button 
                        onClick={() => setContext({...context, learningMode: 'Junior'})}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${context.learningMode === 'Junior' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <span className="text-lg">🌱</span> Junior (1-7)
                    </button>
                    <button 
                        onClick={() => setContext({...context, learningMode: 'Senior'})}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${context.learningMode === 'Senior' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <span className="text-lg">🚀</span> Senior (8-12)
                    </button>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
                    <button 
                        onClick={() => setContext({...context, goal: 'Deep Learning'})}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${context.goal === 'Deep Learning' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <BookOpen className="w-4 h-4" /> Deep Learning
                    </button>
                    <button 
                        onClick={() => setContext({...context, goal: 'Exam'})}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${context.goal === 'Exam' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <Target className="w-4 h-4" /> Exam Prep
                    </button>
                </div>
            </div>

            {/* Context Selectors */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <select 
                    value={context.board}
                    onChange={(e) => setContext({...context, board: e.target.value})}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="Tamil Nadu State Board (Samacheer)">Tamil Nadu State Board (Samacheer)</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                </select>
                <select 
                    value={context.standard}
                    onChange={(e) => setContext({...context, standard: e.target.value})}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                    {standards.map(std => (
                        <option key={std} value={std}>{std} Std</option>
                    ))}
                </select>
                <select 
                    value={context.subject}
                    onChange={(e) => setContext({...context, subject: e.target.value})}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                    {subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
                <select 
                    value={context.language}
                    onChange={(e) => setContext({...context, language: e.target.value})}
                    className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2 text-sm font-bold text-indigo-700 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="English">English</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleAsk} className="relative max-w-2xl mx-auto mb-4">
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question or enter a topic... (e.g., Photosynthesis)"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full py-4 pl-12 pr-24 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all shadow-sm text-slate-900 dark:text-white"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2">
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 text-white px-6 py-2 rounded-full font-bold transition-colors"
                        >
                            Ask
                        </button>
                    </div>
                </div>
            </form>

            {/* Prominent voice input */}
            <div className="flex items-center justify-center gap-3 mb-10">
                <div className="h-px w-16 bg-slate-200 dark:bg-slate-700" />
                <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isSttLoading}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                        isListening
                            ? 'bg-red-500 text-white ring-4 ring-red-100 dark:ring-red-900/40 animate-pulse'
                            : isSttLoading
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                    {isSttLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Mic className="w-4 h-4" />
                    }
                    {isListening
                        ? 'Listening... tap to stop'
                        : isSttLoading
                        ? 'Processing...'
                        : 'Speak in Tamil or English'
                    }
                </button>
                <div className="h-px w-16 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-2">
                <button 
                    type="button"
                    onClick={handleExamClick}
                    className="flex items-center justify-between p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl hover:shadow-md transition-all group text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                            <Flame className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Exam Tomorrow?</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Type a topic above and click here!</p>
                        </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={onLearnWithStory}
                    className="flex items-center justify-between p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl hover:shadow-md transition-all group text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Headphones className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Learn with Story</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Understand concepts through emotional stories</p>
                        </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Syllabus Roadmap / Trending Topics */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    {context.learningMode === 'Junior' ? "Fun Topics to Explore" : "Syllabus Roadmap"} ({context.subject})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(context.learningMode === 'Junior' 
                        ? ['The Magic of Water', 'Our Animal Friends', 'The Solar System', 'Healthy Habits']
                        : ['Core Concepts', 'Important Formulas', 'Previous Year Questions', 'Revision Strategy']
                    ).map((topic) => (
                        <div 
                            key={topic} 
                            onClick={() => { setQuestion(topic); onAskQuestion(topic, context); }}
                            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                            <span className="font-medium text-slate-700 dark:text-slate-300">{topic}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;

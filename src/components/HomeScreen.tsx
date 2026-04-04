import React, { useState, useEffect } from 'react';
import { Search, Mic, BookOpen, Flame, Headphones, ChevronRight, Loader2 } from 'lucide-react';
import { StudentContext } from '../types';

interface HomeScreenProps {
    onAskQuestion: (question: string, context: StudentContext) => void;
    onExamMode: (topic: string, context: StudentContext) => void;
    onLearnWithStory: () => void;
    isLoading: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAskQuestion, onExamMode, onLearnWithStory, isLoading }) => {
    const [question, setQuestion] = useState('');
    const [context, setContext] = useState<StudentContext>({
        board: 'Tamil Nadu State Board (Samacheer)',
        standard: '10th',
        subject: 'Science',
        language: 'English'
    });

    // Dynamic Subjects Logic
    const isHigherSecondary = context.standard === '11th' || context.standard === '12th';
    const subjects = isHigherSecondary 
        ? ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology']
        : ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];

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

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input is not supported in your browser. Please use Chrome.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = context.language === 'Tamil' ? 'ta-IN' : 'en-US';
        recognition.onstart = () => {
            // Optional: Add visual feedback for listening
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            alert("Could not hear you properly. Please try again.");
        };
        recognition.start();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                    Your AI Study Companion
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Ask questions, prepare for exams, or learn through stories.
                </p>
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
                    <option value="8th">8th Std</option>
                    <option value="9th">9th Std</option>
                    <option value="10th">10th Std</option>
                    <option value="11th">11th Std</option>
                    <option value="12th">12th Std</option>
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
            <form onSubmit={handleAsk} className="relative max-w-2xl mx-auto mb-12">
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                        <Search className="w-6 h-6" />
                    </div>
                    <input 
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter a topic or ask a question... (e.g., Photosynthesis)"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full py-4 pl-14 pr-32 text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all shadow-sm"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={handleVoiceInput}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ask'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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

            {/* Chapter List Placeholder */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Chapters ({context.subject})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Chapter {num}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;

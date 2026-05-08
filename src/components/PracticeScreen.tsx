import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeQuestion } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PracticeScreenProps {
    questions: PracticeQuestion[];
    topic: string;
    subject: string;
    onBack: () => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ questions, topic, subject, onBack }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [mcqCount, setMcqCount] = useState(0);

    useEffect(() => {
        setMcqCount(questions.filter(q => q.type === 'mcq').length);
    }, [questions]);

    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    const handleNext = async () => {
        if (!isLast) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
            setSelectedOption(null);
        } else {
            // Save score to Firestore on finish
            if (user) {
                try {
                    await addDoc(collection(db, 'practice_scores'), {
                        userId: user.uid,
                        topic,
                        subject,
                        score,
                        total: mcqCount,
                        createdAt: serverTimestamp()
                    });
                } catch (e) {
                    console.error("Failed to save practice score:", e);
                }
            }
            onBack();
        }
    };

    const handleOptionClick = (option: string) => {
        if (showAnswer) return;
        setSelectedOption(option);
        setShowAnswer(true);
        if (option === currentQ.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Exit Practice
                </button>
                <button
                    onClick={() => navigate('/', { state: { prefilledMessage: `Chat with me about: ${topic}` } })}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm hover:border-indigo-400"
                >
                    <MessageCircle className="w-4 h-4" /> Chat about this
                </button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Practice Mode</h2>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-8 text-slate-900 dark:text-white">
                <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold uppercase tracking-wider">
                        {currentQ.type === 'mcq' ? 'Multiple Choice' : currentQ.type === 'short' ? 'Short Answer' : 'Long Answer'}
                    </span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                    {currentQ.question}
                </h3>

                {currentQ.type === 'mcq' && currentQ.options ? (
                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = selectedOption === opt;
                            const isCorrect = opt === currentQ.correctAnswer;
                            
                            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                            
                            if (!showAnswer) {
                                btnClass += "border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                            } else if (isCorrect) {
                                btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
                            } else if (isSelected && !isCorrect) {
                                btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                            } else {
                                btnClass += "border-slate-200 dark:border-slate-700 opacity-50 text-slate-500";
                            }

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => handleOptionClick(opt)}
                                    disabled={showAnswer}
                                    className={btnClass}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{opt}</span>
                                        {showAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        {showAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {!showAnswer ? (
                            <button 
                                onClick={() => setShowAnswer(true)}
                                className="w-full py-4 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                Show Answer
                            </button>
                        ) : (
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Correct Answer
                                </h4>
                                <p className="text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                    {currentQ.correctAnswer}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showAnswer && (
                <div className="flex justify-end animate-fade-in">
                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        {isLast ? 'Finish Practice' : 'Next Question'}
                        {!isLast && <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PracticeScreen;

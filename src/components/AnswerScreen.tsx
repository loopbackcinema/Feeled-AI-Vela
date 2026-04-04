import React from 'react';
import { ConceptResponse, StudentContext } from '../types';
import { BookOpen, Edit3, Lightbulb, ArrowLeft, PenTool, Headphones } from 'lucide-react';

interface AnswerScreenProps {
    concept: ConceptResponse;
    question: string;
    context: StudentContext;
    onBack: () => void;
    onPractice: () => void;
    onStory: (topic: string) => void;
}

const AnswerScreen: React.FC<AnswerScreenProps> = ({ concept, question, context, onBack, onPractice, onStory }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Search
            </button>

            <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                    {context.subject} • {context.standard}
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{question}</h1>
            </div>

            <div className="space-y-6">
                {/* Textbook Answer */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Textbook Answer
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {concept.textbookAnswer}
                    </p>
                </div>

                {/* Exam Writing Format */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Edit3 className="w-6 h-6 text-emerald-600" />
                        Exam Writing Format
                    </h2>
                    <ul className="space-y-3">
                        {concept.examFormat.map((point, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Simple Explanation */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
                        <Lightbulb className="w-6 h-6 text-amber-500" />
                        Simple Explanation
                    </h2>
                    <p className="text-indigo-900/80 dark:text-indigo-200 leading-relaxed">
                        {concept.simpleExplanation}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={onPractice}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-4 px-6 rounded-xl font-bold transition-colors shadow-lg"
                >
                    <PenTool className="w-5 h-5" />
                    Practice Questions
                </button>
                <button 
                    onClick={() => onStory(question)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Headphones className="w-5 h-5" />
                    Explain with Story
                </button>
            </div>
        </div>
    );
};

export default AnswerScreen;

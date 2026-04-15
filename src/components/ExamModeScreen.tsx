import React from 'react';
import { ExamPrep, StudentContext } from '../types';
import { ArrowLeft, Flame, AlertCircle, FileText, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ExamModeScreenProps {
    examPrep: ExamPrep;
    topic: string;
    context: StudentContext;
    onBack: () => void;
}

const ExamModeScreen: React.FC<ExamModeScreenProps> = ({ examPrep, topic, context, onBack }) => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-black transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="mb-8 flex items-center gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-2xl text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-200 dark:shadow-none">
                    <Flame className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Exam Prep: {topic || context.subject}</h1>
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {context.board} • {context.standard}
                        </span>
                        <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                            • {context.learningMode} Mode
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Notes & Predicted */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revision Notes */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                            <FileText className="w-7 h-7 text-indigo-600" />
                            Quick Revision Notes
                        </h2>
                        <div className="space-y-6">
                            {examPrep.revisionNotes.map((note, index) => (
                                <div key={index} className="flex items-start gap-4 group">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                                    <div className="prose dark:prose-invert max-w-none prose-p:m-0 prose-strong:text-indigo-600">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Predicted Questions */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl border border-orange-200 dark:border-orange-800/50 p-8 shadow-sm">
                        <h2 className="text-2xl font-black text-orange-900 dark:text-orange-100 flex items-center gap-3 mb-8">
                            <Target className="w-7 h-7 text-orange-600" />
                            Predicted High-Value Questions
                        </h2>
                        <div className="space-y-4">
                            {examPrep.predictedQuestions.map((q, index) => (
                                <div key={index} className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-orange-100 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="prose dark:prose-invert max-w-none prose-p:m-0 font-bold text-orange-900 dark:text-orange-100">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Important Questions */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm sticky top-24">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                            <AlertCircle className="w-6 h-6 text-rose-500" />
                            Must-Know
                        </h2>
                        <div className="space-y-6">
                            {examPrep.importantQuestions.map((q, index) => (
                                <div key={index} className="flex gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                    <span className="text-slate-400 font-black text-lg">{index + 1}.</span>
                                    <div className="prose dark:prose-invert max-w-none prose-p:m-0 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamModeScreen;

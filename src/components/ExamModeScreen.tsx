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
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-black transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-5 rounded-3xl text-white shadow-xl shadow-orange-200 dark:shadow-none rotate-3">
                        <Flame className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Exam Survival Kit</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-black uppercase tracking-widest">
                                {topic || context.subject}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                • {context.board} • {context.standard}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-black text-sm uppercase tracking-wider">Genius Mode Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content: Step-by-Step Revision */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FileText className="w-40 h-40 text-indigo-600" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                                <FileText className="w-8 h-8" />
                            </div>
                            Step-by-Step Revision Guide
                        </h2>
                        
                        <div className="space-y-12">
                            {examPrep.revisionNotes.map((note, index) => (
                                <div key={index} className="relative pl-12 group">
                                    {/* Vertical Line */}
                                    {index !== examPrep.revisionNotes.length - 1 && (
                                        <div className="absolute left-[1.35rem] top-10 bottom-[-3rem] w-0.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors"></div>
                                    )}
                                    
                                    {/* Step Number */}
                                    <div className="absolute left-0 top-0 w-11 h-11 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-lg font-black text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all z-10">
                                        {index + 1}
                                    </div>
                                    
                                    <div className="prose dark:prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-strong:text-indigo-600 prose-headings:font-black">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Predicted Questions Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
                        <h2 className="text-3xl font-black flex items-center gap-4 mb-10">
                            <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/50">
                                <Target className="w-8 h-8" />
                            </div>
                            Predicted High-Value Questions
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {examPrep.predictedQuestions.map((q, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group">
                                    <div className="text-orange-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Flame className="w-4 h-4" /> Prediction {index + 1}
                                    </div>
                                    <div className="prose prose-invert max-w-none prose-p:text-xl prose-p:font-bold prose-p:leading-tight">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-white/40 text-sm font-medium">
                                        Estimated: 5-10 Marks
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Must-Know & Strategy */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm sticky top-24">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                            <AlertCircle className="w-6 h-6 text-rose-500" />
                            Must-Know
                        </h2>
                        
                        <div className="space-y-8">
                            {examPrep.importantQuestions.map((q, index) => (
                                <div key={index} className="flex gap-4 group">
                                    <span className="text-slate-300 font-black text-2xl group-hover:text-rose-500 transition-colors">{index + 1}</span>
                                    <div className="prose dark:prose-invert max-w-none prose-p:m-0 text-base text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                                <h4 className="text-amber-800 dark:text-amber-400 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" /> Examiner's Tip
                                </h4>
                                <p className="text-sm text-amber-900/70 dark:text-amber-200/70 leading-relaxed font-medium">
                                    Focus on diagrams and keywords. Examiners look for specific technical terms in the first 3 lines of your answer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamModeScreen;

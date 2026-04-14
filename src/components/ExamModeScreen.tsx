import React from 'react';
import { ExamPrep, StudentContext } from '../types';
import { ArrowLeft, Flame, AlertCircle, FileText, Target } from 'lucide-react';

interface ExamModeScreenProps {
    examPrep: ExamPrep;
    topic: string;
    context: StudentContext;
    onBack: () => void;
}

const ExamModeScreen: React.FC<ExamModeScreenProps> = ({ examPrep, topic, context, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="mb-8 flex items-center gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-2xl text-orange-600 dark:text-orange-400">
                    <Flame className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Exam Prep: {topic || context.subject}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {context.board} • {context.standard}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Notes & Predicted */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revision Notes */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            Quick Revision Notes
                        </h2>
                        <ul className="space-y-4">
                            {examPrep.revisionNotes.map((note, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Predicted Questions */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/50 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2 mb-6">
                            <Target className="w-6 h-6 text-orange-600" />
                            Predicted High-Value Questions
                        </h2>
                        <div className="space-y-4">
                            {examPrep.predictedQuestions.map((q, index) => (
                                <div key={index} className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30">
                                    <p className="font-medium text-orange-900 dark:text-orange-100">{q}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Important Questions */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            Must-Know Questions
                        </h2>
                        <div className="space-y-4">
                            {examPrep.importantQuestions.map((q, index) => (
                                <div key={index} className="flex gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                    <span className="text-slate-400 font-bold">{index + 1}.</span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{q}</p>
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

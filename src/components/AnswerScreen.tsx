import React, { useState } from 'react';
import { ConceptResponse, StudentContext } from '../types';
import { BookOpen, Edit3, Lightbulb, ArrowLeft, PenTool, Headphones, Hash, Target, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AnswerScreenProps {
    concept: ConceptResponse;
    question: string;
    context: StudentContext;
    onBack: () => void;
    onPractice: () => void;
    onStory: (topic: string) => void;
    base64Image?: string | null;
    imageMimeType?: string | null;
    isImageLoading?: boolean;
}

const AnswerScreen: React.FC<AnswerScreenProps> = ({ 
    concept, 
    question, 
    context, 
    onBack, 
    onPractice, 
    onStory,
    base64Image,
    imageMimeType,
    isImageLoading
}) => {
    const [activeTab, setActiveTab] = useState<'standard' | '2mark' | '5mark'>('standard');

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Search
            </button>

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {context.subject} • {context.standard}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${context.learningMode === 'Senior' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {context.learningMode} Mode
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{question}</h1>
                </div>
                
                {/* Keywords Chips */}
                <div className="flex flex-wrap gap-2 max-w-md">
                    {(concept.keyKeywords ?? []).map((kw, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
                            <Hash className="w-3 h-3" /> {kw}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Junior Mode Image Display */}
                    {context.learningMode === 'Junior' && (
                        <div className="rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-800">
                            {isImageLoading ? (
                                <div className="aspect-video flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                                    <p className="text-sm font-bold text-slate-500 animate-pulse">Creating a magical picture for you...</p>
                                </div>
                            ) : base64Image ? (
                                <img 
                                    src={`data:${imageMimeType};base64,${base64Image}`} 
                                    alt={question}
                                    className="w-full aspect-video object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center">
                                    <p className="text-slate-400 font-medium italic">Imagine a beautiful world here...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View Selector Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                        <button 
                            onClick={() => setActiveTab('standard')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'standard' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Full Concept
                        </button>
                        <button 
                            onClick={() => setActiveTab('2mark')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === '2mark' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            2 Mark Answer
                        </button>
                        <button 
                            onClick={() => setActiveTab('5mark')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === '5mark' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            5 Mark Answer
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                        <div className="prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                            {activeTab === 'standard' && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black m-0">Detailed Explanation</h2>
                                    </div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {concept.textbookAnswer}
                                    </ReactMarkdown>
                                </>
                            )}
                            {activeTab === '2mark' && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black m-0">Concise (2 Mark) Answer</h2>
                                    </div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {concept.markBasedAnswers?.twoMark || ''}
                                    </ReactMarkdown>
                                </>
                            )}
                            {activeTab === '5mark' && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black m-0">Structured (5 Mark) Answer</h2>
                                    </div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {concept.markBasedAnswers?.fiveMark || ''}
                                    </ReactMarkdown>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Exam Writing Format */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Edit3 className="w-5 h-5 text-emerald-600" />
                            Exam Presentation
                        </h2>
                        <ul className="space-y-3">
                            {(concept.examFormat ?? []).map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-black mt-1">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Simple Explanation */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            The "Aha!" Moment
                        </h2>
                        <p className="text-sm text-indigo-900/80 dark:text-indigo-200 leading-relaxed italic">
                            {concept.simpleExplanation}
                        </p>
                    </div>

                    {/* Action Sidebar */}
                    <div className="space-y-3">
                        <button 
                            onClick={onPractice}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-4 px-6 rounded-xl font-black transition-all shadow-lg hover:-translate-y-1"
                        >
                            <PenTool className="w-5 h-5" />
                            Test My Knowledge
                        </button>
                        <button 
                            onClick={() => onStory(question)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-black transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-1"
                        >
                            <Headphones className="w-5 h-5" />
                            Explain with Story
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnswerScreen;

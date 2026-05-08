import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SkeletonLoaderProps {
    question?: string;
}

const STEPS = [
    'Searching Samacheer textbook...',
    'Retrieving relevant chapters...',
    'Generating exam-ready answer...',
    'Almost ready!',
];

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ question }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }, 2500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            {/* Header area */}
            <div className="mb-8">
                <div className="flex gap-2 mb-3">
                    <div className="h-6 w-32 bg-indigo-100 dark:bg-indigo-900/40 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>
                {question ? (
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{question}</h1>
                ) : (
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4 animate-pulse" />
                )}
            </div>

            {/* Progress banner */}
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 transition-all duration-500">
                        {STEPS[step]}
                    </p>
                </div>
                <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab bar */}
                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                        {['Full Concept', '2 Mark', '5 Mark'].map((label, i) => (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                                    i === 0
                                        ? 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                                        : 'text-slate-300 dark:text-slate-600'
                                }`}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Content card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg animate-pulse" />
                            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        </div>
                        {['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4', 'w-11/12', 'w-full', 'w-4/5', 'w-2/3'].map((width, i) => (
                            <div
                                key={i}
                                className={`h-4 ${width} bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse`}
                                style={{ animationDelay: `${i * 80}ms` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar skeleton */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-4" />
                        {['w-full', 'w-4/5', 'w-full', 'w-3/4', 'w-4/5'].map((width, i) => (
                            <div key={i} className={`h-3.5 ${width} bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse`} />
                        ))}
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 p-6 space-y-3">
                        <div className="h-5 w-28 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg animate-pulse mb-4" />
                        <div className="h-3.5 w-full bg-indigo-100 dark:bg-indigo-900/40 rounded-lg animate-pulse" />
                        <div className="h-3.5 w-3/4 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoader;

import React, { useState, useEffect } from 'react';
import { StoryRequest } from '../types';

interface LoadingIndicatorProps {
    request: StoryRequest;
}

const loadingSteps = [
    { emoji: '📖', text: "Weaving a '{emotionTone}' story about '{topic}'..." },
    { emoji: '❤️', text: "Finding the perfect emotional trigger..." },
    { emoji: '💡', text: "Explaining '{topic}' for a {std} student..." },
    { emoji: '🧠', text: "Building quiz questions..." },
    { emoji: '🎨', text: "Creating visual imagery..." },
    { emoji: '🔊', text: "Synthesizing voice narration..." },
    { emoji: '✅', text: "Almost ready — finalizing your journey!" },
];

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ request }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < loadingSteps.length - 1) return prev + 1;
                clearInterval(interval);
                return prev;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatText = (text: string) =>
        text
            .replace('{emotionTone}', request.emotionTone)
            .replace(/'{topic}'/g, `"${request.topic}"`)
            .replace('{topic}', request.topic)
            .replace('{std}', request.std);

    const progress = Math.round(((currentStep + 1) / loadingSteps.length) * 100);

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-12 space-y-4">
                <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center text-4xl animate-pulse">
                    {loadingSteps[currentStep].emoji}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Crafting Your Story
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    "{request.topic}" · {request.std} · {request.language}
                </p>
            </div>

            <div className="mb-10 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                    className="h-2 bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-4">
                {loadingSteps.map((step, index) => {
                    const isDone = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                                isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700'
                                    : isDone
                                    ? 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent'
                                    : 'border-2 border-transparent opacity-30'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-all duration-500 ${
                                isDone
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : isActive
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                                {isDone ? '✅' : step.emoji}
                            </div>
                            <p className={`text-sm font-bold flex-1 ${
                                isActive
                                    ? 'text-indigo-700 dark:text-indigo-300'
                                    : isDone
                                    ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-300'
                                    : 'text-slate-400 dark:text-slate-600'
                            }`}>
                                {formatText(step.text)}
                            </p>
                            {isActive && (
                                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LoadingIndicator;
import React, { useState, useEffect } from 'react';
import { StoryRequest } from '../types';

interface LoadingIndicatorProps {
    request: StoryRequest;
}

const loadingSteps = [
    "Weaving a story with a '{emotionTone}' tone...",
    "Finding the perfect emotional trigger...",
    "Explaining '{topic}' for a {std} student...",
    "Adding a moral and a beautiful conclusion...",
    "Almost ready!",
];

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ request }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < loadingSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 1800); 

        return () => clearInterval(interval);
    }, []);

    const formatStep = (step: string) => {
        return step
            .replace('{emotionTone}', request.emotionTone)
            .replace('{topic}', `'${request.topic}'`)
            .replace('{std}', request.std);
    };

    return (
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Crafting Your Story...</h2>
            <p className="text-slate-500 mb-8">Our AI is working its magic. Please wait a moment.</p>
            
            <div className="space-y-4 text-left mx-auto max-w-md">
                {loadingSteps.map((step, index) => (
                    <div 
                        key={index} 
                        className={`transition-all duration-700 ease-in-out flex items-center space-x-4 ${index <= currentStep ? 'opacity-100' : 'opacity-30'}`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-500 flex-shrink-0 ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {index < currentStep ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : index === currentStep ? (
                                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                            ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                            )}
                        </div>
                        <p className={`text-sm ${index <= currentStep ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                            {formatStep(step)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoadingIndicator;
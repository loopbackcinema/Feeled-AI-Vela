import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
            <h1 className="text-3xl font-black text-blue-600 mb-6 text-center">About FeelEd AI</h1>
            <div className="space-y-6 text-slate-700 leading-relaxed font-medium">
                <p>FeelEd AI is an emotional story-based learning assistant designed to humanize digital education. We believe that real learning happens when facts are felt, not just memorized.</p>
                <h2 className="text-xl font-bold text-slate-800">Our Vision</h2>
                <p>To create an education ecosystem where emotional intelligence is the foundation of cognitive learning.</p>
                <h2 className="text-xl font-bold text-slate-800">What We Do</h2>
                <p>We use Gemini AI to convert academic concepts into immersive narratives. By triggering emotions like curiosity, joy, or empathy, we help students retain information longer and understand it deeper.</p>
            </div>
            <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-md">Back to Generator</button>
            </div>
        </div>
    );
};

export default AboutUs;

import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">About FeelEd AI</h1>
                <p className="text-xl text-slate-500 font-medium">Feel the story. Learn naturally.</p>
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mb-10 text-center mx-auto">
                <p className="mb-4">
                    FeelEd AI is an emotion-adaptive learning platform that brings human understanding back into digital education. Our mission is to create a world where technology not only teaches content, but also understands how students feel while they learn. We combine AI, psychology, and storytelling to deliver emotionally intelligent learning experiences for every child.
                </p>
                <p>
                    We believe true learning happens when knowledge meets emotion. Most EdTech systems focus on content delivery. FeelEd AI focuses on emotional connection, helping students learn through stories, empathy, and supportive feedback. Our goal is simple: make learning human again.
                </p>
            </div>

            {/* Powerful Quote */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-8 border-blue-600 p-8 rounded-r-2xl mb-12 shadow-sm transform hover:scale-[1.01] transition-transform">
                <p className="text-2xl md:text-3xl font-bold text-slate-800 italic leading-snug text-center md:text-left">
                    "FeelEd AI is not built for the No.1 student. It is built so any student — even the last one — can rise to No.1."
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* What We Do */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">🤖</span> What We Do
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        FeelEd AI transforms any topic into an adaptive, story-based lesson that responds to a student’s emotional state. Using multimodal affect detection and narrative generation, the system adjusts tone, pace, difficulty, and explanation style based on how the learner feels.
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Emotion detection through voice, facial cues, text patterns, and engagement signals",
                            "Adaptive story generation that converts lessons into relatable narratives",
                            "Avatar-based storytelling using culturally familiar characters",
                            "Real-time emotional feedback loop that supports students like a human teacher",
                            "Mobile-first, low-bandwidth design built for Bharat and underserved communities",
                            "Multilingual support with Tamil, English, and upcoming Indian languages"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span className="text-sm md:text-base">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Why We Exist */}
                <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <span className="bg-red-100 text-red-600 p-2.5 rounded-xl">❤️</span> Why We Exist
                    </h2>
                    <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 flex-grow">
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            India’s learning crisis is not only academic — it is emotional. Millions of students struggle silently with fear, confusion, and low confidence. Traditional EdTech does not recognize these emotional signals, widening learning gaps in rural and low-resource classrooms.
                        </p>
                        <p className="text-slate-700 leading-relaxed font-medium">
                            FeelEd AI exists to solve this emotional blind spot. By integrating affective computing with culturally grounded storytelling, we help students learn with clarity, confidence, and curiosity. Our platform gives teachers the emotional insights they need to support every child, especially those who are usually overlooked.
                        </p>
                    </div>
                </div>
            </div>

            {/* Differentiators */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-xl">✨</span> What Makes FeelEd AI Different
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        "Emotion-first learning instead of one-size-fits-all content",
                        "Story-driven explanations that improve memory and understanding",
                        "Built for Bharat with low-cost devices and low internet usage",
                        "Culturally relevant examples, metaphors, and avatars",
                        "Inclusive design for shy, anxious, and slow learners",
                        "Scalable, ethical, and privacy-first technology",
                        "Supports government schools, NGOs, and high-stress learning environments"
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-3 group">
                            <span className="text-blue-500 text-xl group-hover:scale-110 transition-transform">★</span>
                            <p className="text-slate-700 font-medium text-sm md:text-base">{item}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10 bg-slate-800 text-white p-6 rounded-2xl text-center shadow-lg">
                    <p className="text-lg md:text-xl italic font-medium">
                        "FeelEd AI brings empathy into EdTech — something traditional platforms are not designed to do."
                    </p>
                </div>
            </div>

             <div className="mt-12 text-center">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105">
                    Back to Story Generator
                </button>
            </div>
        </div>
    );
};

export default AboutUs;

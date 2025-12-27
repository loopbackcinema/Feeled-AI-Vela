import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl space-y-16 animate-fade-in pb-20">
            {/* Mission Hero */}
            <div className="bg-white p-10 md:p-20 rounded-[4rem] shadow-2xl border-4 border-white ring-4 ring-blue-50 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
                <div className="relative z-10">
                    <img 
                        src="/logo.svg" 
                        alt="FeelEd AI Logo" 
                        className="w-32 h-32 mx-auto mb-8 drop-shadow-2xl animate-bounce-slow"
                    />
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">About FeelEd AI</h1>
                    <p className="text-2xl text-slate-500 font-bold mb-12">Feel the story. <span className="text-green-500">Learn naturally.</span></p>
                    
                    <div className="max-w-3xl mx-auto space-y-8 text-xl text-slate-600 leading-relaxed font-medium">
                        <p>
                            <span className="text-blue-600 font-black">FeelEd AI</span> is a magical learning friend that brings feelings into digital education. Our mission is to create a world where technology doesn't just teach facts, but understands how <span className="text-pink-600 font-black underline decoration-pink-200 underline-offset-4">you feel</span> while you learn.
                        </p>
                        <p>
                            We combine smart AI, psychology, and the power of storytelling to make learning an adventure. Our goal is simple: <span className="bg-amber-100 text-amber-900 px-6 py-2 rounded-2xl border-2 border-amber-200 inline-block rotate-1 font-black">Make learning human again!</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Powerful Vision Quote */}
            <div className="bg-indigo-600 text-white p-12 md:p-20 rounded-[4rem] shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
                <p className="text-3xl md:text-5xl font-black italic leading-tight relative z-10">
                    "FeelEd AI is not built for the No.1 student. It is built so any student — even the last one — can rise to No.1."
                </p>
            </div>

            {/* Key Pillars */}
            <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-300 transition-all duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-sm group-hover:scale-110 transition-transform">🤖</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">What We Do</h2>
                    <p className="text-lg text-slate-500 font-bold mb-8">We turn boring topics into exciting stories! Our system knows when you are happy, confused, or bored, and changes the story to help you.</p>
                    <ul className="space-y-4 w-full text-left font-bold text-slate-700">
                        <li className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-50">
                            <span className="text-2xl">✅</span> Detects emotions through voice & text
                        </li>
                        <li className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-50">
                            <span className="text-2xl">✅</span> Turns lessons into fun stories
                        </li>
                        <li className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-50">
                            <span className="text-2xl">✅</span> Uses cool avatars & characters
                        </li>
                        <li className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-50">
                            <span className="text-2xl">✅</span> Like a friendly teacher who listens
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-rose-300 transition-all duration-500">
                    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-sm group-hover:scale-110 transition-transform">❤️</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Why We Exist</h2>
                    <p className="text-lg text-slate-500 font-bold mb-8 leading-relaxed">Many students feel scared or confused in class. Traditional apps don't notice these feelings.</p>
                    <div className="bg-rose-50/50 p-8 rounded-[3rem] border-2 border-rose-100 text-rose-900 font-black text-xl leading-relaxed mt-auto">
                        FeelEd AI exists to hug your mind with knowledge. By mixing feelings with stories, we help you learn with confidence and curiosity. We give every child the attention they deserve.
                    </div>
                </div>
            </div>

            {/* The Magic List */}
            <div className="text-center pt-10">
                <h2 className="text-4xl font-black text-slate-900 mb-12 flex items-center justify-center gap-4">
                    <span className="text-4xl">✨</span> The FeelEd Magic <span className="text-4xl">✨</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                    {[
                        "Emotion-first learning", "Story-driven memory", "Works on simple phones", 
                        "Culturally relatable", "Helps shy learners", "Safe & Private", "For every classroom"
                    ].map((magic, i) => (
                        <div key={i} className="bg-white px-8 py-4 rounded-full border-2 border-slate-100 text-slate-700 font-black text-lg shadow-md hover:scale-105 transition-transform flex items-center gap-3">
                            <span className="text-amber-500">★</span> {magic}
                        </div>
                    ))}
                </div>
            </div>

            {/* Differentiator Quote */}
            <div className="bg-slate-900 text-white p-12 md:p-16 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500"></div>
                <p className="text-2xl md:text-4xl font-black italic opacity-90 transition-opacity group-hover:opacity-100">
                    "FeelEd AI brings empathy into EdTech — something traditional platforms are not designed to do."
                </p>
            </div>

            {/* Start CTA */}
            <div className="text-center py-10">
                <button onClick={() => onNavigate('generator')} className="bg-blue-600 text-white font-black py-6 px-16 rounded-full text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
                    Let's Start Learning! 🚀
                </button>
            </div>
        </div>
    );
};

export default AboutUs;

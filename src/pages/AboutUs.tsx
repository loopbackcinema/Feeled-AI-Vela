
import React from 'react';
import { Page } from '../types';

interface AboutUsProps {
    onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-5xl bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border-4 border-white ring-4 ring-blue-50 animate-fade-in relative overflow-hidden">
            
            {/* Playful Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <div className="inline-block mb-4">
                    <img 
                        src="/logo.svg" 
                        alt="FeelEd AI Logo" 
                        className="w-24 h-24 md:w-32 md:h-32 mx-auto drop-shadow-xl hover:scale-110 transition-transform duration-300"
                    />
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-4 drop-shadow-sm">
                    About FeelEd AI
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-bold tracking-wide">
                    Feel the story. <span className="text-green-500">Learn naturally.</span>
                </p>
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-3xl mx-auto text-slate-600 leading-relaxed mb-12 text-center">
                <p className="mb-6 text-lg">
                    <span className="font-bold text-blue-600">FeelEd AI</span> is a magical learning friend that brings feelings into digital education. Our mission is to create a world where technology doesn't just teach facts, but understands how <span className="text-pink-500 font-bold">you feel</span> while you learn.
                </p>
                <p className="text-lg">
                    We combine smart AI, psychology, and the power of storytelling to make learning an adventure. Our goal is simple: <span className="bg-yellow-100 px-2 py-1 rounded-lg transform -rotate-1 inline-block border border-yellow-200 text-yellow-800 font-bold">Make learning human again!</span>
                </p>
            </div>

            {/* Powerful Quote */}
            <div className="relative bg-gradient-to-r from-violet-100 to-fuchsia-100 border-l-8 border-violet-500 p-8 rounded-r-3xl rounded-l-lg mb-16 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                <span className="absolute -top-4 -left-2 text-6xl text-violet-300 opacity-50">"</span>
                <p className="text-2xl md:text-3xl font-bold text-violet-900 italic leading-snug text-center md:text-left relative z-10">
                    "FeelEd AI is not built for the No.1 student. It is built so any student — even the last one — can rise to No.1."
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
                {/* What We Do */}
                <div className="bg-emerald-50/80 p-6 rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
                        <span className="bg-white shadow-md text-2xl p-3 rounded-2xl">🤖</span> 
                        What We Do
                    </h2>
                    <p className="text-emerald-700 mb-6 font-medium">
                        We turn boring topics into exciting stories! Our system knows when you are happy, confused, or bored, and changes the story to help you.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Detects emotions through voice & text",
                            "Turns lessons into fun stories",
                            "Uses cool avatars & characters",
                            "Like a friendly teacher who listens",
                            "Works on any phone, anywhere",
                            "Speaks Tamil, English & more!"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-emerald-100">
                                <span className="text-emerald-500 mt-0.5 text-lg">✅</span>
                                <span className="font-semibold text-sm md:text-base">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Why We Exist */}
                <div className="flex flex-col h-full">
                    <div className="bg-rose-50/80 p-6 rounded-3xl border-2 border-rose-100 hover:border-rose-300 transition-colors duration-300 flex-grow">
                        <h2 className="text-2xl font-bold text-rose-800 mb-6 flex items-center gap-3">
                            <span className="bg-white shadow-md text-2xl p-3 rounded-2xl">❤️</span> 
                            Why We Exist
                        </h2>
                        <div className="space-y-4">
                            <p className="text-rose-700 leading-relaxed text-lg">
                                Many students feel scared or confused in class. Traditional apps don't notice these feelings.
                            </p>
                            <p className="text-rose-900 leading-relaxed font-bold text-lg bg-white/60 p-4 rounded-2xl border border-rose-200">
                                FeelEd AI exists to hug your mind with knowledge. By mixing feelings with stories, we help you learn with confidence and curiosity. We give every child the attention they deserve.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Differentiators */}
            <div className="mt-16 relative z-10">
                <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-10 flex items-center justify-center gap-3">
                    <span className="bg-amber-100 text-amber-500 p-2 rounded-2xl shadow-sm">✨</span> 
                    The FeelEd Magic
                    <span className="bg-amber-100 text-amber-500 p-2 rounded-2xl shadow-sm">✨</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { text: "Emotion-first learning", color: "border-blue-200 bg-blue-50 text-blue-700" },
                        { text: "Story-driven memory", color: "border-purple-200 bg-purple-50 text-purple-700" },
                        { text: "Works on simple phones", color: "border-green-200 bg-green-50 text-green-700" },
                        { text: "Culturally relatable", color: "border-orange-200 bg-orange-50 text-orange-700" },
                        { text: "Helps shy learners", color: "border-pink-200 bg-pink-50 text-pink-700" },
                        { text: "Safe & Private", color: "border-cyan-200 bg-cyan-50 text-cyan-700" },
                        { text: "For every classroom", color: "border-indigo-200 bg-indigo-50 text-indigo-700" }
                    ].map((item, i) => (
                        <div key={i} className={`p-5 rounded-2xl border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-3 group ${item.color}`}>
                            <span className="text-2xl group-hover:scale-125 transition-transform duration-300">★</span>
                            <p className="font-bold text-base">{item.text}</p>
                        </div>
                    ))}
                </div>
                
                <div className="mt-12 bg-slate-800 text-white p-8 rounded-[2rem] text-center shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <p className="text-xl md:text-2xl italic font-medium leading-relaxed">
                        "FeelEd AI brings empathy into EdTech — something traditional platforms are not designed to do."
                    </p>
                </div>
            </div>

            {/* Meet the Founder Section */}
            <div className="mt-16 bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-lg flex flex-col md:flex-row items-center gap-8 relative z-10 hover:border-blue-200 transition-colors">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-md shrink-0 bg-blue-50 flex items-center justify-center">
                    <img 
                        src="/founder.jpg?v=10" 
                        alt="Velayutham S" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Meet the Founder</h3>
                    <p className="text-slate-600 mb-4 max-w-xl">
                        Velayutham S is the visionary behind FeelEd AI, dedicated to restoring empathy in education through artificial intelligence.
                    </p>
                    <button 
                        onClick={() => onNavigate('founder')}
                        className="text-blue-600 font-bold hover:text-blue-800 hover:underline flex items-center justify-center md:justify-start gap-1 transition-colors"
                    >
                        Read Full Bio 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

             <div className="mt-16 text-center">
                <button 
                    onClick={() => onNavigate('generator')} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold py-4 px-10 rounded-full hover:shadow-2xl hover:shadow-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-110 active:scale-95"
                >
                    Let's Start Learning! 🚀
                </button>
            </div>
        </div>
    );
};

export default AboutUs;


import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Story, QuizQuestion } from '../types';
import Spinner from './Spinner';
import StoryChat from './StoryChat';

interface StoryDisplayProps {
    story: Story;
    base64Audio: string | null;
    isAudioLoading: boolean;
    base64Image: string | null;
    imageMimeType: string | null;
    isImageLoading: boolean;
    onTryAnother: () => void;
}

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const getIcon = (t: string) => {
        const lower = t.toLowerCase();
        if (lower.includes('introduction')) return '✨';
        if (lower.includes('trigger')) return '❤️';
        if (lower.includes('concept')) return '💡';
        if (lower.includes('resolution')) return '✅';
        if (lower.includes('moral')) return '🌟';
        if (lower.includes('conclusion')) return '🎓';
        return '📖';
    };

    return (
        <div className="mb-6 bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-slate-800 mb-3 capitalize flex items-center gap-2">
                <span className="text-2xl">{getIcon(title)}</span>
                {title.replace(/_/g, ' ')}
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg">{content}</p>
        </div>
    );
};

interface QuizSectionProps {
    quiz: QuizQuestion[];
    onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onQuizComplete }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; 
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        const isCorrect = answers[qIndex] === quiz[qIndex].answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setShowResult(prev => {
            const next = { ...prev, [qIndex]: true };
            if (Object.keys(next).length === quiz.length) {
                setIsCompleted(true);
                onQuizComplete(isCorrect ? score + 1 : score);
            }
            return next;
        });
    };

    if (!quiz || quiz.length === 0) return null;

    return (
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-indigo-100">
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-3">
                <span className="text-4xl">🧠</span> Knowledge Check
            </h3>
            <div className="space-y-10">
                {quiz.map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-bold text-slate-800 leading-tight">{index + 1}. {q.question}</p>
                        <div className="grid gap-3">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === q.answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-bold text-lg ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-700";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-700";
                                    else btnStyle += "border-slate-100 text-slate-300";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-500 text-blue-800 shadow-md";
                                    else btnStyle += "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-white";
                                }

                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(index, option)}
                                        className={btnStyle}
                                        disabled={isRevealed}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{option}</span>
                                            {isRevealed && isCorrect && <span className="text-2xl">✓</span>}
                                            {isRevealed && isSelected && !isCorrect && <span className="text-2xl">✗</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <button 
                                onClick={() => handleCheckAnswer(index)}
                                disabled={!answers[index]}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-30 shadow-md ml-auto block"
                            >
                                Check Answer
                            </button>
                        )}
                        {showResult[index] && (
                             <div className={`p-4 rounded-2xl text-lg font-bold text-center animate-fade-in ${answers[index] === q.answer ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {answers[index] === q.answer ? "✨ Excellent! That's correct!" : "Don't worry, keep learning! 💪"}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// PCM decoding helpers
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    
    // Certificate States
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [certificateBlob, setCertificateBlob] = useState<Blob | null>(null);
    const [generatingCert, setGeneratingCert] = useState(false);

    const chatSectionRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);

    const handleQuizComplete = (score: number) => {
        if (score === story.quiz.length) {
            setTimeout(() => {
                setShowCertificateForm(true);
                setTimeout(() => certRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }, 1500);
        }
    };

    const generateCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneratingCert(true);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1200;
        canvas.height = 800;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#f0f9ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        // Borders
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 30;
        ctx.strokeRect(0, 0, 1200, 800);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 8;
        ctx.strokeRect(50, 50, 1100, 700);

        // Content
        ctx.font = 'bold 90px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE', 600, 200);
        
        ctx.font = 'bold 45px "Nunito", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OF MERIT', 600, 260);

        ctx.font = 'italic 30px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('This is proudly presented to', 600, 340);

        ctx.font = 'bold italic 75px "Nunito", serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(studentName, 600, 430);

        ctx.font = '28px "Nunito", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(`Grade: ${studentClass} | School: ${schoolName}`, 600, 500);

        ctx.font = 'italic 25px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('For successfully mastering the concept of', 600, 570);

        ctx.font = 'bold 40px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(story.title, 600, 630);

        // Footer
        ctx.font = 'bold 30px "Nunito", sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText('FeelEd AI', 600, 720);
        ctx.font = '20px "Nunito", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Emotion-Adaptive Education', 600, 750);

        canvas.toBlob((blob) => {
            if (blob) setCertificateBlob(blob);
            setGeneratingCert(false);
        }, 'image/png');
    };

    const handlePlayPause = useCallback(async () => {
        if (!base64Audio) return;
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioContextRef.current;
        if (isPlaying && audioSourceRef.current) {
            audioSourceRef.current.stop();
        } else if (!isDecoding) {
            setIsDecoding(true);
            try {
                const audioBuffer = await decodePcmAudioData(decode(base64Audio), audioCtx);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => setIsPlaying(false);
                source.start(0);
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (e) { console.error(e); }
            finally { setIsDecoding(false); }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    useEffect(() => {
        return () => {
            audioSourceRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20">
            {/* Title Header */}
            <div className="text-center mb-12">
                <h2 className="text-5xl font-black text-blue-700 mb-4 tracking-tighter leading-tight">{story.title}</h2>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-sm">
                    Tone: {story.emotion_tone}
                </div>
            </div>

            {/* Theme Image */}
            <div className="mb-12">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-white rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-center animate-pulse">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center text-3xl">🎨</div>
                            <p className="text-slate-400 font-bold">Painting a magical scene...</p>
                        </div>
                    </div>
                ) : base64Image && (
                    <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white ring-1 ring-slate-100">
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                )}
            </div>

            {/* Voice Control */}
            <div className="sticky top-24 z-30 flex justify-center mb-12">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl px-10 py-5 rounded-full font-black text-blue-600 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-4 ring-blue-50/50"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-lg`}>
                            {isPlaying ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4h2V8H7zm4 0v4h2V8h-2z"/></svg>
                            ) : (
                                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            )}
                        </div>
                    )}
                    <span className="text-xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Creating Voice...' : isDecoding ? 'Preparing...' : isPlaying ? 'Stop Narration' : 'Play Story as Voice'}
                    </span>
                 </button>
            </div>
            
            {/* Story Content */}
            <div className="space-y-6">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <StorySection title="Moral Message" content={story.moral_message} />
                <StorySection title="Conclusion" content={story.conclusion} />
            </div>

            {/* Quiz */}
            <QuizSection quiz={story.quiz} onQuizComplete={handleQuizComplete} />
            
            {/* Certificate */}
            {showCertificateForm && (
                <div ref={certRef} className="mt-16 bg-gradient-to-br from-amber-400 to-orange-500 p-1 rounded-[3.5rem] shadow-2xl animate-fade-in">
                    <div className="bg-white p-8 md:p-12 rounded-[3.4rem] text-center space-y-8">
                        {!certificateBlob ? (
                            <>
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black text-orange-600">🎉 Unlocked!</h3>
                                    <p className="text-xl text-slate-500 font-bold">You mastered the lesson! Claim your official Merit Certificate.</p>
                                </div>
                                <form onSubmit={generateCertificate} className="max-w-md mx-auto space-y-4">
                                    <input type="text" placeholder="Your Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-400 outline-none font-bold" required />
                                    <input type="text" placeholder="Grade (e.g. 5th Std)" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-400 outline-none font-bold" required />
                                    <input type="text" placeholder="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-400 outline-none font-bold" required />
                                    <button type="submit" disabled={generatingCert} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all uppercase tracking-tight">
                                        {generatingCert ? 'Crafting Certificate...' : 'Generate My Certificate 🏆'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-8">
                                <h3 className="text-3xl font-black text-blue-700">🎓 Your Certificate is Ready!</h3>
                                <img src={URL.createObjectURL(certificateBlob)} alt="Merit Certificate" className="w-full rounded-2xl shadow-lg border-4 border-slate-50 mx-auto max-w-2xl" />
                                <div className="flex flex-col md:flex-row justify-center gap-4">
                                    <a href={URL.createObjectURL(certificateBlob)} download={`${studentName}_Certificate.png`} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Download Image
                                    </a>
                                    <button onClick={() => setShowCertificateForm(false)} className="bg-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition">Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Chatbot */}
            <div ref={chatSectionRef} className="mt-16">
                <StoryChat story={story} />
            </div>

            {/* Back Button */}
            <div className="mt-16 text-center">
                <button onClick={onTryAnother} className="bg-slate-900 text-white font-black py-5 px-12 rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 shadow-xl uppercase tracking-widest text-sm">
                    ✨ Create Another Magic Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;

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
        if (lower.includes('explanation')) return '💡';
        if (lower.includes('resolution')) return '✅';
        if (lower.includes('moral')) return '🌟';
        if (lower.includes('conclusion')) return '🎓';
        return '📖';
    };

    return (
        <div className="mb-6 bg-white p-6 md:p-8 rounded-[2rem] border-l-8 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-3 capitalize flex items-center gap-3">
                <span className="text-3xl">{getIcon(title)}</span>
                {title.replace(/_/g, ' ')}
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg font-medium">{content}</p>
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
        if (isCorrect) setScore(prev => prev + 1);
        
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
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-3">
                <span className="text-4xl">🧠</span> Knowledge Check
            </h3>
            <div className="space-y-12">
                {quiz.map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-black text-slate-800 leading-snug">{index + 1}. {q.question}</p>
                        <div className="grid gap-4">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === q.answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-5 rounded-2xl border-2 transition-all font-bold text-lg ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-100";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-100";
                                    else btnStyle += "border-slate-100 text-slate-300";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-500 text-blue-800 shadow-md transform scale-[1.01]";
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
                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-xl shadow-slate-200 ml-auto block transform hover:scale-105"
                            >
                                Check Answer
                            </button>
                        )}
                        {showResult[index] && (
                             <div className={`p-5 rounded-2xl text-lg font-black text-center animate-fade-in shadow-sm ${answers[index] === q.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {answers[index] === q.answer ? "✨ Excellent! That's correct!" : "Don't worry, every mistake is a step toward understanding! 💪"}
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
        if (score === 3) {
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

        // High-res canvas
        canvas.width = 1600;
        canvas.height = 1100;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 1600, 1100);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#f8fafc');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1600, 1100);

        // Borders
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 40;
        ctx.strokeRect(0, 0, 1600, 1100);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 10;
        ctx.strokeRect(70, 70, 1460, 960);

        // Header
        ctx.font = 'bold 110px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE', 800, 260);
        
        ctx.font = 'bold 50px "Nunito", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OF MERIT', 800, 330);

        ctx.font = 'italic 35px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('This is proudly presented to', 800, 440);

        // Name
        ctx.font = 'bold italic 100px "Nunito", serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(studentName, 800, 560);

        // Details
        ctx.font = '32px "Nunito", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(`Grade: ${studentClass} | School: ${schoolName}`, 800, 640);

        ctx.font = 'italic 30px "Nunito", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('For successfully mastering the concept of', 800, 730);

        // Story Title
        ctx.font = 'bold 50px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(story.title, 800, 810);

        // Footer
        ctx.font = 'bold 40px "Nunito", sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText('FeelEd AI', 800, 940);
        ctx.font = '24px "Nunito", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Emotion-Adaptive Education Framework', 800, 980);

        // Logo image loading (mocked for this implementation)
        const img = new Image();
        img.src = '/logo.svg';
        img.onload = () => {
            ctx.drawImage(img, 1350, 100, 180, 180);
            canvas.toBlob((blob) => {
                if (blob) setCertificateBlob(blob);
                setGeneratingCert(false);
            }, 'image/png');
        };
        img.onerror = () => {
             canvas.toBlob((blob) => {
                if (blob) setCertificateBlob(blob);
                setGeneratingCert(false);
            }, 'image/png');
        }
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

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(`I just finished reading and learning from "${story.title}" on FeelEd AI! Check out this amazing AI story: https://feeledai.com`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    useEffect(() => {
        return () => {
            audioSourceRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-24 px-4">
            {/* Title Header */}
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl md:text-6xl font-black text-blue-800 tracking-tighter leading-tight drop-shadow-sm">{story.title}</h2>
                <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-600 font-black text-sm uppercase tracking-widest shadow-sm">
                    Tone: {story.emotion_tone}
                </div>
            </div>

            {/* Theme Image */}
            <div className="mb-16">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-white rounded-[4rem] shadow-2xl border-4 border-white flex items-center justify-center animate-pulse">
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-inner">🎨</div>
                            <p className="text-slate-400 font-black text-xl tracking-tight">AI is painting the world for you...</p>
                        </div>
                    </div>
                ) : base64Image && (
                    <div className="relative group overflow-hidden rounded-[4rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-[12px] border-white ring-2 ring-slate-100 transition-all duration-700 hover:scale-[1.01]">
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                )}
            </div>

            {/* Voice Control Floating Bar */}
            <div className="sticky top-28 z-40 flex justify-center mb-16 pointer-events-none">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="pointer-events-auto bg-white/90 backdrop-blur-2xl border-4 border-white shadow-2xl px-12 py-6 rounded-full font-black text-blue-700 flex items-center gap-5 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-8 ring-blue-50/50 group"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-xl transition-colors duration-300 group-hover:rotate-6`}>
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4h2V8H7zm4 0v4h2V8h-2z"/></svg>
                            ) : (
                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 00-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            )}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Creating Voice...' : isDecoding ? 'Preparing...' : isPlaying ? 'Stop Story' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            {/* Story Content Cards */}
            <div className="space-y-8">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-8">
                    <StorySection title="Moral Message" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Quiz */}
            <QuizSection quiz={story.quiz} onQuizComplete={handleQuizComplete} />
            
            {/* Merit Certificate Unlocked */}
            {showCertificateForm && (
                <div ref={certRef} className="mt-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-2 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(245,158,11,0.4)] animate-fade-in transform hover:-translate-y-2 transition-all duration-500">
                    <div className="bg-white p-10 md:p-16 rounded-[3.8rem] text-center space-y-10">
                        {!certificateBlob ? (
                            <>
                                <div className="space-y-4">
                                    <div className="text-7xl mb-4 animate-bounce">🏆</div>
                                    <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Congratulations!</h3>
                                    <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto">You've mastered this lesson with a perfect score! Claim your official Merit Certificate.</p>
                                </div>
                                <form onSubmit={generateCertificate} className="max-w-md mx-auto space-y-5">
                                    <input type="text" placeholder="Enter Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-xl transition-all shadow-inner" required />
                                    <input type="text" placeholder="Grade (e.g. 5th Std)" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-xl transition-all shadow-inner" required />
                                    <input type="text" placeholder="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-orange-400 focus:bg-white outline-none font-black text-xl transition-all shadow-inner" required />
                                    <button type="submit" disabled={generatingCert} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-tighter border-b-8 border-red-800">
                                        {generatingCert ? 'Crafting Merit...' : 'Generate Certificate 🏆'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-10 animate-fade-in">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-blue-800">Merit Certificate Ready!</h3>
                                    <p className="text-lg text-slate-400 font-bold uppercase tracking-widest">A legacy of learning starts here</p>
                                </div>
                                <div className="relative group max-w-3xl mx-auto">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
                                    <img src={URL.createObjectURL(certificateBlob)} alt="Merit Certificate" className="relative w-full rounded-[2rem] shadow-2xl border-4 border-slate-100" />
                                </div>
                                <div className="flex flex-col md:flex-row justify-center gap-6 pt-4">
                                    <a href={URL.createObjectURL(certificateBlob)} download={`${studentName}_Merit_Certificate.png`} className="bg-slate-900 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl hover:-translate-y-1">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Download Image
                                    </a>
                                    <button onClick={() => setShowCertificateForm(false)} className="bg-slate-100 text-slate-600 px-12 py-5 rounded-full font-black text-xl hover:bg-slate-200 transition-all shadow-md">Close View</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Socratic AI Chatbot */}
            <div ref={chatSectionRef} className="mt-20">
                <StoryChat story={story} />
            </div>

            {/* Sharing Bar */}
            <div className="mt-20 bg-white/60 backdrop-blur-xl border-4 border-white p-8 rounded-[3.5rem] shadow-2xl text-center space-y-8 animate-fade-in">
                 <h3 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-3">
                    <span className="text-3xl">🔗</span> Share this Magic Story
                 </h3>
                 <div className="flex flex-wrap justify-center gap-5">
                    <button onClick={handleShareWhatsApp} className="bg-[#25D366] text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-100">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7.1-4.2-73.3 19.3 19.3-71.6-4.7-7.5c-19.1-30.3-29.8-66-29.8-103.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        WhatsApp
                    </button>
                    <button onClick={() => {
                        const text = `Title: ${story.title}\nConcept: ${story.concept_explanation}\nFull story available at https://feeledai.com`;
                        navigator.clipboard.writeText(text);
                        alert("Story summary copied to clipboard!");
                    }} className="bg-slate-800 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                        Copy Link
                    </button>
                 </div>
            </div>

            {/* Final CTA */}
            <div className="mt-16 text-center">
                <button onClick={onTryAnother} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-6 px-16 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-200 transition-all transform hover:scale-105 uppercase tracking-tighter text-xl border-b-8 border-indigo-900">
                    ✨ Create Another Magic Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;
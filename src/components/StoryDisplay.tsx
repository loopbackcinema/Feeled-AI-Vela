import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Story, QuizQuestion } from '../types';
import Spinner from './Spinner';
import StoryChat from './StoryChat';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';

interface StoryDisplayProps {
    story: Story;
    language: string;
    base64Audio: string | null;
    isAudioLoading: boolean;
    base64Image: string | null;
    imageMimeType: string | null;
    isImageLoading: boolean;
    onTryAnother: () => void;
}

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-8 border-indigo-400 dark:border-indigo-500 shadow-sm transition-transform hover:translate-x-2">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 capitalize flex items-center gap-3">
            {title === 'Introduction' && '✨'}
            {title === 'Emotional_trigger' && '❤️'}
            {title === 'Concept_explanation' && '💡'}
            {title === 'Resolution' && '✅'}
            {title === 'Moral_message' && '🌟'}
            {title === 'Conclusion' && '🎓'}
            {title === 'Emotional_trigger' ? 'Emotional Trigger' : title === 'Concept_explanation' ? 'Concept Explanation' : title === 'Moral_message' ? 'Moral Message' : title.replace(/_/g, ' ')}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xl font-medium">{content}</p>
    </div>
);

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
        let newScore = score;
        if (isCorrect) {
            newScore = score + 1;
            setScore(newScore);
        }
        setShowResult(prev => ({ ...prev, [qIndex]: true }));
        
        const nextResults = { ...showResult, [qIndex]: true };
        if (Object.keys(nextResults).length === quiz.length && !isCompleted) {
            setIsCompleted(true);
            onQuizComplete(newScore);
        }
    };

    return (
        <div className="mt-16 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-indigo-50 dark:border-slate-800 shadow-2xl transition-colors duration-300">
            <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-400 mb-10 text-center flex items-center justify-center gap-4">
                <span>🧠</span> Knowledge Verification
            </h3>
            <div className="space-y-10">
                {(quiz ?? []).map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-black text-slate-800 dark:text-slate-200">{index + 1}. {q.question}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {(q.options ?? []).map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === quiz[index].answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-4 rounded-2xl border-4 font-bold transition-all ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300";
                                    else if (isSelected) btnStyle += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300";
                                    else btnStyle += "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-50";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:focus:border-blue-500 text-blue-800 dark:text-blue-200 scale-[1.02] shadow-lg";
                                    else btnStyle += "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 text-slate-600 dark:text-slate-400";
                                }

                                return (
                                    <button key={option} onClick={() => handleOptionSelect(index, option)} className={btnStyle} disabled={isRevealed}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <div className="flex justify-end pt-4">
                                <button onClick={() => handleCheckAnswer(index)} disabled={!answers[index]} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50">
                                    Verify Answer
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Audio Utilities
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, language, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const certificateRef = useRef<HTMLDivElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [activeTab, setActiveTab] = useState<'story' | 'chat'>('story');
    const [shareOpen, setShareOpen] = useState(false);
    
    const chatSectionRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => window.print();

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
                source.onended = () => { setIsPlaying(false); audioSourceRef.current = null; };
                source.start(0);
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (e) { console.error(e); }
            finally { setIsDecoding(false); }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    const shareText = `I just completed a learning journey on FeelEd AI! 🎓 I learned about "${story.title}" and scored ${quizScore}/${story.quiz?.length ?? 0} on the quiz. Check it out!`;
    const storyShareText = (story.introduction || '').slice(0, 150);
    const shareUrl = window.location.origin;

    const handleNativeShare = async () => {
        if (!certificateRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true
            });
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Failed to generate image');

            const file = new File([blob], 'certificate.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'FeelEd AI Certificate',
                    text: shareText,
                });
            } else {
                // Fallback: Download image
                const link = document.createElement('a');
                link.download = 'feeled-ai-certificate.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                alert('Native sharing not supported. Certificate downloaded instead!');
            }
        } catch (error) {
            console.error('Sharing failed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const shareOnWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(url, '_blank');
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };

    const shareOnX = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-32 px-4 print:max-w-full">
            {/* Top Nav Bar */}
            <div className="flex items-center gap-3 mb-10 no-print">
                <button
                    onClick={onTryAnother}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors text-sm"
                >
                    ← Back
                </button>
                <button
                    onClick={() => navigate('/', { state: { prefilledMessage: `Tell me more about the story: "${story.title}"` } })}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm hover:border-indigo-400"
                >
                    💬 Ask about story
                </button>
                <button
                    onClick={() => navigate('/', { state: { prefilledMessage: `Give me exam prep for: "${story.title}"` } })}
                    className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-medium transition-colors border border-orange-200 dark:border-orange-800/50 rounded-lg px-3 py-1.5 text-sm hover:border-orange-400"
                >
                    📝 Exam Mode
                </button>
            </div>

            {/* Header */}
            <div className="text-center mb-16 space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter print:text-4xl">{story.title}</h2>
                <div className="flex justify-center gap-4 no-print">
                    <span className="px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest">
                        Tone: {story.emotion_tone}
                    </span>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-black text-xs uppercase hover:bg-slate-800 dark:hover:bg-slate-700 transition">
                        <span>🖨️</span> Save as PDF
                    </button>
                </div>
            </div>

            {/* Visual */}
            <div className="mb-16 transform transition-all hover:scale-[1.01]">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-indigo-50 dark:bg-slate-800 rounded-[3rem] animate-pulse border-4 border-white dark:border-slate-700 shadow-xl flex items-center justify-center">
                        <p className="text-indigo-300 dark:text-slate-500 font-black text-xl">Creating mental imagery...</p>
                    </div>
                ) : base64Image && (
                    <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-slate-800 shadow-3xl ring-2 ring-slate-100 dark:ring-slate-900">
                        <img src={`data:${imageMimeType};base64,${base64Image}`} alt={story.title} className="w-full h-auto object-cover" />
                    </div>
                )}
            </div>

            {/* Voice Toggle */}
            <div className="flex justify-center mb-16 no-print">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-white dark:border-slate-800 shadow-[0_30px_60px_-10px_rgba(79,70,229,0.3)] px-12 py-6 rounded-full font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-8 ring-indigo-50/50 dark:ring-indigo-900/20"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPlaying ? 'bg-rose-500' : 'bg-indigo-600'} text-white shadow-xl`}>
                            {isPlaying ? '■' : '▶'}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Synthesizing...' : isDecoding ? 'Buffering...' : isPlaying ? 'Stop Narration' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            {/* Story Flow */}
            <div className="space-y-8">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional_trigger" content={story.emotional_trigger} />
                <StorySection title="Concept_explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-8">
                     <StorySection title="Moral_message" content={story.moral_message} />
                     <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Share Story radial menu */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 16, minHeight: shareOpen ? '180px' : '52px', transition: 'min-height 0.3s ease' }} className="no-print">
                <button
                    onClick={() => setShareOpen(o => !o)}
                    style={{ padding: '10px 20px', borderRadius: 20, background: shareOpen ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#0d0d1c', border: '0.5px solid #4f46e5', color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', transform: shareOpen ? 'rotate(5deg)' : 'rotate(0)', position: 'relative', zIndex: 10 }}
                >
                    {shareOpen ? '✕ Close' : '🔗 Share Story'}
                </button>
                {([
                    { icon: '💬', label: 'WhatsApp', color: '#25d366', angle: -120, href: `https://wa.me/?text=${encodeURIComponent('Check this FeelEd AI story! ' + storyShareText + ' https://feeledai.com')}` },
                    { icon: '📘', label: 'Facebook', color: '#1877f2', angle:  -60, href: 'https://www.facebook.com/sharer/sharer.php?u=https://feeledai.com' },
                    { icon: '𝕏',  label: 'X',        color: '#111',    angle:    0, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Learning with FeelEd AI! ' + storyShareText)}&url=https://feeledai.com` },
                    { icon: 'in', label: 'LinkedIn', color: '#0077b5', angle:   60, href: 'https://www.linkedin.com/sharing/share-offsite/?url=https://feeledai.com' },
                ] as { icon: string; label: string; color: string; angle: number; href: string }[]).map((item, i) => {
                    const rad = ((item.angle - 90) * Math.PI) / 180;
                    const radius = 70;
                    const x = Math.cos(rad) * radius;
                    const y = Math.sin(rad) * radius;
                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={item.label}
                            style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none', transform: shareOpen ? `translate(${x}px,${y}px) scale(1)` : 'translate(0,0) scale(0)', opacity: shareOpen ? 1 : 0, transition: `all 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`, boxShadow: `0 4px 12px ${item.color}60`, zIndex: 9, top: '50%', left: '50%', marginTop: -20, marginLeft: -20, pointerEvents: shareOpen ? 'auto' : 'none' }}
                        >
                            {item.icon}
                        </a>
                    );
                })}
                <button
                    onClick={() => { navigator.clipboard.writeText(storyShareText); alert('Story copied!'); }}
                    title="Copy"
                    style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: '#4f46e5', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer', transform: shareOpen ? `translate(${Math.cos((30) * Math.PI / 180) * 70}px,${Math.sin((30) * Math.PI / 180) * 70}px) scale(1)` : 'translate(0,0) scale(0)', opacity: shareOpen ? 1 : 0, transition: `all 0.35s cubic-bezier(0.34,1.56,0.64,1) ${4 * 0.06}s`, boxShadow: '0 4px 12px #4f46e560', zIndex: 9, top: '50%', left: '50%', marginTop: -20, marginLeft: -20, pointerEvents: shareOpen ? 'auto' : 'none' }}
                >
                    📋
                </button>
            </div>

            {/* Quiz */}
            <div className="no-print">
                <QuizSection quiz={story.quiz} onQuizComplete={(score) => {
                    setQuizScore(score);
                }} />
            </div>

            {/* Certificate Section */}
            {quizScore !== null && (
                <div className="mt-24 no-print animate-bounce-in">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Congratulations! 🎊</h3>
                        <p className="text-slate-600 dark:text-slate-400">You've successfully completed the evaluation.</p>
                    </div>

                    {/* Certificate Preview */}
                    <div className="flex justify-center mb-12">
                        <div 
                            ref={certificateRef}
                            className="w-full max-w-2xl aspect-[1.414/1] bg-white border-[16px] border-indigo-600 p-12 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-indigo-200"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-indigo-200"></div>
                            
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">F</div>
                                <h4 className="text-indigo-600 font-black uppercase tracking-[0.3em] text-sm">Certificate of Achievement</h4>
                            </div>

                            <div className="space-y-6">
                                <p className="text-slate-500 italic">This is to certify that</p>
                                <h5 className="text-4xl font-black text-slate-900 border-b-4 border-slate-100 pb-2 px-8">
                                    {userProfile?.displayName || user?.displayName || 'Academic Explorer'}
                                </h5>
                                <p className="text-slate-600 max-w-md">
                                    has successfully completed the pedagogical journey on
                                    <span className="block font-bold text-indigo-600 mt-2 text-xl">"{story.title}"</span>
                                </p>
                            </div>

                            <div className="w-full flex justify-between items-end mt-8">
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-black text-slate-400">Score Achieved</p>
                                    <p className="text-2xl font-black text-indigo-600">{quizScore} / {story.quiz?.length ?? 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black text-slate-400">Verified By</p>
                                    <p className="font-black text-slate-900">FeelEd AI Affective Engine</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-col items-center gap-8">
                        <button 
                            onClick={handleNativeShare}
                            disabled={isSharing}
                            className="w-full max-w-md py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4"
                        >
                            {isSharing ? <Spinner /> : <span>📤 Share Certificate</span>}
                        </button>

                        <div className="flex gap-4">
                            <button 
                                onClick={shareOnWhatsApp}
                                className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                title="Share on WhatsApp"
                            >
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </button>
                            <button 
                                onClick={shareOnFacebook}
                                className="w-14 h-14 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                title="Share on Facebook"
                            >
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </button>
                            <button 
                                onClick={shareOnX}
                                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                title="Share on X"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Bar */}
<div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex no-print mt-16 rounded-2xl overflow-hidden shadow-sm">
    <button
        onClick={() => setActiveTab('story')}
        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'story'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
        }`}
    >
        📖 Story
    </button>
    <button
        onClick={() => setActiveTab('chat')}
        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'chat'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
        }`}
    >
        💬 Ask Narrator
    </button>
</div>

{/* Tab Content */}
<div className="mt-8 no-print">
    {activeTab === 'story' ? (
        <div className="space-y-0">
            {/* Story Flow */}
            <div className="space-y-8">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional_trigger" content={story.emotional_trigger} />
                <StorySection title="Concept_explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-8">
                    <StorySection title="Moral_message" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>
            {/* Quiz */}
            <div className="mt-16">
                <QuizSection quiz={story.quiz} onQuizComplete={(score) => setQuizScore(score)} />
            </div>
            {/* Certificate */}
            {quizScore !== null && (
                <div className="mt-24 animate-bounce-in">
                    {/* keep existing certificate JSX here — don't delete */}
                </div>
            )}
        </div>
    ) : (
        <div ref={chatSectionRef}>
            <StoryChat story={story} language={language} />
        </div>
    )}
</div>

            {/* Restart */}
            <div className="mt-24 text-center no-print">
                <button onClick={onTryAnother} className="bg-slate-900 text-white font-black py-8 px-20 rounded-[3rem] shadow-4xl hover:bg-indigo-700 transition-all transform hover:scale-105 uppercase tracking-tighter text-2xl border-b-[12px] border-slate-950 active:border-b-0">
                    ✨ Generate New Journey
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;

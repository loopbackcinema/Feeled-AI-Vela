import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Story } from '../types';
import Spinner from './Spinner';

interface StoryDisplayProps {
    story: Story;
    base64Audio: string;
    onTryAnother: () => void;
}

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2 capitalize border-b-2 border-blue-50 pb-1">{title.replace(/_/g, ' ')}</h3>
        <p className="text-slate-700 leading-relaxed text-lg">{content}</p>
    </div>
);

// Helper function to decode base64
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper function to decode raw PCM data into an AudioBuffer
async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const numChannels = 1;
  const sampleRate = 24000;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);

    const handlePlayPause = useCallback(async () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        const audioCtx = audioContextRef.current;

        if (isPlaying && audioSourceRef.current) {
            audioSourceRef.current.stop();
        } else if (!isDecoding) {
            setIsDecoding(true);
            try {
                const audioBytes = decode(base64Audio);
                const audioBuffer = await decodePcmAudioData(audioBytes, audioCtx);
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    setIsPlaying(false);
                    audioSourceRef.current = null;
                };
                source.start(0);
                
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (error) {
                console.error("Audio error:", error);
            } finally {
                setIsDecoding(false);
            }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    useEffect(() => {
        return () => {
            if (audioSourceRef.current) audioSourceRef.current.stop();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
        };
    }, []);
    
    return (
        <div className="w-full max-w-3xl bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-100 animate-fade-in mb-12">
            <h2 className="text-4xl font-black text-center mb-2 text-blue-600 tracking-tight">{story.title}</h2>
            <p className="text-center text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">Tone: {story.emotion_tone}</p>

            <div className="mb-10 text-center">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isDecoding}
                    className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto disabled:bg-slate-300"
                >
                    {isDecoding ? <Spinner /> : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            {isPlaying ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />}
                        </svg>
                    )}
                    <span className="text-lg">{isDecoding ? 'Preparing...' : (isPlaying ? 'Stop Story' : 'Narrate Story')}</span>
                 </button>
            </div>
            
            <div className="space-y-4">
                <StorySection title="The Beginning" content={story.introduction} />
                <StorySection title="The Twist" content={story.emotional_trigger} />
                <StorySection title="The Lesson" content={story.concept_explanation} />
                <StorySection title="The Solution" content={story.resolution} />
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
                    <StorySection title="Wisdom" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            <div className="mt-12 text-center pt-8 border-t border-slate-100">
                <button onClick={onTryAnother} className="text-blue-600 font-bold hover:underline">
                    Generate another topic
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;
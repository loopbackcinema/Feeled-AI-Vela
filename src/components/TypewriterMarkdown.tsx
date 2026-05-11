import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TypewriterMarkdownProps {
    text: string;
}

const WORDS_PER_TICK = 4;
const TICK_MS = 25;

const TypewriterMarkdown: React.FC<TypewriterMarkdownProps> = ({ text }) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const idxRef = useRef(0);

    useEffect(() => {
        idxRef.current = 0;
        setDisplayed('');
        setDone(false);

        const words = text.split(' ');

        const id = setInterval(() => {
            idxRef.current += WORDS_PER_TICK;
            if (idxRef.current >= words.length) {
                setDisplayed(text);
                setDone(true);
                clearInterval(id);
            } else {
                setDisplayed(words.slice(0, idxRef.current).join(' '));
            }
        }, TICK_MS);

        return () => clearInterval(id);
    }, [text]);

    return (
        <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayed.replace(/\nFOLLOWUP:[^\n]*/g, '').replace(/FOLLOWUP:[^\n]*/g, '')}</ReactMarkdown>
            {!done && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 animate-pulse rounded-full ml-0.5" />
            )}
        </>
    );
};

export default TypewriterMarkdown;

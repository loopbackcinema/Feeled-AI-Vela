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
        <div className="prose prose-sm dark:prose-invert prose-slate max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-blockquote:border-indigo-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayed.replace(/\nFOLLOWUP:[^\n]*/g, '').replace(/FOLLOWUP:[^\n]*/g, '')}</ReactMarkdown>
            {!done && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 animate-pulse rounded-full ml-0.5" />
            )}
        </div>
    );
};

export default TypewriterMarkdown;

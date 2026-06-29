/**
 * MemoryLayer — src/components/cinema/MemoryLayer.tsx
 *
 * Memory anchor overlay. Zero logic.
 * Input:  MemoryPresentation
 * Output: Evocative image description + anchor sentence
 */
import React from 'react';
import { MemoryPresentation } from '../../cinema/presentation/PresentationModel';

interface Props {
    memory: MemoryPresentation;
    accentColor: string;
}

const MemoryLayer: React.FC<Props> = ({ memory, accentColor }) => {
    if (!memory.visible) return null;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 25,
            background: 'rgba(4,0,14,.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 28px',
            backdropFilter: 'blur(6px)',
        }}>
            <style>{`
                @keyframes ml-in  { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
                @keyframes ml-up  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
            `}</style>

            {/* Image description */}
            <div style={{
                animation: 'ml-in .6s ease',
                textAlign: 'center',
                marginBottom: 20,
            }}>
                <div style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    background: `${accentColor}18`,
                    border: `2px solid ${accentColor}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    fontSize: 32,
                }}>
                    🧠
                </div>
                <p style={{
                    color: '#c4b5fd',
                    fontSize: 'clamp(.78rem,2vw,.9rem)',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                    maxWidth: 320,
                }}>
                    {memory.imageDescription}
                </p>
            </div>

            {/* Anchor sentence */}
            {memory.sentenceVisible && memory.sentence && (
                <div style={{
                    animation: 'ml-up .5s ease',
                    background: `${accentColor}12`,
                    border: `1px solid ${accentColor}44`,
                    borderRadius: 12,
                    padding: '12px 18px',
                    maxWidth: 340,
                    textAlign: 'center',
                }}>
                    <p style={{
                        color: '#f0abfc',
                        fontSize: 'clamp(.82rem,2.1vw,.96rem)',
                        fontWeight: 700,
                        lineHeight: 1.5,
                        margin: 0,
                    }}>
                        "{memory.sentence}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default MemoryLayer;

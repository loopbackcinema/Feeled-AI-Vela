/**
 * InteractionLayer — src/components/cinema/InteractionLayer.tsx
 *
 * Pure interaction UI. Zero logic.
 * Input:  InteractionPresentation + callbacks
 * Output: Question + options overlay
 */
import React from 'react';
import { InteractionPresentation } from '../../cinema/presentation/PresentationModel';

interface Props {
    interaction: InteractionPresentation;
    accentColor: string;
    onRespond: (index: number) => void;
    onAcknowledge: () => void;
}

const InteractionLayer: React.FC<Props> = ({ interaction, accentColor, onRespond, onAcknowledge }) => {
    const { mode, question, options, feedback, feedbackColor } = interaction;

    if (mode === 'hidden') return null;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(4,0,14,.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            backdropFilter: 'blur(4px)',
        }}>
            <style>{`@keyframes il-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }`}</style>

            <div style={{
                width: '100%',
                maxWidth: 380,
                animation: 'il-in .35s ease',
            }}>
                {/* Question */}
                <p style={{
                    color: '#e2e8f0',
                    fontWeight: 700,
                    fontSize: 'clamp(.8rem,2.2vw,.96rem)',
                    lineHeight: 1.5,
                    marginBottom: 14,
                    textAlign: 'center',
                }}>
                    {mode === 'reflect' ? '💭 ' : '🤔 '}{question}
                </p>

                {/* Options */}
                {mode !== 'reflect' && options.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {options.map((opt) => {
                            const bg =
                                opt.state === 'correct' ? 'rgba(34,197,94,.14)' :
                                opt.state === 'wrong'   ? 'rgba(239,68,68,.14)'  :
                                opt.state === 'selected'? 'rgba(79,70,229,.16)'  :
                                'rgba(255,255,255,.03)';
                            const border =
                                opt.state === 'correct' ? '1.5px solid #22c55e' :
                                opt.state === 'wrong'   ? '1.5px solid #ef4444'  :
                                opt.state === 'selected'? '1.5px solid #6366f1'  :
                                `1px solid ${accentColor}33`;
                            const color =
                                opt.state === 'correct' ? '#86efac' :
                                opt.state === 'wrong'   ? '#fca5a5'  :
                                opt.state === 'selected'? '#c7d2fe'  :
                                '#94a3b8';

                            return (
                                <button
                                    key={opt.index}
                                    onClick={() => onRespond(opt.index)}
                                    disabled={interaction.options.some(o => o.state === 'correct' || o.state === 'wrong')}
                                    style={{
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: 'clamp(.68rem,1.7vw,.8rem)',
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                        background: bg,
                                        border,
                                        color,
                                    }}
                                >
                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <p style={{
                        textAlign: 'center',
                        color: feedbackColor,
                        fontSize: '.8rem',
                        fontWeight: 700,
                        marginBottom: 10,
                    }}>
                        {feedback}
                    </p>
                )}

                {/* Acknowledge (reflect mode or after answer) */}
                {(mode === 'reflect' || mode === 'feedback') && (
                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={onAcknowledge}
                            style={{
                                background: `${accentColor}22`,
                                border: `1px solid ${accentColor}55`,
                                borderRadius: 8,
                                padding: '7px 20px',
                                color: accentColor,
                                cursor: 'pointer',
                                fontSize: '.78rem',
                                fontWeight: 700,
                            }}
                        >
                            Continue →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractionLayer;

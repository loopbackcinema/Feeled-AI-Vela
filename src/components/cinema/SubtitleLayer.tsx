/**
 * SubtitleLayer — src/components/cinema/SubtitleLayer.tsx
 *
 * Pure subtitle renderer. Zero logic.
 * Input:  SubtitlePresentation
 * Output: Subtitle bar visual
 *
 * Rule: No speaker detection here.
 *       speakerLabel, speakerColor, key — all pre-computed by PresentationModelBuilder.
 */
import React from 'react';
import { SubtitlePresentation } from '../../cinema/presentation/PresentationModel';

interface Props {
    subtitle: SubtitlePresentation;
    accentColor: string;
}

const SubtitleLayer: React.FC<Props> = ({ subtitle, accentColor }) => {
    const { visible, text, speakerLabel, speakerColor, isConceptReveal, isBilingual, secondaryText, key } = subtitle;

    return (
        <div style={{
            flexShrink: 0,
            minHeight: 54,
            maxHeight: 86,
            background: isConceptReveal
                ? 'linear-gradient(135deg,rgba(26,0,53,.98),rgba(10,0,24,.98))'
                : 'rgba(4,0,12,.95)',
            borderTop: `2px solid ${isConceptReveal ? '#f0abfc44' : accentColor + '2e'}`,
            padding: '6px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            ...(isConceptReveal ? { animation: 'sl-glow 3s ease-in-out infinite' } : {}),
        }}>
            <style>{`
                @keyframes sl-glow {
                    0%,100% { box-shadow: 0 0 8px rgba(240,171,252,.14); }
                    50%     { box-shadow: 0 0 22px rgba(240,171,252,.46); }
                }
                @keyframes sl-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: none; }
                }
            `}</style>

            {visible && text ? (
                <>
                    {speakerLabel && (
                        <span style={{
                            fontSize: '.5rem',
                            fontWeight: 800,
                            color: speakerColor,
                            opacity: 0.6,
                            marginBottom: 2,
                            letterSpacing: '.04em',
                        }}>
                            {speakerLabel}
                        </span>
                    )}

                    <p
                        key={key}
                        style={{
                            margin: 0,
                            color: speakerColor,
                            fontSize: 'clamp(.76rem,2.1vw,.93rem)',
                            lineHeight: 1.52,
                            fontStyle: speakerLabel?.includes('Narrator') ? 'italic' : 'normal',
                            fontWeight: isConceptReveal ? 700 : 500,
                            animation: 'sl-in .3s ease',
                        }}
                    >
                        {text}
                    </p>

                    {isBilingual && secondaryText && (
                        <p style={{
                            margin: '3px 0 0',
                            color: speakerColor,
                            fontSize: 'clamp(.68rem,1.8vw,.82rem)',
                            lineHeight: 1.4,
                            opacity: 0.7,
                            fontStyle: 'italic',
                        }}>
                            {secondaryText}
                        </p>
                    )}
                </>
            ) : (
                <p style={{
                    margin: 0,
                    textAlign: 'center',
                    color: '#1e293b',
                    fontSize: '.66rem',
                    fontStyle: 'italic',
                }}>
                    ·
                </p>
            )}
        </div>
    );
};

export default SubtitleLayer;

import React from 'react';
import { SceneRenderProps } from './SceneFactory';

export const PhysicsForceScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? tick * 0 + tick : tick; // keep tick for frozen state visual
    const objX = 185 + (isFrozen ? 0 : 16 * Math.sin(t * 0.05 * 0.7));
    const forceLen = 60 + (isFrozen ? 0 : 14 * Math.sin(t * 0.05 * 0.8));
    const revealGlow = isReveal ? 0.6 + 0.3 * Math.sin(t * 0.05 * 0.3) : 0;

    return (<>
        {/* Ground line */}
        <line x1="60" y1="193" x2="340" y2="193" stroke="#1e293b" strokeWidth="1.5"/>

        {/* Object being pushed */}
        <rect x={objX - 24} y="163" width="48" height="28" rx="6"
            fill={`${color}14`} stroke={color} strokeWidth={isReveal ? 2.5 : 1.8}
            strokeOpacity={isReveal ? 1 : 0.9}/>
        <text x={objX} y="181" fill={color} fontSize="11" textAnchor="middle" fontWeight="bold">m</text>

        {/* Reveal: mass label with glow */}
        {isReveal && <rect x={objX-24} y="163" width="48" height="28" rx="6"
            fill="none" stroke={color} strokeWidth="6" filter="url(#f6)" strokeOpacity={revealGlow}/>}

        {/* Force arrow */}
        <line x1={objX - forceLen - 26} y1="177" x2={objX - 26} y2="177"
            stroke={color} strokeWidth="3.5" markerEnd="url(#ar)"/>
        <line x1={objX - forceLen - 26} y1="177" x2={objX - 26} y2="177"
            stroke={color} strokeWidth="9" filter="url(#f3)" opacity="0.18"/>
        <text x={objX - forceLen / 2 - 26} y="166" fill={color} fontSize="12"
            textAnchor="middle" fontWeight="bold">F</text>

        {/* Acceleration arrow (opposite side) */}
        <line x1={objX + 28} y1="177" x2={objX + 78} y2="177"
            stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#ar2)" strokeDasharray="5 3"
            opacity={isReveal ? 1 : 0.7}/>
        <text x={objX + 54} y="166" fill="#60a5fa" fontSize="10" textAnchor="middle">a</text>

        {/* Formula — reveal moment */}
        {isReveal && (
            <g style={{ animation: 'fadein 0.5s ease' }}>
                <rect x="132" y="206" width="136" height="26" rx="7"
                    fill="rgba(0,0,10,.85)" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
                <text x="200" y="223" fill="#f0abfc" fontSize="14" textAnchor="middle"
                    fontFamily="ui-monospace,monospace" fontWeight="bold">F = ma</text>
            </g>
        )}
    </>);
};

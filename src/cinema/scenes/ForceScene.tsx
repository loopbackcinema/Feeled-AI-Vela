/**
 * ForceScene — concept grammar: "force"
 * Subjects: Physics (Newton's Laws, pressure, momentum, friction)
 * Visual: Object with force arrow, acceleration indicator, F=ma reveal
 */
import React from 'react';
import { SceneRenderProps } from './SceneFactory';

const ForceScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? tick : tick;
    const objX = 185 + (isFrozen ? 0 : 16 * Math.sin(t * 0.035));
    const forceLen = 60 + (isFrozen ? 0 : 14 * Math.sin(t * 0.04));
    const glowA = isReveal ? 0.5 + 0.3 * Math.sin(t * 0.05) : 0;

    return (<>
        <line x1="60" y1="193" x2="340" y2="193" stroke="#1e293b" strokeWidth="1.5"/>
        <rect x={objX-24} y="163" width="48" height="28" rx="6"
            fill={`${color}14`} stroke={color} strokeWidth={isReveal ? 2.5 : 1.8}/>
        <text x={objX} y="181" fill={color} fontSize="11" textAnchor="middle" fontWeight="bold">m</text>
        {isReveal && <rect x={objX-24} y="163" width="48" height="28" rx="6"
            fill="none" stroke={color} strokeWidth="6" filter="url(#f6)" strokeOpacity={glowA}/>}
        <defs>
            <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill={color}/>
            </marker>
            <marker id="ar2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="#60a5fa"/>
            </marker>
        </defs>
        <line x1={objX-forceLen-26} y1="177" x2={objX-26} y2="177"
            stroke={color} strokeWidth="3.5" markerEnd="url(#ar)"/>
        <line x1={objX-forceLen-26} y1="177" x2={objX-26} y2="177"
            stroke={color} strokeWidth="9" filter="url(#f3)" opacity="0.18"/>
        <text x={objX-forceLen/2-26} y="166" fill={color} fontSize="12" textAnchor="middle" fontWeight="bold">F</text>
        <line x1={objX+28} y1="177" x2={objX+78} y2="177"
            stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#ar2)" strokeDasharray="5 3"/>
        <text x={objX+54} y="166" fill="#60a5fa" fontSize="10" textAnchor="middle">a</text>
        {isReveal && (<>
            <rect x="132" y="206" width="136" height="26" rx="7"
                fill="rgba(0,0,10,.85)" stroke={color} strokeWidth="1.5" strokeOpacity="0.7"/>
            <text x="200" y="223" fill="#f0abfc" fontSize="14" textAnchor="middle"
                fontFamily="ui-monospace,monospace" fontWeight="bold">F = ma</text>
        </>)}
    </>);
};
export default ForceScene;

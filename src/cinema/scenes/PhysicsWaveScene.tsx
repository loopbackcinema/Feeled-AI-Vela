import React from 'react';
import { SceneRenderProps } from './SceneFactory';

export const PhysicsWaveScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? tick * 0 + tick * 0 : tick * 0.05;
    const pts1 = Array.from({ length: 24 }, (_, j) =>
        `${22 + j * 15},${112 + Math.sin(j * 0.52 + t * 1.2) * 32}`).join(' ');
    const pts2 = Array.from({ length: 24 }, (_, j) =>
        `${22 + j * 15},${162 + Math.sin(j * 0.52 + t * 1.2 + Math.PI) * 20}`).join(' ');
    return (<>
        <polyline points={pts1} fill="none" stroke="#34d399" strokeWidth={isReveal ? 3 : 2.5} strokeLinecap="round"/>
        {isReveal && <polyline points={pts1} fill="none" stroke="#34d399" strokeWidth="9" filter="url(#f3)" opacity="0.2"/>}
        <polyline points={pts2} fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
        {/* Wavelength marker */}
        <line x1="22" y1="200" x2="77" y2="200" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2"/>
        <line x1="22" y1="197" x2="22" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
        <line x1="77" y1="197" x2="77" y2="203" stroke="#6ee7b7" strokeWidth="1"/>
        <text x="50" y="213" fill="#6ee7b7" fontSize="10" textAnchor="middle">λ</text>
        {isReveal && (
            <g>
                <rect x="132" y="216" width="136" height="24" rx="7"
                    fill="rgba(0,0,10,.85)" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.5"/>
                <text x="200" y="232" fill="#86efac" fontSize="11" textAnchor="middle"
                    fontFamily="ui-monospace,monospace">v = fλ</text>
            </g>
        )}
    </>);
};

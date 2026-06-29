import React from 'react';
import { SceneRenderProps } from './SceneFactory';
const GraphScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const movI = isFrozen ? 20 : tick % 40;
    const pts = Array.from({length:40},(_,i) => { const x=-4+i*0.2; return `${50+i*7.5},${238-x*x*8}`; }).join(' ');
    const mx = -4 + movI * 0.2;
    return (<>
        <defs><marker id="gah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#475569"/></marker></defs>
        <line x1="50" y1="238" x2="340" y2="238" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#gah)"/>
        <line x1="50" y1="238" x2="50" y2="68" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#gah)"/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        {isReveal && <polyline points={pts} fill="none" stroke={color} strokeWidth="7" filter="url(#f3)" opacity="0.15"/>}
        <circle cx={50+movI*7.5} cy={238-mx*mx*8} r="5" fill="#fbbf24" filter="url(#f3)"/>
        {isReveal && <text x="200" y="215" fill={color} fontSize="12" textAnchor="middle" fontFamily="ui-monospace,monospace">y = x²</text>}
    </>);
};
export default GraphScene;

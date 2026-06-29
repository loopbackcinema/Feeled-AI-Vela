import React from 'react';
import { SceneRenderProps } from './SceneFactory';
const FlowScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? 0 : tick;
    const flow = (t * 2) % 240;
    const glow = 0.3 + 0.6*Math.abs(Math.sin(t*0.1));
    return (<>
        <rect x="80" y="88" width="240" height="108" rx="8" fill="none" stroke="#1e293b" strokeWidth="2"/>
        <rect x="80" y="128" width="4" height="28" fill="#fbbf24"/>
        <rect x="88" y="122" width="4" height="40" fill="#fbbf24" opacity="0.6"/>
        <text x="70" y="146" fill="#fbbf24" fontSize="9" textAnchor="middle">+</text>
        <text x="70" y="165" fill="#60a5fa" fontSize="9" textAnchor="middle">−</text>
        {Array.from({length:6},(_,i) => (
            <line key={i} x1={198+i*8} y1={i%2===0?88:78} x2={206+i*8} y2={i%2===0?78:88} stroke={color} strokeWidth="2"/>
        ))}
        <circle cx="320" cy="142" r="18" fill={`rgba(251,191,36,${glow*0.12})`} stroke="#fbbf24" strokeWidth="1.5" opacity={glow}/>
        <circle cx="320" cy="142" r="10" fill="#fde68a" filter="url(#f3)" opacity={glow*0.7}/>
        {!isFrozen && <circle cx={80+flow} cy="88" r="5" fill="#60a5fa" opacity="0.9" filter="url(#f3)"/>}
        {isReveal && <text x="200" y="222" fill="#94a3b8" fontSize="10" textAnchor="middle">V = IR</text>}
    </>);
};
export default FlowScene;

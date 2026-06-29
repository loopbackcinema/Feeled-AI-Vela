import React from 'react';
import { SceneRenderProps } from './SceneFactory';
const GrowthScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? 0 : tick * 0.05;
    const b = 1 + 0.04*Math.sin(t*0.9);
    const phase = Math.floor((tick % 120) / 30); // 0=interphase,1=division,2=two cells,3=pause
    return (
        <g transform={`translate(200,128) scale(${b})`}>
            <ellipse cx="0" cy="0" rx="88" ry="64" fill="rgba(52,211,153,0.05)" stroke="#34d399" strokeWidth={isReveal?2.5:2}/>
            {isReveal && <ellipse cx="0" cy="0" rx="88" ry="64" fill="none" stroke="#34d399" strokeWidth="5" filter="url(#f6)" opacity="0.3"/>}
            <ellipse cx="8" cy="-5" rx="30" ry="22" fill="rgba(134,239,172,0.1)" stroke="#86efac" strokeWidth="1.5"/>
            <text x="8" y="-1" fill="#86efac" fontSize="7" textAnchor="middle" opacity="0.65">nucleus</text>
            {[[-46,22],[-56,-9],[36,30],[48,-18]].map(([ox,oy],i) => (
                <ellipse key={i} cx={ox} cy={oy} rx="9" ry="5"
                    fill="rgba(251,146,60,0.5)" opacity={0.5+0.3*Math.sin(t+i*0.9)}/>
            ))}
            {[[-30,-36],[20,-30],[-60,4]].map(([ox,oy],i) => (
                <ellipse key={i} cx={ox} cy={oy} rx="8" ry="5"
                    fill="rgba(34,197,94,0.6)" opacity={0.5+0.3*Math.sin(t*1.1+i)}/>
            ))}
        </g>
    );
};
export default GrowthScene;

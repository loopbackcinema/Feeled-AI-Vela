import React from 'react';
import { SceneRenderProps } from './SceneFactory';
const TransformationScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const w = isFrozen ? 0 : Math.sin(tick*0.04)*5;
    const bonds = [[200,126,'#f43f5e',14,'O'],[154,157,'#60a5fa',12,'H'],[246,157,'#60a5fa',12,'H']];
    return (<>
        {[[200,126,154,157],[200,126,246,157]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1+w} x2={x2} y2={Number(y2)+w} stroke="#64748b" strokeWidth="2.5" opacity="0.7"/>
        ))}
        {bonds.map(([ax,ay,ac,r,lb],i) => (<g key={i}>
            <circle cx={Number(ax)} cy={Number(ay)+w} r={Number(r)} fill={String(ac)} opacity="0.9" filter="url(#f3)"/>
            <text x={Number(ax)} y={Number(ay)+w+4} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">{String(lb)}</text>
        </g>))}
        {isReveal && (<><rect x="132" y="210" width="136" height="24" rx="7" fill="rgba(0,0,10,.85)" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
        <text x="200" y="226" fill="#f0abfc" fontSize="11" textAnchor="middle" fontFamily="ui-monospace,monospace">H₂O</text></>)}
    </>);
};
export default TransformationScene;


import React from 'react';
import type { ReactorData } from '../types';

interface ReactorProps {
    id: number;
    title: string;
    data: ReactorData;
    temperature: number;
}

export const Reactor: React.FC<ReactorProps> = ({ id, title, data }) => {
    const bubbles = Array.from({ length: Math.floor(data.level / 10) + 2 });

    return (
        <div className="w-full max-w-[200px] md:w-1/3 flex flex-col items-center p-2 bg-slate-900/40 rounded-lg">
            <h4 className="text-center text-sm font-bold text-amber-400 mb-2 h-10 flex items-center justify-center w-full">{title}</h4>
            <div className="relative w-40 h-56 mt-4">
                {/* Gauge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 bg-slate-200 rounded-full border-4 border-slate-500 shadow-lg flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <div style={{ transform: `rotate(${(data.alcohol * 2.5) - 45}deg)`}} className="absolute bottom-1/2 left-1/2 w-1 h-8 bg-red-600 origin-bottom transition-transform duration-500"></div>
                        <div className="absolute inset-1 bg-white rounded-full"></div>
                         <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-black font-mono">P</span>
                    </div>
                </div>

                {/* Main Vessel */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-gray-400 rounded-t-lg border-x-8 border-b-8 border-gray-500 shadow-inner overflow-hidden">
                    {/* Liquid */}
                    <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-amber-800 to-amber-600 transition-all duration-500 ease-out"
                        style={{ height: `${data.level}%` }}
                    >
                        {/* Bubbles */}
                        {bubbles.map((_, i) => (
                            <div
                                key={i}
                                className="absolute bottom-0 w-1 h-1 bg-white/50 rounded-full animate-bubble"
                                style={{
                                    left: `${Math.random() * 90 + 5}%`,
                                    animationDuration: `${Math.random() * 3 + 2}s`,
                                    animationDelay: `${Math.random() * 2}s`,
                                }}
                            ></div>
                        ))}
                    </div>
                    {/* Foam */}
                    <div className="absolute top-0 w-full h-4 bg-white/30 backdrop-blur-sm" style={{top: `${100-data.level-5}%`, opacity: data.level > 10 ? 1 : 0}}></div>
                </div>
                 {/* Flanges */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-3 bg-gray-600 rounded-sm"></div>
                <div className="absolute top-[28px] left-1/2 -translate-x-1/2 w-36 h-3 bg-gray-600 rounded-sm"></div>
            </div>
             <div className="w-full mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 p-1 rounded text-center">
                    <div>Azúcar</div>
                    <div className="font-bold text-amber-300">{data.sugar.toFixed(0)} g/L</div>
                </div>
                <div className="bg-slate-700/50 p-1 rounded text-center">
                    <div>Alcohol</div>
                    <div className="font-bold text-green-400">{data.alcohol.toFixed(0)} g/L</div>
                </div>
            </div>
            <style>{`
                @keyframes bubble {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    10% { opacity: 0.7; }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(-150px) scale(1.2); opacity: 0; }
                }
                .animate-bubble {
                    animation-name: bubble;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};
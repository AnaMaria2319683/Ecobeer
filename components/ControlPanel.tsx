
import React from 'react';
import type { SimulationParams, ValveStates } from '../types';

interface ControlPanelProps {
    params: SimulationParams;
    setParam: (param: keyof SimulationParams, value: number) => void;
    valves: ValveStates;
    toggleValve: (valve: keyof ValveStates) => void;
    startSimulation: () => void;
    pauseSimulation: () => void;
    resetSimulation: () => void;
    setPreset: (preset: 'high' | 'balanced' | 'low') => void;
    simulationState: { isRunning: boolean, statusText: string };
}

const Slider: React.FC<{ label: string, value: number, min: number, max: number, unit: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, min, max, unit, onChange }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-1 text-slate-300">
            <span>{label}</span>
            <span className="font-bold text-amber-400">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
    </div>
);

const PanelSection: React.FC<{ title: string, icon: string, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
            <i className={`fas fa-${icon}`}></i>
            {title}
        </h3>
        {children}
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParam, valves, toggleValve, startSimulation, pauseSimulation, resetSimulation, setPreset, simulationState }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg h-full flex flex-col">
            <PanelSection title="Parámetros del Proceso" icon="sliders-h">
                <Slider label="Azúcar Inicial" value={params.sugar} min={50} max={500} unit=" g/L" onChange={(e) => setParam('sugar', parseInt(e.target.value))} />
                <Slider label="Caudal de Mosto" value={params.flow} min={20} max={1000} unit=" L/h" onChange={(e) => setParam('flow', parseInt(e.target.value))} />
                <Slider label="Temperatura" value={params.temperature} min={10} max={35} unit="°C" onChange={(e) => setParam('temperature', parseInt(e.target.value))} />
                <Slider label="Tasa de Recirculación" value={params.recirculation} min={0} max={90} unit="%" onChange={(e) => setParam('recirculation', parseInt(e.target.value))} />
            </PanelSection>

            <PanelSection title="Controles del Proceso" icon="cogs">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => toggleValve('valve12')} className={`p-2 rounded-md text-sm transition-all duration-200 ${valves.valve12 ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 text-slate-300'}`}>
                       <i className={`fas ${valves.valve12 ? 'fa-toggle-on' : 'fa-toggle-off'} mr-1`}></i> Válvula 1-2
                    </button>
                    <button onClick={() => toggleValve('valve23')} className={`p-2 rounded-md text-sm transition-all duration-200 ${valves.valve23 ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 text-slate-300'}`}>
                         <i className={`fas ${valves.valve23 ? 'fa-toggle-on' : 'fa-toggle-off'} mr-1`}></i> Válvula 2-3
                    </button>
                    <button onClick={() => toggleValve('valveRec')} className={`p-2 rounded-md text-sm transition-all duration-200 ${valves.valveRec ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 text-slate-300'}`}>
                        <i className={`fas ${valves.valveRec ? 'fa-recycle' : 'fa-ban'} mr-1`}></i> Recirc.
                    </button>
                </div>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={simulationState.isRunning ? pauseSimulation : startSimulation} className={`w-full p-3 font-bold rounded-lg transition-all duration-200 ${simulationState.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                        <i className={`fas ${simulationState.isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i> {simulationState.isRunning ? 'Pausar' : 'Iniciar'}
                    </button>
                    <button onClick={resetSimulation} className="w-full p-3 font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200">
                        <i className="fas fa-redo mr-2"></i> Reiniciar
                    </button>
                </div>
            </PanelSection>
            
            <PanelSection title="Configuraciones" icon="star">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setPreset('high')} className="p-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">Alto Rendim.</button>
                    <button onClick={() => setPreset('balanced')} className="p-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">Balanceado</button>
                    <button onClick={() => setPreset('low')} className="p-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">Artesanal</button>
                </div>
            </PanelSection>

            <div className="mt-auto pt-4">
                 <div className="flex items-center justify-center p-2 rounded-md bg-slate-900/50 text-sm">
                    <div className={`w-3 h-3 rounded-full mr-2 ${simulationState.isRunning ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    <span>{simulationState.statusText}</span>
                </div>
            </div>
        </div>
    );
};
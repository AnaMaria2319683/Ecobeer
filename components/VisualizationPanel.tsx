
import React from 'react';
import type { SimulationState, SimulationParams } from '../types';
import { Reactor } from './Reactor';
import { IngredientPanel } from './IngredientPanel';
import { Charts } from './Charts';
import { ResultsPanel } from './ResultsPanel';
import { ReportModal as ReportDetails } from './ReportModal';

interface VisualizationPanelProps {
    simulationState: SimulationState;
    params: SimulationParams;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ simulationState, params }) => {
    const { reactors, mixProgress, fermentationComplete, chartData } = simulationState;

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg h-full flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-around gap-4">
                <Reactor id={1} title="Reactor 1: Conversión Primaria" data={reactors[0]} temperature={params.temperature} />
                <div className="hidden md:block text-5xl text-slate-500 animate-pulse">&rarr;</div>
                <Reactor id={2} title="Reactor 2: Maduración" data={reactors[1]} temperature={params.temperature} />
                <div className="hidden md:block text-5xl text-slate-500 animate-pulse">&rarr;</div>
                <Reactor id={3} title="Reactor 3: Clarificación" data={reactors[2]} temperature={params.temperature} />
            </div>

            {!fermentationComplete && <IngredientPanel mixProgress={mixProgress} />}
            
            <Charts chartData={chartData} />

            {fermentationComplete && (
                <div className="animate-fade-in space-y-6">
                    <ResultsPanel simulationState={simulationState} params={params} />
                    <ReportDetails simulationState={simulationState} params={params} />
                </div>
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
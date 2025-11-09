
import React from 'react';
import type { SimulationState, SimulationParams } from '../types';

interface ResultsPanelProps {
    simulationState: SimulationState;
    params: SimulationParams;
}

const ResultMetric: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg text-center flex-1 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1">
        <i className={`fas ${icon} text-4xl mb-2 ${color}`}></i>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
    </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ simulationState, params }) => {
    const efficiency = ((params.sugar - simulationState.finalSugar) / params.sugar) * 100;

    return (
        <div className="bg-slate-900/50 p-6 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-green-400 mb-2">¡Fermentación Completada!</h3>
            <p className="text-slate-300 mb-6">El proceso ha finalizado. Aquí están los resultados clave.</p>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <ResultMetric
                    label="ABV Estimado"
                    value={`${simulationState.abv.toFixed(1)}%`}
                    icon="fa-percent"
                    color="text-amber-400"
                />
                <ResultMetric
                    label="Eficiencia"
                    value={`${efficiency.toFixed(1)}%`}
                    icon="fa-cogs"
                    color="text-blue-400"
                />
                <ResultMetric
                    label="Producción de Alcohol"
                    value={`${simulationState.alcoholProduced.toFixed(0)} g/h`}
                    icon="fa-wine-bottle"
                    color="text-green-400"
                />
            </div>
        </div>
    );
};
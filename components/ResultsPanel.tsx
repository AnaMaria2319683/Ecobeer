import React from 'react';
import type { SimulationState, SimulationParams, ReportDetailsProps } from '../types';

const getAnalysis = (state: SimulationState, params: SimulationParams) => {
    const observations = {
        good: [] as string[],
        bad: [] as string[],
    };
    const efficiency = ((params.sugar - state.finalSugar) / params.sugar) * 100;

    if (state.abv > 6.5) {
        observations.good.push("Excelente contenido alcohólico (ABV > 6.5%), ideal para cervezas de estilo fuerte y con cuerpo.");
    } else if (state.abv >= 4.5) {
        observations.good.push("Buen contenido alcohólico (4.5-6.5% ABV), balanceado y apropiado para una amplia variedad de cervezas.");
    } else {
        observations.bad.push("El contenido alcohólico es bajo (< 4.5% ABV). Considere aumentar el azúcar inicial para un resultado más potente.");
    }

    if (efficiency > 85) {
        observations.good.push("Eficiencia de conversión muy alta (> 85%). La levadura ha trabajado de forma óptima, maximizando la producción de alcohol.");
    } else if (efficiency >= 75) {
        observations.good.push("Eficiencia de conversión sólida (75-85%). Un rendimiento saludable y dentro de los estándares esperados.");
    } else {
        observations.bad.push("La eficiencia de conversión es mejorable (< 75%). Revise la temperatura o la salud de la levadura.");
    }
    
    if (state.finalSugar < 20) {
        observations.good.push("Muy bajo azúcar residual, lo que resulta en un final **muy seco y nítido** (Dry/Brut).");
    } else if (state.finalSugar < 50) {
        observations.good.push("Nivel de azúcar residual equilibrado, que aporta un buen cuerpo y balance al dulzor de la malta.");
    } else {
        observations.bad.push("Alto azúcar residual (> 50 g/L), indicando una fermentación incompleta. La cerveza podría resultar **demasiado dulce y pesada**.");
    }

    if (params.temperature >= 19 && params.temperature <= 21) {
        observations.good.push("La temperatura de fermentación se mantuvo en el rango **ideal (19-21°C)**, promoviendo un perfil de sabor limpio.");
    } else if (params.temperature < 19) {
        observations.bad.push("La fermentación a baja temperatura (< 19°C) pudo haber ralentizado la levadura, afectando la eficiencia y el sabor.");
    } else {
        observations.bad.push("La fermentación a alta temperatura (> 21°C) puede generar sabores no deseados (ésteres, alcoholes superiores). Considere enfriar el mosto.");
    }

    if (params.recirculation === 0) {
        observations.bad.push("Recirculación nula (0%). Podría aumentar ligeramente este parámetro para mejorar la exposición de la levadura al mosto fresco, aumentando la conversión.");
    } else if (params.recirculation > 70) {
         observations.bad.push("Recirculación muy alta (> 70%). Si bien favorece la mezcla, podría aumentar el riesgo de estrés en la levadura.");
    } else {
        observations.good.push("Nivel de recirculación optimizado (1-70%), asegurando una buena mezcla y un contacto eficiente de la levadura con el sustrato.");
    }

    return observations;
};


const ResultMetric: React.FC<{ label: string; value: string; icon: string; color: string; feedback?: string }> = ({ label, value, icon, color, feedback }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg text-center flex-1 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 relative min-w-[200px]">
        <i className={`fas ${icon} text-4xl mb-2 ${color}`}></i>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {feedback && (
            <p className="mt-2 text-xs text-slate-300 italic h-8 flex items-center justify-center">{feedback.split('. ')[0] + '.'}</p> 
        )}
    </div>
);


export const ResultsPanel: React.FC<ReportDetailsProps> = ({ simulationState, params }) => {
    const analysis = getAnalysis(simulationState, params);
    const efficiency = ((params.sugar - simulationState.finalSugar) / params.sugar) * 100;

    const summaryMessage = efficiency > 85
        ? "¡Excelente! Máxima conversión lograda, perfil robusto."
        : efficiency >= 75
        ? "Buen rendimiento. Resultados sólidos y balanceados."
        : "Fermentación incompleta. Revise las condiciones del proceso para mejorar.";

    const getFeedback = (keyword: string, analysis: ReturnType<typeof getAnalysis>) => {
        const good = analysis.good.find(item => item.toLowerCase().includes(keyword));
        const bad = analysis.bad.find(item => item.toLowerCase().includes(keyword));
        return good || bad;
    }

    return (
        <div className="bg-slate-900/50 p-6 rounded-lg text-center border border-slate-700/50">
            <h3 className="text-2xl font-bold text-green-400 mb-2">✅ ¡Fermentación Completada!</h3>
            <p className="text-slate-300 mb-6 font-medium">{summaryMessage}</p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <ResultMetric
                    label="ABV Estimado"
                    value={`${simulationState.abv.toFixed(1)}%`}
                    icon="fa-beer"
                    color={simulationState.abv > 6.5 ? "text-amber-400" : simulationState.abv >= 4.5 ? "text-green-400" : "text-red-400"}
                    feedback={getFeedback('contenido alcohólico', analysis)}
                />
                <ResultMetric
                    label="Eficiencia"
                    value={`${efficiency.toFixed(1)}%`}
                    icon="fa-tachometer-alt" 
                    color={efficiency > 85 ? "text-green-400" : efficiency >= 75 ? "text-blue-400" : "text-red-400"}
                    feedback={getFeedback('eficiencia de conversión', analysis)}
                />
                 <ResultMetric
                    label="Azúcar Residual"
                    value={`${simulationState.finalSugar.toFixed(1)} g/L`}
                    icon="fa-cubes" 
                    color={simulationState.finalSugar < 50 ? "text-blue-400" : "text-red-400"} 
                    feedback={getFeedback('azúcar residual', analysis)}
                />
                <ResultMetric
                    label="Producción de Alcohol"
                    value={`${simulationState.alcoholProduced.toFixed(0)} g/h`}
                    icon="fa-flask" 
                    color="text-lime-400"
                    feedback="Tasa de producción horaria neta."
                />
            </div>
            
        </div>
    );
};

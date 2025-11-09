
import React from 'react';
import type { SimulationState, SimulationParams } from '../types';

// Dado que usamos un CDN, obtenemos Recharts de la ventana.
declare const Recharts: any;

// ======================================================================
// 1. LÓGICA DE ANÁLISIS
// ======================================================================

const getAnalysis = (state: SimulationState, params: SimulationParams) => {
    const observations = {
        good: [] as string[],
        bad: [] as string[],
    };
    // Calcular la eficiencia de conversión
    const efficiency = ((params.sugar - state.finalSugar) / params.sugar) * 100;

    // --- ABV (Alcohol por Volumen) ---
    if (state.abv > 6.5) {
        observations.good.push("Excelente contenido alcohólico (ABV > 6.5%), ideal para cervezas de estilo fuerte y con cuerpo.");
    } else if (state.abv >= 4.5) {
        observations.good.push("Buen contenido alcohólico (4.5-6.5% ABV), balanceado y apropiado para una amplia variedad de cervezas.");
    } else {
        observations.bad.push("El contenido alcohólico es bajo (< 4.5% ABV). Considere aumentar el azúcar inicial para un resultado más potente.");
    }

    // --- Eficiencia de Conversión ---
    if (efficiency > 85) {
        observations.good.push("Eficiencia de conversión muy alta (> 85%). La levadura ha trabajado de forma óptima, maximizando la producción de alcohol.");
    } else if (efficiency >= 75) {
        observations.good.push("Eficiencia de conversión sólida (75-85%). Un rendimiento saludable y dentro de los estándares esperados.");
    } else {
        observations.bad.push("La eficiencia de conversión es mejorable (< 75%). Revise la temperatura o la salud de la levadura.");
    }
    
    // --- Azúcar Residual Final ---
    if (state.finalSugar < 20) {
        observations.good.push("Muy bajo azúcar residual, lo que resulta en un final **muy seco y nítido** (Dry/Brut).");
    } else if (state.finalSugar < 50) {
        observations.good.push("Nivel de azúcar residual equilibrado, que aporta un buen cuerpo y balance al dulzor de la malta.");
    } else {
        observations.bad.push("Alto azúcar residual (> 50 g/L), indicando una fermentación incompleta. La cerveza podría resultar **demasiado dulce y pesada**.");
    }

    // --- Temperatura ---
    if (params.temperature >= 19 && params.temperature <= 21) {
        observations.good.push("La temperatura de fermentación se mantuvo en el rango **ideal (19-21°C)**, promoviendo un perfil de sabor limpio.");
    } else if (params.temperature < 19) {
        observations.bad.push("La fermentación a baja temperatura (< 19°C) pudo haber ralentizado la levadura, afectando la eficiencia y el sabor.");
    } else {
        observations.bad.push("La fermentación a alta temperatura (> 21°C) puede generar sabores no deseados (ésteres, alcoholes superiores). Considere enfriar el mosto.");
    }

    // --- Recirculación ---
    if (params.recirculation === 0) {
        observations.bad.push("Recirculación nula (0%). Podría aumentar ligeramente este parámetro para mejorar la exposición de la levadura al mosto fresco, aumentando la conversión.");
    } else if (params.recirculation > 70) {
         observations.bad.push("Recirculación muy alta (> 70%). Si bien favorece la mezcla, podría aumentar el riesgo de estrés en la levadura.");
    } else {
        observations.good.push("Nivel de recirculación optimizado (1-70%), asegurando una buena mezcla y un contacto eficiente de la levadura con el sustrato.");
    }

    return observations;
};


// ======================================================================
// 2. COMPONENTES DE UTILIDAD
// ======================================================================

interface ReportDetailsProps {
    simulationState: SimulationState;
    params: SimulationParams;
}

const ReportSection: React.FC<{title: string, icon: string, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-slate-700/50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <i className={`fas fa-${icon}`}></i>
            {title}
        </h4>
        <div className="space-y-2 text-sm">{children}</div>
    </div>
);

const DataRow: React.FC<{label: string, value: string | number, unit?: string}> = ({label, value, unit}) => (
    <div className="flex justify-between border-b border-slate-600/50 py-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-100">{value} {unit}</span>
    </div>
);

const ChartContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg h-64 flex flex-col border border-slate-800">
        <h4 className="text-center text-sm font-semibold text-slate-300 mb-2">{title}</h4>
        <div className="flex-grow">{children}</div>
    </div>
);

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


// ======================================================================
// 3. PANEL DE RESULTADOS RÁPIDO (ResultsPanel)
// ======================================================================

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


// ======================================================================
// 4. MODAL DE REPORTE DETALLADO (ReportModal)
// ======================================================================

export const ReportModal: React.FC<ReportDetailsProps> = ({ simulationState, params }) => {
    if (typeof Recharts === 'undefined') return null;
    
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } = Recharts;

    const efficiency = ((params.sugar - simulationState.finalSugar) / params.sugar) * 100;
    const reactorEfficiencyData = simulationState.reactors.map((r, i) => ({
        name: `Reactor ${i + 1}`,
        'Alcohol (g/L)': r.alcohol,
        'Azúcar (g/L)': r.sugar,
    }));
    const analysis = getAnalysis(simulationState, params);
    const { chartData } = simulationState;

    const reactorComparisonTitle = simulationState.reactors.length > 1 
        ? `Comparativa de Azúcar y Alcohol por Reactor (${simulationState.reactors.length} Reactores)`
        : 'Concentración Final en Reactor Único'; 
    
    const handleExport = () => {
        const reportContent = `
======================================
  EcoBeer - Reporte de Fermentación
======================================

Fecha de Exportación: ${new Date().toLocaleString()}

--- Parámetros de Entrada ---
Azúcar Inicial: ${params.sugar} g/L
Caudal de Mosto: ${params.flow} L/h
Temperatura: ${params.temperature} °C
Recirculación: ${params.recirculation} %

--- Resultados Finales ---
Azúcar Residual: ${simulationState.finalSugar.toFixed(1)} g/L
Producción Alcohol: ${simulationState.alcoholProduced.toFixed(0)} g/h
ABV Estimado: ${simulationState.abv.toFixed(1)} %
Eficiencia Conversión: ${efficiency.toFixed(1)} %

--- Observaciones y Recomendaciones ---

[+] Puntos Fuertes:
${analysis.good.length > 0 ? analysis.good.map(item => `  - ${item}`).join('\n') : '  - No se destacaron puntos fuertes.'}

[!] Áreas de Mejora:
${analysis.bad.length > 0 ? analysis.bad.map(item => `  - ${item}`).join('\n') : '  - ¡Excelente trabajo! No se identificaron áreas claras de mejora.'}


Nota: Los análisis gráficos (charts) no se incluyen en esta exportación.
        `;

        const blob = new Blob([reportContent.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-fermentacion-ecobeer-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-6 space-y-6">
            <div className="p-4 border-b border-t border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-3">
                    <i className="fas fa-file-alt"></i>
                    Reporte Detallado de Fermentación
                </h3>
                <button 
                    onClick={handleExport}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
                >
                    <i className="fas fa-download"></i>
                    Exportar Reporte
                </button>
            </div>
            
            <div className="space-y-6 p-4 pt-0">
                   <div className="grid md:grid-cols-2 gap-6">
                        <ReportSection title="Parámetros de Entrada" icon="sliders-h">
                            <DataRow label="Azúcar Inicial" value={params.sugar} unit="g/L" />
                            <DataRow label="Caudal de Mosto" value={params.flow} unit="L/h" />
                            <DataRow label="Temperatura" value={params.temperature} unit="°C" />
                            <DataRow label="Recirculación" value={params.recirculation} unit="%" />
                        </ReportSection>
                        <ReportSection title="Resultados Finales" icon="chart-pie">
                            <DataRow label="Azúcar Residual" value={simulationState.finalSugar.toFixed(1)} unit="g/L" />
                            <DataRow label="Producción Alcohol" value={simulationState.alcoholProduced.toFixed(0)} unit="g/h" />
                            <DataRow label="ABV Estimado" value={simulationState.abv.toFixed(1)} unit="%" />
                            <DataRow label="Eficiencia Conversión" value={efficiency.toFixed(1)} unit="%" />
                        </ReportSection>
                    </div>

                    <div>
                          <h3 className="text-lg font-semibold text-amber-400 mt-6 mb-4 flex items-center gap-2 justify-center">
                                <i className="fas fa-chart-area"></i>
                                Análisis Gráfico
                            </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ChartContainer title="Evolución de Concentraciones a lo largo del Proceso">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                        <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} unit="s" label={{ value: 'Tiempo (s)', position: 'insideBottom', fill: '#94A3B8', offset: -15 }} />
                                        <YAxis stroke="#94A3B8" fontSize={12} label={{ value: 'g/L', angle: -90, position: 'insideLeft', fill: '#94A3B8' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                                        <Line type="monotone" dataKey="sugar" name="Azúcar" stroke="#F59E0B" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="alcohol" name="Alcohol" stroke="#22C55E" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <ChartContainer title={reactorComparisonTitle}>
                                   <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reactorEfficiencyData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} label={{ value: 'Reactor', position: 'insideBottom', fill: '#94A3B8', offset: -15 }} />
                                            <YAxis stroke="#94A3B8" fontSize={12} label={{ value: 'g/L', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}/>
                                            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }}/>
                                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                                            <Bar dataKey="Alcohol (g/L)" fill="#22C55E" />
                                            <Bar dataKey="Azúcar (g/L)" fill="#F59E0B" />
                                        </BarChart>
                                    </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mt-6 mb-4 flex items-center gap-2 justify-center">
                                <i className="fas fa-microscope"></i>
                                Observaciones y Recomendaciones
                            </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-700/50 p-4 rounded-lg border border-green-700/50">
                                <h4 className="text-md font-semibold text-green-400 mb-3 flex items-center gap-2">
                                    <i className="fas fa-thumbs-up"></i> Puntos Fuertes
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
                                    {analysis.good.map((item, index) => <li key={index}>{item}</li>)}
                                    {analysis.good.length === 0 && <li>No se destacaron puntos fuertes con esta configuración.</li>}
                                </ul>
                            </div>
                            <div className="bg-slate-700/50 p-4 rounded-lg border border-red-700/50">
                                <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center gap-2">
                                    <i className="fas fa-lightbulb"></i> Áreas de Mejora
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
                                    {analysis.bad.map((item, index) => <li key={index}>{item}</li>)}
                                    {analysis.bad.length === 0 && <li>¡Excelente trabajo! No se identificaron áreas claras de mejora.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};
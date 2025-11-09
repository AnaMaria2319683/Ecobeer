import React, { useState } from 'react';
import type { SimulationState, SimulationParams, ReportDetailsProps } from '../types';

// Dado que usamos un CDN, obtenemos Recharts y jsPDF de la ventana.
declare const Recharts: any;
declare const jspdf: any;

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

// ======================================================================
// 3. MODAL DE REPORTE DETALLADO (ReportModal)
// ======================================================================

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
            active
                ? 'bg-slate-700/50 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
    >
        {children}
    </button>
);

const CorrelationChart: React.FC<{
    data: any[];
    xKey: string;
    yKey: string;
    xLabel: string;
    yLabel: string;
    lineColor: string;
}> = ({ data, xKey, yKey, xLabel, yLabel, lineColor }) => {
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                    dataKey={xKey} 
                    type="number" 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    domain={['dataMin', 'dataMax']}
                    label={{ value: xLabel, position: 'insideBottom', fill: '#94A3B8', offset: -15 }} 
                />
                <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    domain={['auto', 'auto']}
                    label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94A3B8', offset: 5 }} 
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} 
                    formatter={(value: number) => value.toFixed(1)}
                />
                <Line type="monotone" dataKey={yKey} name={yLabel.split(' ')[0]} stroke={lineColor} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const ReportModal: React.FC<ReportDetailsProps> = ({ simulationState, params }) => {
    if (typeof Recharts === 'undefined') return null;
    
    const [activeTab, setActiveTab] = useState('azucar-eficiencia');
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } = Recharts;

    const efficiency = ((params.sugar - simulationState.finalSugar) / params.sugar) * 100;
    const reactorEfficiencyData = simulationState.reactors.map((r, i) => ({
        name: `Reactor ${i + 1}`,
        'Alcohol (g/L)': r.alcohol,
        'Azúcar (g/L)': r.sugar,
    }));
    const analysis = getAnalysis(simulationState, params);
    const { chartData } = simulationState;

    const correlationData = chartData.map(d => ({
        ...d,
        fermentacion: (d.time / 60) * 100
    }));

    const reactorComparisonTitle = simulationState.reactors.length > 1 
        ? `Comparativa de Azúcar y Alcohol por Reactor (${simulationState.reactors.length} Reactores)`
        : 'Concentración Final en Reactor Único'; 

    const sugarDrop = params.sugar - simulationState.finalSugar;
    const alcoholIncrease = simulationState.reactors[2]?.alcohol || 0;
    const yieldRatio = sugarDrop > 0 ? alcoholIncrease / sugarDrop : 0;
    
    const handleExport = () => {
        if (typeof jspdf === 'undefined') {
            alert('La librería para generar PDF no está disponible. Por favor, recargue la página.');
            return;
        }
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        let y = 20;
        const x = 15;
        const lineSpacing = 7;
        const sectionSpacing = 12;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("EcoBeer - Reporte de Fermentación", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += lineSpacing;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += sectionSpacing * 1.5;

        const drawSection = (title: string, data: {label: string, value: string}[]) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(245, 158, 11); // amber-500
            doc.text(title, x, y);
            y += lineSpacing;
            doc.setDrawColor(200);
            doc.line(x, y, 195, y);
            y += lineSpacing;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            
            data.forEach(item => {
                doc.setTextColor(100);
                doc.text(item.label, x + 2, y);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(15);
                doc.text(item.value, 100, y);
                y += lineSpacing;
            });
            y += sectionSpacing / 2;
        };
        
        drawSection("Parámetros de Entrada", [
            { label: "Azúcar Inicial:", value: `${params.sugar} g/L` },
            { label: "Caudal de Mosto:", value: `${params.flow} L/h` },
            { label: "Temperatura:", value: `${params.temperature} °C` },
            { label: "Recirculación:", value: `${params.recirculation} %` },
        ]);

        drawSection("Resultados Finales", [
            { label: "Azúcar Residual:", value: `${simulationState.finalSugar.toFixed(1)} g/L` },
            { label: "Producción Alcohol:", value: `${simulationState.alcoholProduced.toFixed(0)} g/h` },
            { label: "ABV Estimado:", value: `${simulationState.abv.toFixed(1)} %` },
            { label: "Eficiencia Conversión:", value: `${efficiency.toFixed(1)} %` },
        ]);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(245, 158, 11);
        doc.text("Observaciones y Recomendaciones", x, y);
        y += lineSpacing;
        doc.setDrawColor(200);
        doc.line(x, y, 195, y);
        y += sectionSpacing;

        const drawAnalysisList = (title: string, items: string[], color: [number, number, number]) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(title, x, y);
            y += lineSpacing;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(50);
            
            const defaultText = title.includes("Fuertes") 
                ? "No se destacaron puntos fuertes con esta configuración."
                : "¡Excelente trabajo! No se identificaron áreas claras de mejora.";

            const itemsToRender = items.length > 0 ? items : [defaultText];
            itemsToRender.forEach(item => {
                const wrappedText = doc.splitTextToSize(`- ${item}`, 175);
                 if (y + (wrappedText.length * (lineSpacing - 2)) > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(wrappedText, x + 5, y);
                y += wrappedText.length * (lineSpacing - 2) + 2;
            });
            y += sectionSpacing / 2;
        };
        
        drawAnalysisList("[+] Puntos Fuertes", analysis.good, [34, 197, 94]); // green-500
        drawAnalysisList("[!] Áreas de Mejora", analysis.bad, [239, 68, 68]); // red-500
        
        doc.save(`reporte-fermentacion-ecobeer-${new Date().toISOString().split('T')[0]}.pdf`);
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
                    <i className="fas fa-file-pdf"></i>
                    Exportar PDF
                </button>
            </div>
            
            <div className="space-y-6 p-4 pt-0">
                   <div className="grid md:grid-cols-3 gap-6">
                        <ReportSection title="Parámetros de Entrada" icon="sliders-h">
                            <DataRow label="Azúcar Inicial" value={params.sugar} unit="g/L" />
                            <DataRow label="Caudal de Mosto" value={params.flow} unit="L/h" />
                            <DataRow label="Temperatura" value={params.temperature} unit="°C" />
                            <DataRow label="Recirculación" value={params.recirculation} unit="%" />
                        </ReportSection>
                        <ReportSection title="Resultados Clave" icon="chart-pie">
                            <DataRow label="Azúcar Residual" value={simulationState.finalSugar.toFixed(1)} unit="g/L" />
                            <DataRow label="Producción Alcohol" value={simulationState.alcoholProduced.toFixed(0)} unit="g/h" />
                            <DataRow label="ABV Estimado" value={simulationState.abv.toFixed(1)} unit="%" />
                            <DataRow label="Eficiencia Conversión" value={efficiency.toFixed(1)} unit="%" />
                        </ReportSection>
                        <ReportSection title="Análisis Cuantitativo" icon="calculator">
                            <DataRow label="Disminución de Azúcar" value={sugarDrop.toFixed(1)} unit="g/L" />
                            <DataRow label="Incremento de Alcohol" value={alcoholIncrease.toFixed(1)} unit="g/L" />
                            <DataRow label="Rendimiento (Alc/Az)" value={yieldRatio.toFixed(2)} unit="" />
                            <DataRow label="Proceso Completo" value={simulationState.fermentationComplete ? "Sí" : "No"} />
                        </ReportSection>
                    </div>

                    <div>
                          <h3 className="text-lg font-semibold text-amber-400 mt-6 mb-4 flex items-center gap-2 justify-center">
                                <i className="fas fa-chart-area"></i>
                                Análisis Gráfico del Proceso
                            </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartContainer title="Evolución de Concentraciones">
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
                            <div className="md:col-span-2">
                                <ChartContainer title="Evolución de la Temperatura">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                            <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} unit="s" label={{ value: 'Tiempo (s)', position: 'insideBottom', fill: '#94A3B8', offset: -15 }} />
                                            <YAxis stroke="#94A3B8" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} unit="°C" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94A3B8' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                                            <Line type="monotone" dataKey="temperature" name="Temperatura" stroke="#BE185D" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mt-8 mb-4 flex items-center gap-2 justify-center">
                            <i className="fas fa-link"></i>
                            Análisis de Correlación de Variables
                        </h3>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                             <div className="flex flex-wrap border-b border-slate-700 mb-4">
                                <TabButton active={activeTab === 'azucar-eficiencia'} onClick={() => setActiveTab('azucar-eficiencia')}>Azúcar vs Eficiencia</TabButton>
                                <TabButton active={activeTab === 'eficiencia-alcohol'} onClick={() => setActiveTab('eficiencia-alcohol')}>Eficiencia vs Alcohol</TabButton>
                                <TabButton active={activeTab === 'alcohol-azucar'} onClick={() => setActiveTab('alcohol-azucar')}>Alcohol vs Azúcar</TabButton>
                                <TabButton active={activeTab === 'progreso-azucar'} onClick={() => setActiveTab('progreso-azucar')}>Progreso vs Azúcar</TabButton>
                                <TabButton active={activeTab === 'progreso-eficiencia'} onClick={() => setActiveTab('progreso-eficiencia')}>Progreso vs Eficiencia</TabButton>
                            </div>
                            <div className="h-72">
                                {activeTab === 'azucar-eficiencia' && <CorrelationChart data={correlationData} xKey="sugar" yKey="efficiency" xLabel="Azúcar (g/L)" yLabel="Eficiencia (%)" lineColor="#38BDF8" />}
                                {activeTab === 'eficiencia-alcohol' && <CorrelationChart data={correlationData} xKey="efficiency" yKey="alcohol" xLabel="Eficiencia (%)" yLabel="Alcohol (g/L)" lineColor="#22C55E" />}
                                {activeTab === 'alcohol-azucar' && <CorrelationChart data={correlationData} xKey="alcohol" yKey="sugar" xLabel="Alcohol (g/L)" yLabel="Azúcar (g/L)" lineColor="#F59E0B" />}
                                {activeTab === 'progreso-azucar' && <CorrelationChart data={correlationData} xKey="fermentacion" yKey="sugar" xLabel="Progreso Fermentación (%)" yLabel="Azúcar (g/L)" lineColor="#F59E0B" />}
                                {activeTab === 'progreso-eficiencia' && <CorrelationChart data={correlationData} xKey="fermentacion" yKey="efficiency" xLabel="Progreso Fermentación (%)" yLabel="Eficiencia (%)" lineColor="#38BDF8" />}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mt-6 mb-4 flex items-center gap-2 justify-center">
                                <i className="fas fa-microscope"></i>
                                Análisis Cualitativo
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
                    
                    <ReportSection title="Interpretación General del Proceso" icon="info-circle">
                        <div className="text-slate-300 space-y-2 text-xs italic">
                           <p>
                                <strong>Tendencia General:</strong> A medida que la fermentación avanza, es normal observar una disminución del azúcar y un aumento del alcohol. La eficiencia debe ascender de forma constante, reflejando la conversión de azúcar en alcohol.
                           </p>
                           <p>
                                <strong>Estabilidad del Proceso:</strong> Si las curvas en los gráficos son suaves y continuas, sin caídas o mesetas abruptas, indica que el proceso fue estable y la levadura trabajó de forma consistente.
                           </p>
                           <p>
                                <strong>Posibles Problemas:</strong> Si la eficiencia se estanca o deja de subir antes de alcanzar un nivel alto (típicamente >80%), puede ser un indicador de limitación de nutrientes, estrés de la levadura por alta temperatura o una tolerancia alcohólica alcanzada.
                           </p>
                        </div>
                    </ReportSection>
            </div>
        </div>
    );
};

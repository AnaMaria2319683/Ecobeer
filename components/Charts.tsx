
import React from 'react';
import type { ChartDataPoint } from '../types';

// Since we are using a CDN, we have to get Recharts from the window object.
declare const Recharts: any;

interface ChartsProps {
    chartData: ChartDataPoint[];
}

const ChartContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg h-64 flex flex-col">
        <h4 className="text-center text-sm font-semibold text-slate-300 mb-2">{title}</h4>
        <div className="flex-grow">{children}</div>
    </div>
);

export const Charts: React.FC<ChartsProps> = ({ chartData }) => {
    if (typeof Recharts === 'undefined') {
        return <div className="text-center text-slate-400">Cargando gráficos...</div>;
    }

    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Evolución del Proceso">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} unit="s" />
                        <YAxis yAxisId="left" stroke="#F59E0B" fontSize={12} unit=" g/L" />
                        <YAxis yAxisId="right" orientation="right" stroke="#22C55E" fontSize={12} unit=" g/L" />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line yAxisId="left" type="monotone" dataKey="sugar" name="Azúcar" stroke="#F59E0B" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="alcohol" name="Alcohol" stroke="#22C55E" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
            <ChartContainer title="Eficiencia de Conversión">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} unit="s" />
                        <YAxis stroke="#38BDF8" fontSize={12} domain={[0, 100]} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="efficiency" name="Eficiencia" stroke="#38BDF8" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimulationState, SimulationParams, ValveStates, ChartDataPoint, Notification, ReactorData } from '../types';

const INITIAL_PARAMS: SimulationParams = {
    sugar: 180,
    flow: 200,
    temperature: 20,
    recirculation: 25,
};

const INITIAL_STATE: SimulationState = {
    reactors: [
        { sugar: 0, alcohol: 0, level: 0 },
        { sugar: 0, alcohol: 0, level: 0 },
        { sugar: 0, alcohol: 0, level: 0 },
    ],
    finalSugar: 0,
    alcoholProduced: 0,
    abv: 0,
    mixProgress: 0,
    fermentationProgress: 0,
    isRunning: false,
    fermentationComplete: false,
    statusText: 'Sistema listo - Simulación en pausa',
    chartData: [],
};

export const useSimulation = () => {
    const [params, setParams] = useState<SimulationParams>(INITIAL_PARAMS);
    const [valves, setValves] = useState<ValveStates>({ valve12: true, valve23: true, valveRec: true });
    const [simulationState, setSimulationState] = useState<SimulationState>(INITIAL_STATE);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const simulationIntervalRef = useRef<number | null>(null);
    const mixIntervalRef = useRef<number | null>(null);
    const peakNotificationSentRef = useRef<boolean>(false);
    const paramsRef = useRef(params);
    useEffect(() => { paramsRef.current = params; }, [params]);
    const valvesRef = useRef(valves);
    useEffect(() => { valvesRef.current = valves; }, [valves]);

    const addNotification = useCallback((title: string, message: string, type: 'success' | 'info') => {
        const newNotification: Notification = {
            id: Date.now(),
            title,
            message,
            type,
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const runSimulationStep = useCallback(() => {
        const currentParams = paramsRef.current;
        const currentValves = valvesRef.current;

        setSimulationState(prevState => {
            if (prevState.fermentationComplete) {
                if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                return prevState;
            }

            let efficiency = 0.7;
            if (currentParams.temperature >= 18 && currentParams.temperature <= 24) {
                efficiency = 0.8 + (Math.abs(currentParams.temperature - 21) * -0.05);
            } else if (currentParams.temperature < 18) {
                efficiency = 0.5 + (currentParams.temperature - 10) * 0.025;
            } else {
                efficiency = 0.8 - (currentParams.temperature - 24) * 0.05;
            }

            const recircEffect = 1 + (currentParams.recirculation / 200);

            let sugar1 = currentParams.sugar * 0.7 * (currentValves.valveRec ? recircEffect : 1);
            let sugar2 = sugar1 * 0.6 * efficiency;
            let sugar3 = sugar2 * 0.5 * efficiency;
            
            if (!currentValves.valve12) sugar2 = sugar1;
            if (!currentValves.valve23) sugar3 = sugar2;

            const alcohol1 = (currentParams.sugar - sugar1) * 0.51;
            const alcohol2 = alcohol1 + (sugar1 - sugar2) * 0.51;
            const alcohol3 = alcohol2 + (sugar2 - sugar3) * 0.51;

            const newReactors: ReactorData[] = [
                { sugar: sugar1, alcohol: alcohol1, level: (sugar1 / currentParams.sugar) * 70 },
                { sugar: sugar2, alcohol: alcohol2, level: (sugar2 / currentParams.sugar) * 70 },
                { sugar: sugar3, alcohol: alcohol3, level: (sugar3 / currentParams.sugar) * 70 },
            ];
            
            const alcoholProduced = alcohol3 * currentParams.flow;
            const abv = (alcohol3 / 789) * 100;
            const fermentationProgress = prevState.fermentationProgress + 1;

            const conversionEfficiency = ((currentParams.sugar - sugar3) / currentParams.sugar) * 100;
            const newDataPoint: ChartDataPoint = {
                time: fermentationProgress,
                sugar: sugar3,
                alcohol: alcohol3,
                efficiency: conversionEfficiency,
                temperature: currentParams.temperature,
            };
            const newChartData = [...prevState.chartData, newDataPoint];
            const finalChartData = newChartData.length > 30 ? newChartData.slice(1) : newChartData;

            if (fermentationProgress === 10) {
                addNotification('Fermentación Iniciada', 'La levadura está activa, la producción de alcohol ha comenzado.', 'success');
            }
            if (conversionEfficiency >= 45 && !peakNotificationSentRef.current) {
                addNotification('Pico de Actividad Alcanzado', `La eficiencia de conversión superó el ${conversionEfficiency.toFixed(0)}%. La levadura está en su fase más productiva.`, 'info');
                peakNotificationSentRef.current = true;
            }
            
            if (fermentationProgress >= 60) {
                 if (!prevState.fermentationComplete) {
                    addNotification('¡Fermentación Completa!', 'El proceso ha finalizado. Los resultados están listos.', 'success');
                }
                if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                if (mixIntervalRef.current) clearInterval(mixIntervalRef.current);
                
                return {
                    ...prevState,
                    reactors: newReactors,
                    finalSugar: sugar3,
                    alcoholProduced,
                    abv,
                    fermentationProgress,
                    fermentationComplete: true,
                    isRunning: false,
                    statusText: 'Simulación Finalizada',
                    chartData: finalChartData,
                };
            }

            return {
                ...prevState,
                reactors: newReactors,
                finalSugar: sugar3,
                alcoholProduced,
                abv,
                fermentationProgress,
                chartData: finalChartData,
            };
        });
    }, [addNotification]);
    
    const startSimulation = () => {
        if (simulationState.isRunning) return;
        peakNotificationSentRef.current = false;
        setSimulationState({
            ...INITIAL_STATE,
            isRunning: true,
            statusText: 'Simulación en curso',
        });
        setNotifications([]);
        
        mixIntervalRef.current = window.setInterval(() => {
            setSimulationState(prev => {
                if (prev.mixProgress >= 100) {
                    if(mixIntervalRef.current) clearInterval(mixIntervalRef.current);
                    return prev;
                }
                return { ...prev, mixProgress: prev.mixProgress + 2 };
            });
        }, 100);

        simulationIntervalRef.current = window.setInterval(runSimulationStep, 1000);
    };
    
    const pauseSimulation = () => {
        if (!simulationState.isRunning) return;
        setSimulationState(prev => ({ ...prev, isRunning: false, statusText: 'Simulación en pausa' }));
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        if (mixIntervalRef.current) clearInterval(mixIntervalRef.current);
    };

    const resetSimulation = () => {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        if (mixIntervalRef.current) clearInterval(mixIntervalRef.current);
        setParams(INITIAL_PARAMS);
        setValves({ valve12: true, valve23: true, valveRec: true });
        setSimulationState(INITIAL_STATE);
        setNotifications([]);
        peakNotificationSentRef.current = false;
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            if (mixIntervalRef.current) clearInterval(mixIntervalRef.current);
        };
    }, []);

    const setParam = (param: keyof SimulationParams, value: number) => {
        setParams(p => ({...p, [param]: value}));
    };

    const toggleValve = (valve: keyof ValveStates) => {
        setValves(v => ({...v, [valve]: !v[valve]}));
    };
    
    const setPreset = (preset: 'high' | 'balanced' | 'low') => {
        const presets = {
            high: { sugar: 350, flow: 300, temperature: 22, recirculation: 15 },
            balanced: { sugar: 180, flow: 200, temperature: 20, recirculation: 25 },
            low: { sugar: 100, flow: 150, temperature: 18, recirculation: 40 },
        };
        setParams(presets[preset]);
    };

    return {
        params,
        setParam,
        valves,
        toggleValve,
        simulationState,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        setPreset,
        notifications,
        removeNotification
    };
};
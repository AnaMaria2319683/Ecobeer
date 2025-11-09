
export interface ReactorData {
    sugar: number;
    alcohol: number;
    level: number;
}

export interface ChartDataPoint {
    time: number;
    sugar: number;
    alcohol: number;
    efficiency: number;
}

export interface SimulationState {
    reactors: ReactorData[];
    finalSugar: number;
    alcoholProduced: number;
    abv: number;
    mixProgress: number;
    fermentationProgress: number;
    isRunning: boolean;
    fermentationComplete: boolean;
    statusText: string;
    chartData: ChartDataPoint[];
}

export interface SimulationParams {
    sugar: number;
    flow: number;
    temperature: number;
    recirculation: number;
}

export interface ValveStates {
    valve12: boolean;
    valve23: boolean;
    valveRec: boolean;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'info';
}
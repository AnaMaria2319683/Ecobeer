
import React from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { VisualizationPanel } from './components/VisualizationPanel';
import { useSimulation } from './hooks/useSimulation';
import { NotificationContainer } from './components/NotificationContainer';

const App: React.FC = () => {
    const simulation = useSimulation();
    
    return (
        <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-slate-100 min-h-screen p-2 sm:p-4 md:p-6 font-sans">
            <div className="container mx-auto max-w-screen-2xl">
                <Header />
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <ControlPanel {...simulation} />
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9">
                        <VisualizationPanel 
                            simulationState={simulation.simulationState} 
                            params={simulation.params}
                        />
                    </div>
                </main>
            </div>
            <NotificationContainer notifications={simulation.notifications} removeNotification={simulation.removeNotification} />
        </div>
    );
};

export default App;
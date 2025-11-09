
import React from 'react';

const Ingredient: React.FC<{ icon: string, name: string, active: boolean }> = ({ icon, name, active }) => (
    <div className={`text-center p-2 rounded-lg transition-all duration-300 ${active ? 'bg-amber-500/20 scale-110 ring-2 ring-amber-500' : 'bg-slate-700/50'}`}>
        <i className={`fas fa-${icon} text-2xl mb-1 ${active ? 'text-amber-400' : 'text-slate-400'}`}></i>
        <p className="text-xs font-semibold">{name}</p>
    </div>
);

export const IngredientPanel: React.FC<{ mixProgress: number }> = ({ mixProgress }) => {
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg mb-6">
            <h4 className="text-md font-semibold text-slate-300 mb-3 text-center">Preparación del Mosto</h4>
            <div className="grid grid-cols-4 gap-4 mb-4">
                <Ingredient icon="wheat-alt" name="Malta" active={mixProgress > 5 && mixProgress < 30} />
                <Ingredient icon="tint" name="Agua" active={mixProgress > 30 && mixProgress < 55} />
                <Ingredient icon="leaf" name="Lúpulo" active={mixProgress > 55 && mixProgress < 80} />
                <Ingredient icon="vial" name="Levadura" active={mixProgress > 80 && mixProgress <= 100} />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                    style={{ width: `${mixProgress}%` }}
                ></div>
            </div>
        </div>
    );
};
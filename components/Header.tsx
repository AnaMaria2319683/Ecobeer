
import React from 'react';

export const Header: React.FC = () => (
    <header className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-400 flex items-center justify-center gap-4">
            <i className="fas fa-beer"></i>
            <span>EcoBeer - Simulador de Fermentación</span>
        </h1>
        <p className="text-slate-300 mt-2 text-sm md:text-base">
            Modelo Educativo Interactivo - Sistema de 3 Reactores con Recirculación
        </p>
    </header>
);
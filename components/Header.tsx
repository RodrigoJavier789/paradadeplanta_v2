import React, { useState, useEffect } from 'react';
import { UserCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
    userName?: string;
    proyecto?: {
        fechaInicioReclutamiento: Date;
        fechaTerminoReclutamiento: Date;
    };
}

const Header: React.FC<HeaderProps> = ({ userName, proyecto }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const CountdownBar = () => {
        if (!proyecto) return null;

        const { fechaInicioReclutamiento, fechaTerminoReclutamiento } = proyecto;
        const totalDuration = fechaTerminoReclutamiento.getTime() - fechaInicioReclutamiento.getTime();
        const elapsed = new Date().getTime() - fechaInicioReclutamiento.getTime();
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        const daysRemaining = Math.ceil((fechaTerminoReclutamiento.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

        return (
            <div className="w-full md:w-1/3">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>Progreso del Reclutamiento</span>
                    <span>{daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Finalizado'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <header className="bg-white shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-gray-500">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>{currentDateTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentDateTime.toLocaleTimeString('es-ES')}</span>
            </div>
            
            {proyecto && <CountdownBar />}

            <div className="flex items-center">
                <span className="text-gray-700 font-medium mr-3">{userName}</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
        </header>
    );
};

export default Header;
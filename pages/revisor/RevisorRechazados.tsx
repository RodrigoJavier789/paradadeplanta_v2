import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoDocumental, EstadoCliente } from '../../types';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const RevisorRechazados = () => {
    const { trabajadores, updateTrabajador, getProyectoById } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const todosLosRechazados = useMemo(() => 
        trabajadores.filter(t => 
            t.estadoDocumental === EstadoDocumental.RechazadoDocumental || t.estadoCliente === EstadoCliente.Rechazado
        ).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [trabajadores]);

    const filteredRechazados = useMemo(() => {
        if (!searchTerm) return todosLosRechazados;
        const lowercasedFilter = searchTerm.toLowerCase();
        return todosLosRechazados.filter(t =>
            t.nombre.toLowerCase().includes(lowercasedFilter) ||
            t.rut.includes(lowercasedFilter) ||
            t.especialidad.toLowerCase().includes(lowercasedFilter)
        );
    }, [todosLosRechazados, searchTerm]);
    
    const handleReValidate = (worker: Trabajador) => {
        if (window.confirm(`¿Está seguro que desea mover a ${worker.nombre} de vuelta a la cola de validación? Se quitará el motivo de rechazo y deberá ser revisado nuevamente.`)) {
            updateTrabajador({ ...worker, estadoDocumental: EstadoDocumental.EnRevision, motivoRechazoDocumental: undefined });
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Candidatos Rechazados</h1>
                <p className="text-gray-600 mt-1">Listado consolidado de candidatos rechazados en cualquier etapa del proceso.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Historial de Rechazos ({filteredRechazados.length})</h2>
                    <div className="relative w-full md:w-auto">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Buscar por nombre, RUT, especialidad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-800">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Nombre</th>
                                <th className="px-6 py-3 text-left">Especialidad</th>
                                <th className="px-6 py-3 text-left">RUT</th>
                                <th className="px-6 py-3 text-left">Etapa Rechazo</th>
                                <th className="px-6 py-3 text-left">Motivo / Proyecto</th>
                                <th className="px-6 py-3 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRechazados.length > 0 ? filteredRechazados.map(t => {
                                const isRechazoDocumental = t.estadoDocumental === EstadoDocumental.RechazadoDocumental;
                                const proyecto = t.ultimoProyectoAsignado ? getProyectoById(t.ultimoProyectoAsignado) : null;
                                return (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{t.nombre}</td>
                                    <td className="px-6 py-4">{t.especialidad}</td>
                                    <td className="px-6 py-4">{t.rut}</td>
                                    <td className="px-6 py-4">
                                        {isRechazoDocumental ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Documental</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cliente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        <p className="text-gray-800">{isRechazoDocumental ? t.motivoRechazoDocumental : t.motivoRechazo}</p>
                                        {!isRechazoDocumental && proyecto && (
                                            <p className="text-xs text-gray-500 font-normal">Proyecto: {proyecto.nombre}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isRechazoDocumental ? (
                                             <button 
                                                onClick={() => handleReValidate(t)} 
                                                title="Mover a Validación" 
                                                className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200"
                                            >
                                                <ArrowPathIcon className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan={6} className="text-center py-6 text-gray-500">No hay candidatos rechazados en el sistema.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevisorRechazados;
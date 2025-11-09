import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoDocumental, Revisor } from '../../types';
import { UserGroupIcon, ArrowsRightLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const AdminDistribucion = () => {
    const { trabajadores, revisores, distributeTrabajadoresToRevisores } = useData();
    const [selectedTrabajadorIds, setSelectedTrabajadorIds] = useState<Set<string>>(new Set());
    const [selectedRevisorId, setSelectedRevisorId] = useState<string>('');

    const { unassignedWorkers, revisorLoad } = useMemo(() => {
        const unassigned = trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.EnRevision && !t.revisorAsignadoId);
        
        const load = new Map<string, number>();
        trabajadores.forEach(t => {
            if (t.revisorAsignadoId && t.estadoDocumental === EstadoDocumental.EnRevision) {
                load.set(t.revisorAsignadoId, (load.get(t.revisorAsignadoId) || 0) + 1);
            }
        });
        
        return { unassignedWorkers: unassigned, revisorLoad: load };
    }, [trabajadores]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTrabajadorIds(new Set(unassignedWorkers.map(t => t.id)));
        } else {
            setSelectedTrabajadorIds(new Set());
        }
    };

    const handleSelectOne = (trabajadorId: string) => {
        setSelectedTrabajadorIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trabajadorId)) {
                newSet.delete(trabajadorId);
            } else {
                newSet.add(trabajadorId);
            }
            return newSet;
        });
    };

    const handleAssign = () => {
        if (!selectedRevisorId) {
            alert('Por favor, seleccione un revisor.');
            return;
        }
        if (selectedTrabajadorIds.size === 0) {
            alert('Por favor, seleccione al menos un trabajador.');
            return;
        }

        const assignments = Array.from(selectedTrabajadorIds).map(trabajadorId => ({
            trabajadorId,
            revisorId: selectedRevisorId,
        }));

        distributeTrabajadoresToRevisores(assignments);
        setSelectedTrabajadorIds(new Set());
        setSelectedRevisorId('');
    };

    const handleAutoDistribute = () => {
        if (unassignedWorkers.length === 0) {
            alert('No hay trabajadores para distribuir.');
            return;
        }
        if (revisores.length === 0) {
            alert('No hay revisores disponibles.');
            return;
        }

        // Distribute workers evenly among revisors
        const assignments: { trabajadorId: string; revisorId: string }[] = [];
        let revisorIndex = 0;
        
        unassignedWorkers.forEach(worker => {
            assignments.push({
                trabajadorId: worker.id,
                revisorId: revisores[revisorIndex].id,
            });
            revisorIndex = (revisorIndex + 1) % revisores.length;
        });
        
        distributeTrabajadoresToRevisores(assignments);
        setSelectedTrabajadorIds(new Set());
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Distribución de Candidatos a Revisores</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {revisores.map(revisor => (
                    <div key={revisor.id} className="bg-white p-4 rounded-lg shadow flex items-center">
                        <UserGroupIcon className="h-8 w-8 text-blue-500 mr-4" />
                        <div>
                            <p className="font-semibold text-gray-800">{revisor.nombre}</p>
                            <p className="text-sm text-gray-500">
                                {revisorLoad.get(revisor.id) || 0} en revisión
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Candidatos Pendientes de Asignación ({unassignedWorkers.length})</h2>
                    <button
                        onClick={handleAutoDistribute}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <ArrowsRightLeftIcon className="h-5 w-5" />
                        Distribuir Automáticamente
                    </button>
                </div>
                
                {unassignedWorkers.length > 0 && (
                     <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-md border mb-4">
                        <span className="font-semibold text-gray-700">
                            {selectedTrabajadorIds.size} seleccionados
                        </span>
                        <select 
                            value={selectedRevisorId}
                            onChange={e => setSelectedRevisorId(e.target.value)}
                            className="w-full md:w-auto p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                        >
                            <option value="">-- Asignar a Revisor --</option>
                            {revisores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                        <button 
                            onClick={handleAssign}
                            disabled={selectedTrabajadorIds.size === 0 || !selectedRevisorId}
                            className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Asignar Seleccionados
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        onChange={handleSelectAll}
                                        checked={unassignedWorkers.length > 0 && selectedTrabajadorIds.size === unassignedWorkers.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Especialidad</th>
                                <th scope="col" className="px-6 py-3">RUT</th>
                                <th scope="col" className="px-6 py-3">Fecha de Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unassignedWorkers.map(trabajador => (
                                <tr key={trabajador.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="w-4 p-4">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                            checked={selectedTrabajadorIds.has(trabajador.id)}
                                            onChange={() => handleSelectOne(trabajador.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{trabajador.nombre}</td>
                                    <td className="px-6 py-4">{trabajador.especialidad}</td>
                                    <td className="px-6 py-4">{trabajador.rut}</td>
                                    <td className="px-6 py-4">{format(new Date(trabajador.fechaRegistro), 'dd/MM/yyyy')}</td>
                                </tr>
                            ))}
                            {unassignedWorkers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircleIcon className="h-10 w-10 text-green-500 mb-2" />
                                            <p className="font-semibold">No hay candidatos pendientes de asignación.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDistribucion;

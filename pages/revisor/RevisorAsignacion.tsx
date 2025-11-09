
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoDocumental } from '../../types';
import { BriefcaseIcon, MagnifyingGlassIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const RevisorAsignacion = () => {
    const { trabajadores, assignTrabajadorToProject, proyectos } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningWorkerId, setAssigningWorkerId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const validadosDisponibles = useMemo(() => 
        trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.Validado && !t.proyectoAsignado),
    [trabajadores]);
    
    const publishedProyectos = useMemo(() => proyectos.filter(p => p.estado === 'publicado'), [proyectos]);

    const filteredValidados = useMemo(() => {
        if (!searchTerm) return validadosDisponibles;
        const lowercasedFilter = searchTerm.toLowerCase();
        return validadosDisponibles.filter(t =>
            t.nombre.toLowerCase().includes(lowercasedFilter) ||
            t.rut.includes(lowercasedFilter) ||
            t.especialidad.toLowerCase().includes(lowercasedFilter)
        );
    }, [validadosDisponibles, searchTerm]);

    const handleAssignClick = (workerId: string) => {
        setAssigningWorkerId(workerId);
        setSelectedProjectId('');
    };

    const handleCancelAssignment = () => {
        setAssigningWorkerId(null);
    };

    const handleConfirmAssignment = () => {
        if (assigningWorkerId && selectedProjectId) {
            assignTrabajadorToProject(assigningWorkerId, selectedProjectId);
            setAssigningWorkerId(null);
        } else {
            alert('Por favor, seleccione un proyecto.');
        }
    };

    const columns = [
        { header: 'Nombre', accessor: (t: Trabajador) => <span className="font-medium text-gray-900">{t.nombre}</span> },
        { header: 'Especialidad', accessor: (t: Trabajador) => t.especialidad },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Paso 2: Asignación a Proyectos</h1>
                <p className="text-gray-600 mt-1">Seleccione un candidato validado y asígnelo a un proyecto activo.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Candidatos Disponibles ({filteredValidados.length})</h2>
                    <div className="relative w-full md:w-auto">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-800">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {columns.map(c => <th key={c.header} className="px-6 py-3 text-left">{c.header}</th>)}
                                <th className="px-6 py-3 text-left">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredValidados.length > 0 ? filteredValidados.map(t => (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    {columns.map(c => <td key={c.header} className="px-6 py-4">{c.accessor(t)}</td>)}
                                    <td className="px-6 py-4">
                                        {assigningWorkerId === t.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={selectedProjectId}
                                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                >
                                                    <option value="">Seleccionar Proyecto</option>
                                                    {publishedProyectos.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                                    ))}
                                                </select>
                                                <button onClick={handleConfirmAssignment} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Confirmar">
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={handleCancelAssignment} className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500" title="Cancelar">
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleAssignClick(t.id)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-sm text-blue-800 bg-blue-100 hover:bg-blue-200 transition-colors" title="Asignar a Proyecto">
                                                <BriefcaseIcon className="h-5 w-5" />
                                                Asignar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={columns.length + 1} className="text-center py-6 text-gray-500">No hay candidatos validados disponibles para asignar.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevisorAsignacion;

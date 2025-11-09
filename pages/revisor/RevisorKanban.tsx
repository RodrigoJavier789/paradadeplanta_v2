
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoCliente, ProximoEscenario } from '../../types';
import { 
    XCircleIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    BriefcaseIcon,
    CheckBadgeIcon,
    FolderArrowDownIcon
} from '@heroicons/react/24/solid';


const CompletionStatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, iconBgColor: string }> = ({ icon: Icon, title, value, iconBgColor }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ProjectCompletionDashboard: React.FC<{
    status: 'En Proceso' | 'Completado';
    totalRequired: number;
    totalApproved: number;
    foldersRequested: number;
    progressPercent: number;
}> = ({ status, totalRequired, totalApproved, foldersRequested, progressPercent }) => {
    const isCompleted = status === 'Completado';
    const bgColor = isCompleted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
    const textColor = isCompleted ? 'text-green-800' : 'text-blue-800';
    const progressColor = isCompleted ? 'bg-green-500' : 'bg-blue-500';

    return (
        <div className={`p-4 rounded-lg border-2 ${bgColor} mb-6`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Estado de Contratación del Proyecto</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                    {status === 'Completado' ? 'Proyecto Completado' : 'En Proceso de Contratación'}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <CompletionStatCard icon={BriefcaseIcon} title="Vacantes Totales" value={totalRequired} iconBgColor="bg-gray-500"/>
                <CompletionStatCard icon={CheckBadgeIcon} title="Candidatos Aprobados" value={totalApproved} iconBgColor="bg-teal-500"/>
                <CompletionStatCard icon={FolderArrowDownIcon} title="Carpetas Solicitadas" value={foldersRequested} iconBgColor="bg-indigo-500"/>
            </div>
            <div>
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>Progreso General</span>
                    <span className={textColor}>{`${Math.round(progressPercent)}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3.5">
                    <div className={`${progressColor} h-3.5 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const RevisorProyecto = () => {
    const { trabajadores, proyectos } = useData();
    const { projectId } = useParams<{ projectId: string }>();

    const [searchTermAsignados, setSearchTermAsignados] = useState('');
    const [searchTermRechazados, setSearchTermRechazados] = useState('');
    const [showRechazados, setShowRechazados] = useState(false);
    
    const { 
        currentProject, 
        showCompletionDashboard,
        completionData 
    } = useMemo(() => {
        if (!projectId) {
            return { currentProject: null, showCompletionDashboard: false, completionData: null };
        }
        const project = proyectos.find(p => p.id === projectId);
        if (!project) {
             return { currentProject: null, showCompletionDashboard: false, completionData: null };
        }
        
        const candidatosDelProyecto = trabajadores.filter(t => t.proyectoAsignado === projectId);
        
        const listos = candidatosDelProyecto.filter(t => t.proximoEscenario === ProximoEscenario.AprobadoParaContratar);
        const solicitados = candidatosDelProyecto.filter(t => t.proximoEscenario === ProximoEscenario.CarpetaSolicitada);

        const totalAprobadosYContratados = listos.length + solicitados.length;
        const requeridosCount = project.cantidadTrabajadores;
        
        const isCompleted = totalAprobadosYContratados >= requeridosCount && requeridosCount > 0;
        const hasStartedContracting = solicitados.length > 0;

        const data = {
            status: isCompleted ? 'Completado' : 'En Proceso' as 'Completado' | 'En Proceso',
            totalRequired: requeridosCount,
            totalApproved: totalAprobadosYContratados,
            foldersRequested: solicitados.length,
            progressPercent: requeridosCount > 0 ? Math.min(100, (totalAprobadosYContratados / requeridosCount) * 100) : 0,
        };

        return {
            currentProject: project,
            showCompletionDashboard: isCompleted || hasStartedContracting,
            completionData: data
        };
    }, [projectId, proyectos, trabajadores]);

    const { asignadosAlProyecto, rechazadosEnProyecto } = useMemo(() => {
        let asignados: Trabajador[] = [];
        let rechazados: Trabajador[] = [];
        
        if (projectId) {
            asignados = trabajadores.filter(t => t.proyectoAsignado === projectId);
            rechazados = trabajadores.filter(t => t.ultimoProyectoAsignado === projectId && t.estadoCliente === EstadoCliente.Rechazado);
        }
        
        return { asignadosAlProyecto: asignados, rechazadosEnProyecto: rechazados };
    }, [trabajadores, projectId]);
    
    const filterWorkers = (workers: Trabajador[], term: string) => {
        if (!term) return workers;
        const lowercasedFilter = term.toLowerCase();
        return workers.filter(t =>
            t.nombre.toLowerCase().includes(lowercasedFilter) ||
            t.rut.includes(lowercasedFilter) ||
            t.especialidad.toLowerCase().includes(lowercasedFilter)
        );
    };

    const filteredAsignados = useMemo(() => filterWorkers(asignadosAlProyecto, searchTermAsignados), [asignadosAlProyecto, searchTermAsignados]);
    const filteredRechazados = useMemo(() => filterWorkers(rechazadosEnProyecto, searchTermRechazados), [rechazadosEnProyecto, searchTermRechazados]);

    if (!currentProject) {
        return <div className="p-6 text-center bg-white rounded-lg shadow">Seleccione un proyecto del menú lateral para ver el seguimiento de candidatos.</div>
    }

    return (
        <div className="space-y-6">
            {showCompletionDashboard && completionData && <ProjectCompletionDashboard {...completionData} />}

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Seguimiento de Proyecto: {currentProject.nombre}</h1>
                <p className="text-gray-600 mt-1">Estado de los candidatos asignados. El avance de etapas es gestionado por el Cliente.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-lg font-semibold text-gray-700">Candidatos en Proceso ({filteredAsignados.length})</h2>
                    <div className="relative w-full md:w-auto">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar candidato..."
                            value={searchTermAsignados}
                            onChange={(e) => setSearchTermAsignados(e.target.value)}
                            className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Especialidad</th>
                                <th className="px-6 py-3">RUT</th>
                                <th className="px-6 py-3">Etapa Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAsignados.length > 0 ? filteredAsignados.map(t => (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{t.nombre}</td>
                                    <td className="px-6 py-4">{t.especialidad}</td>
                                    <td className="px-6 py-4">{t.rut}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {t.proximoEscenario || 'No definido'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-6 text-gray-500">No hay candidatos asignados a este proyecto.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <button onClick={() => setShowRechazados(!showRechazados)} className="w-full flex justify-between items-center font-bold text-gray-700">
                    <div className="flex items-center gap-2"><XCircleIcon className="h-5 w-5 text-red-500" /> Candidatos Rechazados por Cliente ({rechazadosEnProyecto.length})</div>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${showRechazados ? 'rotate-180' : ''}`} />
                </button>
                {showRechazados && (
                    <div className="mt-4">
                        <div className="flex justify-end mb-4">
                           <div className="relative w-full md:w-auto">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar rechazados..."
                                    value={searchTermRechazados}
                                    onChange={(e) => setSearchTermRechazados(e.target.value)}
                                    className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3">Especialidad</th>
                                        <th className="px-6 py-3">Motivo del Rechazo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRechazados.length > 0 ? filteredRechazados.map(t => (
                                        <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{t.nombre}</td>
                                            <td className="px-6 py-4">{t.especialidad}</td>
                                            <td className="px-6 py-4 text-red-700 font-medium">{t.motivoRechazo}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="text-center py-6 text-gray-500">No hay candidatos rechazados en este proyecto.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevisorProyecto;

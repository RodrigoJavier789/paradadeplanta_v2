
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoCliente, ProximoEscenario, Rol } from '../../types';
import Header from '../../components/Header';
import { 
    XCircleIcon, 
    FolderArrowDownIcon, 
    XMarkIcon as XMarkSolid,
    ChatBubbleLeftRightIcon,
    ArrowRightIcon,
    DocumentMagnifyingGlassIcon,
    ArchiveBoxIcon,
    ClipboardDocumentCheckIcon,
    CheckBadgeIcon,
    UsersIcon,
    CheckCircleIcon,
    HashtagIcon,
    BriefcaseIcon
} from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useParams } from 'react-router-dom';

const REJECTION_REASONS = {
    [ProximoEscenario.Ingreso]: ['No cumple perfil', 'Documentación insuficiente', 'Contacto no exitoso'],
    [ProximoEscenario.Entrevista]: ['No asistió a entrevista', 'Rechazado en entrevista técnica', 'Rechazado en entrevista psicológica'],
    [ProximoEscenario.Evaluacion]: ['No asistió a exámenes', 'Rechazado por exámenes médicos', 'Rechazado por test de drogas']
};


const RejectionSelector: React.FC<{
    trabajador: Trabajador;
    onConfirm: (trabajador: Trabajador, reason: string) => void;
    onCancel: () => void;
}> = ({ trabajador, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    const reasons = REJECTION_REASONS[trabajador.proximoEscenario as keyof typeof REJECTION_REASONS] || [];

    return (
        <div className="absolute z-10 bottom-0 left-0 right-0 p-2 bg-red-50 border-t border-red-200 rounded-b-lg space-y-2">
            <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block p-1.5 border rounded-md bg-white text-sm w-full text-gray-900 focus:ring-red-500 focus:border-red-500"
                aria-label={`Motivo de rechazo para ${trabajador.nombre}`}
            >
                <option value="">Seleccionar causal de rechazo...</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
                <button onClick={onCancel} className="w-full text-xs font-semibold p-1.5 bg-gray-400 text-white rounded-md hover:bg-gray-500">Cancelar</button>
                <button onClick={() => onConfirm(trabajador, reason)} className="w-full text-xs font-semibold p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">Confirmar</button>
            </div>
        </div>
    );
};


const CandidateKanbanCard: React.FC<{
    trabajador: Trabajador;
    onApprove: (trabajador: Trabajador) => void;
    onReject: (trabajador: Trabajador) => void;
    isRejecting: boolean;
    onConfirmRejection: (trabajador: Trabajador, reason: string) => void;
    onCancelRejection: () => void;
}> = ({ trabajador, onApprove, onReject, isRejecting, onConfirmRejection, onCancelRejection }) => {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-3 transition-shadow hover:shadow-md relative">
            <div className={`p-3 ${isRejecting ? 'pb-20' : ''}`}>
                <p className="font-bold text-sm text-gray-800">{trabajador.nombre}</p>
                <p className="text-xs text-gray-500">{trabajador.especialidad}</p>
            </div>
            {!isRejecting && (
                <div className="border-t border-gray-100 p-2 flex justify-end gap-1">
                    <button onClick={() => onReject(trabajador)} className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Rechazar"><XMarkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onApprove(trabajador)} className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Aprobar"><ArrowRightIcon className="h-4 w-4"/></button>
                </div>
            )}
            {isRejecting && (
                <RejectionSelector trabajador={trabajador} onConfirm={onConfirmRejection} onCancel={onCancelRejection} />
            )}
        </div>
    );
};


const KanbanColumn: React.FC<{ title: string; count: number; icon: React.ElementType; colorClass: string; children: React.ReactNode; headerAction?: React.ReactNode }> = ({ title, count, icon: Icon, colorClass, children, headerAction }) => {
    return (
        <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-inner">
            <div className="sticky top-0 bg-gray-100 z-10 p-4 rounded-t-lg border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-base font-bold ${colorClass} flex items-center gap-2`}>
                        <Icon className="h-5 w-5" /> 
                        {title}
                    </h3>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">{count}</span>
                </div>
                {headerAction && <div className="mt-2">{headerAction}</div>}
            </div>
            <div className="p-2 h-[calc(100%-4rem)] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

const RejectedModal: React.FC<{ isOpen: boolean; onClose: () => void; rechazados: Trabajador[] }> = ({ isOpen, onClose, rechazados }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Historial de Candidatos Rechazados</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XMarkSolid className="h-6 w-6 text-gray-600" /></button>
                </div>
                <div className="overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Especialidad</th>
                                <th className="px-4 py-2">Motivo del Rechazo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rechazados.length > 0 ? rechazados.map(t => (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{t.nombre}</td>
                                    <td className="px-4 py-2">{t.especialidad}</td>
                                    <td className="px-4 py-2 text-red-700">{t.motivoRechazo}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-4">No hay candidatos rechazados en este proyecto.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

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


const UsuarioTrabajadores = () => {
    const { trabajadores, updateTrabajador, updateTrabajadoresStatus, proyectos, currentUser } = useData();
    const { projectId } = useParams<{ projectId: string }>();

    const [rejectionState, setRejectionState] = useState<{ workerId: string | null }>({ workerId: null });
    const [isRechazadosModalOpen, setIsRechazadosModalOpen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const { 
        currentProject, 
        paraRevision, 
        enEntrevista, 
        enEvaluacion, 
        listosParaContratar, 
        carpetasSolicitadas, 
        rechazados,
        showCompletionDashboard,
        completionData,
    } = useMemo(() => {
        if (!projectId || !currentUser || currentUser.role !== Rol.Usuario) {
            return { currentProject: null, paraRevision: [], enEntrevista: [], enEvaluacion: [], listosParaContratar: [], carpetasSolicitadas: [], rechazados: [], showCompletionDashboard: false, completionData: null };
        }
        const project = proyectos.find(p => p.id === projectId);
        if (!project) {
             return { currentProject: null, paraRevision: [], enEntrevista: [], enEvaluacion: [], listosParaContratar: [], carpetasSolicitadas: [], rechazados: [], showCompletionDashboard: false, completionData: null };
        }
        
        const candidatosDelProyecto = trabajadores.filter(t => t.proyectoAsignado === projectId);
        const rechazadosEnProyecto = trabajadores.filter(t => t.ultimoProyectoAsignado === projectId && t.estadoCliente === EstadoCliente.Rechazado);
        
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
            paraRevision: candidatosDelProyecto.filter(t => t.proximoEscenario === ProximoEscenario.Ingreso),
            enEntrevista: candidatosDelProyecto.filter(t => t.proximoEscenario === ProximoEscenario.Entrevista),
            enEvaluacion: candidatosDelProyecto.filter(t => t.proximoEscenario === ProximoEscenario.Evaluacion),
            listosParaContratar: listos,
            carpetasSolicitadas: solicitados,
            rechazados: rechazadosEnProyecto,
            showCompletionDashboard: isCompleted || hasStartedContracting,
            completionData: data
        };
    }, [projectId, proyectos, trabajadores, currentUser]);

    const handleCandidateAction = (trabajador: Trabajador, newStage: ProximoEscenario | null, reason?: string) => {
        let updatedTrabajador = { ...trabajador };
        if (reason) {
            updatedTrabajador = { ...updatedTrabajador, estadoCliente: EstadoCliente.Rechazado, motivoRechazo: reason, disponible: true, ultimoProyectoAsignado: trabajador.proyectoAsignado, proyectoAsignado: undefined, proximoEscenario: undefined, ultimaAccion: `Rechazado. Motivo: ${reason}` };
        } else if (newStage) {
            updatedTrabajador = { ...updatedTrabajador, estadoCliente: newStage === ProximoEscenario.AprobadoParaContratar ? EstadoCliente.Aprobado : EstadoCliente.Pendiente, proximoEscenario: newStage, ultimaAccion: `Avanzado a: ${newStage}`, motivoRechazo: undefined };
        }
        updateTrabajador(updatedTrabajador);
        setRejectionState({ workerId: null });
    };
    
    const handleApproveClick = (trabajador: Trabajador) => {
        const nextStageMap: { [key in ProximoEscenario]?: ProximoEscenario } = {
            [ProximoEscenario.Ingreso]: ProximoEscenario.Entrevista,
            [ProximoEscenario.Entrevista]: ProximoEscenario.Evaluacion,
            [ProximoEscenario.Evaluacion]: ProximoEscenario.AprobadoParaContratar
        };
        const nextStage = trabajador.proximoEscenario ? nextStageMap[trabajador.proximoEscenario] : undefined;
        if (nextStage) handleCandidateAction(trabajador, nextStage);
    };

    const handleConfirmRejection = (trabajador: Trabajador, reason: string) => {
        if (!reason) { alert('Por favor, seleccione un motivo de rechazo.'); return; }
        handleCandidateAction(trabajador, null, reason);
    };
    
    const handleRequestFolders = () => {
        if (listosParaContratar.length === 0 || !currentProject) return;

        // 1. Marcar a los trabajadores como solicitados
        const workerIds = listosParaContratar.map(t => t.id);
        updateTrabajadoresStatus(workerIds, ProximoEscenario.CarpetaSolicitada, 'Carpeta de contratación solicitada por cliente.');

        setShowSuccessPopup(true);
    };

    if (!currentProject || !currentUser || !completionData) {
        return <div className="p-6 text-center bg-white rounded-lg shadow">Proyecto o usuario no encontrado.</div>;
    }
    
    const aprobadosCount = listosParaContratar.length + carpetasSolicitadas.length;
    const requeridosCount = currentProject.cantidadTrabajadores;
    const progressData = [{ name: 'Aprobados', value: aprobadosCount }, { name: 'Pendientes', value: Math.max(0, requeridosCount - aprobadosCount) }];

    return (
        <>
            <Header role="Usuario" proyecto={currentProject} />
            <RejectedModal isOpen={isRechazadosModalOpen} onClose={() => setIsRechazadosModalOpen(false)} rechazados={rechazados} />
            
            {showSuccessPopup && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Solicitud Enviada</h2>
                        <p className="text-gray-600 mt-2">Su solicitud ha sido recibida. La plataforma le enviará un link para la descarga de las carpetas dentro de las próximas 24 horas.</p>
                        <button onClick={() => setShowSuccessPopup(false)} className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold">
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            <div className="p-4 md:p-6 h-[calc(100vh-65px)] flex flex-col">
                
                {showCompletionDashboard && <ProjectCompletionDashboard {...completionData} />}

                <div className="flex-shrink-0 mb-6">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 text-white">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-300">Proyecto Activo:</p>
                            <h1 className="text-2xl font-bold mt-1">{currentProject.nombre}</h1>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-300">Progreso:</p>
                                <p className="text-2xl font-bold">{aprobadosCount} <span className="text-lg font-normal text-gray-400">/ {requeridosCount}</span></p>
                            </div>
                            <div className="w-16 h-16"><ResponsiveContainer><PieChart><Pie data={progressData} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={450} stroke="none"><Cell fill="#22c55e" /><Cell fill="#4b5563" /></Pie><Tooltip formatter={(value, name) => [`${value} ${name}`, '']}/></PieChart></ResponsiveContainer></div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-3">
                             <div className="p-2 bg-gray-100 rounded-md"><ArchiveBoxIcon className="h-6 w-6 text-gray-600"/></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Carpetas Solicitadas</p>
                                <p className="text-xl font-bold text-gray-800">{carpetasSolicitadas.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-md"><XCircleIcon className="h-6 w-6 text-red-500"/></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Rechazados en Proceso</p>
                                    <p className="text-xl font-bold text-gray-800">{rechazados.length}</p>
                                </div>
                            </div>
                             <button onClick={() => setIsRechazadosModalOpen(true)} className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 text-xs font-semibold">Ver Historial</button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
                    <KanbanColumn title="Para Revisión" count={paraRevision.length} icon={DocumentMagnifyingGlassIcon} colorClass="text-yellow-600">
                        {paraRevision.length > 0 ? paraRevision.map(t => (
                            <CandidateKanbanCard 
                                key={t.id} 
                                trabajador={t} 
                                onApprove={handleApproveClick}
                                onReject={() => setRejectionState({ workerId: t.id })}
                                isRejecting={rejectionState.workerId === t.id}
                                onConfirmRejection={handleConfirmRejection}
                                onCancelRejection={() => setRejectionState({ workerId: null })}
                            />
                        )) : <p className="text-gray-500 text-center text-sm py-4">No hay candidatos nuevos.</p>}
                    </KanbanColumn>
                    
                    <KanbanColumn title="En Entrevista" count={enEntrevista.length} icon={ChatBubbleLeftRightIcon} colorClass="text-purple-700">
                         {enEntrevista.length > 0 ? enEntrevista.map(t => (
                            <CandidateKanbanCard 
                                key={t.id} 
                                trabajador={t} 
                                onApprove={handleApproveClick}
                                onReject={() => setRejectionState({ workerId: t.id })}
                                isRejecting={rejectionState.workerId === t.id}
                                onConfirmRejection={handleConfirmRejection}
                                onCancelRejection={() => setRejectionState({ workerId: null })}
                            />
                        )) : <p className="text-gray-500 text-center text-sm py-4">No hay candidatos aquí.</p>}
                    </KanbanColumn>

                    <KanbanColumn title="En Evaluación" count={enEvaluacion.length} icon={ClipboardDocumentCheckIcon} colorClass="text-blue-700">
                        {enEvaluacion.length > 0 ? enEvaluacion.map(t => (
                            <CandidateKanbanCard 
                                key={t.id} 
                                trabajador={t} 
                                onApprove={handleApproveClick}
                                onReject={() => setRejectionState({ workerId: t.id })}
                                isRejecting={rejectionState.workerId === t.id}
                                onConfirmRejection={handleConfirmRejection}
                                onCancelRejection={() => setRejectionState({ workerId: null })}
                            />
                        )) : <p className="text-gray-500 text-center text-sm py-4">No hay candidatos aquí.</p>}
                    </KanbanColumn>

                    <KanbanColumn 
                        title="Listos para Contratar" 
                        count={listosParaContratar.length} 
                        icon={CheckBadgeIcon} 
                        colorClass="text-green-700"
                        headerAction={
                             <button
                                onClick={handleRequestFolders}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={listosParaContratar.length === 0}
                                title={listosParaContratar.length === 0 ? "No hay candidatos para solicitar" : "Solicitar carpetas de los candidatos aprobados"}
                            >
                                <FolderArrowDownIcon className="h-5 w-5" /> Solicitar Carpetas
                            </button>
                        }
                    >
                         {listosParaContratar.length > 0 ? listosParaContratar.map(t => (
                             <div key={t.id} className="p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                                <p className="font-bold text-sm text-green-900">{t.nombre}</p>
                                <p className="text-xs text-green-700">{t.especialidad}</p>
                            </div>
                        )) : <p className="text-gray-500 text-center text-sm py-4">Aún no hay candidatos aprobados.</p>}
                    </KanbanColumn>
                    
                    <KanbanColumn
                        title="Carpetas Solicitadas"
                        count={carpetasSolicitadas.length}
                        icon={ArchiveBoxIcon}
                        colorClass="text-indigo-700"
                    >
                        {carpetasSolicitadas.length > 0 ? carpetasSolicitadas.map(t => (
                            <div key={t.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-3">
                                <p className="font-bold text-sm text-indigo-900">{t.nombre}</p>
                                <p className="text-xs text-indigo-700">{t.especialidad}</p>
                            </div>
                        )) : <p className="text-gray-500 text-center text-sm py-4">Aún no hay carpetas solicitadas.</p>}
                    </KanbanColumn>

                </div>
            </div>
        </>
    );
};

export default UsuarioTrabajadores;
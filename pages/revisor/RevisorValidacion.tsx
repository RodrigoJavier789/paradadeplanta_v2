
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador, EstadoDocumental } from '../../types';
import { 
    CheckCircleIcon,
    XCircleIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    DocumentMagnifyingGlassIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    EyeIcon,
    UserCircleIcon,
    IdentificationIcon
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';

// --- Componente de ayuda para la fila de información ---
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-200 last:border-b-0">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="text-sm font-semibold text-gray-900 text-right">{value}</dd>
    </div>
);

// --- MODAL DE REVISIÓN ---
const ReviewModal = ({ worker, onClose, onValidate, onReject }: { worker: Trabajador, onClose: () => void, onValidate: (workerId: string) => void, onReject: (workerId: string, reason: string) => void }) => {
    const [rejectionReason, setRejectionReason] = useState('');

    const simulatedDocuments = [
        { name: 'Cédula de Identidad' },
        { name: 'Certificado de Antecedentes' },
        { name: 'Currículum Vitae' },
        { name: 'Certificados de Especialidad' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <DocumentMagnifyingGlassIcon className="h-8 w-8 text-purple-600" />
                        Revisión de Candidato
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna de Información */}
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-2"><UserCircleIcon className="h-5 w-5" /> Datos Personales</h3>
                            <dl>
                                <InfoRow label="Nombre" value={worker.nombre} />
                                <InfoRow label="RUT" value={worker.rut} />
                                <InfoRow label="Edad" value={`${worker.edad} años`} />
                                <InfoRow label="Ciudad" value={worker.ciudad} />
                                <InfoRow label="Nacionalidad" value={worker.nacionalidad} />
                                <InfoRow label="Teléfono" value={worker.telefono || 'No registrado'} />
                                <InfoRow label="Fecha Registro" value={format(worker.fechaRegistro, 'dd/MM/yyyy')} />
                            </dl>
                        </div>
                        <div className="p-4 border rounded-lg">
                             <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-2"><BriefcaseIcon className="h-5 w-5" /> Perfil Profesional</h3>
                             <dl>
                                <InfoRow label="Especialidad" value={worker.especialidad} />
                             </dl>
                        </div>
                    </div>

                    {/* Columna de Documentos */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-3"><IdentificationIcon className="h-5 w-5" /> Documentación Adjunta</h3>
                        <div className="space-y-3">
                            {simulatedDocuments.map(doc => (
                                <div key={doc.name} className="flex justify-between items-center p-3 bg-white border rounded-md">
                                    <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                                    <button 
                                        onClick={() => alert(`Visualizando (simulado): ${doc.name}`)}
                                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        Ver Documento
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Acciones del Modal */}
                <div className="mt-6 pt-4 border-t space-y-4">
                    <div>
                        <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo de Rechazo (Obligatorio para rechazar)
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ej: Cédula de identidad vencida, certificado de antecedentes ilegible..."
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={() => onReject(worker.id, rejectionReason)} 
                            disabled={!rejectionReason.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md font-bold transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            <XCircleIcon className="h-5 w-5" />
                            Rechazar Documentación
                        </button>
                        <button onClick={() => onValidate(worker.id)} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold transition-colors">
                            <CheckCircleIcon className="h-5 w-5" />
                            Validar Candidato para Proyecto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
const RevisorValidacion = () => {
    const { trabajadores, updateTrabajador } = useData();
    
    // State for search terms
    const [searchTermNuevos, setSearchTermNuevos] = useState('');
    const [searchTermRechazados, setSearchTermRechazados] = useState('');

    // State for UI control
    const [showRechazados, setShowRechazados] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Trabajador | null>(null);

    // Memoized lists of workers
    const { enRevision, rechazadosDocumental } = useMemo(() => ({
        enRevision: trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.EnRevision),
        rechazadosDocumental: trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.RechazadoDocumental),
    }), [trabajadores]);


    // Filtering logic
    const filterWorkers = (workers: Trabajador[], term: string) => {
        if (!term) return workers;
        const lowercasedFilter = term.toLowerCase();
        return workers.filter(t =>
            t.nombre.toLowerCase().includes(lowercasedFilter) ||
            t.rut.includes(lowercasedFilter) ||
            t.especialidad.toLowerCase().includes(lowercasedFilter)
        );
    };

    const filteredEnRevision = useMemo(() => filterWorkers(enRevision, searchTermNuevos), [enRevision, searchTermNuevos]);
    const filteredRechazados = useMemo(() => filterWorkers(rechazadosDocumental, searchTermRechazados), [rechazadosDocumental, searchTermRechazados]);

    // --- Handlers ---
    const handleOpenReviewModal = (worker: Trabajador) => {
        setSelectedWorker(worker);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorker(null);
    };

    const handleValidate = (workerId: string) => {
        const worker = trabajadores.find(t => t.id === workerId);
        if (worker) {
            updateTrabajador({ ...worker, estadoDocumental: EstadoDocumental.Validado, motivoRechazoDocumental: undefined });
        }
        handleCloseModal();
    };

    const handleReject = (workerId: string, reason: string) => {
        const worker = trabajadores.find(t => t.id === workerId);
        if (worker) {
            updateTrabajador({ ...worker, estadoDocumental: EstadoDocumental.RechazadoDocumental, motivoRechazoDocumental: reason });
        }
        handleCloseModal();
    };
    
    const handleReValidate = (worker: Trabajador) => {
        if (window.confirm(`¿Está seguro que desea re-validar a ${worker.nombre}? Se quitará el motivo de rechazo.`)) {
            updateTrabajador({ ...worker, estadoDocumental: EstadoDocumental.Validado, motivoRechazoDocumental: undefined });
        }
    };
    
    const columns = [
        { header: 'Nombre', accessor: (t: Trabajador) => <span className="font-medium text-gray-900">{t.nombre}</span> },
        { header: 'Especialidad', accessor: (t: Trabajador) => t.especialidad },
    ];
    
    return (
         <div className="space-y-6">
            {isModalOpen && selectedWorker && <ReviewModal worker={selectedWorker} onClose={handleCloseModal} onValidate={handleValidate} onReject={handleReject} />}
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Paso 1: Validación Documental</h1>
                <p className="text-gray-600 mt-1">Revise los perfiles y documentos de los nuevos candidatos para aprobarlos. Los candidatos validados pasarán a la etapa de asignación.</p>
            </div>
            
            {/* Tabla de Nuevos Ingresos */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Nuevos Ingresos para Revisar ({filteredEnRevision.length})</h2>
                    <div className="relative w-full md:w-auto">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Buscar..." value={searchTermNuevos} onChange={(e) => setSearchTermNuevos(e.target.value)} className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
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
                            {filteredEnRevision.length > 0 ? filteredEnRevision.map(t => (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    {columns.map(c => <td key={c.header} className="px-6 py-4">{c.accessor(t)}</td>)}
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleOpenReviewModal(t)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-sm text-purple-800 bg-purple-100 hover:bg-purple-200 transition-colors">
                                            <EyeIcon className="h-5 w-5" /> Revisar
                                        </button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={columns.length + 1} className="text-center py-6 text-gray-500">No hay nuevos candidatos para revisar.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla de Rechazados (Colapsable) */}
             <div className="bg-white p-4 rounded-lg shadow-sm">
                <button onClick={() => setShowRechazados(!showRechazados)} className="w-full flex justify-between items-center font-bold text-gray-700">
                    <div className="flex items-center gap-2"><XCircleIcon className="h-5 w-5 text-red-500" /> Rechazados en Revisión Documental ({rechazadosDocumental.length})</div>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${showRechazados ? 'rotate-180' : ''}`} />
                </button>
                {showRechazados && (
                     <div className="mt-4">
                        <div className="flex justify-end mb-4">
                            <div className="relative w-full md:w-auto">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input type="text" placeholder="Buscar..." value={searchTermRechazados} onChange={(e) => setSearchTermRechazados(e.target.value)} className="w-full md:w-80 p-2 pl-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-gray-800">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Nombre</th>
                                        <th className="px-6 py-3 text-left">Especialidad</th>
                                        <th className="px-6 py-3 text-left">RUT</th>
                                        <th className="px-6 py-3 text-left">Motivo Rechazo</th>
                                        <th className="px-6 py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRechazados.map(t => (
                                        <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{t.nombre}</td><td className="px-6 py-4">{t.especialidad}</td><td className="px-6 py-4">{t.rut}</td>
                                            <td className="px-6 py-4 text-red-700 font-semibold">{t.motivoRechazoDocumental}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleReValidate(t)} title="Re-validar" className="p-2 rounded-full text-green-600 bg-green-100 hover:bg-green-200">
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRechazados.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-6 text-gray-500">No hay candidatos rechazados.</td></tr>
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

export default RevisorValidacion;

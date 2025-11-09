
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import WorkerTable from '../../components/WorkerTable';
import { Trabajador, EstadoDocumental, EstadoCliente, ProximoEscenario } from '../../types';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const TabButton: React.FC<{
    label: string;
    count: number;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, count, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 font-semibold text-sm rounded-t-lg border-b-4 transition-colors ${
            isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
    </button>
);


const AdminTrabajadores = () => {
    const { trabajadores, getProyectoById, revisores } = useData();
    const [activeTab, setActiveTab] = useState<'ingresados' | 'libres' | 'ocupados'>('ingresados');
    
    const revisoresMap = useMemo(() => new Map(revisores.map(r => [r.id, r.nombre])), [revisores]);

    const { recienIngresados, libres, ocupados } = useMemo(() => {
        const ingresados = trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.EnRevision);
        const free = trabajadores.filter(t => 
            (t.estadoDocumental === EstadoDocumental.Validado && !t.proyectoAsignado) ||
            t.estadoCliente === EstadoCliente.Rechazado
        );
        const busy = trabajadores.filter(t => t.proximoEscenario === ProximoEscenario.Contratado);

        return { recienIngresados: ingresados, libres: free, ocupados: busy };
    }, [trabajadores]);

    const downloadFicha = (trabajador: Trabajador) => alert(`Descargando ficha de ${trabajador.nombre}`);
    const downloadDocumentos = (trabajador: Trabajador) => alert(`Descargando documentos de ${trabajador.nombre}`);

    const generalColumns = useMemo(() => [
        { header: 'Nº', accessor: 'numero' as keyof Trabajador },
        { header: 'Nombre', accessor: 'nombre' as keyof Trabajador },
        { header: 'Especialidad', accessor: 'especialidad' as keyof Trabajador },
        { header: 'RUT', accessor: 'rut' as keyof Trabajador },
        { header: 'Ciudad', accessor: 'ciudad' as keyof Trabajador },
        { header: 'Estado Documental', accessor: 'estadoDocumental' as keyof Trabajador},
        { 
            header: 'Revisor Asignado', 
            accessor: (t: Trabajador) => t.revisorAsignadoId ? (revisoresMap.get(t.revisorAsignadoId) || 'ID no encontrado') : 'Sin asignar' 
        },
        { 
            header: 'Proyecto (Actual/Último)', 
            accessor: (t: Trabajador) => {
                const proyectoId = t.proyectoAsignado || t.ultimoProyectoAsignado;
                return getProyectoById(proyectoId || '')?.nombre || 'N/A';
            }
        },
        { header: 'Estado Cliente', accessor: (t: Trabajador) => t.estadoCliente || 'N/A' },
        { header: 'Próximo Escenario', accessor: (t: Trabajador) => t.proximoEscenario || 'N/A' },
    ], [getProyectoById, revisoresMap]);

    const actions = [
        { label: 'Descargar Ficha', icon: DocumentTextIcon, onClick: downloadFicha, className: 'bg-blue-500 text-white' },
        { label: 'Descargar Documentos', icon: ArrowDownTrayIcon, onClick: downloadDocumentos, className: 'bg-green-500 text-white' },
    ];
    
    const renderTable = () => {
        switch (activeTab) {
            case 'ingresados':
                return <WorkerTable title={`Total Recién Ingresados (${recienIngresados.length})`} trabajadores={recienIngresados} columns={generalColumns} actions={actions} />;
            case 'libres':
                return <WorkerTable title={`Total Libres y Disponibles (${libres.length})`} trabajadores={libres} columns={generalColumns} actions={actions} />;
            case 'ocupados':
                return <WorkerTable title={`Total Ocupados (${ocupados.length})`} trabajadores={ocupados} columns={generalColumns} actions={actions} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Listado Global de Trabajadores</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton label="Recién Ingresados" count={recienIngresados.length} icon={UserPlusIcon} isActive={activeTab === 'ingresados'} onClick={() => setActiveTab('ingresados')} />
                    <TabButton label="Libres y Disponibles" count={libres.length} icon={UserIcon} isActive={activeTab === 'libres'} onClick={() => setActiveTab('libres')} />
                    <TabButton label="Ocupados" count={ocupados.length} icon={UserGroupIcon} isActive={activeTab === 'ocupados'} onClick={() => setActiveTab('ocupados')} />
                </nav>
            </div>
            
            <div>
                {renderTable()}
            </div>
        </div>
    );
};

export default AdminTrabajadores;

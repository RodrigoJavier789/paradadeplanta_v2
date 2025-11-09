import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EstadoDocumental, ProximoEscenario } from '../../types';
import { 
    UsersIcon,
    ListBulletIcon,
    BriefcaseIcon,
    CheckBadgeIcon,
    FolderArrowDownIcon
} from '@heroicons/react/24/solid';
import PieChartCard from '../../components/charts/PieChartCard';

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}><Icon className="h-6 w-6 text-white" /></div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const RevisorDashboard = () => {
    const { trabajadores, proyectos } = useData();

    const stats = useMemo(() => {
        const enRevision = trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.EnRevision).length;
        const validadosDisponibles = trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.Validado && !t.proyectoAsignado).length;
        const asignados = trabajadores.filter(t => !!t.proyectoAsignado).length;
        const publishedProyectos = proyectos.filter(p => p.estado === 'publicado').length;
        const carpetasSolicitadas = trabajadores.filter(t => t.proximoEscenario === ProximoEscenario.CarpetaSolicitada).length;

        
        const pieData = [
            { name: 'En Revisión', value: enRevision },
            { name: 'Validados Disponibles', value: validadosDisponibles },
            { name: 'Asignados a Proyectos', value: asignados },
            { name: 'Rechazados', value: trabajadores.filter(t => t.estadoDocumental === EstadoDocumental.RechazadoDocumental).length },
        ];

        return { enRevision, validadosDisponibles, asignados, publishedProyectos, carpetasSolicitadas, pieData };
    }, [trabajadores, proyectos]);

    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Dashboard del Revisor</h1>
                <p className="text-gray-600 mt-1">Resumen general del estado de los candidatos en el sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard icon={ListBulletIcon} title="Pendientes de Revisión" value={stats.enRevision} color="bg-yellow-500" />
                <StatCard icon={CheckBadgeIcon} title="Validados Disponibles" value={stats.validadosDisponibles} color="bg-green-500" />
                <StatCard icon={UsersIcon} title="Asignados a Proyectos" value={stats.asignados} color="bg-purple-500" />
                <StatCard icon={BriefcaseIcon} title="Proyectos Activos" value={stats.publishedProyectos} color="bg-blue-500" />
                <StatCard icon={FolderArrowDownIcon} title="Solicitudes de Carpetas" value={stats.carpetasSolicitadas} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1">
                 <PieChartCard title="Distribución General de Candidatos" data={stats.pieData} />
            </div>
        </div>
    );
};

export default RevisorDashboard;
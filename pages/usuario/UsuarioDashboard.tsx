import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import PieChartCard from '../../components/charts/PieChartCard';
import { ProximoEscenario, EstadoCliente, Usuario } from '../../types';
import { UserCircleIcon, BriefcaseIcon, UserGroupIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Header from '../../components/Header';

// Helper component for stat cards
const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const UsuarioDashboard = () => {
    const { trabajadores, proyectos, clientes, currentUser } = useData();
    
    const client = currentUser ? clientes.find(c => c.id === (currentUser as Usuario).clienteId) : undefined;
    
    const userProyectos = useMemo(() => {
        return client ? proyectos.filter(p => client.proyectosActivos.includes(p.id) && p.estado === 'publicado') : [];
    }, [client, proyectos]);

    const userTrabajadoresEnProceso = useMemo(() => {
        const projectIds = userProyectos.map(p => p.id);
        // Includes candidates assigned to a project but not yet rejected
        return trabajadores.filter(t => t.proyectoAsignado && projectIds.includes(t.proyectoAsignado));
    }, [userProyectos, trabajadores]);
    
    const stats = useMemo(() => {
        const totalVacantes = userProyectos.reduce((acc, p) => acc + p.cantidadTrabajadores, 0);
        const aprobados = userTrabajadoresEnProceso.filter(t => t.proximoEscenario === ProximoEscenario.AprobadoParaContratar).length;

        const stageCounts = userTrabajadoresEnProceso.reduce((acc, t) => {
            const stage = t.proximoEscenario;
            if (stage && stage !== ProximoEscenario.Contratado && stage !== ProximoEscenario.Acreditacion) { // Focusing on client-facing stages
                 const stageName = {
                    [ProximoEscenario.Ingreso]: 'Para Revisión',
                    [ProximoEscenario.Entrevista]: 'En Entrevista',
                    [ProximoEscenario.Evaluacion]: 'En Evaluación',
                    [ProximoEscenario.AprobadoParaContratar]: 'Aprobados'
                 }[stage] || stage;
                acc[stageName] = (acc[stageName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));
        
        return {
            totalProyectos: userProyectos.length,
            totalCandidatos: userTrabajadoresEnProceso.length,
            totalAprobados: aprobados,
            totalVacantes,
            pieData
        };
    }, [userProyectos, userTrabajadoresEnProceso]);

    if (!currentUser || !client) {
        return <div className="p-6 text-center text-gray-600">No se pudo cargar la información del usuario.</div>;
    }

    return (
        <>
        <Header userName={currentUser.nombre} />
        <div className="p-4 md:p-6 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {currentUser.nombre}</h1>
                <p className="text-gray-600">Dashboard General de {client.nombre}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BriefcaseIcon} title="Proyectos Activos" value={stats.totalProyectos} color="bg-blue-500" />
                <StatCard icon={UserGroupIcon} title="Candidatos en Proceso" value={stats.totalCandidatos} color="bg-yellow-500" />
                <StatCard icon={CheckCircleIcon} title="Listos para Contratar" value={stats.totalAprobados} color="bg-green-500" />
                <StatCard icon={UserCircleIcon} title="Total Vacantes" value={stats.totalVacantes} color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <PieChartCard title="Candidatos por Etapa" data={stats.pieData} />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Proyectos Activos</h3>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {userProyectos.length > 0 ? userProyectos.map(proyecto => {
                            const candidatosProyecto = trabajadores.filter(t => t.proyectoAsignado === proyecto.id);
                            const aprobadosProyecto = candidatosProyecto.filter(t => t.proximoEscenario === ProximoEscenario.AprobadoParaContratar).length;
                            const progress = proyecto.cantidadTrabajadores > 0 ? (aprobadosProyecto / proyecto.cantidadTrabajadores) * 100 : 0;

                            return (
                                <div key={proyecto.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                                    <div className="flex flex-col md:flex-row justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{proyecto.nombre}</p>
                                            <p className="text-sm text-gray-500">{proyecto.ciudad}</p>
                                        </div>
                                        <Link to={`/usuario/proyectos/${proyecto.id}`} className="mt-2 md:mt-0 flex items-center bg-gray-700 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 text-sm font-medium">
                                            Gestionar Proyecto <ArrowRightIcon className="h-4 w-4 ml-2" />
                                        </Link>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-600">Progreso de Aprobación</span>
                                            <span className="font-semibold">{aprobadosProyecto} / {proyecto.cantidadTrabajadores}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-center text-gray-500 py-8">No tiene proyectos activos asignados.</p>}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default UsuarioDashboard;
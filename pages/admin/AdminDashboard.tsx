
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import PieChartCard from '../../components/charts/PieChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import { EstadoCliente, Trabajador, ProximoEscenario, EstadoDocumental, Proyecto, Cliente } from '../../types';
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, Interval } from 'date-fns';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ProjectStatusTable = ({ 
    trabajadores, 
    proyectos, 
    getClienteById 
}: { 
    trabajadores: Trabajador[],
    proyectos: Proyecto[],
    getClienteById: (id: string) => Cliente | undefined
}) => {
    const statusData = proyectos
        .filter(p => p.estado === 'publicado')
        .map(proyecto => {
            const aprobados = trabajadores.filter(t => 
                t.proyectoAsignado === proyecto.id && t.estadoCliente === EstadoCliente.Aprobado
            ).length;
            
            return {
                id: proyecto.id,
                nombre: proyecto.nombre,
                cliente: getClienteById(proyecto.clienteId)?.nombre || 'N/A',
                requeridos: proyecto.cantidadTrabajadores,
                aprobados: aprobados,
                fechaTerminoReclutamiento: proyecto.fechaTerminoReclutamiento,
            };
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Estado de Aceptación por Proyecto (Publicados)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Proyecto</th>
                            <th scope="col" className="px-6 py-3 text-center">Requeridos</th>
                            <th scope="col" className="px-6 py-3 text-center">Aprobados por Usuario</th>
                            <th scope="col" className="px-6 py-3">Progreso</th>
                            <th scope="col" className="px-6 py-3">Término Reclutamiento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statusData.map(item => {
                            const progress = item.requeridos > 0 ? (item.aprobados / item.requeridos) * 100 : 0;
                            return (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{item.cliente}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.nombre}</td>
                                    <td className="px-6 py-4 text-center">{item.requeridos}</td>
                                    <td className="px-6 py-4 text-center">{item.aprobados}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">{`${progress.toFixed(0)}%`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(item.fechaTerminoReclutamiento, 'dd/MM/yyyy')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DateFilterButton = ({ range, label, currentRange, setRange }: { 
    range: 'this_week' | 'last_week' | 'last_4_weeks' | 'all', 
    label: string, 
    currentRange: string, 
    setRange: (range: 'this_week' | 'last_week' | 'last_4_weeks' | 'all') => void 
}) => (
    <button 
        onClick={() => setRange(range)} 
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentRange === range ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
        {label}
    </button>
);


const AdminDashboard = () => {
    const { trabajadores, clientes, proyectos, getClienteById } = useData();
    const [dateRange, setDateRange] = useState<'this_week' | 'last_week' | 'last_4_weeks' | 'all'>('all');

    const filteredTrabajadores = useMemo(() => {
        if (dateRange === 'all') return trabajadores;
        
        const now = new Date();
        let interval: Interval;

        switch(dateRange) {
            case 'this_week':
                interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case 'last_week':
                const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                interval = { start: lastWeekStart, end: endOfWeek(lastWeekStart, { weekStartsOn: 1 }) };
                break;
            case 'last_4_weeks':
                interval = { start: subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 3), end: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
        }
        
        return trabajadores.filter(t => t.fechaRegistro && isWithinInterval(t.fechaRegistro, interval));
    }, [trabajadores, dateRange]);
    
    const kpiStats = useMemo(() => {
        let libres = 0;
        let ocupados = 0;
        let enProceso = 0;

        filteredTrabajadores.forEach(t => {
            const isOcupado = t.proximoEscenario === ProximoEscenario.Contratado;
            const isLibre = t.estadoCliente === EstadoCliente.Rechazado || (t.estadoDocumental === EstadoDocumental.Validado && !t.proyectoAsignado);

            if (isOcupado) {
                ocupados++;
            } else if (isLibre) {
                libres++;
            } else {
                enProceso++;
            }
        });

        return { libres, ocupados, enProceso };
    }, [filteredTrabajadores]);

    const processData = (data: Trabajador[], key: keyof Trabajador) => {
        const counts = data.reduce((acc: Record<string, number>, item) => {
            const value = item[key];
            if (value !== null && value !== undefined && value !== '') {
                const stringKey = String(value);
                acc[stringKey] = (acc[stringKey] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    const processTopData = (rawData: { name: string; value: number }[], topN = 10) => {
        const sortedData = [...rawData].sort((a, b) => b.value - a.value);
        if (sortedData.length <= topN) {
            return sortedData;
        }
        const top = sortedData.slice(0, topN);
        const othersValue = sortedData.slice(topN).reduce((acc, curr) => acc + curr.value, 0);
        if (othersValue > 0) {
            return [...top, { name: 'Otros', value: othersValue }];
        }
        return top;
    };

    const especialidadesDataRaw = processData(filteredTrabajadores, 'especialidad');
    const topEspecialidadesData = useMemo(() => processTopData(especialidadesDataRaw, 10), [especialidadesDataRaw]);

    const ciudadesDataRaw = processData(filteredTrabajadores, 'ciudad');
    const topCiudadesData = useMemo(() => processTopData(ciudadesDataRaw, 10), [ciudadesDataRaw]);

    const nuevosTrabajadoresData = [{ name: 'Registrados en Periodo', value: filteredTrabajadores.length }];
    const nacionalidadesData = processData(filteredTrabajadores, 'nacionalidad');
    const estadosDocumentalData = processData(filteredTrabajadores, 'estadoDocumental');
    const clientesProyectosData = [
      { name: 'Clientes Activos', value: clientes.length },
      { name: 'Proyectos Activos', value: proyectos.length }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Administrador</h1>

            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-700">Filtro de Tiempo</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <DateFilterButton range="this_week" label="Esta Semana" currentRange={dateRange} setRange={setDateRange} />
                    <DateFilterButton range="last_week" label="Semana Pasada" currentRange={dateRange} setRange={setDateRange} />
                    <DateFilterButton range="last_4_weeks" label="Últimas 4 Semanas" currentRange={dateRange} setRange={setDateRange} />
                    <DateFilterButton range="all" label="Histórico" currentRange={dateRange} setRange={setDateRange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={CheckCircleIcon} title="Ocupados" value={kpiStats.ocupados} color="bg-green-500" />
                <StatCard icon={ClockIcon} title="En Proceso" value={kpiStats.enProceso} color="bg-yellow-500" />
                <StatCard icon={BriefcaseIcon} title="Libres y Disponibles" value={kpiStats.libres} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProjectStatusTable trabajadores={filteredTrabajadores} proyectos={proyectos} getClienteById={getClienteById} />
                <PieChartCard title="Trabajadores Registrados en Periodo" data={nuevosTrabajadoresData} />
                <BarChartCard title="Top 10 Especialidades Más Solicitadas" data={topEspecialidadesData} />
                <BarChartCard title="Top 10 Ciudades de los Trabajadores" data={topCiudadesData} />
                <PieChartCard title="Nacionalidad de los Trabajadores" data={nacionalidadesData} />
                <PieChartCard title="Estados de Revisión Documental" data={estadosDocumentalData} />
                <PieChartCard title="Clientes y Proyectos" data={clientesProyectosData} />
            </div>
        </div>
    );
};

export default AdminDashboard;
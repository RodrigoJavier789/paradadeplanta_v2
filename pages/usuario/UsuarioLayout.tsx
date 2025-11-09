import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import UsuarioDashboard from './UsuarioDashboard';
import UsuarioTrabajadores from './UsuarioTrabajadores';
import { BriefcaseIcon, ChartPieIcon } from '@heroicons/react/24/solid';
import { useData } from '../../context/DataContext';

const UsuarioLayout = () => {
    const { proyectos, clientes, currentUser } = useData();
    
    const client = currentUser ? clientes.find(c => c.id === (currentUser as any).clienteId) : undefined;
    
    const userProyectos = useMemo(() => {
        return client ? proyectos.filter(p => client.proyectosActivos.includes(p.id) && p.estado === 'publicado') : [];
    }, [client, proyectos]);

    const navItems = useMemo(() => {
        const projectNavItems = userProyectos.map(proyecto => ({
            to: `/usuario/proyectos/${proyecto.id}`,
            label: proyecto.nombre,
            icon: BriefcaseIcon,
        }));

        return [
            { to: '/usuario', label: 'Dashboard', icon: ChartPieIcon },
            ...projectNavItems
        ];
    }, [userProyectos]);

    const firstProjectId = userProyectos.length > 0 ? userProyectos[0].id : null;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar navItems={navItems} role="Usuario" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <Routes>
                        <Route path="/" element={<UsuarioDashboard />} />
                        <Route path="/proyectos/:projectId" element={<UsuarioTrabajadores />} />
                        
                        {/* Redirige /proyectos al primer proyecto del usuario, o al dashboard si no tiene */}
                        <Route 
                            path="/proyectos" 
                            element={
                                firstProjectId 
                                    ? <Navigate to={`/usuario/proyectos/${firstProjectId}`} replace />
                                    : <Navigate to="/usuario" replace />
                            } 
                        />
                        
                        {/* Redirige cualquier otra ruta de usuario al dashboard */}
                        <Route path="/*" element={<Navigate to="/usuario" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default UsuarioLayout;
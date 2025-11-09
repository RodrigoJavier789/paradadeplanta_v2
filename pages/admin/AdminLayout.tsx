

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AdminDashboard from './AdminDashboard';
import AdminTrabajadores from './AdminTrabajadores';
import AdminClientes from './AdminClientes';
import AdminProyectos from './AdminProyectos';
import AdminCuentas from './AdminCuentas';
import AdminRevisores from './AdminRevisores';
import AdminImportacion from './AdminImportacion';
import AdminDistribucion from './AdminDistribucion';
import AdminPersonalizacion from './AdminPersonalizacion';
import { useData } from '../../context/DataContext';
import { 
    ChartPieIcon, 
    UsersIcon, 
    BuildingStorefrontIcon, 
    BriefcaseIcon,
    KeyIcon,
    UserGroupIcon,
    ArrowUpTrayIcon,
    ArrowsRightLeftIcon,
    PaintBrushIcon,
 } from '@heroicons/react/24/solid';


const AdminLayout = () => {
    const { currentUser } = useData();

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: ChartPieIcon },
        { to: '/admin/trabajadores', label: 'Listado Global', icon: UsersIcon },
        { to: '/admin/distribucion', label: 'Distribución', icon: ArrowsRightLeftIcon },
        { to: '/admin/clientes', label: 'Clientes', icon: BuildingStorefrontIcon },
        { to: '/admin/proyectos', label: 'Proyectos', icon: BriefcaseIcon },
        { to: '/admin/revisores', label: 'Revisores', icon: UserGroupIcon },
        { to: '/admin/importacion', label: 'Importación Masiva', icon: ArrowUpTrayIcon },
        { to: '/admin/cuentas', label: 'Cuentas Trabajadores', icon: KeyIcon },
        { to: '/admin/personalizacion', label: 'Personalización y Datos', icon: PaintBrushIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar navItems={navItems} role="Administrador" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={currentUser?.nombre} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/trabajadores" element={<AdminTrabajadores />} />
                        <Route path="/distribucion" element={<AdminDistribucion />} />
                        <Route path="/clientes" element={<AdminClientes />} />
                        <Route path="/proyectos" element={<AdminProyectos />} />
                        <Route path="/revisores" element={<AdminRevisores />} />
                        <Route path="/importacion" element={<AdminImportacion />} />
                        <Route path="/cuentas" element={<AdminCuentas />} />
                        <Route path="/personalizacion" element={<AdminPersonalizacion />} />
                        <Route path="/*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
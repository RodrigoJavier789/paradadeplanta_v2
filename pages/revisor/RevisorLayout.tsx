import React, { useState, useMemo } from 'react';
import { Routes, Route, NavLink, Navigate, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import RevisorDashboard from './RevisorDashboard';
import RevisorValidacion from './RevisorValidacion';
import RevisorAsignacion from './RevisorAsignacion';
import RevisorProyecto from './RevisorKanban';
import RevisorRechazados from './RevisorRechazados';
import { 
    ChartPieIcon, 
    BriefcaseIcon,
    ChevronDownIcon,
    DocumentMagnifyingGlassIcon,
    ClipboardDocumentCheckIcon,
    XCircleIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { useData } from '../../context/DataContext';

const CustomSidebar = ({ navItems, publishedProyectos, onLogout }: { 
    navItems: any[], 
    publishedProyectos: any[],
    onLogout: () => void
}) => {
    const [proyectosOpen, setProyectosOpen] = useState(true);

    const baseLinkClasses = "flex items-center p-3 my-1 rounded-md transition-colors duration-200";
    const activeLinkClasses = "bg-purple-900";
    const inactiveLinkClasses = "hover:bg-purple-700";

    return (
        <aside className="fixed md:relative inset-y-0 left-0 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-purple-800 text-purple-100 flex flex-col z-20">
             <div className="p-4 border-b border-purple-900">
                <Link to="/revisor" className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center font-bold text-lg text-purple-800">
                        PdP
                    </div>
                    <span className="text-white text-xl font-bold">Paradadeplanta.cl</span>
                </Link>
                <p className="text-sm text-purple-300 mt-1">Revisor</p>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/revisor/dashboard'}
                        className={({ isActive }) =>
                          `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="flex-1">{item.label}</span>
                         {item.badge && item.badge > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
                
                {/* Collapsible Project List */}
                <div className="mt-2">
                    <button onClick={() => setProyectosOpen(!proyectosOpen)} className={`${baseLinkClasses} w-full text-left ${inactiveLinkClasses}`}>
                        <BriefcaseIcon className="h-5 w-5 mr-3" />
                        <span>Seguimiento Proyectos</span>
                        <ChevronDownIcon className={`h-4 w-4 ml-auto transition-transform ${proyectosOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {proyectosOpen && (
                        <div className="pl-6 border-l-2 border-purple-700 ml-3">
                            {publishedProyectos.map(proyecto => (
                                 <NavLink
                                    key={proyecto.id}
                                    to={`/revisor/proyectos/${proyecto.id}`}
                                    className={({ isActive }) =>
                                      `flex items-center py-2 px-3 my-1 rounded-md text-sm transition-colors duration-200 ${isActive ? 'bg-purple-900' : 'hover:bg-purple-700'}`
                                    }
                                >
                                    {proyecto.nombre}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </nav>
            <div className="p-2 mt-auto border-t border-purple-700">
                <button
                    onClick={onLogout}
                    className={`${baseLinkClasses} ${inactiveLinkClasses} w-full`}
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

const RevisorLayout = () => {
    const { proyectos, currentUser, logout } = useData();
    const navigate = useNavigate();
    
    const navItems = useMemo(() => [
        { to: '/revisor/dashboard', label: 'Dashboard', icon: ChartPieIcon },
        { to: '/revisor/validacion', label: 'Ingresos para revisar', icon: DocumentMagnifyingGlassIcon },
        { to: '/revisor/asignacion', label: 'Asignación a Proyectos', icon: ClipboardDocumentCheckIcon },
        { to: '/revisor/rechazados', label: 'Rechazados', icon: XCircleIcon },
    ], []);
    
    const publishedProyectos = useMemo(() => 
        proyectos.filter(p => p.estado === 'publicado'), 
    [proyectos]);
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <CustomSidebar 
                navItems={navItems} 
                publishedProyectos={publishedProyectos}
                onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={currentUser?.nombre} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/revisor/dashboard" replace />} />
                        <Route path="/dashboard" element={<RevisorDashboard />} />
                        <Route path="/validacion" element={<RevisorValidacion />} />
                        <Route path="/asignacion" element={<RevisorAsignacion />} />
                        <Route path="/rechazados" element={<RevisorRechazados />} />
                        <Route path="/proyectos/:projectId" element={<RevisorProyecto />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default RevisorLayout;
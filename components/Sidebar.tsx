import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ChartPieIcon, BriefcaseIcon, BuildingStorefrontIcon, UsersIcon, UserPlusIcon, FolderPlusIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { useData } from '../context/DataContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { platformLogo, logout } = useData();
    const navigate = useNavigate();

    const roleColors = {
        Administrador: 'bg-blue-800 text-blue-100',
        Revisor: 'bg-purple-800 text-purple-100',
        Usuario: 'bg-gray-800 text-gray-100',
        Trabajador: 'bg-yellow-800 text-yellow-100',
    };
    const roleAccent = {
      Administrador: 'hover:bg-blue-700',
      Revisor: 'hover:bg-purple-700',
      Usuario: 'hover:bg-gray-700',
      Trabajador: 'hover:bg-yellow-700',
    }

    const logoTextColor = role === 'Administrador' ? 'text-blue-800' : role === 'Revisor' ? 'text-purple-800' : 'text-gray-800';
    const activeLinkClasses = role === 'Administrador' ? 'bg-blue-900' : role === 'Revisor' ? 'bg-purple-900' : 'bg-gray-900';
    const inactiveLinkClasses = roleAccent[role as keyof typeof roleAccent];

    const baseLinkClasses = "flex items-center p-3 my-1 rounded-md transition-colors duration-200";
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-md">
            {isOpen ? <XMarkIcon className="h-6 w-6"/> : <Bars3Icon className="h-6 w-6"/>}
          </button>
            <aside className={`fixed md:relative inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-64 ${roleColors[role as keyof typeof roleColors]} flex flex-col z-20`}>
                <div className="p-4 border-b border-gray-700">
                    <Link to="/" className="flex items-center gap-3">
                        {platformLogo ? (
                            <img src={platformLogo} alt="Logo Plataforma" className="h-9 w-9 rounded-full object-contain bg-white p-1" />
                        ) : (
                            <div className={`h-9 w-9 bg-white rounded-full flex items-center justify-center font-bold text-lg ${logoTextColor}`}>
                                PdP
                            </div>
                        )}
                        <span className="text-white text-xl font-bold">Paradadeplanta.cl</span>
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">{role}</p>
                </div>
                <nav className="flex-1 p-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                            onClick={() => setIsOpen(false)}
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
                </nav>
                <div className="p-2 mt-auto border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`${baseLinkClasses} ${inactiveLinkClasses} w-full`}
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
            <div className={`fixed md:hidden inset-0 bg-black bg-opacity-50 z-10 ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
        </>
    );
};

export default Sidebar;
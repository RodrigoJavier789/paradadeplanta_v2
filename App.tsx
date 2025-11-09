import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from './pages/admin/AdminLayout';
import UsuarioLayout from './pages/usuario/UsuarioLayout';
import TrabajadorLayout from './pages/trabajador/TrabajadorLayout';
import RevisorLayout from './pages/revisor/RevisorLayout';
import { DataProvider, useData } from './context/DataContext';
import { BuildingOffice2Icon, UserGroupIcon, UserIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon, AtSymbolIcon, LockClosedIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { Rol } from './types';

const LandingPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Plataforma de Reclutamiento Industrial</h1>
                <p className="text-gray-600 mb-8">Seleccione su rol para iniciar sesión.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <RoleCard
                        to="/admin/login"
                        icon={<BuildingOffice2Icon className="h-12 w-12 mx-auto text-blue-600" />}
                        title="Administrador"
                        description="Gestión de proyectos y clientes."
                    />
                    <RoleCard
                        to="/revisor/login"
                        icon={<ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto text-purple-600" />}
                        title="Revisor"
                        description="Gestión y avance de candidatos."
                    />
                    <RoleCard
                        to="/usuario/login"
                        icon={<UserGroupIcon className="h-12 w-12 mx-auto text-green-600" />}
                        title="Usuario"
                        description="Visualización y aprobación de candidatos."
                    />
                    <RoleCard
                        to="/trabajador"
                        icon={<UserIcon className="h-12 w-12 mx-auto text-yellow-600" />}
                        title="Trabajador"
                        description="Registro y gestión de perfil."
                    />
                </div>
            </div>
        </div>
    );
};

const RoleCard: React.FC<{ to: string, icon: React.ReactNode, title: string, description: string }> = ({ to, icon, title, description }) => (
    <Link to={to} className="block p-6 bg-gray-100 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
    </Link>
);

const Login = ({ role, bgImageUrl }: { role: Rol, bgImageUrl: string }) => {
    const { login, platformLogo } = useData();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const getDashboardPath = (role: Rol) => {
        switch (role) {
            case Rol.Admin: return '/admin';
            case Rol.Revisor: return '/revisor';
            case Rol.Usuario: return '/usuario';
            default: return '/';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = login(email, password, role);
        if (user) {
            navigate(getDashboardPath(role));
        } else {
            setError('Correo electrónico o contraseña incorrectos.');
        }
    };

    const roleUI = {
        [Rol.Admin]: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-400', ring: 'focus:ring-blue-500', border: 'focus:border-blue-500', name: 'Administrador' },
        [Rol.Revisor]: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-400', ring: 'focus:ring-purple-500', border: 'focus:border-purple-500', name: 'Revisor' },
        [Rol.Usuario]: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-400', ring: 'focus:ring-green-500', border: 'focus:border-green-500', name: 'Usuario' },
        [Rol.Trabajador]: { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', text: 'text-yellow-400', ring: 'focus:ring-yellow-500', border: 'focus:border-yellow-500', name: 'Trabajador' },
    };
    const ui = roleUI[role];

    return (
        <div 
          className="relative min-h-screen bg-cover bg-center flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
          style={{ backgroundImage: `url('${bgImageUrl}')` }}
        >
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
            
            <div className="relative w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                <div className="text-center">
                     <Link to="/" className="inline-flex items-center justify-center gap-3 mb-6">
                         {platformLogo ? (
                            <img src={platformLogo} alt="Logo Plataforma" className="h-12 w-auto bg-white/20 p-1 rounded-lg" />
                        ) : (
                            <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-2xl text-white">
                                P
                            </div>
                        )}
                         <span className="text-3xl font-bold text-white">Paradadeplanta.cl</span>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-white">
                       Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-center text-md text-gray-300">
                       Bienvenido al portal de <span className={`font-medium ${ui.text}`}>{ui.name}</span>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="mail@mail.com"
                                className={`w-full p-2.5 pl-10 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm bg-black/30 text-white ${ui.ring} ${ui.border}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200">Contraseña</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className={`w-full p-2.5 pl-10 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm bg-black/30 text-white ${ui.ring} ${ui.border}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={`h-4 w-4 rounded border-gray-500 bg-transparent ${ui.text} ${ui.ring} focus:ring-offset-0`}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                                Recordar sesión
                            </label>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 text-center font-semibold">{error}</p>}
                    
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-md font-medium text-white ${ui.bg} ${ui.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${ui.ring}`}
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Iniciar Sesión
                    </button>
                </form>
                 <div className="mt-6 text-center">
                    <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white flex items-center justify-center gap-2">
                        <ArrowUturnLeftIcon className="h-4 w-4"/>
                        Volver a la selección de roles
                    </Link>
                </div>
            </div>
        </div>
    );
};


const ProtectedRoute = ({ children, role }: { children: React.ReactElement, role: Rol }) => {
    const { currentUser } = useData();
    const location = useLocation();

    const getLoginPath = (r: Rol) => {
        switch(r) {
            case Rol.Admin: return '/admin/login';
            case Rol.Revisor: return '/revisor/login';
            case Rol.Usuario: return '/usuario/login';
            default: return '/';
        }
    };

    if (!currentUser) {
        return <Navigate to={getLoginPath(role)} state={{ from: location }} replace />;
    }

    if (currentUser.role !== role) {
        // Logged in but wrong role, redirect to their correct dashboard
        const correctPath = getDashboardPath(currentUser.role);
        return <Navigate to={correctPath} replace />;
    }

    return children;
};

const getDashboardPath = (role: Rol) => {
    switch(role) {
        case Rol.Admin: return '/admin';
        case Rol.Revisor: return '/revisor';
        case Rol.Usuario: return '/usuario';
        default: return '/';
    }
};

const AppContent = () => {
    const LOGIN_IMAGES = {
        ADMIN: 'https://images.unsplash.com/photo-1579567761406-461487c3c188?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        REVISOR: 'https://images.unsplash.com/photo-1542104085-8e4d3448f4a2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        USUARIO: 'https://images.unsplash.com/photo-1516578499725-c26f0412a87a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    };

    return (
        <div>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                
                {/* Login Routes */}
                <Route path="/admin/login" element={<Login role={Rol.Admin} bgImageUrl={LOGIN_IMAGES.ADMIN} />} />
                <Route path="/revisor/login" element={<Login role={Rol.Revisor} bgImageUrl={LOGIN_IMAGES.REVISOR} />} />
                <Route path="/usuario/login" element={<Login role={Rol.Usuario} bgImageUrl={LOGIN_IMAGES.USUARIO} />} />

                {/* Protected Layout Routes */}
                <Route path="/admin/*" element={<ProtectedRoute role={Rol.Admin} children={<AdminLayout />} />} />
                <Route path="/revisor/*" element={<ProtectedRoute role={Rol.Revisor} children={<RevisorLayout />} />} />
                <Route path="/usuario/*" element={<ProtectedRoute role={Rol.Usuario} children={<UsuarioLayout />} />} />

                {/* Worker flow remains public for registration */}
                <Route path="/trabajador/*" element={<TrabajadorLayout />} />
            </Routes>
        </div>
    );
};

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </DataProvider>
    );
};

export default App;
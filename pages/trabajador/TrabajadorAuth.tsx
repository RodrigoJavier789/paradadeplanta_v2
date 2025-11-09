import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CheckBadgeIcon, ArrowRightIcon, ArrowUturnLeftIcon, UserPlusIcon, LockClosedIcon, AtSymbolIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1581092921462-215163e3d3aa?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const AuthHeader = () => (
    <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
             <Link to="/trabajador" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md">
                    PdP
                </div>
                <div>
                    <span className="text-white text-2xl font-bold">Paradadeplanta.cl</span>
                    <p className="text-sm text-gray-200 -mt-1">Portal del Trabajador</p>
                </div>
            </Link>
            <Link to="/" className="flex items-center text-sm font-medium bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2"/>
                <span>Salir</span>
            </Link>
        </nav>
    </header>
);

const LoginForm = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
    const [rememberMe, setRememberMe] = useState(false);
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Función de inicio de sesión no implementada. Por favor, proceda con el registro.");
    };

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold text-center mb-2">Acceso Trabajadores</h1>
            <p className="text-center text-gray-300 mb-8">Ingresa a tu cuenta para ver oportunidades.</p>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">RUT o Correo Electrónico</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <AtSymbolIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="email"
                            placeholder="mail@mail.com"
                            className="w-full p-2.5 pl-10 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm bg-black/30 text-white"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Contraseña</label>
                     <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-2.5 pl-10 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm bg-black/30 text-white"
                            required
                        />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me-trabajador"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-500 rounded bg-transparent"
                        />
                        <label htmlFor="remember-me-trabajador" className="ml-2 block text-sm text-gray-200">
                            Recordar sesión
                        </label>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold flex items-center justify-center text-base transition-colors shadow-lg"
                >
                    Iniciar Sesión
                </button>
            </form>
            <div className="text-center mt-6">
                <p className="text-sm text-gray-300">¿Aún no tienes una cuenta?</p>
                <button
                    onClick={onSwitchToRegister}
                    className="mt-2 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold flex items-center justify-center text-base transition-colors shadow-lg"
                >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Crear una cuenta
                </button>
            </div>
        </div>
    );
};

const TermsAndConditions: React.FC<{ onAccept: () => void; onBack: () => void; }> = ({ onAccept, onBack }) => (
    <div className="text-white">
        <h1 className="text-2xl font-bold text-center mb-4">Términos y Condiciones</h1>
        <div className="prose prose-sm max-w-none text-gray-300 h-64 overflow-y-auto border border-white/20 p-4 rounded-md bg-black/20 prose-strong:text-white prose-ul:text-gray-300">
            <p>Bienvenido a la Plataforma de Reclutamiento Industrial de Paradadeplanta.cl.</p>
            <p>Al continuar, usted declara ser mayor de edad y aceptar los siguientes términos y condiciones, en conformidad con la <strong>Ley N° 19.628 sobre Protección de la Vida Privada en Chile:</strong></p>
            <ul>
                <li><strong>Consentimiento Informado:</strong> Usted autoriza de manera voluntaria, explícita e informada a Paradadeplanta.cl para recolectar, almacenar y procesar sus datos personales y documentos confidenciales.</li>
                <li><strong>Finalidad del Tratamiento:</strong> La información proporcionada será utilizada exclusivamente para fines de reclutamiento y selección por parte de nuestra empresa y las empresas clientes.</li>
                <li><strong>Confidencialidad y Seguridad:</strong> Nos comprometemos a resguardar la confidencialidad de su información.</li>
                <li><strong>Derechos del Titular:</strong> Usted tiene derecho a solicitar el Acceso, Rectificación, Cancelación u Oposición al tratamiento de sus datos.</li>
                <li><strong>Veracidad de la Información:</strong> Usted declara que toda la información y documentación que subirá a la plataforma es verídica y actual.</li>
            </ul>
            <p>Al hacer clic en "Acepto y deseo Registrarme", usted confirma que ha leído, comprendido y aceptado íntegramente los presentes términos.</p>
        </div>
        <button
            onClick={onAccept}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold flex items-center justify-center text-base transition-colors shadow-lg"
        >
            <CheckBadgeIcon className="h-5 w-5 mr-2" />
            Acepto y deseo Registrarme
        </button>
        <button onClick={onBack} className="w-full mt-3 bg-white/20 text-white py-2.5 rounded-md hover:bg-white/30 font-semibold flex items-center justify-center text-sm transition-colors">
            <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
            Volver
        </button>
    </div>
);

const RegistrationForm: React.FC<{
    email: string; setEmail: (value: string) => void;
    password: string; setPassword: (value: string) => void;
    confirmPassword: string; setConfirmPassword: (value: string) => void;
    error: string; onSubmit: (e: React.FormEvent) => void; onBack: () => void;
}> = ({ email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, error, onSubmit, onBack }) => (
    <div className="text-white">
        <h1 className="text-2xl font-bold text-center mb-2">Crear Cuenta</h1>
        <p className="text-center text-gray-300 mb-6">Asegure su cuenta con un correo y contraseña.</p>
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Correo Electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan.perez@email.com" className="w-full p-2.5 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm bg-black/30 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Crear Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crea una contraseña segura" className="w-full p-2.5 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm bg-black/30 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Confirmar Contraseña</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita su contraseña" className="w-full p-2.5 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm bg-black/30 text-white" required />
            </div>
            {error && <p className="text-red-400 text-sm text-center font-semibold">{error}</p>}
            <button type="submit" className="w-full pt-4 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold flex items-center justify-center text-base transition-colors shadow-lg">
                Crear Cuenta y Continuar
                <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
             <button onClick={onBack} className="w-full mt-3 bg-white/20 text-white py-2.5 rounded-md hover:bg-white/30 font-semibold flex items-center justify-center text-sm transition-colors">
                <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
                Volver
            </button>
        </form>
    </div>
);

const TrabajadorAuth = () => {
    const navigate = useNavigate();
    const { createTrabajadorAccount } = useData();
    const [view, setView] = useState<'login' | 'terms' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
        
        const newTrabajadorId = createTrabajadorAccount(email, password);
        navigate(`/trabajador/registro/${newTrabajadorId}`);
    };
    
    const renderContent = () => {
        switch (view) {
            case 'terms':
                return <TermsAndConditions onAccept={() => setView('register')} onBack={() => setView('login')} />;
            case 'register':
                return (
                    <RegistrationForm
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        error={error} onSubmit={handleRegister}
                        onBack={() => setView('terms')}
                    />
                );
            case 'login':
            default:
                return <LoginForm onSwitchToRegister={() => setView('terms')} />;
        }
    };

    return (
        <div 
          className="relative min-h-screen bg-cover bg-center flex flex-col"
          style={{ backgroundImage: `url('${BG_IMAGE_URL}')` }}
        >
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
            <AuthHeader />
            <main className="relative flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                   {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TrabajadorAuth;

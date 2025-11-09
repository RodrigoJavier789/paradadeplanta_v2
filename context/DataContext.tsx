
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Trabajador, Cliente, Usuario, Proyecto, EstadoDocumental, EstadoCliente, ProximoEscenario, TrabajadorCredencial, Revisor, Admin, Rol, CurrentUser } from '../types';
import { initialTrabajadores, initialClientes, initialUsuarios, initialProyectos, initialTrabajadorCredenciales, initialRevisores, initialAdmins } from '../data';

interface DataContextType {
    // Data
    trabajadores: Trabajador[];
    setTrabajadores: React.Dispatch<React.SetStateAction<Trabajador[]>>;
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    usuarios: Usuario[];
    setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
    proyectos: Proyecto[];
    setProyectos: React.Dispatch<React.SetStateAction<Proyecto[]>>;
    trabajadorCredenciales: TrabajadorCredencial[];
    setTrabajadorCredenciales: React.Dispatch<React.SetStateAction<TrabajadorCredencial[]>>;
    revisores: Revisor[];
    admins: Admin[];
    platformLogo: string | null;
    setPlatformLogo: React.Dispatch<React.SetStateAction<string | null>>;

    // Auth
    currentUser: CurrentUser | null;
    login: (email: string, password: string, role: Rol) => CurrentUser | null;
    logout: () => void;
    
    // Workers
    updateTrabajador: (updatedTrabajador: Trabajador) => void;
    updateTrabajadoresStatus: (workerIds: string[], newStatus: ProximoEscenario, newAction: string) => void;
    assignTrabajadorToProject: (trabajadorId: string, proyectoId: string) => void;
    createTrabajadorAccount: (email: string, password: string) => string;
    updateTrabajadorCredencial: (credencial: TrabajadorCredencial) => void;
    deleteTrabajadorAccount: (trabajadorId: string) => void;
    addBulkTrabajadores: (newTrabajadores: Partial<Trabajador>[]) => void;
    distributeTrabajadoresToRevisores: (assignments: { trabajadorId: string; revisorId: string }[]) => void;
    
    // Projects
    getProyectoById: (id: string) => Proyecto | undefined;
    addProyecto: (proyecto: Omit<Proyecto, 'id'>) => void;
    updateProyecto: (updatedProyecto: Proyecto) => void;
    
    // Clients
    getClienteById: (id: string) => Cliente | undefined;
    addCliente: (cliente: Omit<Cliente, 'id' | 'usuarios' | 'proyectosActivos'>, usuarios: Omit<Usuario, 'id' | 'clienteId'>[]) => void;
    updateCliente: (updatedCliente: Cliente) => void;
    updateClienteAndUsuarios: (updatedCliente: Cliente) => void;
    
    // Revisores
    addRevisor: (revisorData: Omit<Revisor, 'id' | 'fechaCreacion' | 'userId'>) => void;
    updateRevisor: (updatedRevisor: Revisor) => void;
    deleteRevisor: (revisorId: string) => void;
    
    // Data Management
    backupApplicationData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    // --- State Persistence Logic ---
    const APP_STATE_KEY = 'plataformaReclutamientoState';

    const loadState = () => {
        try {
            const serializedState = localStorage.getItem(APP_STATE_KEY);
            if (serializedState === null) return null;

            const parsedState = JSON.parse(serializedState);
            
            // Re-hydrate dates because JSON.stringify converts them to strings
            if (parsedState.proyectos) {
                parsedState.proyectos.forEach((p: Proyecto) => {
                    p.fechaInicioReclutamiento = new Date(p.fechaInicioReclutamiento);
                    p.fechaTerminoReclutamiento = new Date(p.fechaTerminoReclutamiento);
                    p.fechaInicioTrabajo = new Date(p.fechaInicioTrabajo);
                });
            }
            if (parsedState.trabajadores) {
                parsedState.trabajadores.forEach((t: Trabajador) => {
                    t.fechaRegistro = new Date(t.fechaRegistro);
                    if (t.fechaNacimiento) t.fechaNacimiento = new Date(t.fechaNacimiento);
                });
            }
            if (parsedState.revisores) {
                parsedState.revisores.forEach((r: Revisor) => {
                    r.fechaCreacion = new Date(r.fechaCreacion);
                });
            }
            return parsedState;
        } catch (error) {
            console.error("Error loading state from localStorage:", error);
            return null;
        }
    };

    const savedState = loadState();

    // Data States with lazy initialization from localStorage or initial data
    const [trabajadores, setTrabajadores] = useState<Trabajador[]>(savedState?.trabajadores || initialTrabajadores);
    const [clientes, setClientes] = useState<Cliente[]>(savedState?.clientes || initialClientes);
    const [usuarios, setUsuarios] = useState<Usuario[]>(savedState?.usuarios || initialUsuarios);
    const [proyectos, setProyectos] = useState<Proyecto[]>(savedState?.proyectos || initialProyectos);
    const [trabajadorCredenciales, setTrabajadorCredenciales] = useState<TrabajadorCredencial[]>(savedState?.trabajadorCredenciales || initialTrabajadorCredenciales);
    const [revisores, setRevisores] = useState<Revisor[]>(savedState?.revisores || initialRevisores);
    const [admins, setAdmins] = useState<Admin[]>(savedState?.admins || initialAdmins);
    const [platformLogo, setPlatformLogo] = useState<string | null>(savedState?.platformLogo || null);
    
    // Auth State (session-based, not persisted)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    
    // useEffect to save state whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                trabajadores, clientes, usuarios, proyectos,
                trabajadorCredenciales, revisores, admins, platformLogo
            };
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(APP_STATE_KEY, serializedState);
        } catch (error) {
            console.error("Error saving state to localStorage:", error);
        }
    }, [trabajadores, clientes, usuarios, proyectos, trabajadorCredenciales, revisores, admins, platformLogo]);

    // Auth Functions
    const login = (email: string, password: string, role: Rol): CurrentUser | null => {
        let foundUser: any = null;
        switch (role) {
            case Rol.Admin:
                foundUser = admins.find(u => u.email === email && u.password === password);
                break;
            case Rol.Revisor:
                foundUser = revisores.find(u => u.email === email && u.password === password);
                break;
            case Rol.Usuario:
                foundUser = usuarios.find(u => u.email === email && u.password === password);
                break;
            default:
                return null;
        }

        if (foundUser) {
            const userWithRole = { ...foundUser, role };
            setCurrentUser(userWithRole);
            return userWithRole;
        }
        
        return null;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    // Data Management
    const backupApplicationData = () => {
        try {
            const stateToSave = {
                trabajadores, clientes, usuarios, proyectos,
                trabajadorCredenciales, revisores, admins, platformLogo
            };
            const serializedState = JSON.stringify(stateToSave, null, 2); // Pretty-print for readability
            const blob = new Blob([serializedState], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            a.href = url;
            a.download = `respaldo_plataforma_reclutamiento_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error backing up application data:", error);
            alert("Ocurrió un error al intentar generar el respaldo.");
        }
    };

    const updateTrabajador = (updatedTrabajador: Trabajador) => {
        setTrabajadores(prev => prev.map(t => t.id === updatedTrabajador.id ? updatedTrabajador : t));
    };
    
    const updateTrabajadoresStatus = (workerIds: string[], newStatus: ProximoEscenario, newAction: string) => {
        const workerIdSet = new Set(workerIds);
        setTrabajadores(prev => 
            prev.map(t => 
                workerIdSet.has(t.id) 
                ? { ...t, proximoEscenario: newStatus, ultimaAccion: newAction } 
                : t
            )
        );
    };

    const getClienteById = (id: string) => clientes.find(c => c.id === id);
    const getProyectoById = (id: string) => proyectos.find(p => p.id === id);
    
    const addProyecto = (proyectoData: Omit<Proyecto, 'id'>) => {
        const newProyecto: Proyecto = { ...proyectoData, id: `pro-${Date.now()}` };
        setProyectos(prev => [...prev, newProyecto]);
        setClientes(prev => prev.map(c => c.id === newProyecto.clienteId ? { ...c, proyectosActivos: [...c.proyectosActivos, newProyecto.id] } : c));
    };

    const updateProyecto = (updatedProyecto: Proyecto) => {
        setProyectos(prev => prev.map(p => p.id === updatedProyecto.id ? updatedProyecto : p));
    };

    const addCliente = (clienteData: Omit<Cliente, 'id' | 'usuarios' | 'proyectosActivos'>, usuariosData: Omit<Usuario, 'id' | 'clienteId'>[]) => {
        const newClienteId = `cli-${Date.now()}`;
        const newUsuarios: Usuario[] = usuariosData.map((u, i) => ({ 
            ...u, 
            id: `user-${Date.now()}-${i}`, 
            clienteId: newClienteId,
        } as Usuario));
        const newCliente: Cliente = { ...clienteData, id: newClienteId, usuarios: newUsuarios, proyectosActivos: [] };
        
        setClientes(prev => [...prev, newCliente]);
        setUsuarios(prev => [...prev, ...newUsuarios]);
    };

    const updateCliente = (updatedCliente: Cliente) => {
        setClientes(prev => prev.map(c => c.id === updatedCliente.id ? updatedCliente : c));
    };
    
    const updateClienteAndUsuarios = (updatedCliente: Cliente) => {
        setClientes(prev => prev.map(c => c.id === updatedCliente.id ? updatedCliente : c));
        setUsuarios(prev => {
            const otherUsers = prev.filter(u => u.clienteId !== updatedCliente.id);
            return [...otherUsers, ...updatedCliente.usuarios];
        });
    };
    
    const assignTrabajadorToProject = (trabajadorId: string, proyectoId: string) => {
        setTrabajadores(prev => prev.map(t => 
            t.id === trabajadorId 
            ? { 
                ...t, 
                proyectoAsignado: proyectoId, 
                disponible: false, 
                estadoCliente: EstadoCliente.Pendiente, 
                proximoEscenario: ProximoEscenario.Ingreso,
                ultimaAccion: undefined
              } 
            : t
        ));
    };

    const createTrabajadorAccount = (email: string, password: string): string => {
        const newId = `trab-${Date.now()}`;
        
        const newCredential: TrabajadorCredencial = { id: newId, email, password };
        setTrabajadorCredenciales(prev => [...prev, newCredential]);

        const newTrabajador: Trabajador = {
            id: newId,
            numero: trabajadores.length + 1,
            nombre: email, // Placeholder name
            especialidad: '',
            edad: 0,
            rut: '',
            ciudad: '',
            nacionalidad: '',
            estadoDocumental: EstadoDocumental.EnRevision,
            fechaRegistro: new Date(),
        };
        setTrabajadores(prev => [...prev, newTrabajador]);

        return newId;
    };

    const updateTrabajadorCredencial = (updatedCredencial: TrabajadorCredencial) => {
        setTrabajadorCredenciales(prev => prev.map(c => c.id === updatedCredencial.id ? updatedCredencial : c));
    };

    const deleteTrabajadorAccount = (trabajadorId: string) => {
        setTrabajadores(prev => prev.filter(t => t.id !== trabajadorId));
        setTrabajadorCredenciales(prev => prev.filter(c => c.id !== trabajadorId));
    };

    const addRevisor = (revisorData: Omit<Revisor, 'id' | 'fechaCreacion' | 'userId'>) => {
        const timestamp = Date.now();
        const newRevisor: Revisor = {
            ...revisorData,
            id: `rev-${timestamp}`,
            userId: `user-rev-${timestamp}`,
            fechaCreacion: new Date(),
            proyectosAsignados: [],
        };
        setRevisores(prev => [...prev, newRevisor]);
    };

    const updateRevisor = (updatedRevisor: Revisor) => {
        setRevisores(prev => prev.map(r => r.id === updatedRevisor.id ? updatedRevisor : r));
    };

    const deleteRevisor = (revisorId: string) => {
        setTrabajadores(prev => prev.map(t => {
            if (t.revisorAsignadoId === revisorId) {
                return { ...t, revisorAsignadoId: undefined };
            }
            return t;
        }));
        setRevisores(prev => prev.filter(r => r.id !== revisorId));
    };

    const addBulkTrabajadores = (newTrabajadoresData: Partial<Trabajador>[]) => {
        const timestamp = Date.now();
        const maxNumero = Math.max(0, ...trabajadores.map(t => t.numero));

        const fullNewTrabajadores: Trabajador[] = newTrabajadoresData.map((t, index) => {
            const birthDate = t.fechaNacimiento ? new Date(t.fechaNacimiento) : new Date();
            const ageDate = t.fechaNacimiento ? new Date(Date.now() - birthDate.getTime()) : null;
            const age = ageDate ? Math.abs(ageDate.getUTCFullYear() - 1970) : 0;
            
            return {
                id: `trab-imp-${timestamp}-${index}`,
                numero: maxNumero + index + 1,
                nombre: t.nombre || 'N/A',
                especialidad: t.especialidad || 'N/A',
                edad: age,
                rut: t.rut || 'N/A',
                ciudad: t.ciudad || 'N/A',
                nacionalidad: t.nacionalidad || 'N/A',
                telefono: t.telefono || 'N/A',
                fechaNacimiento: t.fechaNacimiento,
                estadoDocumental: EstadoDocumental.EnRevision,
                fechaRegistro: new Date(),
                documentos: t.documentos || {},
                esPrueba: false,
            } as Trabajador;
        });

        setTrabajadores(prev => [...prev, ...fullNewTrabajadores]);
    };

    const distributeTrabajadoresToRevisores = (assignments: { trabajadorId: string, revisorId: string }[]) => {
        const assignmentsMap = new Map(assignments.map(a => [a.trabajadorId, a.revisorId]));
        
        setTrabajadores(prev => 
            prev.map(trabajador => 
                assignmentsMap.has(trabajador.id)
                    ? { ...trabajador, revisorAsignadoId: assignmentsMap.get(trabajador.id) }
                    : trabajador
            )
        );
    };

    return (
        <DataContext.Provider value={{ 
            trabajadores, setTrabajadores, 
            clientes, setClientes, 
            usuarios, setUsuarios, 
            proyectos, setProyectos, 
            trabajadorCredenciales, setTrabajadorCredenciales,
            revisores,
            admins,
            platformLogo, setPlatformLogo,
            currentUser, login, logout,
            updateTrabajador, 
            updateTrabajadoresStatus,
            assignTrabajadorToProject,
            createTrabajadorAccount, updateTrabajadorCredencial, deleteTrabajadorAccount,
            addBulkTrabajadores,
            distributeTrabajadoresToRevisores,
            getClienteById, getProyectoById, 
            addProyecto, updateProyecto, 
            addCliente, updateCliente, updateClienteAndUsuarios,
            addRevisor, updateRevisor, deleteRevisor,
            backupApplicationData,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
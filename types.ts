export enum Rol {
    Admin = 'Administrador',
    Revisor = 'Revisor',
    Usuario = 'Usuario',
    Trabajador = 'Trabajador',
}

export enum EstadoDocumental {
    EnRevision = 'En revisión documental',
    Validado = 'Validado',
    Asignado = 'Asignado a proyecto',
    RechazadoDocumental = 'Rechazado Documental',
}

export enum EstadoCliente {
    Aprobado = 'Aprobado por el cliente',
    Rechazado = 'Rechazado por el cliente',
    Pendiente = 'Pendiente de acción'
}

export enum ProximoEscenario {
    Ingreso = 'Ingresos validados',
    Entrevista = 'En entrevista',
    Evaluacion = 'En evaluación',
    AprobadoParaContratar = 'Aprobado para Contratar',
    CarpetaSolicitada = 'Carpeta Solicitada',
    Acreditacion = 'A acreditar',
    Contratado = 'Contratado',
}

export enum CategoriaTrabajador {
    Tecnico = 'Técnico',
    TecnicoCalificado = 'Técnico Calificado',
    Profesional = 'Profesional',
}

export interface TurnoAsignado {
    nombre: string;
    horario: string;
    cantidad: number;
}

export interface Puesto {
    tipo: string;
    categoria: CategoriaTrabajador;
    cantidad: number;
    sueldo: number;
    turnos: TurnoAsignado[];
}

export interface Proyecto {
    id: string;
    nombre: string;
    clienteId: string;
    cantidadTrabajadores: number;
    puestos: Puesto[];
    ciudad: string;
    fechaInicioReclutamiento: Date;
    fechaTerminoReclutamiento: Date;
    fechaInicioTrabajo: Date;
    usuariosAsignados: string[];
    beneficios?: string;
    estado: 'borrador' | 'publicado';
}

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    password?: string;
    telefono: string;
    cargo: string;
    horarioContacto: string;
    clienteId: string;
}

export interface Cliente {
    id: string;
    nombre: string;
    usuarios: Usuario[];
    proyectosActivos: string[]; // array of project ids
    logoUrl?: string;
    contactoPrincipal?: string;
    telefonoPrincipal?: string;
    emailPrincipal?: string;
    direccion?: string;
    planContratado?: 'Por Proyecto' | 'Mensual' | 'Personalizado';
}

export interface Trabajador {
    id: string;
    numero: number;
    nombre: string;
    especialidad: string;
    edad: number;
    rut: string;
    ciudad: string;
    nacionalidad: string;
    telefono?: string;
    fechaNacimiento?: Date;
    estadoDocumental: EstadoDocumental;
    fechaRegistro: Date;
    proyectoAsignado?: string; // project id
    ultimoProyectoAsignado?: string; // project id
    disponible?: boolean;
    ultimaAccion?: string;
    estadoCliente?: EstadoCliente;
    proximoEscenario?: ProximoEscenario;
    motivoRechazo?: string;
    motivoRechazoDocumental?: string;
    revisorAsignadoId?: string;
    documentos?: {
        [key: string]: string; // key: tipo de documento (cv, cedula), value: base64 string
    };
    esPrueba?: boolean;
}

export interface TrabajadorCredencial {
    id: string; // Should match Trabajador ID
    email: string;
    password: string;
}

export interface Revisor {
    id: string; // Legacy ID, used for assignment logic
    userId: string; // Generic user ID for messaging, etc.
    nombre: string;
    email: string;
    password: string;
    fechaCreacion: Date;
    proyectosAsignados?: string[];
}

export interface Admin {
    id: string;
    nombre: string;
    email: string;
    password: string;
}

export type CurrentUser = (Usuario & { role: Rol.Usuario }) | (Revisor & { role: Rol.Revisor }) | (Admin & { role: Rol.Admin });

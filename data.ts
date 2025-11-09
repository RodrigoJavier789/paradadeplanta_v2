import { Trabajador, Cliente, Usuario, Proyecto, EstadoDocumental, EstadoCliente, ProximoEscenario, CategoriaTrabajador, TrabajadorCredencial, Revisor, Admin } from './types';

function createDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
}

export const initialAdmins: Admin[] = [
    { id: 'admin-1', nombre: 'Admin General', email: 'mail@mail.com', password: '1234' },
];

export const initialClientes: Cliente[] = [
    { 
        id: 'cli-1', 
        nombre: 'Constructora XYZ', 
        usuarios: [], 
        proyectosActivos: ['pro-1'],
        contactoPrincipal: 'Juan Pérez',
        telefonoPrincipal: '+56987654321',
        emailPrincipal: 'mail@mail.com',
        direccion: 'Av. Principal 123, Antofagasta', 
        planContratado: 'Por Proyecto'
    },
];

export const initialUsuarios: Usuario[] = [
    { id: 'user-1', nombre: 'Juan Pérez', email: 'mail@mail.com', password: '1234', telefono: '+56987654321', cargo: 'Jefe de RRHH', horarioContacto: 'L-V 9-17h', clienteId: 'cli-1' },
];
initialClientes[0].usuarios.push(initialUsuarios[0]);

export const initialProyectos: Proyecto[] = [
    { 
        id: 'pro-1', 
        nombre: 'Ampliación Planta Norte', 
        clienteId: 'cli-1', 
        cantidadTrabajadores: 500, 
        puestos: [
            { tipo: 'Soldador', categoria: CategoriaTrabajador.TecnicoCalificado, cantidad: 250, sueldo: 850000, turnos: [{nombre: 'Turno A', horario: '08:00 - 17:00', cantidad: 250}] },
            { tipo: 'Eléctrico Industrial', categoria: CategoriaTrabajador.Tecnico, cantidad: 250, sueldo: 950000, turnos: [{nombre: 'Turno B', horario: '17:00 - 02:00', cantidad: 250}] }
        ],
        ciudad: 'Antofagasta',
        fechaInicioReclutamiento: createDate(2024, 7, 1),
        fechaTerminoReclutamiento: createDate(2024, 8, 31),
        fechaInicioTrabajo: createDate(2024, 9, 1),
        usuariosAsignados: ['user-1'],
        beneficios: 'Seguro complementario de salud, bono de movilización.',
        estado: 'publicado'
    },
];

export const initialRevisores: Revisor[] = [
    { id: 'rev-1', userId: 'user-rev-1', nombre: 'Elena Castillo', email: 'mail@mail.com', password: '1234', fechaCreacion: createDate(2024, 7, 20), proyectosAsignados: [] },
    { id: 'rev-2', userId: 'user-rev-2', nombre: 'Marco Díaz', email: 'marco.d@paradadeplanta.cl', password: '1234', fechaCreacion: createDate(2024, 7, 21), proyectosAsignados: [] },
];


const initialHardcodedTrabajadores: Trabajador[] = [
    { id: 'trab-1', numero: 1, nombre: 'Carlos Soto', especialidad: 'Soldador', edad: 35, rut: '15.123.456-7', ciudad: 'Antofagasta', nacionalidad: 'Chilena', telefono: '+56911111111', fechaNacimiento: createDate(1989, 1, 1), estadoDocumental: EstadoDocumental.EnRevision, fechaRegistro: createDate(2024, 7, 22), revisorAsignadoId: 'rev-1' },
    { id: 'trab-2', numero: 2, nombre: 'Luis Morales', especialidad: 'Eléctrico Industrial', edad: 42, rut: '13.987.654-K', ciudad: 'Calama', nacionalidad: 'Chilena', telefono: '+56922222222', fechaNacimiento: createDate(1982, 2, 2), estadoDocumental: EstadoDocumental.Validado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Pendiente, proximoEscenario: ProximoEscenario.Ingreso, fechaRegistro: createDate(2024, 7, 23) },
    { id: 'trab-3', numero: 3, nombre: 'Pedro Pascal', especialidad: 'Operador de Maquinaria', edad: 28, rut: '18.456.789-1', ciudad: 'Santiago', nacionalidad: 'Chilena', telefono: '+56933333333', fechaNacimiento: createDate(1996, 3, 3), estadoDocumental: EstadoDocumental.Asignado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Aprobado, proximoEscenario: ProximoEscenario.Contratado, fechaRegistro: createDate(2024, 7, 15) },
    { id: 'trab-4', numero: 4, nombre: 'Maria Rojas', especialidad: 'Soldador', edad: 31, rut: '17.111.222-3', ciudad: 'Copiapó', nacionalidad: 'Peruana', telefono: '+56944444444', fechaNacimiento: createDate(1993, 4, 4), estadoDocumental: EstadoDocumental.Validado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Aprobado, proximoEscenario: ProximoEscenario.Evaluacion, fechaRegistro: createDate(2024, 7, 16) },
    { id: 'trab-5', numero: 5, nombre: 'Jose Fernandez', especialidad: 'Mecánico de Mantenimiento', edad: 51, rut: '10.333.444-5', ciudad: 'Iquique', nacionalidad: 'Boliviana', telefono: '+56955555555', fechaNacimiento: createDate(1973, 5, 5), estadoDocumental: EstadoDocumental.Validado, estadoCliente: EstadoCliente.Rechazado, motivoRechazo: 'Rechazado por entrevista', disponible: true, proyectoAsignado: undefined, ultimoProyectoAsignado: 'pro-1', fechaRegistro: createDate(2024, 7, 17) },
    { id: 'trab-6', numero: 6, nombre: 'Ana Torres', especialidad: 'Supervisor de Obra', edad: 39, rut: '14.555.666-7', ciudad: 'Concepción', nacionalidad: 'Chilena', telefono: '+56966666666', fechaNacimiento: createDate(1985, 6, 6), estadoDocumental: EstadoDocumental.EnRevision, fechaRegistro: createDate(2024, 7, 8), revisorAsignadoId: 'rev-2' },
    { id: 'trab-7', numero: 7, nombre: 'Diego Rivera', especialidad: 'Operador de Maquinaria', edad: 25, rut: '19.888.999-0', ciudad: 'Antofagasta', nacionalidad: 'Venezolana', telefono: '+56977777777', fechaNacimiento: createDate(1999, 7, 7), estadoDocumental: EstadoDocumental.Asignado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Aprobado, proximoEscenario: ProximoEscenario.AprobadoParaContratar, fechaRegistro: createDate(2024, 7, 9) },
    { id: 'trab-8', numero: 8, nombre: 'Sofia Castro', especialidad: 'Eléctrico Industrial', edad: 33, rut: '16.222.333-4', ciudad: 'Santiago', nacionalidad: 'Colombiana', telefono: '+56988888888', fechaNacimiento: createDate(1991, 8, 8), estadoDocumental: EstadoDocumental.Validado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Pendiente, proximoEscenario: ProximoEscenario.Ingreso, fechaRegistro: createDate(2024, 7, 1) },
    { id: 'trab-9', numero: 9, nombre: 'Roberto Carlos', especialidad: 'Soldador', edad: 45, rut: '12.444.555-6', ciudad: 'Calama', nacionalidad: 'Chilena', telefono: '+56999999999', fechaNacimiento: createDate(1979, 9, 9), estadoDocumental: EstadoDocumental.Validado, disponible: true, fechaRegistro: createDate(2024, 7, 2) },
    { id: 'trab-10', numero: 10, nombre: 'Laura Pausini', especialidad: 'Operador de Maquinaria', edad: 30, rut: '17.777.888-9', ciudad: 'Calama', nacionalidad: 'Chilena', telefono: '+56910101010', fechaNacimiento: createDate(1994, 10, 10), estadoDocumental: EstadoDocumental.Asignado, proyectoAsignado: 'pro-1', estadoCliente: EstadoCliente.Pendiente, proximoEscenario: ProximoEscenario.Ingreso, fechaRegistro: createDate(2024, 7, 3) },
].slice(0, 10);

export const initialTrabajadores: Trabajador[] = [...initialHardcodedTrabajadores];

const initialHardcodedCredenciales: TrabajadorCredencial[] = initialHardcodedTrabajadores.map(t => ({
    id: t.id,
    email: `${t.nombre.split(' ')[0].toLowerCase()}.${t.nombre.split(' ')[1].toLowerCase()}@email.com`,
    password: '1234'
}));

export const initialTrabajadorCredenciales: TrabajadorCredencial[] = [...initialHardcodedCredenciales];
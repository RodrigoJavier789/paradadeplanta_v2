import { CategoriaTrabajador } from "./types";

export const ESPECIALIDADES = [
    // Supervisión y Planificación
    'Supervisor General',
    'Supervisor Mecánico',
    'Supervisor Eléctrico',
    'Supervisor de Instrumentación',
    'Jefe de Terreno',
    'Planificador de Parada',
    'Prevencionista de Riesgos (HSE)',
    
    // Oficios Mecánicos
    'Mecánico de Mantenimiento',
    'Mecánico Montajista',
    'Ajustador Mecánico',
    'Soldador Calificado (6G, TIG, MIG)',
    'Calderero',
    'Tubero / Piping',
    
    // Oficios Eléctricos e Instrumentación
    'Eléctrico Industrial',
    'Eléctrico de Mantenimiento',
    'Instrumentista',

    // Operadores y Maniobras
    'Operador de Grúa',
    'Operador de Maquinaria Pesada',
    'Rigger / Maniobrista',

    // Apoyo y Varios
    'Andamiero',
    'Obras Civiles',
    'Bodeguero / Pañolero',
    'Ayudante / Jornal',
    'Otro'
];

export const CATEGORIAS_TRABAJADOR: CategoriaTrabajador[] = [
    CategoriaTrabajador.Tecnico,
    CategoriaTrabajador.TecnicoCalificado,
    CategoriaTrabajador.Profesional
];

export const CIUDADES = ['Antofagasta', 'Calama', 'Santiago', 'Copiapó', 'Iquique', 'Concepción'];
export const NACIONALIDADES = ['Chilena', 'Peruana', 'Boliviana', 'Venezolana', 'Colombiana', 'Otra'];

export const CHART_COLORS = ['#FFC107', '#007BFF', '#DC3545', '#28A745']; // Amarillo, Azul, Rojo, Verde
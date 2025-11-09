
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Proyecto, Puesto, CategoriaTrabajador, TurnoAsignado, Cliente } from '../../types';
import { PlusCircleIcon, TrashIcon, PencilIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { ESPECIALIDADES, CATEGORIAS_TRABAJADOR } from '../../constants';
import { differenceInDays, format, isValid, parseISO, isBefore } from 'date-fns';


interface ProjectCardProps {
    proyecto: Proyecto;
    onEdit: () => void;
    getClienteById: (id: string) => Cliente | undefined;
}

interface ProjectFormProps {
    proyectoToEdit: Proyecto | null;
    onClose: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ proyecto, onEdit, getClienteById }) => {
    const cliente = getClienteById(proyecto.clienteId);
    return (
        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between">
                     <h2 className="text-xl font-bold">{proyecto.nombre}</h2>
                     {cliente?.logoUrl ? (
                        <img src={cliente.logoUrl} alt={`Logo ${cliente.nombre}`} className="h-8 max-w-[80px] object-contain"/>
                     ) : (
                        <BuildingStorefrontIcon className="h-8 w-8 text-gray-300"/>
                     )}
                </div>
                <p className="text-sm font-medium text-gray-700">{cliente?.nombre}</p>
                <p className="text-sm text-gray-500">{proyecto.ciudad}</p>
                <p><strong>Inicio Trabajo:</strong> {format(proyecto.fechaInicioTrabajo, 'dd/MM/yyyy')}</p>
                <p><strong>Reclutamiento:</strong> {format(proyecto.fechaInicioReclutamiento, 'dd/MM/yyyy')} - {format(proyecto.fechaTerminoReclutamiento, 'dd/MM/yyyy')}</p>
                <p><strong>Trabajadores requeridos:</strong> {proyecto.cantidadTrabajadores}</p>
                {proyecto.beneficios && <p className="text-sm pt-2 mt-2 border-t"><strong>Beneficios:</strong> {proyecto.beneficios}</p>}
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                </button>
            </div>
        </div>
    );
}

const ProjectForm = ({ proyectoToEdit, onClose }: ProjectFormProps) => {
    const { clientes, addProyecto, updateProyecto } = useData();
    const [nombre, setNombre] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [newPuesto, setNewPuesto] = useState<Omit<Puesto, 'turnos'>>({
        tipo: '',
        categoria: CategoriaTrabajador.Tecnico,
        cantidad: 1,
        sueldo: 0,
    });
    const [beneficios, setBeneficios] = useState('');
    const [fechaInicioReclutamiento, setFechaInicioReclutamiento] = useState('');
    const [fechaTerminoReclutamiento, setFechaTerminoReclutamiento] = useState('');
    const [fechaInicioTrabajo, setFechaInicioTrabajo] = useState('');
    const [duracionProceso, setDuracionProceso] = useState(0);

    const turnosIndustria = {
        '7x7 Día': '07:00 - 19:00',
        '7x7 Noche': '19:00 - 07:00',
        '4x4 Día': '08:00 - 20:00',
        '4x4 Noche': '20:00 - 08:00',
        '5x2 L-V': 'L-V 08:00 - 17:00',
        '10x10': '10 días de trabajo, 10 de descanso',
        '14x14': '14 días de trabajo, 14 de descanso',
        'Administrativo': 'L-J 08-18, V 08-14',
        'Otro': '',
    };

    useEffect(() => {
        if (proyectoToEdit) {
            setNombre(proyectoToEdit.nombre);
            setClienteId(proyectoToEdit.clienteId);
            setCiudad(proyectoToEdit.ciudad);
            setPuestos(proyectoToEdit.puestos);
            setBeneficios(proyectoToEdit.beneficios || '');
            setFechaInicioReclutamiento(format(proyectoToEdit.fechaInicioReclutamiento, 'yyyy-MM-dd'));
            setFechaTerminoReclutamiento(format(proyectoToEdit.fechaTerminoReclutamiento, 'yyyy-MM-dd'));
            setFechaInicioTrabajo(format(proyectoToEdit.fechaInicioTrabajo, 'yyyy-MM-dd'));
        } else {
            setNombre('');
            setClienteId('');
            setCiudad('');
            setPuestos([]);
            setNewPuesto({ tipo: '', categoria: CategoriaTrabajador.Tecnico, cantidad: 1, sueldo: 0 });
            setBeneficios('');
            setFechaInicioReclutamiento('');
            setFechaTerminoReclutamiento('');
            setFechaInicioTrabajo('');
        }
    }, [proyectoToEdit]);


    useEffect(() => {
        if (fechaInicioReclutamiento && fechaTerminoReclutamiento) {
            const start = parseISO(fechaInicioReclutamiento);
            const end = parseISO(fechaTerminoReclutamiento);
            if (isValid(start) && isValid(end) && isBefore(start, end)) {
                setDuracionProceso(differenceInDays(end, start) + 1);
            } else {
                setDuracionProceso(0);
            }
        } else {
            setDuracionProceso(0);
        }
    }, [fechaInicioReclutamiento, fechaTerminoReclutamiento]);
    
    const handleNewPuestoChange = (field: keyof Omit<Puesto, 'turnos'>, value: string | number | CategoriaTrabajador) => {
        if (field === 'cantidad' && Number(value) < 1) {
            value = 1;
        }
        setNewPuesto(prev => ({ ...prev, [field]: value }));
    };

    const handleAddPuesto = () => {
        if (!newPuesto.tipo) {
            alert('Por favor, seleccione un "Nombre del Cargo".');
            return;
        }
        if (newPuesto.cantidad < 1) {
            alert('La cantidad debe ser al menos 1.');
            return;
        }
        setPuestos([...puestos, { ...newPuesto, turnos: [] }]);
        setNewPuesto({ tipo: '', categoria: CategoriaTrabajador.Tecnico, cantidad: 1, sueldo: 0 });
    };

    const removePuesto = (index: number) => setPuestos(puestos.filter((_, i) => i !== index));

    const handleTurnoChange = (puestoIndex: number, turnoIndex: number, field: keyof TurnoAsignado, value: string | number) => {
        const newPuestos = [...puestos];
        const turno = newPuestos[puestoIndex].turnos[turnoIndex];
        
        let processedValue = value;
        if (field === 'cantidad') {
            processedValue = Math.max(1, Number(value) || 1);
        }
        
        newPuestos[puestoIndex].turnos[turnoIndex] = { ...turno, [field]: processedValue };

        if (field === 'nombre' && value in turnosIndustria) {
            newPuestos[puestoIndex].turnos[turnoIndex].horario = turnosIndustria[value as keyof typeof turnosIndustria];
        }
        
        setPuestos(newPuestos);
    };

    const addTurno = (puestoIndex: number) => {
        const newPuestos = [...puestos];
        if (!newPuestos[puestoIndex].turnos) {
            newPuestos[puestoIndex].turnos = [];
        }
        newPuestos[puestoIndex].turnos.push({ nombre: '', horario: '', cantidad: 1 });
        setPuestos(newPuestos);
    };
    const removeTurno = (puestoIndex: number, turnoIndex: number) => {
        const newPuestos = [...puestos];
        newPuestos[puestoIndex].turnos.splice(turnoIndex, 1);
        setPuestos(newPuestos);
    };

    const handleFormSubmit = (estado: 'borrador' | 'publicado') => {
        if (!clienteId) {
            alert('Debe seleccionar un cliente.');
            return;
        }
        
        // La validación de turnos solo se aplica al publicar, no al guardar como borrador.
        if (estado === 'publicado') {
            for (const puesto of puestos) {
                const totalAsignadoEnTurnos = puesto.turnos.reduce((sum, turno) => sum + turno.cantidad, 0);
                if (totalAsignadoEnTurnos !== puesto.cantidad) {
                    alert(`Para el cargo "${puesto.tipo}", la cantidad de trabajadores asignados a turnos (${totalAsignadoEnTurnos}) no coincide con el total requerido (${puesto.cantidad}). Por favor, ajuste las cantidades.`);
                    return;
                }
            }
        }

        const inicioReclutamientoDate = parseISO(fechaInicioReclutamiento);
        const terminoReclutamientoDate = parseISO(fechaTerminoReclutamiento);
        const inicioTrabajoDate = parseISO(fechaInicioTrabajo);

        if (!isValid(inicioReclutamientoDate) || !isValid(terminoReclutamientoDate) || !isValid(inicioTrabajoDate) || !isBefore(inicioReclutamientoDate, terminoReclutamientoDate) || !isBefore(terminoReclutamientoDate, inicioTrabajoDate)) {
            alert('Las fechas deben ser válidas y seguir el orden cronológico: Inicio Proceso < Término Proceso < Inicio Operación.');
            return;
        }
                
        const proyectoPayload = {
            nombre, clienteId, ciudad, cantidadTrabajadores: puestos.reduce((sum, p) => sum + p.cantidad, 0), 
            puestos, beneficios,
            fechaInicioReclutamiento: inicioReclutamientoDate,
            fechaTerminoReclutamiento: terminoReclutamientoDate,
            fechaInicioTrabajo: inicioTrabajoDate,
            usuariosAsignados: proyectoToEdit?.usuariosAsignados || [],
            estado: estado
        };

        if (proyectoToEdit) {
            updateProyecto({ ...proyectoPayload, id: proyectoToEdit.id });
        } else {
            addProyecto(proyectoPayload);
        }
        onClose();
    };

    const totalTrabajadores = puestos.reduce((sum, p) => sum + p.cantidad, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">{proyectoToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Información Clave del Proyecto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <input type="text" placeholder="Nombre del Proyecto" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                            <select value={clienteId} onChange={e => setClienteId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Seleccionar Cliente</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            <input type="text" placeholder="Ciudad o Comuna" value={ciudad} onChange={e => setCiudad(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Fechas del Proyecto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fecha Inicio del Proceso</label>
                                <input type="date" value={fechaInicioReclutamiento} onChange={e => setFechaInicioReclutamiento(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fecha Término del Proceso</label>
                                <input type="date" value={fechaTerminoReclutamiento} onChange={e => setFechaTerminoReclutamiento(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div className="p-2 bg-gray-700 text-white rounded text-center font-semibold flex items-center justify-center h-10">Duración: <strong>{duracionProceso} días</strong></div>
                             <div>
                                <label className="text-sm font-medium text-gray-700">Fecha Inicio de la Operación</label>
                                <input type="date" value={fechaInicioTrabajo} onChange={e => setFechaInicioTrabajo(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Listado de Roles Requeridos (Total: {totalTrabajadores})</h3>
                         <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-2 mb-4 p-4 border rounded-md bg-gray-50">
                            <div className="md:col-span-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del Cargo</label>
                                <select value={newPuesto.tipo} onChange={e => handleNewPuestoChange('tipo', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Seleccionar Rol</option>
                                    {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                                <select value={newPuesto.categoria} onChange={e => handleNewPuestoChange('categoria', e.target.value as CategoriaTrabajador)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                    {CATEGORIAS_TRABAJADOR.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad de Personas</label>
                                <input type="number" min="1" value={newPuesto.cantidad} onChange={e => handleNewPuestoChange('cantidad', parseInt(e.target.value, 10))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Renta Líquida</label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500">$</span>
                                    <input type="number" placeholder="550000" value={newPuesto.sueldo} onChange={e => handleNewPuestoChange('sueldo', parseInt(e.target.value, 10) || 0)} className="w-full p-2 border border-gray-300 rounded-r-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <button type="button" onClick={handleAddPuesto} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Agregar</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2">Nombre del Cargo</th><th className="px-4 py-2">Rol</th><th className="px-4 py-2">Cantidad</th><th className="px-4 py-2">Renta Líquida</th><th className="px-4 py-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {puestos.length > 0 ? puestos.map((p, i) => (
                                        <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{p.tipo}</td><td className="px-4 py-2">{p.categoria}</td><td className="px-4 py-2">{p.cantidad}</td><td className="px-4 py-2">${p.sueldo.toLocaleString('es-CL')}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => removePuesto(i)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="text-center py-4 text-gray-500">Aún no se han agregado roles.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Beneficios Adicionales</h3>
                         <textarea value={beneficios} onChange={e => setBeneficios(e.target.value)} rows={3} placeholder="Describa aquí beneficios, bonos, etc..." className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Asignación de Turnos y Horarios</h3>
                        {puestos.length > 0 ? (
                            <div className="space-y-6">
                                {puestos.map((puesto, puestoIndex) => {
                                    const totalAsignado = puesto.turnos.reduce((sum, turno) => sum + turno.cantidad, 0);
                                    const restante = puesto.cantidad - totalAsignado;

                                    return (
                                        <div key={puestoIndex} className="p-4 border rounded-md bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold">{puesto.tipo} ({puesto.cantidad} requeridos)</h4>
                                                <span className={`text-sm font-bold ${restante === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {restante === 0 ? 'Completo' : `${restante} por asignar`}
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                {puesto.turnos.map((turno, turnoIndex) => (
                                                    <div key={turnoIndex} className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-5">
                                                            <select
                                                                value={turno.nombre}
                                                                onChange={e => handleTurnoChange(puestoIndex, turnoIndex, 'nombre', e.target.value)}
                                                                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                                                            >
                                                                <option value="">Seleccionar Turno</option>
                                                                {Object.keys(turnosIndustria).map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-4">
                                                            <input
                                                                type="text"
                                                                placeholder="Horario"
                                                                value={turno.horario}
                                                                onChange={e => handleTurnoChange(puestoIndex, turnoIndex, 'horario', e.target.value)}
                                                                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                                                                disabled={turno.nombre !== 'Otro'}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={turno.cantidad}
                                                                onChange={e => handleTurnoChange(puestoIndex, turnoIndex, 'cantidad', parseInt(e.target.value, 10))}
                                                                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 text-right">
                                                            <button type="button" onClick={() => removeTurno(puestoIndex, turnoIndex)} className="p-1 text-red-500 hover:text-red-700">
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addTurno(puestoIndex)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold mt-2">
                                                    + Agregar Turno
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Agregue roles para poder asignar turnos.</p>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-6 mt-6 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-md font-semibold text-gray-800 hover:bg-gray-300">
                            Cancelar
                        </button>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => handleFormSubmit('borrador')}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600"
                            >
                                Guardar como Borrador
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFormSubmit('publicado')}
                                className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700"
                            >
                                {proyectoToEdit && proyectoToEdit.estado === 'publicado' ? 'Actualizar Proyecto' : 'Publicar Proyecto'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminProyectos = () => {
    const { proyectos, getClienteById } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Proyecto | null>(null);

    const handleOpenForm = (proyecto: Proyecto | null) => {
        setEditingProject(proyecto);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingProject(null);
        setIsFormOpen(false);
    };
    
    const publishedProjects = proyectos.filter(p => p.estado === 'publicado');
    const draftProjects = proyectos.filter(p => p.estado === 'borrador');

    return (
        <div>
            {isFormOpen && <ProjectForm proyectoToEdit={editingProject} onClose={handleCloseForm} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h1>
                <button onClick={() => handleOpenForm(null)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Crear Proyecto
                </button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Proyectos Publicados ({publishedProjects.length})</h2>
                    {publishedProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publishedProjects.map(p => (
                                <ProjectCard 
                                    key={p.id} 
                                    proyecto={p} 
                                    onEdit={() => handleOpenForm(p)} 
                                    getClienteById={getClienteById}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay proyectos publicados.</p>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Borradores ({draftProjects.length})</h2>
                    {draftProjects.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {draftProjects.map(p => (
                                <ProjectCard 
                                    key={p.id} 
                                    proyecto={p} 
                                    onEdit={() => handleOpenForm(p)} 
                                    getClienteById={getClienteById}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay borradores guardados.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProyectos;

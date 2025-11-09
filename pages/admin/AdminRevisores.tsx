
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Proyecto, Revisor } from '../../types';
import { PlusCircleIcon, TrashIcon, XMarkIcon, ClipboardDocumentIcon, PencilIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 3) + 6; // Random length between 6 and 8
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

interface RevisorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newRevisor: { nombre: string; email: string; password: string; };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RevisorFormModal: React.FC<RevisorFormModalProps> = ({ isOpen, onClose, onSubmit, newRevisor, onInputChange }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Revisor</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input type="text" name="nombre" value={newRevisor.nombre} onChange={onInputChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input type="email" name="email" value={newRevisor.email} onChange={onInputChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Generada</label>
                         <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newRevisor.password}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 font-mono"
                            />
                            <button 
                                type="button" 
                                onClick={() => navigator.clipboard.writeText(newRevisor.password)}
                                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                title="Copiar contraseña"
                            >
                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Crear Revisor</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const EditRevisorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    revisor: Revisor | null;
    proyectos: Proyecto[];
    onSave: (updatedRevisor: Revisor) => void;
}> = ({ isOpen, onClose, revisor, proyectos, onSave }) => {
    const [assignedProjects, setAssignedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (revisor?.proyectosAsignados) {
            setAssignedProjects(new Set(revisor.proyectosAsignados));
        } else {
            setAssignedProjects(new Set());
        }
    }, [revisor]);

    if (!isOpen || !revisor) return null;

    const handleCheckboxChange = (projectId: string) => {
        setAssignedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        onSave({ ...revisor, proyectosAsignados: Array.from(assignedProjects) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Asignar Proyectos a {revisor.nombre}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BriefcaseIcon className="h-5 w-5" />
                        Proyectos Disponibles
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-2 border p-4 rounded-md bg-gray-50">
                        {proyectos.length > 0 ? proyectos.map(p => (
                            <label key={p.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={assignedProjects.has(p.id)}
                                    onChange={() => handleCheckboxChange(p.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-800">{p.nombre}</span>
                            </label>
                        )) : (
                            <p className="text-sm text-gray-500 text-center">No hay proyectos publicados para asignar.</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};


const AdminRevisores = () => {
    const { revisores, addRevisor, deleteRevisor, updateRevisor, proyectos } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRevisor, setEditingRevisor] = useState<Revisor | null>(null);
    const [newRevisor, setNewRevisor] = useState({ nombre: '', email: '', password: '' });

    const projectsMap = useMemo(() => new Map(proyectos.map(p => [p.id, p.nombre])), [proyectos]);
    const publishedProyectos = useMemo(() => proyectos.filter(p => p.estado === 'publicado'), [proyectos]);

    const openModalAndGeneratePassword = () => {
        setNewRevisor({
            nombre: '',
            email: '',
            password: generateRandomPassword(),
        });
        setIsCreateModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewRevisor(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRevisor.nombre && newRevisor.email && newRevisor.password) {
            addRevisor(newRevisor);
            handleCloseCreateModal();
        } else {
            alert('Por favor, complete todos los campos.');
        }
    };

    const handleDelete = (revisor: Revisor) => {
        if (window.confirm(`¿Está seguro que desea eliminar al revisor ${revisor.nombre}? Cualquier trabajador que tuviera asignado quedará como "sin asignar" y deberá ser redistribuido.`)) {
            deleteRevisor(revisor.id);
        }
    };

    const handleOpenEditModal = (revisor: Revisor) => {
        setEditingRevisor(revisor);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingRevisor(null);
    };

    const handleSaveRevisor = (updatedRevisor: Revisor) => {
        updateRevisor(updatedRevisor);
        handleCloseEditModal();
    };

    return (
        <div>
            <RevisorFormModal 
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleSubmit}
                newRevisor={newRevisor}
                onInputChange={handleInputChange}
            />
            <EditRevisorModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                revisor={editingRevisor}
                proyectos={publishedProyectos}
                onSave={handleSaveRevisor}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Revisores</h1>
                <button onClick={openModalAndGeneratePassword} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Crear Revisor
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Proyectos Asignados</th>
                                <th className="px-6 py-3">Fecha de Creación</th>
                                <th className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revisores.map(revisor => (
                                <tr key={revisor.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{revisor.nombre}</td>
                                    <td className="px-6 py-4">{revisor.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {revisor.proyectosAsignados && revisor.proyectosAsignados.length > 0 ? (
                                                revisor.proyectosAsignados.map(projId => (
                                                    <span key={projId} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                        {projectsMap.get(projId) || 'ID no encontrado'}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs">Ninguno</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{format(revisor.fechaCreacion, 'dd/MM/yyyy')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleOpenEditModal(revisor)} className="p-2 text-blue-600 hover:text-blue-800" title="Editar Proyectos">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(revisor)} className="p-2 text-red-600 hover:text-red-800" title="Eliminar Revisor">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {revisores.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">No hay revisores registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRevisores;

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { TrabajadorCredencial } from '../../types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const EditModal = ({ isOpen, onClose, onSubmit, formData, onFormChange }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: { email: string; password: string };
    onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Editar Credenciales</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onFormChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={onFormChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const AdminCuentas = () => {
    const { 
        trabajadorCredenciales, 
        trabajadores, 
        updateTrabajadorCredencial, 
        deleteTrabajadorAccount 
    } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState<TrabajadorCredencial | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const trabajadoresMap = useMemo(() => {
        return new Map(trabajadores.map(t => [t.id, t]));
    }, [trabajadores]);

    const handleEditClick = (credential: TrabajadorCredencial) => {
        setEditingCredential(credential);
        setFormData({ email: credential.email, password: credential.password });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (credential: TrabajadorCredencial) => {
        const worker = trabajadoresMap.get(credential.id);
        if (window.confirm(`¿Está seguro de que desea eliminar la cuenta de ${worker?.nombre || credential.email}? Esta acción es irreversible y borrará tanto la cuenta como el perfil del trabajador.`)) {
            deleteTrabajadorAccount(credential.id);
        }
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingCredential(null);
        setFormData({ email: '', password: '' });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCredential) {
            updateTrabajadorCredencial({
                ...editingCredential,
                email: formData.email,
                password: formData.password,
            });
            handleModalClose();
        }
    };

    return (
        <div>
            <EditModal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleFormSubmit}
                formData={formData}
                onFormChange={handleFormChange}
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Cuentas de Trabajadores</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">Nombre del Trabajador</th>
                                <th className="px-6 py-3">RUT</th>
                                <th className="px-6 py-3">Email de Acceso</th>
                                <th className="px-6 py-3">Contraseña</th>
                                <th className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trabajadorCredenciales.map(cred => {
                                const worker = trabajadoresMap.get(cred.id);
                                return (
                                    <tr key={cred.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{worker?.nombre || '(Perfil no completado)'}</td>
                                        <td className="px-6 py-4">{worker?.rut || 'N/A'}</td>
                                        <td className="px-6 py-4">{cred.email}</td>
                                        <td className="px-6 py-4 font-mono">********</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button onClick={() => handleEditClick(cred)} className="p-2 text-blue-600 hover:text-blue-800" title="Editar">
                                                    <PencilIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => handleDeleteClick(cred)} className="p-2 text-red-600 hover:text-red-800" title="Eliminar">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {trabajadorCredenciales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No hay cuentas de trabajadores registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCuentas;
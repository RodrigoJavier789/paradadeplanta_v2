
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Cliente, Usuario } from '../../types';
import { PlusCircleIcon, UserPlusIcon, TrashIcon, PencilIcon, BuildingStorefrontIcon, XMarkIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';

const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 3) + 6; // Random length between 6 and 8
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const FormField: React.FC<{ label: string, children: React.ReactNode, className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
);

const ClientFormModal = ({ clienteToEdit, onClose }: { clienteToEdit: Cliente | null, onClose: () => void }) => {
    const { addCliente, updateClienteAndUsuarios } = useData();
    const [nombreCliente, setNombreCliente] = useState('');
    const [contactoPrincipal, setContactoPrincipal] = useState('');
    const [emailPrincipal, setEmailPrincipal] = useState('');
    const [telefonoPrincipal, setTelefonoPrincipal] = useState('');
    const [direccion, setDireccion] = useState('');
    const [planContratado, setPlanContratado] = useState<'Por Proyecto' | 'Mensual' | 'Personalizado'>('Por Proyecto');
    const [formUsuarios, setFormUsuarios] = useState<Partial<Usuario>[]>([{ nombre: '', email: '' }]);
    const [newlyResetPasswords, setNewlyResetPasswords] = useState<Record<string, string>>({});

    const planOptions = ['Por Proyecto', 'Mensual', 'Personalizado'];

    useEffect(() => {
        if (clienteToEdit) {
            setNombreCliente(clienteToEdit.nombre);
            setContactoPrincipal(clienteToEdit.contactoPrincipal || '');
            setEmailPrincipal(clienteToEdit.emailPrincipal || '');
            setTelefonoPrincipal(clienteToEdit.telefonoPrincipal?.replace('+569', '').trim() || '');
            setDireccion(clienteToEdit.direccion || '');
            setPlanContratado(clienteToEdit.planContratado || 'Por Proyecto');
            setFormUsuarios(clienteToEdit.usuarios.length > 0 ? clienteToEdit.usuarios.map(u => ({...u, telefono: u.telefono?.replace('+569', '').trim()})) : [{ nombre: '', email: '', telefono: '', cargo: '', horarioContacto: '', password: generateRandomPassword() }]);
        } else {
            setNombreCliente('');
            setContactoPrincipal('');
            setEmailPrincipal('');
            setTelefonoPrincipal('');
            setDireccion('');
            setPlanContratado('Por Proyecto');
            setFormUsuarios([{ nombre: '', email: '', telefono: '', cargo: '', horarioContacto: '', password: generateRandomPassword() }]);
        }
    }, [clienteToEdit]);

    const handleInternalClose = () => {
        setNewlyResetPasswords({});
        onClose();
    };

    const handleAddUsuario = () => {
        if (formUsuarios.length < 5) {
            setFormUsuarios([...formUsuarios, { nombre: '', email: '', telefono: '', cargo: '', horarioContacto: '', password: generateRandomPassword() }]);
        }
    };

    const handleUsuarioChange = (index: number, field: keyof Omit<Usuario, 'id' | 'clienteId'>, value: string) => {
        const newUsuarios = [...formUsuarios];
        newUsuarios[index] = { ...newUsuarios[index], [field]: value };
        setFormUsuarios(newUsuarios);
    };

    const handleRemoveUsuario = (index: number) => {
        if (formUsuarios.length > 1) {
            setFormUsuarios(prev => prev.filter((_, i) => i !== index));
        } else {
            alert("Un cliente debe tener al menos un usuario.");
        }
    };

    const handleResetPassword = (index: number) => {
        const newPassword = generateRandomPassword();
        const newUsuarios = [...formUsuarios];
        const userToUpdate = newUsuarios[index];
        
        if (!userToUpdate) return;
    
        newUsuarios[index] = { ...userToUpdate, password: newPassword };
        setFormUsuarios(newUsuarios);
        
        if (userToUpdate.id) {
            setNewlyResetPasswords(prev => ({ ...prev, [userToUpdate.id as string]: newPassword }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombreCliente && formUsuarios.every(u => u.nombre && u.email)) {
            const clienteDataPayload = {
                nombre: nombreCliente,
                contactoPrincipal,
                emailPrincipal,
                telefonoPrincipal: telefonoPrincipal ? `+569${telefonoPrincipal}` : '',
                direccion,
                planContratado,
            };
            
            const usuariosPayload = formUsuarios.map(u => ({...u, telefono: u.telefono ? `+569${u.telefono}` : ''}));

            if (clienteToEdit) {
                // Lógica de edición: se preservan los IDs de usuario existentes y se generan nuevos para los recién añadidos.
                const finalUsuarios = usuariosPayload.map((user, index) => ({
                    id: user.id || `user-new-${Date.now()}-${index}`,
                    clienteId: clienteToEdit.id,
                    nombre: user.nombre || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    cargo: user.cargo || '',
                    horarioContacto: user.horarioContacto || '',
                    password: user.password,
                })) as Usuario[];

                const updatedCliente: Cliente = {
                    ...clienteToEdit,
                    ...clienteDataPayload,
                    usuarios: finalUsuarios,
                };
                updateClienteAndUsuarios(updatedCliente);
            } else {
                // Lógica de creación
                addCliente(clienteDataPayload, usuariosPayload as Omit<Usuario, 'id' | 'clienteId'>[]);
            }
            handleInternalClose();
        } else {
            alert('Por favor, complete el nombre del cliente y al menos el nombre y email de cada usuario.');
        }
    };
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{clienteToEdit ? 'Editar Ficha de Cliente' : 'Crear Nuevo Cliente'}</h2>
                    <button onClick={handleInternalClose} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Client General Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Información General del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nombre del Cliente" className="md:col-span-2">
                                <TextInput type="text" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} required/>
                            </FormField>
                             <FormField label="Nombre Contacto Principal">
                                <TextInput type="text" value={contactoPrincipal} onChange={e => setContactoPrincipal(e.target.value)} />
                            </FormField>
                            <FormField label="Email Contacto Principal">
                                <TextInput type="email" value={emailPrincipal} onChange={e => setEmailPrincipal(e.target.value)} />
                            </FormField>
                            <FormField label="Teléfono Contacto Principal">
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">+569</span>
                                    <input
                                        type="tel"
                                        placeholder="87654321"
                                        value={telefonoPrincipal}
                                        onChange={e => setTelefonoPrincipal(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-none rounded-r-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </FormField>
                            <FormField label="Dirección">
                                <TextInput type="text" value={direccion} onChange={e => setDireccion(e.target.value)} />
                            </FormField>
                             <FormField label="Plan Contratado" className="md:col-span-2">
                                <select value={planContratado} onChange={e => setPlanContratado(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                    {planOptions.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                                </select>
                            </FormField>
                        </div>
                    </div>
                    
                    {/* Users Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Usuarios Adicionales ({formUsuarios.length}/5)</h3>
                        <p className="text-xs text-gray-500 mb-4 -mt-2">Nota: Para nuevos usuarios, copie la contraseña generada y guárdela en un lugar seguro. Para usuarios existentes, puede resetearla.</p>
                        {formUsuarios.map((user, index) => (
                             <div key={user.id || index} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md mb-4 bg-gray-50">
                                <div className="absolute top-2 right-2 flex items-center">
                                    <span className="text-sm font-semibold text-gray-600 mr-2">Usuario {index + 1}</span>
                                    {formUsuarios.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveUsuario(index)} className="p-1 text-gray-400 hover:text-red-600" title="Eliminar usuario">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                <FormField label="Nombre">
                                    <TextInput type="text" value={user.nombre} onChange={(e) => handleUsuarioChange(index, 'nombre', e.target.value)} required />
                                </FormField>
                                <FormField label="Email">
                                    <TextInput type="email" value={user.email} onChange={(e) => handleUsuarioChange(index, 'email', e.target.value)} required />
                                </FormField>
                                <FormField label="Teléfono">
                                     <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">+569</span>
                                        <input
                                            type="tel"
                                            placeholder="87654321"
                                            value={user.telefono}
                                            onChange={(e) => handleUsuarioChange(index, 'telefono', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-none rounded-r-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </FormField>
                                <FormField label="Cargo">
                                    <TextInput type="text" value={user.cargo} onChange={(e) => handleUsuarioChange(index, 'cargo', e.target.value)} />
                                </FormField>
                                <FormField label="Días y Horario de Contacto">
                                    <TextInput type="text" value={user.horarioContacto} onChange={(e) => handleUsuarioChange(index, 'horarioContacto', e.target.value)} />
                                </FormField>
                                <FormField label="Contraseña" className="md:col-span-1">
                                    {user.id && !newlyResetPasswords[user.id] ? (
                                        <div className="flex items-center gap-2">
                                            <input type="text" value="••••••••" readOnly className="w-full p-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-100 text-gray-700 font-mono" />
                                            <button
                                                type="button"
                                                onClick={() => handleResetPassword(index)}
                                                className="flex-shrink-0 px-4 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 font-semibold text-sm"
                                            >
                                                Resetear
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={(user.id && newlyResetPasswords[user.id]) || user.password || ''}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-100 text-green-700 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => navigator.clipboard.writeText((user.id && newlyResetPasswords[user.id]) || user.password || '')}
                                                className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
                                                title="Copiar contraseña"
                                            >
                                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                </FormField>
                            </div>
                        ))}
                        {formUsuarios.length < 5 && (
                            <button type="button" onClick={handleAddUsuario} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold">
                                <UserPlusIcon className="h-5 w-5 mr-1" /> Agregar Usuario
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={handleInternalClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{clienteToEdit ? 'Guardar Cambios' : 'Guardar Cliente'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminClientes = () => {
    const { clientes } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingClient(null);
    };

    return (
        <div>
            {(isCreateModalOpen || editingClient) && <ClientFormModal clienteToEdit={editingClient} onClose={handleCloseModal} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Crear Cliente
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientes.map(cliente => (
                    <div key={cliente.id} className="bg-white p-6 rounded-lg shadow flex flex-col">
                        <div className="flex-grow">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                     {cliente.logoUrl ? (
                                        <img src={cliente.logoUrl} alt={`Logo de ${cliente.nombre}`} className="h-12 w-12 object-contain rounded-md" />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{cliente.nombre}</h2>
                                        <p className="text-sm font-medium text-blue-600">{cliente.planContratado}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 flex-shrink-0">Proyectos: {cliente.proyectosActivos.length}</p>
                            </div>
                            
                            <div className="space-y-1 text-sm mb-4 text-gray-700">
                                <p className="flex items-center gap-2"><UserPlusIcon className="h-4 w-4 text-gray-400"/> <strong>{cliente.contactoPrincipal || 'N/A'}</strong></p>
                                <p className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4 text-gray-400"/> {cliente.emailPrincipal || 'N/A'}</p>
                                <p className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-gray-400"/> {cliente.telefonoPrincipal || 'N/A'}</p>
                                <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-400"/> {cliente.direccion || 'N/A'}</p>
                            </div>
                            
                            <h3 className="font-semibold mb-2 text-sm text-gray-600 border-t pt-2">Usuarios Adicionales ({cliente.usuarios.length}):</h3>
                            <ul className="space-y-2 max-h-24 overflow-y-auto">
                                {cliente.usuarios.map(user => (
                                    <li key={user.id} className="text-sm p-2 bg-gray-50 rounded">
                                        <p className="font-medium text-gray-800">{user.nombre} ({user.cargo})</p>
                                        <p className="text-gray-600">{user.email}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button onClick={() => setEditingClient(cliente)} className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar Cliente">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminClientes;

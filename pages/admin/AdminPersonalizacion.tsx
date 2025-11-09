
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Cliente } from '../../types';
import { PhotoIcon, BuildingStorefrontIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationTriangleIcon, ArchiveBoxArrowDownIcon, CircleStackIcon } from '@heroicons/react/24/solid';

const AdminPersonalizacion = () => {
    const { platformLogo, setPlatformLogo, clientes, updateCliente, backupApplicationData } = useData();
    
    const [platformLogoPreview, setPlatformLogoPreview] = useState<string | null>(platformLogo);
    const [clientLogoPreviews, setClientLogoPreviews] = useState<Record<string, string>>({});
    
    const handleFileRead = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handlePlatformLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await handleFileRead(e.target.files[0]);
                setPlatformLogoPreview(base64);
            } catch (error) {
                console.error("Error reading platform logo file:", error);
            }
        }
    };
    
    const handlePlatformLogoSave = () => {
        if (platformLogoPreview) {
            setPlatformLogo(platformLogoPreview);
            alert('Logo de la plataforma actualizado.');
        }
    };
    
    const handleClientLogoChange = async (e: React.ChangeEvent<HTMLInputElement>, clienteId: string) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await handleFileRead(e.target.files[0]);
                setClientLogoPreviews(prev => ({ ...prev, [clienteId]: base64 }));
            } catch (error) {
                console.error("Error reading client logo file:", error);
            }
        }
    };
    
    const handleClientLogoSave = (cliente: Cliente) => {
        const logoUrl = clientLogoPreviews[cliente.id];
        if (logoUrl) {
            updateCliente({ ...cliente, logoUrl });
            alert(`Logo para ${cliente.nombre} actualizado.`);
            setClientLogoPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[cliente.id];
                return newPreviews;
            });
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Personalización y Datos</h1>

            {/* Platform Logo Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Logo de la Plataforma</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Previsualización del logo actual:</p>
                        <div className="h-24 w-full bg-gray-100 rounded-md flex items-center justify-center p-2 border">
                            {platformLogoPreview ? (
                                <img src={platformLogoPreview} alt="Logo Plataforma" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-gray-500">Sin logo</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                         <p className="text-sm text-gray-600">Suba un nuevo logo (se recomienda formato PNG con fondo transparente, 128x128px).</p>
                        <input
                            type="file"
                            id="platform-logo-upload"
                            accept="image/png, image/jpeg, image/svg+xml"
                            onChange={handlePlatformLogoChange}
                            className="hidden"
                        />
                        <label htmlFor="platform-logo-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">
                           <ArrowUpTrayIcon className="h-5 w-5" /> Seleccionar Archivo
                        </label>
                        <button 
                            onClick={handlePlatformLogoSave}
                            disabled={!platformLogoPreview || platformLogoPreview === platformLogo}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                           <CheckCircleIcon className="h-5 w-5" /> Guardar Logo
                        </button>
                    </div>
                </div>
            </div>

            {/* Client Logos Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Logos de Clientes</h2>
                <div className="space-y-4">
                    {clientes.map(cliente => (
                        <div key={cliente.id} className="p-4 border rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-grow">
                                <div className="h-16 w-16 bg-gray-50 rounded-md flex items-center justify-center p-1 border flex-shrink-0">
                                    {clientLogoPreviews[cliente.id] || cliente.logoUrl ? (
                                        <img src={clientLogoPreviews[cliente.id] || cliente.logoUrl} alt={`Logo de ${cliente.nombre}`} className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <BuildingStorefrontIcon className="h-10 w-10 text-gray-300" />
                                    )}
                                </div>
                                <span className="font-semibold text-gray-700">{cliente.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <input
                                    type="file"
                                    id={`client-logo-${cliente.id}`}
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => handleClientLogoChange(e, cliente.id)}
                                    className="hidden"
                                />
                                <label htmlFor={`client-logo-${cliente.id}`} className="w-full text-center cursor-pointer flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 font-semibold text-sm">
                                    <ArrowUpTrayIcon className="h-4 w-4" /> Cambiar
                                </label>
                                <button
                                    onClick={() => handleClientLogoSave(cliente)}
                                    disabled={!clientLogoPreviews[cliente.id]}
                                    className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-semibold disabled:bg-gray-400 text-sm flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" /> Guardar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Management Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Datos de la Aplicación</h2>
                <div className="grid grid-cols-1 gap-6">
                    {/* Backup Data */}
                    <div className="p-4 border rounded-md flex flex-col justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Respaldar Datos Actuales</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Guarde una copia de seguridad de todos los clientes, proyectos y candidatos actuales en un archivo JSON descargable.
                            </p>
                        </div>
                        <button
                            onClick={backupApplicationData}
                            className="mt-4 w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 self-start"
                        >
                            <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                            Descargar Respaldo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPersonalizacion;

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ESPECIALIDADES, CIUDADES, NACIONALIDADES } from '../../constants';
import { PaperClipIcon, CheckCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const TrabajadorRegistro = () => {
    const { trabajadorId } = useParams<{ trabajadorId: string }>();
    const { trabajadores, updateTrabajador } = useData();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        rut: '',
        fechaNacimiento: '',
        telefono: '',
        ciudad: '',
        nacionalidad: '',
        especialidad: '',
        otraEspecialidad: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const workerToUpdate = trabajadores.find(t => t.id === trabajadorId);
        if (workerToUpdate) {
            const birthDate = new Date(formData.fechaNacimiento);
            const ageDate = new Date(Date.now() - birthDate.getTime());
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            const updatedWorker = {
                ...workerToUpdate,
                nombre: formData.nombreCompleto,
                rut: formData.rut,
                edad: age,
                telefono: `+569${formData.telefono}`,
                fechaNacimiento: new Date(formData.fechaNacimiento),
                ciudad: formData.ciudad,
                nacionalidad: formData.nacionalidad,
                especialidad: formData.especialidad === 'Otro' ? formData.otraEspecialidad : formData.especialidad,
                esPrueba: false, // Marcar como un registro real
            };
            updateTrabajador(updatedWorker);
            setIsSubmitted(true);
        } else {
            alert('Error: No se encontró el trabajador para actualizar.');
        }
    };

    const FileInput = ({ label }: { label: string }) => {
        const [fileName, setFileName] = useState('');
        const id = label.replace(/\s+/g, '-').toLowerCase();

        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
                <label htmlFor={id} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500">
                    <div className="space-y-1 text-center">
                        <PaperClipIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <p className="pl-1">{fileName ? fileName : 'Subir un archivo'}</p>
                            <input id={id} name={id} type="file" className="sr-only" onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
                        </div>
                        <p className="text-xs text-gray-500">PDF, JPG hasta 10MB</p>
                    </div>
                </label>
            </div>
        );
    };

    const registrationForm = (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Registro de Trabajador</h1>
                <p className="text-gray-500">Paso {step} de 3</p>
            </div>
            
            <p className="text-center text-gray-700 bg-blue-50 p-3 rounded-md mb-8">
                {step === 1 && 'Ahora, completa tu perfil profesional. Esta información nos ayudará a encontrarte las mejores oportunidades.'}
                {step === 2 && 'Es fundamental que adjuntes tus documentos. Un perfil completo tiene más posibilidades de ser seleccionado.'}
                {step === 3 && 'Estamos casi listos. Por favor, completa esta última sección para finalizar tu registro.'}
            </p>

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                            <input className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" type="text" placeholder="ej: 12.345.678-9" name="rut" value={formData.rut} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <input className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="flex rounded-md">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">+569</span>
                                <input className="w-full flex-1 rounded-none rounded-r-md border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" type="tel" placeholder="87654321" name="telefono" value={formData.telefono} onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad de Residencia</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" name="ciudad" value={formData.ciudad} onChange={handleChange} required>
                                <option value="">Seleccione...</option>
                                {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} required>
                                <option value="">Seleccione...</option>
                                {NACIONALIDADES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad Principal</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" name="especialidad" value={formData.especialidad} onChange={handleChange} required>
                                <option value="">Seleccione...</option>
                                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        {formData.especialidad === 'Otro' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Especifique su Especialidad</label>
                                <input 
                                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                                    type="text" 
                                    name="otraEspecialidad"
                                    value={formData.otraEspecialidad}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Carga de Documentos</h3>
                        <p className="text-sm text-gray-600 mb-4">Adjunte los siguientes documentos en formato PDF o JPG.</p>
                        <div className="space-y-4">
                           <FileInput label="Cédula de Identidad (ambos lados)" />
                           <FileInput label="Certificado de Antecedentes" />
                           <FileInput label="Currículum Vitae" />
                           <FileInput label="Certificados de Especialidad (si aplica)" />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                         <h3 className="font-semibold text-lg mb-4">Declaración de Salud</h3>
                         <p className="text-sm text-gray-600 mb-4">¿Padece alguna enfermedad preexistente que debamos conocer?</p>
                         <textarea className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" rows={4} placeholder="Especifique aquí... (si no tiene, escriba 'Ninguna')"></textarea>
                         <div className="mt-4">
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" required/>
                                <span className="ml-2 text-sm text-gray-700">Confirmo que toda la información proporcionada es verídica.</span>
                            </label>
                         </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    {step > 1 && <button type="button" onClick={handleBack} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400">Atrás</button>}
                    {step < 3 && <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 ml-auto">Siguiente</button>}
                    {step === 3 && <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ml-auto">Finalizar Registro</button>}
                </div>
            </form>
        </div>
    );
    
    const successView = (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg mx-auto">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">¡Registro Exitoso!</h1>
            <p className="text-gray-600 mt-2">Tus datos han sido enviados. Un revisor se pondrá en contacto contigo si hay oportunidades que coincidan con tu perfil.</p>
            <Link to="/trabajador" className="inline-flex items-center mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Volver al inicio de sesión
            </Link>
        </div>
    );
    
    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 flex items-center justify-center">
            {isSubmitted ? successView : registrationForm}
        </div>
    );
};

export default TrabajadorRegistro;

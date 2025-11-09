import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trabajador } from '../../types';
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, ArrowUturnLeftIcon, ArrowDownTrayIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import JSZip from 'jszip';

type ParsedTrabajador = Omit<Trabajador, 'id' | 'numero' | 'estadoDocumental' | 'fechaRegistro' | 'edad'> & {
    fechaNacimiento?: string;
};

type PreviewData = {
    trabajador: Partial<Trabajador>;
    documents: {
        cv: boolean;
        cedula: boolean;
        antecedentes: boolean;
        certificado: boolean;
    };
    hasError: boolean;
};

const DOCUMENT_TYPES = {
    cv: 'cv',
    cedula: 'cedula',
    antecedentes: 'antecedentes',
    certificado: 'certificado',
};


const XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<candidatos>
  <candidato>
    <nombre>Juan Alberto Gonzalez</nombre>
    <rut>15.123.456-7</rut>
    <fechaNacimiento>1989-01-15</fechaNacimiento>
    <telefono>+56911112222</telefono>
    <ciudad>Antofagasta</ciudad>
    <nacionalidad>Chilena</nacionalidad>
    <especialidad>Soldador</especialidad>
  </candidato>
  <candidato>
    <nombre>Maria Isabel Rojas</nombre>
    <rut>17.321.654-K</rut>
    <fechaNacimiento>1993-05-20</fechaNacimiento>
    <telefono>+56933334444</telefono>
    <ciudad>Calama</ciudad>
    <nacionalidad>Peruana</nacionalidad>
    <especialidad>Eléctrico Industrial</especialidad>
  </candidato>
</candidatos>
`;

const AdminImportacion = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'preview' | 'success'>('upload');
    const { addBulkTrabajadores } = useData();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/zip' || selectedFile.type === 'application/x-zip-compressed') {
                setFile(selectedFile);
                setError(null);
            } else {
                setFile(null);
                setError('Por favor, seleccione un archivo .zip válido.');
            }
        }
    };

    const handleProcessZip = async () => {
        if (!file) {
            setError('No se ha seleccionado ningún archivo.');
            return;
        }

        try {
            const zip = await JSZip.loadAsync(file);
            const xmlFile = zip.file('candidatos.xml');
            
            if (!xmlFile) {
                throw new Error("El archivo 'candidatos.xml' no se encontró en la raíz del .zip.");
            }

            const xmlText = await xmlFile.async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");

            if (xmlDoc.getElementsByTagName("parsererror").length) {
                throw new Error("El archivo 'candidatos.xml' está malformado.");
            }
            
            const candidatosNodes = xmlDoc.getElementsByTagName('candidato');
            const data: PreviewData[] = [];

            for (const node of Array.from(candidatosNodes)) {
                const getTagValue = (tagName: string) => node.getElementsByTagName(tagName)[0]?.textContent?.trim() || '';
                const rut = getTagValue('rut');
                if (!rut) continue; 
                
                const documents: PreviewData['documents'] = { cv: false, cedula: false, antecedentes: false, certificado: false };
                const documentData: { [key: string]: string } = {};

                for (const type of Object.values(DOCUMENT_TYPES)) {
                    const docFile = zip.file(new RegExp(`documentos/${rut}_${type}\\.(pdf|jpg|jpeg|png)$`, 'i'));
                    if (docFile && docFile.length > 0) {
                        documents[type as keyof typeof documents] = true;
                        const base64 = await docFile[0].async('base64');
                        const mimeType = docFile[0].name.endsWith('pdf') ? 'application/pdf' : `image/${docFile[0].name.split('.').pop()}`;
                        documentData[type] = `data:${mimeType};base64,${base64}`;
                    }
                }
                
                const trabajador: Partial<Trabajador> = {
                    nombre: getTagValue('nombre'),
                    rut: rut,
                    fechaNacimiento: new Date(getTagValue('fechaNacimiento')),
                    telefono: getTagValue('telefono'),
                    ciudad: getTagValue('ciudad'),
                    nacionalidad: getTagValue('nacionalidad'),
                    especialidad: getTagValue('especialidad'),
                    documentos: documentData,
                };

                data.push({
                    trabajador,
                    documents,
                    hasError: !documents.cv || !documents.cedula || !documents.antecedentes, // CV, Cédula y Antecedentes son obligatorios
                });
            }

            setPreviewData(data);
            setView('preview');
            setError(null);

        } catch (err: any) {
            setError(`Error al procesar el archivo .zip: ${err.message}`);
        }
    };
    
    const handleConfirmImport = () => {
        const validTrabajadores = previewData
            .filter(item => !item.hasError)
            .map(item => item.trabajador);
        
        addBulkTrabajadores(validTrabajadores);
        setView('success');
    };

    const handleReset = () => {
        setFile(null);
        setPreviewData([]);
        setError(null);
        setView('upload');
    };
    
    const handleDownloadTemplate = async () => {
        const zip = new JSZip();
        zip.file("candidatos.xml", XML_TEMPLATE);
        const docFolder = zip.folder("documentos");
        docFolder?.file("15.123.456-7_cv.pdf", "Este es un CV de ejemplo.", { binary: true });
        docFolder?.file("15.123.456-7_cedula.png", "Esta es una cédula de ejemplo.", { binary: true });
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_importacion.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const validCount = previewData.filter(d => !d.hasError).length;
    const errorCount = previewData.length - validCount;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Importación Masiva de Candidatos</h1>
            
            {view === 'upload' && (
                 <div className="bg-white p-8 rounded-lg shadow space-y-4">
                     <div className="text-center">
                         <ArchiveBoxIcon className="h-16 w-16 text-blue-500 mx-auto" />
                         <h2 className="text-xl font-semibold mt-2">Carga de Paquete de Importación (.zip)</h2>
                     </div>
                     <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md [&_*]:text-black prose-code:text-blue-700">
                         <h4>Instrucciones para Importación Masiva de Candidatos</h4>
                        
                        <h5>Paso 1: Descargar la Plantilla</h5>
                        <p>Haga clic en el botón "Descargar Plantilla .zip". Esto le proporcionará un archivo comprimido que contiene la estructura necesaria para la importación.</p>

                        <h5>Paso 2: Estructura del Archivo .zip</h5>
                        <p>El archivo .zip debe contener:</p>
                        <ol>
                            <li><strong>Un archivo <code>candidatos.xml</code>:</strong> Este archivo contiene los datos básicos de los candidatos.</li>
                            <li><strong>Una carpeta llamada <code>documentos</code>:</strong> Aquí se almacenarán todos los archivos de los candidatos.</li>
                        </ol>

                        <h5>Paso 3: Llenar el Archivo <code>candidatos.xml</code></h5>
                        <ul>
                            <li>Abra el archivo <code>candidatos.xml</code> con un editor de texto (como Notepad++, VS Code, o incluso el Bloc de notas).</li>
                            <li>Siga la estructura del ejemplo para cada candidato, llenando las etiquetas <code>&lt;nombre&gt;</code>, <code>&lt;rut&gt;</code>, <code>&lt;fechaNacimiento&gt;</code>, etc.</li>
                            <li><strong>Importante:</strong> El <code>&lt;rut&gt;</code> es el identificador único. Asegúrese de que sea correcto y coincida con el nombre de los documentos.</li>
                        </ul>

                        <h5>Paso 4: Agregar y Nombrar los Documentos</h5>
                        <ul>
                            <li>Coloque todos los documentos de los candidatos (PDF, JPG, PNG) dentro de la carpeta <code>documentos</code>.</li>
                            <li><strong>Convención de Nombres (CRÍTICO):</strong> Cada archivo debe ser nombrado siguiendo este formato exacto: <br/><code>[RUT]_[tipo_de_documento].[extensión]</code></li>
                            <li><strong>Ejemplo:</strong> Para el candidato con RUT <code>12.345.678-9</code>, sus archivos serían:
                                <ul>
                                    <li><code>12.345.678-9_cv.pdf</code></li>
                                    <li><code>12.345.678-9_cedula.jpg</code></li>
                                    <li><code>12.345.678-9_antecedentes.pdf</code></li>
                                </ul>
                            </li>
                            <li><strong>Tipos de Documento Válidos:</strong>
                                <ul>
                                    <li><code>cv</code> (Currículum Vitae) - <strong>Obligatorio</strong></li>
                                    <li><code>cedula</code> (Cédula de Identidad) - <strong>Obligatorio</strong></li>
                                    <li><code>antecedentes</code> (Certificado de Antecedentes) - <strong>Obligatorio</strong></li>
                                    <li><code>certificado</code> (Certificados adicionales) - Opcional</li>
                                </ul>
                            </li>
                        </ul>

                        <h5>Paso 5: Comprimir y Subir</h5>
                        <ul>
                            <li>Una vez que haya llenado el XML y agregado todos los documentos correctamente nombrados a la carpeta <code>documentos</code>, comprima todo en un nuevo archivo .zip.</li>
                            <li>Seleccione ese archivo .zip en esta página y haga clic en "Procesar Paquete".</li>
                        </ul>
                     </div>
                     <div className="text-center">
                         <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
                             <ArrowDownTrayIcon className="h-4 w-4" />
                             Descargar Plantilla .zip
                         </button>
                     </div>
                     <div className="flex flex-col items-center pt-4">
                         <input type="file" id="zip-upload" accept=".zip,application/zip,application/x-zip-compressed" onChange={handleFileChange} className="hidden" />
                         <label htmlFor="zip-upload" className="cursor-pointer bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold">
                             {file ? file.name : 'Seleccionar Archivo .zip'}
                         </label>
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                     </div>
                     <button onClick={handleProcessZip} disabled={!file} className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed">
                         Procesar Paquete
                     </button>
                 </div>
            )}

            {view === 'preview' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Previsualización de Datos</h2>
                    <p className="text-sm text-gray-600 mb-4">Se encontraron {previewData.length} candidatos en el archivo. {errorCount > 0 && <span className="font-bold text-red-600">{errorCount} candidatos serán omitidos por falta de documentos obligatorios (CV, Cédula, Antecedentes).</span>}</p>

                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm text-left text-gray-600">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                               <tr>
                                   <th className="px-4 py-2">Estado</th>
                                   <th className="px-4 py-2">Nombre</th>
                                   <th className="px-4 py-2">RUT</th>
                                   <th className="px-4 py-2 text-center">CV</th>
                                   <th className="px-4 py-2 text-center">Cédula</th>
                                   <th className="px-4 py-2 text-center">Antec.</th>
                                   <th className="px-4 py-2 text-center">Certif.</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                               {previewData.map((data, i) => (
                                   <tr key={i} className={data.hasError ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                       <td className="px-4 py-2">
                                          {data.hasError ? <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Faltan documentos obligatorios"/> : <CheckCircleIcon className="h-5 w-5 text-green-500" title="Listo para importar" />}
                                       </td>
                                       <td className="px-4 py-2 font-medium">{data.trabajador.nombre}</td>
                                       <td className="px-4 py-2">{data.trabajador.rut}</td>
                                       <td className="px-4 py-2 text-center">{data.documents.cv ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline"/> : <XCircleIcon className="h-5 w-5 text-red-500 inline"/>}</td>
                                       <td className="px-4 py-2 text-center">{data.documents.cedula ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline"/> : <XCircleIcon className="h-5 w-5 text-red-500 inline"/>}</td>
                                       <td className="px-4 py-2 text-center">{data.documents.antecedentes ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline"/> : <XCircleIcon className="h-5 w-5 text-red-500 inline"/>}</td>
                                       <td className="px-4 py-2 text-center">{data.documents.certificado ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline"/> : <span className="text-gray-400">-</span>}</td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    </div>
                     <div className="flex justify-end gap-4 mt-6">
                        <button onClick={handleReset} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 font-semibold flex items-center gap-2">
                           <ArrowUturnLeftIcon className="h-5 w-5" /> Cancelar y Volver
                        </button>
                        <button onClick={handleConfirmImport} disabled={validCount === 0} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex items-center gap-2 disabled:bg-green-300">
                            <CheckCircleIcon className="h-5 w-5" /> Importar {validCount} Válidos
                        </button>
                    </div>
                </div>
            )}
            
            {view === 'success' && (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Importación Completada</h2>
                    <p className="text-gray-600 mb-6">Se han añadido <span className="font-bold">{validCount}</span> nuevos candidatos al sistema. Los candidatos con errores fueron omitidos.</p>
                    <button onClick={handleReset} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                        Realizar otra importación
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminImportacion;
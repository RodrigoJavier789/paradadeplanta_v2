
import React, { useMemo } from 'react';
import { Trabajador } from '../types';
import { ArrowDownTrayIcon, DocumentTextIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface Action<T> {
  label: string;
  icon: React.ElementType;
  onClick: (item: T) => void;
  className: string;
}

interface WorkerTableProps {
  title: string;
  trabajadores: Trabajador[];
  columns: Column<Trabajador>[];
  actions?: Action<Trabajador>[];
  onDownloadExcel?: () => void;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ title, trabajadores, columns, actions, onDownloadExcel }) => {
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {onDownloadExcel && (
                    <button
                        onClick={onDownloadExcel}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mt-2 md:mt-0"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Descargar Excel
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} scope="col" className="px-6 py-3">{col.header}</th>
                            ))}
                            {actions && actions.length > 0 && <th scope="col" className="px-6 py-3">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {trabajadores.length > 0 ? trabajadores.map((trabajador) => (
                            <tr key={trabajador.id} className="bg-white border-b hover:bg-gray-50">
                                {columns.map((col, index) => (
                                    <td key={index} className="px-6 py-4">
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(trabajador)
                                            : String(trabajador[col.accessor as keyof Trabajador] || '')}
                                    </td>
                                ))}
                                {actions && actions.length > 0 && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {actions.map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => action.onClick(trabajador)}
                                                    className={`p-2 rounded-full hover:opacity-80 transition-opacity ${action.className}`}
                                                    title={action.label}
                                                >
                                                    <action.icon className="h-5 w-5" />
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4 text-gray-500">
                                    No hay trabajadores para mostrar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkerTable;


import { sql } from '@vercel/postgres';
import { initialTrabajadores } from '../data';
import { Trabajador } from '../types';

// Helper to format JS Date to 'YYYY-MM-DD' for SQL
function toIsoDate(date?: Date): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
}

export default async function handler(
  request: any,
  response: any,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await sql`BEGIN`;

        // Create table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS trabajadores (
                id TEXT PRIMARY KEY,
                numero INT,
                nombre VARCHAR(255) NOT NULL,
                especialidad VARCHAR(255),
                edad INT,
                rut VARCHAR(255) UNIQUE,
                ciudad VARCHAR(255),
                nacionalidad VARCHAR(255),
                telefono VARCHAR(255),
                fechaNacimiento DATE,
                estadoDocumental VARCHAR(255),
                fechaRegistro TIMESTAMP,
                proyectoAsignado TEXT,
                ultimoProyectoAsignado TEXT,
                disponible BOOLEAN,
                ultimaAccion TEXT,
                estadoCliente VARCHAR(255),
                proximoEscenario VARCHAR(255),
                motivoRechazo TEXT,
                motivoRechazoDocumental TEXT,
                revisorAsignadoId TEXT,
                documentos JSONB,
                esPrueba BOOLEAN
            );
        `;
        
        // Check if table is already seeded
        const { rows: existingRows } = await sql`SELECT COUNT(*) FROM trabajadores`;
        const count = parseInt(existingRows[0].count, 10);
        
        if (count > 0) {
            await sql`COMMIT`; // Commit transaction even if no inserts
            return response.status(200).json({ message: 'La base de datos ya contiene datos. No se realizaron nuevas inserciones.' });
        }

        // Insert initial data
        for (const worker of initialTrabajadores) {
            await sql`
                INSERT INTO trabajadores (
                    id, numero, nombre, especialidad, edad, rut, ciudad, nacionalidad,
                    telefono, fechaNacimiento, estadoDocumental, fechaRegistro,
                    proyectoAsignado, ultimoProyectoAsignado, disponible, ultimaAccion,
                    estadoCliente, proximoEscenario, motivoRechazo, motivoRechazoDocumental,
                    revisorAsignadoId, documentos, esPrueba
                ) VALUES (
                    ${worker.id}, ${worker.numero}, ${worker.nombre}, ${worker.especialidad}, ${worker.edad}, ${worker.rut}, ${worker.ciudad}, ${worker.nacionalidad},
                    ${worker.telefono}, ${toIsoDate(worker.fechaNacimiento)}, ${worker.estadoDocumental}, ${worker.fechaRegistro.toISOString()},
                    ${worker.proyectoAsignado}, ${worker.ultimoProyectoAsignado}, ${worker.disponible}, ${worker.ultimaAccion},
                    ${worker.estadoCliente}, ${worker.proximoEscenario}, ${worker.motivoRechazo}, ${worker.motivoRechazoDocumental},
                    ${worker.revisorAsignadoId}, ${worker.documentos ? JSON.stringify(worker.documentos) : null}, ${worker.esPrueba}
                )
                ON CONFLICT (id) DO NOTHING;
            `;
        }
        
        await sql`COMMIT`;
        
        return response.status(200).json({ message: '¡Base de datos inicializada y poblada con éxito!' });
    } catch (error: any) {
        await sql`ROLLBACK`;
        console.error('Seeding Error:', error);
        return response.status(500).json({
            error_code: 'DATABASE_SEED_ERROR',
            error: `No se pudo inicializar la base de datos. Verifique la conexión y que las variables de entorno estén configuradas en Vercel. Detalle: ${error.message}`
        });
    }
}

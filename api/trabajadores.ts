
import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // La librería @vercel/postgres busca automáticamente las variables de entorno
    // que Vercel inyecta al vincular un proyecto con una base de datos.
    // Si esas variables no están, esta llamada fallará.
    const { rows } = await sql`SELECT * FROM trabajadores ORDER BY numero ASC;`;
    
    return response.status(200).json(rows);

  } catch (error: any) {
    console.error('Database Error:', error);
    // Devuelve un error estructurado para que el frontend pueda identificarlo.
    return response.status(500).json({ 
        error_code: 'DATABASE_CONNECTION_ERROR',
        error: `No se pudo conectar a la base de datos. Verifique que la base de datos Vercel Postgres esté creada y vinculada a este proyecto. Detalle: ${error.message}` 
    });
  }
}
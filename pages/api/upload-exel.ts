// /pages/api/upload-excel.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId, data } = req.body;

  if (!empresaId || !data) {
    return res.status(400).json({ message: 'empresaId o data faltante' });
  }

  try {
    await pool.query(
      `UPDATE empresa_config SET excel_data = $1 WHERE empresa_id = $2`,
      [JSON.stringify(data), empresaId]
    );

    res.status(200).json({ message: 'Archivo procesado y guardado exitosamente' });
  } catch (error) {
    console.error('Error guardando en DB:', error);
    res.status(500).json({ message: 'Error al guardar el archivo' });
  }
}

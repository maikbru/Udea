// /pages/api/getCustomization.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId } = req.query;

  if (!empresaId) {
    return res.status(400).json({ message: 'Falta el parámetro empresaId' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        ec.logo, 
        ec.bg_color AS "bgColor", 
        ec.sidebar_color AS "sidebarColor", 
        ec.welcome_text AS "welcomeText",
        u.username
      FROM empresa_config ec
      LEFT JOIN users u ON ec.empresa_id = u.id
      WHERE ec.empresa_id = $1
      LIMIT 1
    `, [empresaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

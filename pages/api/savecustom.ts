// /pages/api/saveCustomization.ts
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
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId, logo, bgColor, sidebarColor, welcomeText } = req.body;

  try {
    await pool.query(
      `INSERT INTO empresa_config (empresa_id, logo, bg_color, sidebar_color, welcome_text)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (empresa_id)
       DO UPDATE SET logo = $2, bg_color = $3, sidebar_color = $4, welcome_text = $5`,
      [empresaId, logo, bgColor, sidebarColor, welcomeText]
    );

    res.status(200).json({ message: 'Personalización guardada' });
  } catch (err) {
    console.error('Error al guardar personalización:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

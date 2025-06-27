// /pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { user, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [user]);
    const usuario = result.rows[0];

    if (!usuario) return res.status(401).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Login exitoso
    res.status(200).json({ empresaId: usuario.id }); // O el ID de la empresa asociada
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

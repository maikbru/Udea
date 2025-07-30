// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', user)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error en Supabase:', error);
      return res.status(500).json({ message: 'Error interno' });
    }

    if (!data) return res.status(401).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, data.password);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    return res.status(200).json({ empresaId: data.empresa_id || data.id });
  } catch (err) {
    console.error('Excepción en login:', err);
    return res.status(500).json({ message: 'Error inesperado' });
  }
}

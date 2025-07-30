// /pages/api/login.ts
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

  try {
    // Buscar el usuario por nombre de usuario
    const { data: usuarios, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', user)
      .limit(1);

    if (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ message: 'Error al buscar usuario' });
    }

    const usuario = usuarios?.[0];
    if (!usuario) return res.status(401).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Login exitoso
    res.status(200).json({ empresaId: usuario.id }); // o `usuario.empresa_id` si está separado
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

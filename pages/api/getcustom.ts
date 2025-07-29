// /pages/api/getCustomization.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Usa SUPABASE_KEY, no SERVICE_ROLE si usas anon
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId } = req.query;

  if (!empresaId || typeof empresaId !== 'string') {
    return res.status(400).json({ message: 'Falta el parámetro empresaId' });
  }

  try {
    const { data, error } = await supabase
      .from('empresa_config')
      .select(`
        logo,
        bg_color,
        sidebar_color,
        welcome_text,
        terms_text,
        users (
          username
        )
      `)
      .eq('empresa_id', empresaId)
      .limit(1)
      .single(); // ← trae directamente el objeto

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    // Renombrar claves para que coincidan con tu frontend
    const result = {
  logo: data.logo,
  bgColor: data.bg_color,
  sidebarColor: data.sidebar_color,
  welcomeText: data.welcome_text,
  terminos: data.terms_text,
  username: data.users?.[0]?.username || ''
};

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

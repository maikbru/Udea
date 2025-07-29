// /pages/api/saveCustomization.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId, logo, bgColor, sidebarColor, welcomeText } = req.body;

  try {
    const { data, error } = await supabase
      .from('empresa_config')
      .upsert(
        { 
          empresa_id: empresaId,
          logo,
          bg_color: bgColor,
          sidebar_color: sidebarColor,
          welcome_text: welcomeText 
        },
        { onConflict: 'empresa_id' }
      );

    if (error) throw error;

    res.status(200).json({ message: 'Personalización guardada', data });
  } catch (err) {
    console.error('Error al guardar personalización:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// pages/api/upload-links.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId, links } = req.body;

  if (!empresaId || !links) {
    return res.status(400).json({ message: 'empresaId o links faltantes' });
  }

  const { error } = await supabase
    .from('empresa_config')
    .update({ link_data: links })
    .eq('empresa_id', empresaId);

  if (error) {
    console.error('Error al guardar links:', error);
    return res.status(500).json({ message: 'Error al guardar los links' });
  }

  return res.status(200).json({ message: 'Links guardados exitosamente' });
}

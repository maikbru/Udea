// pages/api/upload-links.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { empresaId, links } = req.body;

  if (!empresaId || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ message: 'empresaId o links inválidos' });
  }

  try {
    // Enviar cada link al backend de procesamiento
    const resultados = [];

    for (const url of links) {
      try {
        const scrapeRes = await axios.post('https://chatbot-backend-y8bz.onrender.com/scrape_url', { url });
        resultados.push({ url, success: true, message: scrapeRes.data.message });
      } catch (err: any) {
        resultados.push({
          url,
          success: false,
          message: err?.response?.data?.detail || 'Error desconocido al procesar URL'
        });
      }
    }

    // Guardar los links originales en Supabase
    const { error } = await supabase
      .from('empresa_config')
      .update({ link_data: links })
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Error al guardar links en Supabase:', error);
      return res.status(500).json({ message: 'Error al guardar los links en Supabase' });
    }

    return res.status(200).json({
      message: 'Links enviados correctamente',
      detalles: resultados
    });

  } catch (e: any) {
    console.error('Error general en upload-links:', e);
    return res.status(500).json({ message: 'Error inesperado' });
  }
}

// pages/api/upload-excel.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { empresaId, data } = req.body;

  if (!empresaId || !data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Faltan datos requeridos o data inválida' });
  }

  try {
    // 1. Guardar el Excel en Supabase como respaldo
    const { error } = await supabase
      .from('empresa_config')
      .update({ excel_data: data })
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Error al guardar Excel en Supabase:', error);
      return res.status(500).json({ message: 'Error al guardar Excel en Supabase' });
    }

    // 2. Enviar los datos al backend para procesamiento
    const response = await axios.post(
      'https://chatbot-backend-y8bz.onrender.com/upload-excel',
      { data },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      message: 'Excel subido y procesado correctamente',
      procesamiento: response.data
    });

  } catch (e: any) {
    console.error('Error al subir o procesar el Excel:', e);
    return res.status(500).json({
      message: 'Error inesperado al subir o procesar el archivo Excel',
      detail: e?.response?.data || e.message
    });
  }
}

// pages/api/upload-word.ts
import * as formidable from 'formidable';
import fs from 'fs';
import { parseDocx } from '@/utils/parseDocx';
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 👇 Función para convertir form.parse en una promesa
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  try {
    const { fields, files } = await parseForm(req);

    const empresaId = Array.isArray(fields.empresaId) ? fields.empresaId[0] : fields.empresaId;
    const termsFile = Array.isArray(files.termsFile) ? files.termsFile[0] : files.termsFile;
    const wordname = Array.isArray(fields.filename) ? fields.filename[0] : fields.filename;

    if (!empresaId || !termsFile || !('filepath' in termsFile)) {
      return res.status(400).json({ message: 'empresaId o archivo faltante' });
    }

    const buffer = fs.readFileSync(termsFile.filepath);
    const termsText = await parseDocx(buffer);

    const { error } = await supabase
      .from('empresa_config')
      .update({ terms_text: termsText,word_name: wordname, })
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Error en DB:', error);
      return res.status(500).json({ message: 'Error al guardar términos' });
    }

    return res.status(200).json({ message: 'Términos guardados con éxito' });
  } catch (err) {
    console.error('Error procesando Word:', err);
    return res.status(500).json({ message: 'Error al procesar documento Word' });
  }
}

// pages/api/upload-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: false },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al parsear el formulario:', err);
      return res.status(500).json({ message: 'Error al procesar formulario' });
    }

    const empresaId = fields.empresaId?.[0];
    const pdfFile = Array.isArray(files.pdfFile) ? files.pdfFile[0] : files.pdfFile;

    if (!empresaId || !pdfFile) {
      return res.status(400).json({ message: 'empresaId o archivo faltante' });
    }

    try {
      const buffer = fs.readFileSync(pdfFile.filepath);
      const data = await pdfParse(buffer);
      const text = data.text;

      const { error } = await supabase
        .from('empresa_config')
        .update({ pdf_text_content: text })
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        return res.status(500).json({ message: 'Error al guardar el texto del PDF' });
      }

      return res.status(200).json({ message: 'Texto del PDF guardado exitosamente' });
    } catch (e) {
      console.error('Error al procesar el PDF:', e);
      return res.status(500).json({ message: 'Error al leer el contenido del PDF' });
    }
  });
}

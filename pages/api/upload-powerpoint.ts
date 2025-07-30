// /pages/api/upload-powerpoint.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: false },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;

      const empresaId = fields.empresaId?.[0];
      const pptxFile = Array.isArray(files.pptxFile) ? files.pptxFile[0] : files.pptxFile;

      if (!empresaId || !pptxFile) {
        return res.status(400).json({ message: 'empresaId o archivo faltante' });
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(pptxFile.filepath), {
        filename: pptxFile.originalFilename ?? undefined,
        contentType: pptxFile.mimetype ?? undefined,
      });

      const response = await fetch('https://chatbot-backend-y8bz.onrender.com/upload_pptx', {
        method: 'POST',
        body: formData as any,
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('Respuesta con error desde backend IA:', result);
        throw new Error(result?.detail || result?.message || JSON.stringify(result));
      }

      const fullText = result.full_text;

      if (!fullText || fullText.trim().length === 0) {
        return res.status(400).json({ message: 'El backend no devolvió texto procesable del PPTX' });
      }

      const { error } = await supabase
        .from('empresa_config')
        .update({ pptx_text_content: fullText })
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        return res.status(500).json({ message: 'Error al guardar el texto del PowerPoint en Supabase' });
      }

      return res.status(200).json({ message: result.message || 'PPTX procesado y guardado correctamente' });

    } catch (e: any) {
      console.error('Error final:', e);
      return res.status(500).json({ message: e.message || 'Error inesperado' });
    }
  });
}

import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
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

      // 1. Crear el FormData para enviar al backend
      const formData = new FormData();
      formData.append('file', fs.createReadStream(pptxFile.filepath), {
        filename: pptxFile.originalFilename ?? 'archivo.pptx',
        contentType: pptxFile.mimetype ?? 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      // 2. Usar axios y enviar encabezados correctos
      const response = await axios.post(
        'https://chatbot-backend-y8bz.onrender.com/upload_pptx',
        formData,
        { headers: formData.getHeaders() }
      );

      const result = response.data;
      const fullText = result.full_text;
      const ppname = Array.isArray(fields.filename) ? fields.filename[0] : fields.filename;

      if (!fullText || fullText.trim().length === 0) {
        return res.status(400).json({ message: 'El backend no devolvió texto procesable del PPTX' });
      }

      // 3. Guardar en Supabase
      const { error } = await supabase
        .from('empresa_config')
        .update({ pptx_file_url: fullText, pptx_name:ppname })
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        return res.status(500).json({ message: 'Error al guardar el texto del PowerPoint en Supabase' });
      }

      return res.status(200).json({ message: result.message || 'PPTX procesado y guardado correctamente' });

    } catch (e: any) {
      console.error('Error final:', e);
      return res.status(500).json({ message: e.message || 'Error inesperado al subir PowerPoint' });
    }
  });
}

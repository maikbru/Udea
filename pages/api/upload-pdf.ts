// pages/api/upload-pdf.ts
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
      const pdfFile = Array.isArray(files.pdfFile) ? files.pdfFile[0] : files.pdfFile;

      if (!empresaId || !pdfFile) {
        return res.status(400).json({ message: 'empresaId o archivo faltante' });
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(pdfFile.filepath), {
        filename: pdfFile.originalFilename ?? 'documento.pdf',
        contentType: pdfFile.mimetype ?? 'application/pdf',
      });

      // ⚠️ Aquí usamos axios
      const response = await axios.post(
        'https://chatbot-backend-y8bz.onrender.com/upload_pdf',
        formData,
        { headers: formData.getHeaders() }
      );

      const result = response.data;

      const fullText = result.full_text;
      if (!fullText || fullText.trim().length === 0) {
        return res.status(400).json({ message: 'El backend no devolvió texto procesable' });
      }

      const { error } = await supabase
        .from('empresa_config')
        .update({ pdf_text_content: fullText })
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        return res.status(500).json({ message: 'Error al guardar en Supabase' });
      }

      return res.status(200).json({ message: result.message || 'PDF procesado y guardado correctamente' });

    } catch (e: any) {
      console.error('Error final:', e);
      return res.status(500).json({ message: e.message || 'Error inesperado' });
    }
  });
}

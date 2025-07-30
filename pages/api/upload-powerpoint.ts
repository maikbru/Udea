// /pages/api/upload-powerpoint.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

  const form = new IncomingForm({ keepExtensions: true });


  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al parsear el formulario:', err);
      return res.status(500).json({ message: 'Error al procesar archivo PowerPoint' });
    }

    const empresaId = fields.empresaId?.[0];
    const pptxFile = Array.isArray(files.pptxFile) ? files.pptxFile[0] : files.pptxFile;

    if (!empresaId || !pptxFile) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    try {
      const fileBuffer = fs.readFileSync(pptxFile.filepath);
      const filename = `pptx-${empresaId}-${uuidv4()}.pptx`;

      const { data, error: uploadError } = await supabase.storage
        .from('empresa-assets')
        .upload(filename, fileBuffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });

      if (uploadError) {
        console.error('Error al subir el archivo:', uploadError);
        return res.status(500).json({ message: 'Error al subir a Supabase Storage' });
      }

      const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/empresa-assets/${filename}`;

      const { error: updateError } = await supabase
        .from('empresa_config')
        .update({ pptx_file_url: fileUrl })
        .eq('empresa_id', empresaId);

      if (updateError) {
        console.error('Error al actualizar la base de datos:', updateError);
        return res.status(500).json({ message: 'Error al guardar la URL del PowerPoint' });
      }

      res.status(200).json({ message: 'Archivo PowerPoint guardado con éxito' });
    } catch (error) {
      console.error('Error procesando PowerPoint:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });
}

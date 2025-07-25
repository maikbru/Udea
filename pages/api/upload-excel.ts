// pages/api/upload-excel.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { Pool } from 'pg';
import { parseDocx } from '../../utils/parseDocx';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
  if (err) {
    console.error('Error parsing form:', err);
    res.status(500).json({ message: 'Error procesando el formulario' });
    return; // ⬅ importante
  }

  const empresaId = fields.empresaId?.[0];
  const data = fields.data?.[0];
  const linkPages = fields.linkPages?.[0];
  const termsFile = Array.isArray(files.termsFile) ? files.termsFile[0] : files.termsFile;

  if (!empresaId || !data) {
    res.status(400).json({ message: 'empresaId o data faltante' });
    return; // ⬅ importante
  }

  try {
    let termsText = null;
    if (termsFile) {
      const buffer = fs.readFileSync(termsFile.filepath);
      termsText = await parseDocx(buffer);
    }

    await pool.query(
      `UPDATE empresa_config
       SET excel_data = $1,
           link_data = $2,
           terms_text = $3
       WHERE empresa_id = $4`,
      [data, linkPages, termsText, empresaId]
    );

    return res.status(200).json({ message: 'Datos guardados exitosamente' });
  } catch (error) {
    console.error('Error guardando en DB:', error);
    return res.status(500).json({ message: 'Error al guardar los datos' });
  }
});
}

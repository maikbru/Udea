// /pages/api/upload-excel.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { read, utils } from 'xlsx';
import fs from 'fs';
import { Pool } from 'pg';
import path from 'path';

export const config = {
  api: { bodyParser: false }
};

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/tmp'),
    keepExtensions: true,
    multiples: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file || !fields.empresaId) {
      return res.status(400).json({ message: 'Archivo o empresaId faltante' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;
    const empresaId = Array.isArray(fields.empresaId) ? fields.empresaId[0] : fields.empresaId;

    try {
      const workbook = read(fs.readFileSync(filePath));
      const sheetName = workbook.SheetNames[0];
      const data = utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Guarda el JSON directamente en la base de datos
      await pool.query(
        `UPDATE empresa_config SET excel_data = $1 WHERE empresa_id = $2`,
        [JSON.stringify(data), empresaId]
      );

      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'Archivo procesado y guardado exitosamente' });
    } catch (error) {
      console.error('Error procesando Excel:', error);
      res.status(500).json({ message: 'Error al procesar el archivo' });
    }
  });
}

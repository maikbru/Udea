// /pages/api/upload-excel.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { read, utils } from 'xlsx';
import fs from 'fs';
import { Pool } from 'pg';
import path from 'path';

// Configura la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/tmp'),
    keepExtensions: true,
    multiples: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      console.error('Error al subir archivo:', err);
      return res.status(500).json({ message: 'Error al procesar el archivo' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;

    try {
      const workbook = read(fs.readFileSync(filePath));
      const sheetName = workbook.SheetNames[0];
      const data = utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Aquí deberías ajustar esto a tus columnas reales
      for (const row of data) {
        const { nombre, correo, telefono } = row as any;
        await pool.query(
          'INSERT INTO contactos (nombre, correo, telefono) VALUES ($1, $2, $3)',
          [nombre, correo, telefono]
        );
      }

      fs.unlinkSync(filePath); // elimina archivo temporal
      res.status(200).json({ message: 'Archivo procesado correctamente' });
    } catch (error) {
      console.error('Error procesando Excel:', error);
      res.status(500).json({ message: 'Error al procesar el archivo' });
    }
  });
}

// utils/parseDocx.ts
import mammoth from 'mammoth';

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error al leer el .docx:', error);
    return '';
  }
}

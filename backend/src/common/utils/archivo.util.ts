import { randomUUID } from 'crypto';
import * as path from 'path';

export const MIME_TYPES_PERMITIDOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

export const TAMANIO_MAXIMO_BYTES = 5 * 1024 * 1024;

export function sanitizarNombreArchivo(nombreOriginal: string): string {
  const extension = path.extname(nombreOriginal).toLowerCase();
  const base = path
    .basename(nombreOriginal, extension)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 60);
  return `${base}${extension}`;
}

export function generarNombreArchivo(nombreOriginal: string): string {
  return `${randomUUID()}-${sanitizarNombreArchivo(nombreOriginal)}`;
}

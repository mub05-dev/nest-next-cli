import path from 'node:path';
import fs from 'fs-extra';

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export interface ValidateProjectNameResult {
  valid: boolean;
  error?: string;
  targetDir?: string;
}

export async function validateProjectName(
  name: string,
  cwd: string = process.cwd(),
): Promise<ValidateProjectNameResult> {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre del proyecto no puede estar vacío.' };
  }

  if (!NAME_PATTERN.test(name)) {
    return {
      valid: false,
      error:
        'El nombre del proyecto debe ser minúsculas, números y guiones, sin empezar o terminar en guion (ej: mi-proyecto-api).',
    };
  }

  const targetDir = path.resolve(cwd, name);

  if (await fs.pathExists(targetDir)) {
    return { valid: false, error: `Ya existe una carpeta llamada "${name}" en ${cwd}.` };
  }

  return { valid: true, targetDir };
}

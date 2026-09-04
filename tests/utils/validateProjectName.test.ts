import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { validateProjectName } from '../../src/utils/validateProjectName.js';

describe('validateProjectName', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('rechaza nombres vacíos', async () => {
    const result = await validateProjectName('', tmpDir);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/no puede estar vacío/);
  });

  it('rechaza nombres con mayúsculas o espacios', async () => {
    const result = await validateProjectName('Mi Proyecto', tmpDir);
    expect(result.valid).toBe(false);
  });

  it('rechaza nombres que empiezan o terminan en guion', async () => {
    expect((await validateProjectName('-proyecto', tmpDir)).valid).toBe(false);
    expect((await validateProjectName('proyecto-', tmpDir)).valid).toBe(false);
  });

  it('rechaza si ya existe una carpeta con ese nombre', async () => {
    await fs.ensureDir(path.join(tmpDir, 'ya-existe'));
    const result = await validateProjectName('ya-existe', tmpDir);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/ya existe/i);
  });

  it('acepta nombres válidos y devuelve targetDir absoluto', async () => {
    const result = await validateProjectName('mi-proyecto-api', tmpDir);
    expect(result.valid).toBe(true);
    expect(result.targetDir).toBe(path.resolve(tmpDir, 'mi-proyecto-api'));
  });
});

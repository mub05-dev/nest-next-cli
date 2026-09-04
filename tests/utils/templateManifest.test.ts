import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  assertCliCompatibility,
  readTemplateManifest,
  TemplateManifestError,
} from '../../src/utils/templateManifest.js';

describe('templateManifest', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-manifest-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('lanza error si no existe template.json', async () => {
    await expect(readTemplateManifest(tmpDir)).rejects.toThrow(TemplateManifestError);
  });

  it('lanza error si falta un campo requerido', async () => {
    await fs.writeJson(path.join(tmpDir, 'template.json'), { name: 'x' });
    await expect(readTemplateManifest(tmpDir)).rejects.toThrow(/no define/);
  });

  it('lee un manifest válido', async () => {
    await fs.writeJson(path.join(tmpDir, 'template.json'), {
      name: 'demo',
      version: '1.0.0',
      cliMinVersion: '0.1.0',
      description: 'demo',
    });
    const manifest = await readTemplateManifest(tmpDir);
    expect(manifest.name).toBe('demo');
  });

  it('acepta cuando la versión del CLI cumple cliMinVersion', () => {
    expect(() =>
      assertCliCompatibility(
        { name: 'demo', version: '1.0.0', cliMinVersion: '0.1.0', description: '' },
        '0.1.0',
      ),
    ).not.toThrow();
  });

  it('rechaza cuando la versión del CLI es menor a cliMinVersion', () => {
    expect(() =>
      assertCliCompatibility(
        { name: 'demo', version: '1.0.0', cliMinVersion: '2.0.0', description: '' },
        '0.1.0',
      ),
    ).toThrow(TemplateManifestError);
  });
});

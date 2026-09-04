import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProject } from '../../src/generators/generateProject.js';

describe('generateProject', () => {
  let tmpDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-generate-'));
    targetDir = path.join(tmpDir, 'demo-app');
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('copia el template, renderiza variables y escribe .scaffold-meta.json', async () => {
    await generateProject({
      projectName: 'demo-app',
      type: 'monorepo',
      targetDir,
      author: 'Marco',
      cliVersion: '0.1.0',
    });

    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
    expect(pkg.name).toBe('demo-app');
    expect(pkg.author).toBe('Marco');

    const readme = await fs.readFile(path.join(targetDir, 'README.md'), 'utf-8');
    expect(readme).toContain('demo-app');

    const meta = await fs.readJson(path.join(targetDir, '.scaffold-meta.json'));
    expect(meta).toMatchObject({
      templateName: '_placeholder',
      templateVersion: '0.1.0',
      cliVersion: '0.1.0',
    });
    expect(typeof meta.generatedAt).toBe('string');
  });

  it('aborta si la versión del CLI no cumple cliMinVersion del template', async () => {
    await expect(
      generateProject({
        projectName: 'demo-app',
        type: 'monorepo',
        targetDir,
        cliVersion: '0.0.1',
      }),
    ).rejects.toThrow(/requiere nest-next-cli/);

    expect(await fs.pathExists(path.join(targetDir, 'package.json'))).toBe(false);
  });
});

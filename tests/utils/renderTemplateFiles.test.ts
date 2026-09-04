import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderTemplateFiles } from '../../src/utils/renderTemplateFiles.js';

describe('renderTemplateFiles', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-render-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('renderiza variables y elimina la extensión .ejs', async () => {
    await fs.ensureDir(path.join(tmpDir, 'nested'));
    await fs.writeFile(path.join(tmpDir, 'README.md.ejs'), '# <%= projectName %> (<%= year %>)');
    await fs.writeFile(
      path.join(tmpDir, 'nested', 'package.json.ejs'),
      '{"name": "<%= projectName %>", "author": "<%= author %>"}',
    );

    await renderTemplateFiles(tmpDir, { projectName: 'demo-app', year: 2026, author: 'Marco' });

    expect(await fs.pathExists(path.join(tmpDir, 'README.md.ejs'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'README.md'))).toBe(true);

    const readme = await fs.readFile(path.join(tmpDir, 'README.md'), 'utf-8');
    expect(readme).toBe('# demo-app (2026)');

    const pkg = await fs.readJson(path.join(tmpDir, 'nested', 'package.json'));
    expect(pkg).toEqual({ name: 'demo-app', author: 'Marco' });
  });

  it('no falla si no hay archivos .ejs', async () => {
    await fs.writeFile(path.join(tmpDir, 'plain.txt'), 'sin variables');
    await expect(
      renderTemplateFiles(tmpDir, { projectName: 'x', year: 2026, author: '' }),
    ).resolves.not.toThrow();
  });
});

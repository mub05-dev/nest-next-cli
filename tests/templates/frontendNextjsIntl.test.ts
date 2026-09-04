import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProject } from '../../src/generators/generateProject.js';

describe('frontend-nextjs-intl template', () => {
  let tmpDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-frontend-intl-'));
    targetDir = path.join(tmpDir, 'demo-frontend-intl');

    await generateProject({
      projectName: 'demo-frontend-intl',
      type: 'frontend',
      frontendI18n: true,
      targetDir,
      author: 'Marco',
      cliVersion: '0.1.0',
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it.each([
    'middleware.ts',
    'i18n/routing.ts',
    'i18n/request.ts',
    'messages/es.json',
    'messages/en.json',
    'app/[locale]/layout.tsx',
    'app/[locale]/page.tsx',
    'app/[locale]/page.test.tsx',
  ])('genera %s', async (relativePath) => {
    expect(await fs.pathExists(path.join(targetDir, relativePath))).toBe(true);
  });

  it('package.json incluye next-intl', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
    expect(pkg.name).toBe('demo-frontend-intl');
    expect(pkg.dependencies).toMatchObject({ 'next-intl': expect.any(String) });
  });

  it('messages/es.json usa el nombre del proyecto', async () => {
    const messages = await fs.readJson(path.join(targetDir, 'messages', 'es.json'));
    expect(messages.HomePage.title).toContain('demo-frontend-intl');
  });
});

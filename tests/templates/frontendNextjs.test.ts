import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProject } from '../../src/generators/generateProject.js';

describe('frontend-nextjs template (sin i18n)', () => {
  let tmpDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-frontend-'));
    targetDir = path.join(tmpDir, 'demo-frontend');

    await generateProject({
      projectName: 'demo-frontend',
      type: 'frontend',
      targetDir,
      author: 'Marco',
      cliVersion: '0.1.0',
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it.each([
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'app/page.test.tsx',
    'app/globals.css',
    'vitest.config.ts',
    'Dockerfile',
    'docker-compose.yml',
    '.env.example',
    '.github/workflows/ci.yml',
    'README.md',
    '.husky/pre-commit',
  ])('genera %s', async (relativePath) => {
    expect(await fs.pathExists(path.join(targetDir, relativePath))).toBe(true);
  });

  it('no incluye archivos de la variante next-intl', async () => {
    expect(await fs.pathExists(path.join(targetDir, 'middleware.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(targetDir, 'app', '[locale]'))).toBe(false);
  });

  it('package.json tiene el nombre del proyecto, deps de Next y no incluye next-intl', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));

    expect(pkg.name).toBe('demo-frontend');
    expect(pkg.author).toBe('Marco');
    expect(pkg.dependencies).toMatchObject({
      next: expect.any(String),
      react: expect.any(String),
    });
    expect(pkg.dependencies).not.toHaveProperty('next-intl');
    expect(pkg.devDependencies).toMatchObject({
      vitest: expect.any(String),
      '@testing-library/react': expect.any(String),
    });
  });

  it('app/page.tsx incluye el nombre del proyecto', async () => {
    const page = await fs.readFile(path.join(targetDir, 'app', 'page.tsx'), 'utf-8');
    expect(page).toContain('demo-frontend');
  });
});

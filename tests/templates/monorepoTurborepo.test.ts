import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProject } from '../../src/generators/generateProject.js';

describe('monorepo-turborepo template', () => {
  let tmpDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-monorepo-'));
    targetDir = path.join(tmpDir, 'demo-mono');

    await generateProject({
      projectName: 'demo-mono',
      type: 'monorepo',
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
    'pnpm-workspace.yaml',
    'turbo.json',
    'docker-compose.yml',
    '.env.example',
    'README.md',
    '.github/workflows/ci.yml',
    '.husky/pre-commit',
    'packages/README.md',
    'apps/api/package.json',
    'apps/api/src/main.ts',
    'apps/api/src/health/health.controller.ts',
    'apps/api/prisma/schema.prisma',
    'apps/api/Dockerfile',
    'apps/web/package.json',
    'apps/web/app/page.tsx',
    'apps/web/Dockerfile',
  ])('genera %s', async (relativePath) => {
    expect(await fs.pathExists(path.join(targetDir, relativePath))).toBe(true);
  });

  it('package.json raíz tiene el nombre del proyecto y scripts que delegan a turbo', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
    expect(pkg.name).toBe('demo-mono');
    expect(pkg.author).toBe('Marco');
    expect(pkg.scripts).toMatchObject({
      build: 'turbo run build',
      dev: 'turbo run dev',
      lint: 'turbo run lint',
      test: 'turbo run test',
    });
  });

  it('apps/api/package.json se llama "api" e incluye deps de NestJS/Prisma', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'apps', 'api', 'package.json'));
    expect(pkg.name).toBe('api');
    expect(pkg.dependencies).toMatchObject({
      '@nestjs/core': expect.any(String),
      '@prisma/client': expect.any(String),
    });
  });

  it('apps/web/package.json se llama "web" e incluye deps de Next.js', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'apps', 'web', 'package.json'));
    expect(pkg.name).toBe('web');
    expect(pkg.dependencies).toMatchObject({
      next: expect.any(String),
      react: expect.any(String),
    });
  });

  it('el workflow de CI filtra por paquetes afectados con turbo', async () => {
    const ci = await fs.readFile(path.join(targetDir, '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(ci).toContain('turbo run lint test build --filter');
  });

  it('docker-compose.yml y .env.example incluyen el nombre del proyecto', async () => {
    const compose = await fs.readFile(path.join(targetDir, 'docker-compose.yml'), 'utf-8');
    const env = await fs.readFile(path.join(targetDir, '.env.example'), 'utf-8');

    expect(compose).toContain('demo-mono');
    expect(env).toContain('demo-mono');
  });
});

import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProject } from '../../src/generators/generateProject.js';

describe('backend-nestjs-prisma template', () => {
  let tmpDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-backend-'));
    targetDir = path.join(tmpDir, 'demo-backend');

    await generateProject({
      projectName: 'demo-backend',
      type: 'backend',
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
    'src/main.ts',
    'src/app.module.ts',
    'src/prisma/prisma.module.ts',
    'src/prisma/prisma.service.ts',
    'src/health/health.controller.ts',
    'src/health/health.module.ts',
    'src/health/health.controller.spec.ts',
    'prisma/schema.prisma',
    'prisma/migrations/migration_lock.toml',
    'prisma/migrations/20260101000000_init/migration.sql',
    'Dockerfile',
    'docker-compose.yml',
    '.env.example',
    '.github/workflows/ci.yml',
    'README.md',
    '.husky/pre-commit',
    '.gitignore',
  ])('genera %s', async (relativePath) => {
    expect(await fs.pathExists(path.join(targetDir, relativePath))).toBe(true);
  });

  it('package.json tiene el nombre del proyecto y dependencias clave', async () => {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));

    expect(pkg.name).toBe('demo-backend');
    expect(pkg.author).toBe('Marco');
    expect(pkg.dependencies).toMatchObject({
      '@nestjs/core': expect.any(String),
      '@prisma/client': expect.any(String),
      'class-validator': expect.any(String),
    });
    expect(pkg.devDependencies).toMatchObject({
      jest: expect.any(String),
      prisma: expect.any(String),
      husky: expect.any(String),
      eslint: expect.any(String),
    });
  });

  it('schema.prisma usa PostgreSQL', async () => {
    const schema = await fs.readFile(path.join(targetDir, 'prisma', 'schema.prisma'), 'utf-8');
    expect(schema).toContain('provider = "postgresql"');
  });

  it('docker-compose.yml y .env.example incluyen el nombre del proyecto', async () => {
    const compose = await fs.readFile(path.join(targetDir, 'docker-compose.yml'), 'utf-8');
    const env = await fs.readFile(path.join(targetDir, '.env.example'), 'utf-8');

    expect(compose).toContain('demo-backend');
    expect(env).toContain('demo-backend');
  });
});

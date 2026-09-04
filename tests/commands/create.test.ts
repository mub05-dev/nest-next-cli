import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerCreateCommand } from '../../src/commands/create.js';
import { generateProject } from '../../src/generators/generateProject.js';

vi.mock('../../src/generators/generateProject.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/generators/generateProject.js')>();
  return {
    ...actual,
    generateProject: vi.fn(actual.generateProject),
  };
});

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerCreateCommand(program, '0.1.0');
  return program;
}

describe('create command', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nest-next-cli-cmd-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it('genera el proyecto cuando se pasan --type y name como flags (sin prompts)', async () => {
    const program = buildProgram();

    await program.parseAsync(['node', 'nest-next-cli', 'create', 'demo-app', '--type', 'backend']);

    const targetDir = path.join(tmpDir, 'demo-app');
    expect(await fs.pathExists(path.join(targetDir, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, '.scaffold-meta.json'))).toBe(true);
  });

  it('genera la variante next-intl cuando se pasa --type frontend --i18n', async () => {
    const program = buildProgram();

    await program.parseAsync([
      'node',
      'nest-next-cli',
      'create',
      'demo-frontend',
      '--type',
      'frontend',
      '--i18n',
    ]);

    const targetDir = path.join(tmpDir, 'demo-frontend');
    expect(await fs.pathExists(path.join(targetDir, 'middleware.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, 'app', '[locale]', 'page.tsx'))).toBe(true);
  });

  it('genera la variante base cuando se pasa --type frontend --no-i18n (sin prompt)', async () => {
    const program = buildProgram();

    await program.parseAsync([
      'node',
      'nest-next-cli',
      'create',
      'demo-frontend-base',
      '--type',
      'frontend',
      '--no-i18n',
    ]);

    const targetDir = path.join(tmpDir, 'demo-frontend-base');
    expect(await fs.pathExists(path.join(targetDir, 'middleware.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(targetDir, 'app', 'page.tsx'))).toBe(true);
  });

  it('--author se refleja en el package.json del proyecto generado', async () => {
    const program = buildProgram();

    await program.parseAsync([
      'node',
      'nest-next-cli',
      'create',
      'demo-author',
      '--type',
      'backend',
      '--author',
      'Ada Lovelace',
    ]);

    const pkg = await fs.readJson(path.join(tmpDir, 'demo-author', 'package.json'));
    expect(pkg.author).toBe('Ada Lovelace');
  });

  it('modo no interactivo: falla con mensaje claro si falta --type (sin colgarse)', async () => {
    const program = buildProgram();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'nest-next-cli', 'create', 'demo-sin-type']);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/Falta --type/));
    expect(await fs.pathExists(path.join(tmpDir, 'demo-sin-type'))).toBe(false);

    errorSpy.mockRestore();
  });

  it('modo no interactivo: falla con mensaje claro si falta el nombre', async () => {
    const program = buildProgram();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'nest-next-cli', 'create', '--type', 'backend']);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/Falta el nombre del proyecto/));

    errorSpy.mockRestore();
  });

  it('hace rollback de la carpeta si generateProject falla', async () => {
    const mocked = vi.mocked(generateProject);
    mocked.mockImplementationOnce(async (options) => {
      await fs.ensureDir(options.targetDir);
      await fs.writeFile(path.join(options.targetDir, 'partial.txt'), 'x');
      throw new Error('boom');
    });

    const program = buildProgram();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'nest-next-cli', 'create', 'demo-fail', '--type', 'backend']);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('No se pudo generar el proyecto'));
    expect(await fs.pathExists(path.join(tmpDir, 'demo-fail'))).toBe(false);

    errorSpy.mockRestore();
  });

  it('rechaza un --type inválido sin generar nada', async () => {
    const program = buildProgram();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'nest-next-cli', 'create', 'demo-app', '--type', 'mobile']);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/Tipo de proyecto inválido/));
    expect(await fs.pathExists(path.join(tmpDir, 'demo-app'))).toBe(false);

    errorSpy.mockRestore();
  });

  it('rechaza un nombre de proyecto inválido sin generar nada', async () => {
    const program = buildProgram();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'nest-next-cli', 'create', 'Nombre Invalido', '--type', 'backend']);

    expect(errorSpy).toHaveBeenCalled();
    expect(await fs.pathExists(path.join(tmpDir, 'Nombre Invalido'))).toBe(false);

    errorSpy.mockRestore();
  });
});

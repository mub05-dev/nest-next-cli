import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerCreateCommand } from '../../src/commands/create.js';

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

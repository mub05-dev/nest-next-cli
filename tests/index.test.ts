import { Command } from 'commander';
import { describe, expect, it } from 'vitest';
import { registerCreateCommand } from '../src/commands/create.js';

describe('CLI', () => {
  it('registra el nombre, versión y comando create', () => {
    const program = new Command();
    program.name('nest-next-cli').description('Generador de proyectos').version('0.1.0');
    registerCreateCommand(program, '0.1.0');

    expect(program.name()).toBe('nest-next-cli');
    expect(program.version()).toBe('0.1.0');
    expect(program.commands.map((cmd) => cmd.name())).toContain('create');
  });
});

import { Command } from 'commander';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerListTemplatesCommand } from '../../src/commands/listTemplates.js';

describe('list-templates command', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('imprime los templates disponibles', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const program = new Command();
    registerListTemplatesCommand(program);

    await program.parseAsync(['node', 'nest-next-cli', 'list-templates']);

    const output = logSpy.mock.calls.map((call) => call.join(' ')).join('\n');

    expect(output).toContain('backend-nestjs-prisma');
    expect(output).toContain('frontend-nextjs');
    expect(output).toContain('frontend-nextjs-intl');
    expect(output).toContain('monorepo-turborepo');
  });
});

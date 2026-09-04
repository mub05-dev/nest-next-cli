#!/usr/bin/env node
import { Command } from 'commander';
import { registerCreateCommand } from './commands/create.js';

const CLI_VERSION = '0.1.0';

const program = new Command();

program
  .name('nest-next-cli')
  .description('Generador de proyectos NestJS + Prisma, Next.js o monorepo')
  .version(CLI_VERSION);

registerCreateCommand(program, CLI_VERSION);

program.parse();

#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('nest-next-cli')
  .description('Generador de proyectos NestJS + Prisma, Next.js o monorepo')
  .version('0.1.0');

program.parse();

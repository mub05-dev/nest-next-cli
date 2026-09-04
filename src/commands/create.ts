import path from 'node:path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { validateProjectName } from '../utils/validateProjectName.js';
import { promptMissingCreateOptions } from '../prompts/createPrompts.js';
import { generateProject, type ProjectType } from '../generators/generateProject.js';

const PROJECT_TYPES: ProjectType[] = ['backend', 'frontend', 'monorepo'];

interface CreateCommandOptions {
  type?: string;
  i18n?: boolean;
  author?: string;
  yes?: boolean;
}

export function registerCreateCommand(program: Command, cliVersion: string): void {
  program
    .command('create')
    .description('Genera un nuevo proyecto (backend, frontend o monorepo)')
    .argument('[name]', 'nombre del proyecto a generar')
    .option('-t, --type <type>', 'tipo de proyecto: backend, frontend o monorepo')
    .option('--i18n', 'incluir next-intl (i18n) en el template frontend')
    .option('--no-i18n', 'omitir next-intl (i18n) en el template frontend')
    .option('-a, --author <author>', 'nombre del autor a usar en el proyecto generado')
    .option('-y, --yes', 'modo no interactivo: falla en vez de preguntar si falta información')
    .action(async (name: string | undefined, options: CreateCommandOptions) => {
      if (options.type && !PROJECT_TYPES.includes(options.type as ProjectType)) {
        console.error(
          `Tipo de proyecto inválido: "${options.type}". Debe ser uno de: ${PROJECT_TYPES.join(', ')}.`,
        );
        process.exitCode = 1;
        return;
      }

      const nonInteractive = options.yes === true || !process.stdin.isTTY;

      let answers;
      try {
        answers = await promptMissingCreateOptions(
          {
            projectName: name,
            type: options.type as ProjectType | undefined,
            frontendI18n: options.i18n,
          },
          { nonInteractive },
        );
      } catch (error) {
        console.error((error as Error).message);
        process.exitCode = 1;
        return;
      }

      const result = await validateProjectName(answers.projectName);
      if (!result.valid || !result.targetDir) {
        console.error(result.error);
        process.exitCode = 1;
        return;
      }

      try {
        await generateProject({
          projectName: answers.projectName,
          type: answers.type,
          targetDir: result.targetDir,
          cliVersion,
          frontendI18n: answers.frontendI18n,
          author: options.author,
        });

        console.log(`Proyecto generado en ${path.relative(process.cwd(), result.targetDir)}`);
      } catch (error) {
        console.error(`No se pudo generar el proyecto: ${(error as Error).message}`);
        if (await fs.pathExists(result.targetDir)) {
          await fs.remove(result.targetDir);
        }
        process.exitCode = 1;
      }
    });
}

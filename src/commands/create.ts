import path from 'node:path';
import { Command } from 'commander';
import { validateProjectName } from '../utils/validateProjectName.js';
import { promptMissingCreateOptions } from '../prompts/createPrompts.js';
import { generateProject, type ProjectType } from '../generators/generateProject.js';

const PROJECT_TYPES: ProjectType[] = ['backend', 'frontend', 'monorepo'];

interface CreateCommandOptions {
  type?: string;
  i18n?: boolean;
}

export function registerCreateCommand(program: Command, cliVersion: string): void {
  program
    .command('create')
    .description('Genera un nuevo proyecto (backend, frontend o monorepo)')
    .argument('[name]', 'nombre del proyecto a generar')
    .option('-t, --type <type>', 'tipo de proyecto: backend, frontend o monorepo')
    .option('--i18n', 'incluir next-intl (i18n) en el template frontend')
    .option('--no-i18n', 'omitir next-intl (i18n) en el template frontend')
    .action(async (name: string | undefined, options: CreateCommandOptions) => {
      if (options.type && !PROJECT_TYPES.includes(options.type as ProjectType)) {
        console.error(
          `Tipo de proyecto inválido: "${options.type}". Debe ser uno de: ${PROJECT_TYPES.join(', ')}.`,
        );
        process.exitCode = 1;
        return;
      }

      const answers = await promptMissingCreateOptions({
        projectName: name,
        type: options.type as ProjectType | undefined,
        frontendI18n: options.i18n,
      });

      const result = await validateProjectName(answers.projectName);
      if (!result.valid || !result.targetDir) {
        console.error(result.error);
        process.exitCode = 1;
        return;
      }

      await generateProject({
        projectName: answers.projectName,
        type: answers.type,
        targetDir: result.targetDir,
        cliVersion,
        frontendI18n: answers.frontendI18n,
      });

      console.log(`Proyecto generado en ${path.relative(process.cwd(), result.targetDir)}`);
    });
}

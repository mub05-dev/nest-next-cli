import * as clack from '@clack/prompts';
import type { ProjectType } from '../generators/generateProject.js';

export interface CreateAnswers {
  projectName: string;
  type: ProjectType;
  frontendI18n?: boolean;
}

export interface PromptMissingCreateOptionsSettings {
  nonInteractive: boolean;
}

export async function promptMissingCreateOptions(
  partial: Partial<CreateAnswers>,
  settings: PromptMissingCreateOptionsSettings = { nonInteractive: false },
): Promise<CreateAnswers> {
  if (settings.nonInteractive) {
    return resolveNonInteractive(partial);
  }

  clack.intro('nest-next-cli — crear proyecto');

  const projectName =
    partial.projectName ??
    (await clack.text({
      message: '¿Cómo se llama el proyecto?',
      placeholder: 'mi-proyecto-api',
      validate: (value) => (value.trim() ? undefined : 'El nombre no puede estar vacío.'),
    }));

  if (clack.isCancel(projectName)) {
    clack.cancel('Operación cancelada.');
    process.exit(1);
  }

  const type =
    partial.type ??
    (await clack.select({
      message: '¿Qué tipo de proyecto quieres generar?',
      options: [
        { value: 'backend', label: 'Backend (NestJS + Prisma)' },
        { value: 'frontend', label: 'Frontend (Next.js)' },
        { value: 'monorepo', label: 'Monorepo (backend + frontend)' },
      ],
    }));

  if (clack.isCancel(type)) {
    clack.cancel('Operación cancelada.');
    process.exit(1);
  }

  let frontendI18n = partial.frontendI18n;
  if (type === 'frontend' && frontendI18n === undefined) {
    const answer = await clack.confirm({
      message: '¿Incluir next-intl (i18n) en el frontend?',
      initialValue: false,
    });

    if (clack.isCancel(answer)) {
      clack.cancel('Operación cancelada.');
      process.exit(1);
    }

    frontendI18n = answer;
  }

  clack.outro('Generando proyecto...');

  return { projectName: projectName as string, type: type as ProjectType, frontendI18n };
}

function resolveNonInteractive(partial: Partial<CreateAnswers>): CreateAnswers {
  if (!partial.projectName) {
    throw new Error(
      'Falta el nombre del proyecto. Pásalo como argumento (ej: create mi-app --type backend) o corre en modo interactivo.',
    );
  }

  if (!partial.type) {
    throw new Error(
      'Falta --type. Debe ser uno de: backend, frontend, monorepo (o corre en modo interactivo).',
    );
  }

  const frontendI18n = partial.type === 'frontend' ? (partial.frontendI18n ?? false) : partial.frontendI18n;

  return { projectName: partial.projectName, type: partial.type, frontendI18n };
}

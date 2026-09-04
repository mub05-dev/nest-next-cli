import * as clack from '@clack/prompts';
import type { ProjectType } from '../generators/generateProject.js';

export interface CreateAnswers {
  projectName: string;
  type: ProjectType;
}

export async function promptMissingCreateOptions(
  partial: Partial<CreateAnswers>,
): Promise<CreateAnswers> {
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

  clack.outro('Generando proyecto...');

  return { projectName: projectName as string, type: type as ProjectType };
}

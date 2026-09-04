import path from 'node:path';
import fs from 'fs-extra';
import { readTemplateManifest, assertCliCompatibility } from '../utils/templateManifest.js';
import { renderTemplateFiles } from '../utils/renderTemplateFiles.js';
import { TEMPLATES_ROOT } from '../utils/templatesRoot.js';

export type ProjectType = 'backend' | 'frontend' | 'monorepo';

const TEMPLATE_BY_TYPE: Record<Exclude<ProjectType, 'frontend'>, string> = {
  backend: 'backend-nestjs-prisma',
  monorepo: 'monorepo-turborepo',
};

function resolveTemplateDir(type: ProjectType, frontendI18n?: boolean): string {
  if (type === 'frontend') {
    return frontendI18n ? 'frontend-nextjs-intl' : 'frontend-nextjs';
  }
  return TEMPLATE_BY_TYPE[type];
}

export interface GenerateProjectOptions {
  projectName: string;
  type: ProjectType;
  targetDir: string;
  author?: string;
  cliVersion: string;
  frontendI18n?: boolean;
}

export async function generateProject(options: GenerateProjectOptions): Promise<void> {
  const { projectName, type, targetDir, cliVersion } = options;
  const author = options.author ?? '';
  const templateDir = path.join(TEMPLATES_ROOT, resolveTemplateDir(type, options.frontendI18n));

  const manifest = await readTemplateManifest(templateDir);
  assertCliCompatibility(manifest, cliVersion);

  await fs.ensureDir(targetDir);
  await fs.copy(path.join(templateDir, 'files'), targetDir);

  await renderTemplateFiles(targetDir, {
    projectName,
    author,
    year: new Date().getFullYear(),
  });

  await fs.writeJson(
    path.join(targetDir, '.scaffold-meta.json'),
    {
      templateName: manifest.name,
      templateVersion: manifest.version,
      cliVersion,
      generatedAt: new Date().toISOString(),
    },
    { spaces: 2 },
  );
}

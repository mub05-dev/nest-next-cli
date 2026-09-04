import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { readTemplateManifest, assertCliCompatibility } from '../utils/templateManifest.js';
import { renderTemplateFiles } from '../utils/renderTemplateFiles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.resolve(__dirname, '../templates');

export type ProjectType = 'backend' | 'frontend' | 'monorepo';

// TODO: M3/M4 reemplazan cada entrada por su template real
// (frontend-nextjs, monorepo-turborepo).
const TEMPLATE_BY_TYPE: Record<ProjectType, string> = {
  backend: 'backend-nestjs-prisma',
  frontend: '_placeholder',
  monorepo: '_placeholder',
};

export interface GenerateProjectOptions {
  projectName: string;
  type: ProjectType;
  targetDir: string;
  author?: string;
  cliVersion: string;
}

export async function generateProject(options: GenerateProjectOptions): Promise<void> {
  const { projectName, type, targetDir, cliVersion } = options;
  const author = options.author ?? '';
  const templateDir = path.join(TEMPLATES_ROOT, TEMPLATE_BY_TYPE[type]);

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
